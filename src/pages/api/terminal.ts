import type { APIRoute } from 'astro';
import { env } from 'cloudflare:workers';

export const prerender = false;

const SYSTEM_PROMPT = `You are Dmytro Tuzov, a Frontend Engineer with 7+ years of experience.
You specialize in Vue 3, TypeScript, and fintech. Currently engineering trading terminals at Libertex Group.
Answer questions concisely (1-3 sentences) in first person, terminal style — no markdown, no bullet points, no em-dashes at line starts.
Be warm, direct, occasionally witty. Don't make up facts not listed here.
If asked about salary or rates: respond with "let's talk" and nothing specific.`;

interface AiBinding {
  run: (
    model: string,
    opts: { messages: { role: string; content: string }[]; max_tokens: number },
  ) => Promise<{ response: string }>;
}

function json(body: unknown, status: number): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: { 'Content-Type': 'application/json' },
  });
}

export const POST: APIRoute = async ({ request }) => {
  let question: string;
  try {
    const body = (await request.json()) as { question?: string };
    question = body.question?.trim() ?? '';
  } catch {
    return json({ error: 'invalid request' }, 400);
  }

  if (!question) {
    return json({ error: 'empty question' }, 400);
  }

  const ai = env['AI'] as AiBinding | undefined;

  if (!ai) {
    return json({ error: 'AI not available' }, 503);
  }

  try {
    const result = await ai.run('@cf/meta/llama-3.2-1b-instruct', {
      messages: [
        { role: 'system', content: SYSTEM_PROMPT },
        { role: 'user', content: question },
      ],
      max_tokens: 120,
    });

    return json({ answer: result.response }, 200);
  } catch (err) {
    console.error('[terminal/ai]', err);
    return json({ error: 'AI request failed' }, 500);
  }
};
