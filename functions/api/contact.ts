interface Env {
  RESEND_API_KEY: string;
  TURNSTILE_SECRET_KEY: string;
}

interface ContactBody {
  name?: unknown;
  email?: unknown;
  message?: unknown;
  honeypot?: unknown;
  turnstileToken?: unknown;
}

interface TurnstileResponse {
  success: boolean;
}

interface ResendResponse {
  id?: string;
  name?: string;
  message?: string;
}

const RECIPIENT = 'dmy2zov@gmail.com';
const SENDER = 'onboarding@resend.dev';

function json(body: { success: boolean; message?: string }, status = 200): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: { 'Content-Type': 'application/json' },
  });
}

export async function onRequestPost(context: {
  request: Request;
  env: Env;
}): Promise<Response> {
  const { request, env } = context;

  let body: ContactBody;
  try {
    body = (await request.json()) as ContactBody;
  } catch {
    return json({ success: false, message: 'Invalid request body.' }, 400);
  }

  // Honeypot — bots fill hidden fields; real users leave them empty
  if (body.honeypot) {
    return json({ success: true });
  }

  const name = typeof body.name === 'string' ? body.name.trim() : '';
  const email = typeof body.email === 'string' ? body.email.trim() : '';
  const message = typeof body.message === 'string' ? body.message.trim() : '';
  const turnstileToken = typeof body.turnstileToken === 'string' ? body.turnstileToken : '';

  if (!name || !email || !message) {
    return json({ success: false, message: 'All fields are required.' }, 400);
  }
  if (!email.includes('@')) {
    return json({ success: false, message: 'Please enter a valid email address.' }, 400);
  }
  if (message.length < 10) {
    return json({ success: false, message: 'Message must be at least 10 characters.' }, 400);
  }

  // Turnstile verification
  const tsForm = new FormData();
  tsForm.append('secret', env.TURNSTILE_SECRET_KEY);
  tsForm.append('response', turnstileToken);

  const tsRes = await fetch('https://challenges.cloudflare.com/turnstile/v0/siteverify', {
    method: 'POST',
    body: tsForm,
  });
  const tsData = (await tsRes.json()) as TurnstileResponse;
  if (!tsData.success) {
    return json({ success: false, message: 'Security check failed. Please try again.' }, 400);
  }

  // Send email via Resend
  const resendRes = await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${env.RESEND_API_KEY}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      from: SENDER,
      to: RECIPIENT,
      reply_to: email,
      subject: `Portfolio contact from ${name}`,
      text: `Name: ${name}\nEmail: ${email}\n\n${message}`,
    }),
  });

  if (!resendRes.ok) {
    const errData = (await resendRes.json()) as ResendResponse;
    const errMsg = errData.message ?? 'Failed to send email.';
    return json({ success: false, message: errMsg }, 500);
  }

  return json({ success: true });
}
