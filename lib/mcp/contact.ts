// lib/mcp/contact.ts
// Shared contact_selvin tool logic (validation + rate limit + send). No "@/"
// aliases or JSON imports here so this compiles under both the Next.js bundler
// and the plain-tsc standalone build (tsconfig.server.json).
import { Resend } from "resend";
import { parseContact } from "../validation/contact";
import { checkContactRateLimit } from "../rateLimit";
import type { McpRequestContext } from "./types";

const GENERIC_ERROR = "Failed to send message. Please try again later.";

function escapeHtml(s: string): string {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

export async function sendContactMessage(args: Record<string, unknown>, ctx: McpRequestContext): Promise<string> {
  const parsed = parseContact({ name: args.name, email: args.email, message: args.message });
  if (!parsed.ok) return JSON.stringify({ error: parsed.error });
  const { name, email, message } = parsed.data;

  const limitError = checkContactRateLimit(ctx.ip);
  if (limitError) return JSON.stringify({ error: limitError });

  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey) {
    console.error("[mcp/contact] RESEND_API_KEY is not configured");
    return JSON.stringify({ error: GENERIC_ERROR });
  }

  try {
    const { error } = await new Resend(apiKey).emails.send({
      from: "SPR Portfolio MCP <onboarding@resend.dev>",
      to: "selvinpaulgomathi@gmail.com",
      subject: `[MCP Contact] ${name}`,
      replyTo: email,
      html: `<h2>New message via Portfolio MCP</h2><p><strong>From:</strong> ${escapeHtml(name)} (${escapeHtml(email)})</p><hr/><p>${escapeHtml(message).replace(/\n/g, "<br>")}</p>`,
    });
    if (error) {
      console.error("[mcp/contact] Resend rejected the message:", error);
      return JSON.stringify({ error: GENERIC_ERROR });
    }
  } catch (err) {
    console.error("[mcp/contact] Failed to send:", err);
    return JSON.stringify({ error: GENERIC_ERROR });
  }

  return JSON.stringify({
    success: true,
    message: `Message sent to Selvin from ${name}. He'll reply to ${email} soon.`,
  });
}
