// lib/mcp/contact.ts
// Shared contact_selvin tool logic (validation + rate limit + send). No "@/"
// aliases or JSON imports here so this compiles under both the Next.js bundler
// and the plain-tsc standalone build (tsconfig.server.json). Failures throw
// ToolError; provider error text is logged, never returned.
import { Resend } from "resend";
import { parseContact } from "../validation/contact";
import { checkContactRateLimit } from "../rateLimit";
import { ToolError } from "./errors";
import type { McpRequestContext } from "./types";

const GENERIC_ERROR = "Failed to send message. Please try again later.";
const SEND_TIMEOUT_MS = 10_000;

function escapeHtml(s: string): string {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

/** Rejects with a TimeoutError once `ms` passes; the timer never keeps the process alive. */
function withTimeout<T>(promise: Promise<T>, ms: number): Promise<T> {
  let timer: ReturnType<typeof setTimeout> | undefined;
  const timeout = new Promise<never>((_, reject) => {
    timer = setTimeout(() => reject(Object.assign(new Error(`Timed out after ${ms}ms`), { name: "TimeoutError" })), ms);
    timer.unref?.();
  });
  return Promise.race([promise, timeout]).finally(() => clearTimeout(timer));
}

export async function sendContactMessage(
  args: { name: string; email: string; message: string },
  ctx: McpRequestContext
): Promise<{ success: true; message: string }> {
  const parsed = parseContact(args);
  if (!parsed.ok) throw new ToolError(parsed.error);
  const { name, email, message } = parsed.data;

  const limitError = checkContactRateLimit(ctx.ip);
  if (limitError) throw new ToolError(limitError);

  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey) {
    console.error("[mcp/contact] RESEND_API_KEY is not configured");
    throw new ToolError(GENERIC_ERROR);
  }

  try {
    const { error } = await withTimeout(
      new Resend(apiKey).emails.send({
        from: "SPR Portfolio MCP <onboarding@resend.dev>",
        to: "selvinpaulgomathi@gmail.com",
        subject: `[MCP Contact] ${name}`,
        replyTo: email,
        html: `<h2>New message via Portfolio MCP</h2><p><strong>From:</strong> ${escapeHtml(name)} (${escapeHtml(email)})</p><hr/><p>${escapeHtml(message).replace(/\n/g, "<br>")}</p>`,
      }),
      SEND_TIMEOUT_MS
    );
    if (error) {
      console.error("[mcp/contact] Resend rejected the message:", error);
      throw new ToolError(GENERIC_ERROR);
    }
  } catch (err) {
    if (err instanceof ToolError) throw err;
    console.error("[mcp/contact] Failed to send:", err);
    throw new ToolError(GENERIC_ERROR);
  }

  return { success: true, message: `Message sent to Selvin from ${name}. He'll reply to ${email} soon.` };
}
