// lib/validation/contact.ts
// Shared contact-message schema used by the site's contact form (server
// action) and the MCP contact_selvin tool. No "@/" aliases — also compiled by
// the standalone MCP build (tsconfig.server.json).
import { z } from "zod";
import { CONTACT_LIMITS } from "./contactLimits";

export { CONTACT_LIMITS };

// Collapse CR/LF/tab/NUL (and other C0 controls) to spaces so a crafted
// value can't smuggle extra lines into email headers or the subject.
const stripControlChars = (s: string) => s.replace(/[\u0000-\u001f\u007f]+/g, " ").trim();

export const contactSchema = z.object({
  name: z
    .string({ error: "Name is required" })
    .transform(stripControlChars)
    .pipe(
      z
        .string()
        .min(1, "Name is required")
        .max(CONTACT_LIMITS.nameMax, `Name must be at most ${CONTACT_LIMITS.nameMax} characters`),
    ),
  email: z
    .string({ error: "Email is required" })
    .trim()
    .max(CONTACT_LIMITS.emailMax, "Email is too long")
    .pipe(z.email("Please enter a valid email address")),
  message: z
    .string({ error: "Message is required" })
    .trim()
    .min(CONTACT_LIMITS.messageMin, "Message is too short")
    .max(CONTACT_LIMITS.messageMax, `Message must be at most ${CONTACT_LIMITS.messageMax} characters`),
});

export type ContactInput = z.infer<typeof contactSchema>;

/** Validates raw input; returns the parsed data or the first user-facing error. */
export function parseContact(
  input: unknown,
): { ok: true; data: ContactInput } | { ok: false; error: string } {
  const result = contactSchema.safeParse(input);
  if (result.success) return { ok: true, data: result.data };
  return { ok: false, error: result.error.issues[0]?.message ?? "Invalid input" };
}
