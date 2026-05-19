---
title: "Copy-Trading Bots, Whale Wallets, and a Prediction Market API"
description: What I built when I wanted to understand how "smart money" actually moves on Polymarket — and why running it locally was the right call.
pubDate: 2026-05-18
tags: [TypeScript, Node.js, Polymarket, Automation]
draft: false
---

The starting point was curiosity, not a trading strategy. I'd been following Polymarket for a while — a prediction market platform where people bet real USDC on real-world outcomes — and I kept noticing the same thing: a handful of wallets consistently entered positions early, at favourable prices, on markets that eventually resolved in their favour. The data is fully public on-chain. I wanted to know if that signal was real, and if so, what building around it looked like in practice.

So I opened the Polymarket CLOB API docs and started reading.

## What I Built

The project is a full TypeScript automation system with four moving parts:

**A CLI tool** that talks to Polymarket's CLOB V2 API, Gamma API, and their public Data API. You can query live orderbooks, inspect any wallet's open positions, discover top traders from Dune Analytics, and trigger manual analysis cycles.

**A background daemon** running three PM2 processes: a monitor loop (two-tier polling — trade stream every 60 seconds, full whale snapshot every 5 minutes), a cron scheduler that refreshes market metadata and re-scores wallets every few hours, and a Nuxt 3 dashboard on port 3001.

**A wallet scoring engine** that evaluates each wallet on three axes: ROI on resolved trades, Brier score (calibration quality — were their high-confidence positions actually more likely to win?), and a two-tailed t-test p-value to separate genuine edge from luck. A wallet only gets the `isSharp` flag — the one that triggers copy signals — if it passes all three at strict thresholds: p < 0.01, ROI > 5%, Brier < 0.22, and at least 30 resolved trades.

**A copy execution layer** with Kelly criterion sizing (capped at 25% of full Kelly), a multi-gate signal pipeline, and a `DRY_RUN` mode that stays on by default. Every signal — executed or skipped — is logged to SQLite with a reason.

The dashboard gives a real-time view of open positions, signal history, the whale leaderboard, and a live WebSocket feed of large trades and market anomalies.

## Technical Decisions Worth Explaining

### Two-tier monitoring instead of per-wallet polling

Naive implementation would poll each whale's positions individually — expensive and slow. Instead: one API call to the trade stream every 60 seconds filters for activity by tracked wallets, then fetches positions only for whales who were actually active. This reduces API load by roughly 80% compared to full per-wallet sweeps.

### SQLite with WAL mode

The dashboard reads from the same database the bot writes to. SQLite in Write-Ahead Logging mode handles concurrent readers cleanly without blocking write cycles. It's local-first and operationally simple — no separate database server to run.

### Brier score as a sanity check on ROI

A wallet with a 40% ROI over 30 trades could still be badly calibrated — consistently overestimating probabilities, just getting lucky on size. The Brier score catches this. A wallet that's both profitable and well-calibrated is a stronger signal than raw returns alone.

### WebSocket streaming alongside polling

Later in the project I added a streaming layer for sub-second market event detection — large trades, price spikes, orderbook thinness, and coordinated entries (two or more sharp wallets entering the same market within 15 minutes). The polling layer handles reliability; the WebSocket layer handles latency. They coexist rather than replacing each other.

## What Didn't Go Smoothly

### The CLOB V2 migration

When I started, some documentation still referenced the V1 API. V2 uses EIP-712 domain version 2, a different collateral token (pUSD instead of USDC.e), new contract addresses, and a different order struct — no nonce field, uses timestamp instead. Getting order signing to work correctly took longer than it should have, mostly because error messages from failed signatures aren't descriptive.

### Wallet quality vs. quantity

The first Dune query I used returned wallets sorted by volume. Volume correlates with activity, not with edge. After rescoring, fewer than 8% of discovered wallets passed the `isSharp` threshold. The false-positive rate on naive "top traders" lists is high — most high-volume wallets are market makers, not directional bettors.

### Signal timing

The biggest known limitation: by the time a position change is detected, the whale has already entered. If they entered at 0.55 and the current ask is 0.78, copying that trade is a different risk profile entirely. The signal pipeline gates on `currentAsk ≤ 0.85` and requires the current ask to be within 2× the whale's average — but timing lag is an inherent structural problem with any copy-trading approach.

## Hypothetical Results

The system runs in dry-run mode, which means no real orders are placed — it logs what it would have done. Looking at backtested signal history: the `isSharp` filter is conservative enough that signal volume is low (a few per week, not per day), but the markets flagged tend to be ones with meaningful probability divergence between the whale's entry and current market price.

Whether that translates to actual edge depends on execution — slippage, timing lag, and whether the whale's position reflects information or just a directional bet. I haven't flipped `DRY_RUN=false`. The infrastructure is ready; the decision to deploy capital is a separate question.

## What This Project Is (and Isn't)

This is a local research tool, not a production trading system. It runs on my machine, connects to a real API, logs real market data, and would place real orders if told to. But the intent was exploratory: can you build a statistically rigorous signal pipeline on top of public on-chain data, and what does that engineering actually look like?

The answer is yes, and it's more infrastructure than math. The statistics are a few hundred lines. The reliability layer — retry logic, deduplication guards, session-level token guards to prevent race-condition double entries, WAL mode, PM2 restart policies, dry-run gating — is most of the codebase.

I used Claude as a collaborator throughout, primarily for architecture review and working through the EIP-712 signing issues. The code is mine; the debugging was faster with a second opinion on hand.

**Stack:** TypeScript (strict) · Node.js 20 · pnpm · SQLite + Drizzle ORM · Nuxt 3 · Commander.js · pino · Zod · viem · PM2 · Vitest · Biome

**Repository:** github.com/2zovd/polymarket (private for now — contains trading logic I want to document properly before making public)

## What's Next

- Backtesting framework against historical resolution data
- Multi-outcome market support (categorical markets, not just binary)
- Wallet signal decay — reduce weight for wallets whose edge degrades over time
- Making the repository public with a proper runbook
