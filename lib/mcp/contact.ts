// lib/mcp/contact.ts
// Shared contact_selvin tool logic (validation + send). No "@/" aliases or
// JSON imports here so this compiles under both the Next.js bundler and the
// plain-tsc standalone build (tsconfig.server.json).
import { Resend } from "resend";

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const MAX_NAME_LEN = 200;
const MAX_MESSAGE_LEN = 5000;

function escapeHtml(s: string): string {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

// Strip control/newline characters so a crafted name/email can't smuggle
// extra lines into the outgoing email's subject or headers.
function stripControlChars(s: string): string {
  return s.replace(/[\r\n\t\0]/g, " ").trim();
}

export async function sendContactMessage(args: Record<string, unknown>): Promise<string> {
  const rawName = args.name as string | undefined;
  const rawEmail = args.email as string | undefined;
  const rawMessage = args.message as string | undefined;

  const name = stripControlChars(rawName ?? "");
  const email = stripControlChars(rawEmail ?? "");
  const message = (rawMessage ?? "").trim();

  if (!name) return JSON.stringify({ error: "name is required" });
  if (name.length > MAX_NAME_LEN) return JSON.stringify({ error: `name too long (max ${MAX_NAME_LEN} chars)` });
  if (!EMAIL_RE.test(email)) return JSON.stringify({ error: "a valid email address is required" });
  if (!message) return JSON.stringify({ error: "message is required" });
  if (message.length > MAX_MESSAGE_LEN)
    return JSON.stringify({ error: `message too long (max ${MAX_MESSAGE_LEN} chars)` });

  try {
    const resend = new Resend(process.env.RESEND_API_KEY);
    await resend.emails.send({
      from: "SPR Portfolio MCP <onboarding@resend.dev>",
      to: "selvinpaulgomathi@gmail.com",
      subject: `[MCP Contact] ${name}`,
      replyTo: email,
      html: `<h2>New message via Portfolio MCP</h2><p><strong>From:</strong> ${escapeHtml(name)} (${escapeHtml(email)})</p><hr/><p>${escapeHtml(message).replace(/\n/g, "<br>")}</p>`,
    });
  } catch {
    return JSON.stringify({ error: "Failed to send message. Please try again later." });
  }

  return JSON.stringify({
    success: true,
    message: `Message sent to Selvin from ${name}. He'll reply to ${email} soon.`,
  });
}
