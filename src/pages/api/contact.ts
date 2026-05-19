import type { APIRoute } from 'astro';

export const prerender = false;

interface ContactBody {
  name: string;
  email: string;
  message: string;
  honeypot: string;
  turnstileToken: string;
}

function json(body: unknown, status: number): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: { 'Content-Type': 'application/json' },
  });
}

async function verifyTurnstile(token: string, ip: string): Promise<boolean> {
  const res = await fetch('https://challenges.cloudflare.com/turnstile/v0/siteverify', {
    method: 'POST',
    body: new URLSearchParams({
      secret: import.meta.env.TURNSTILE_SECRET_KEY,
      response: token,
      remoteip: ip,
    }),
  });
  const data = (await res.json()) as { success: boolean };
  return data.success;
}

export const POST: APIRoute = async ({ request }) => {
  const ip = request.headers.get('CF-Connecting-IP') ?? request.headers.get('X-Forwarded-For') ?? '';

  let body: ContactBody;
  try {
    body = (await request.json()) as ContactBody;
  } catch {
    return json({ success: false, message: 'Invalid request.' }, 400);
  }

  const { name, email, message, honeypot, turnstileToken } = body;

  if (honeypot) return json({ success: true }, 200);

  if (!name?.trim() || !email?.trim() || !message?.trim()) {
    return json({ success: false, message: 'All fields are required.' }, 400);
  }

  const turnstileOk = await verifyTurnstile(turnstileToken, ip);
  if (!turnstileOk) {
    return json({ success: false, message: 'Security check failed. Please try again.' }, 400);
  }

  const emailRes = await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${import.meta.env.RESEND_API_KEY}`,
    },
    body: JSON.stringify({
      from: 'contact@dmytrotuzov.dev',
      to: import.meta.env.CONTACT_TO_EMAIL,
      reply_to: email.trim(),
      subject: `Portfolio contact: ${name.trim()}`,
      text: `From: ${name.trim()} <${email.trim()}>\n\n${message.trim()}`,
    }),
  });

  if (!emailRes.ok) {
    const resendError = await emailRes.json().catch(() => ({}));
    console.error('[contact] Resend error', emailRes.status, resendError);
    return json({ success: false, message: 'Failed to send message. Please try again.' }, 500);
  }

  return json({ success: true }, 200);
};
