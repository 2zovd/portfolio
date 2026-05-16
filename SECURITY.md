# Security Policy

## Reporting a vulnerability

Do **not** open a public issue for security vulnerabilities.

Instead, report them by emailing the maintainer at the address listed on the GitHub profile. Include a description of the issue, steps to reproduce, and potential impact. You will receive a response within 72 hours.

## Scope

This is a project template, not a deployed service. Security concerns most likely to apply:

- Credentials or secrets accidentally included in preset files
- Unsafe defaults in CI workflows or hook configurations
- Dependencies with known CVEs in preset `package.json` files

## After a report

Once confirmed, a fix will be issued as a patch release. Credit will be given to the reporter in the changelog unless anonymity is requested.
