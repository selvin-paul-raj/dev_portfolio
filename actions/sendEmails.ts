"use server";

import React from "react";
import { headers } from "next/headers";
import { Resend } from "resend";
import CustomEmail from "@/email/custom-email";
import { parseContact } from "@/lib/validation/contact";
import { checkContactRateLimit, getClientIp } from "@/lib/rateLimit";

export type SendEmailResult = { ok: true } | { ok: false; error: string };

const GENERIC_ERROR = "Couldn't send your message right now. Please try again later or email me directly.";

export async function sendEmail(formData: FormData): Promise<SendEmailResult> {
  // Honeypot: real users never see this field. Pretend success so bots don't retry.
  const honeypot = formData.get("company_website");
  if (typeof honeypot === "string" && honeypot.trim() !== "") {
    return { ok: true };
  }

  const parsed = parseContact({
    name: formData.get("senderName") ?? undefined,
    email: formData.get("email") ?? undefined,
    message: formData.get("message") ?? undefined,
  });
  if (!parsed.ok) return parsed;
  const { name, email, message } = parsed.data;

  const requestHeaders = await headers();
  const limitError = checkContactRateLimit(getClientIp((h) => requestHeaders.get(h)));
  if (limitError) return { ok: false, error: limitError };

  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey) {
    console.error("[sendEmail] RESEND_API_KEY is not configured");
    return { ok: false, error: GENERIC_ERROR };
  }

  try {
    const { error } = await new Resend(apiKey).emails.send({
      from: "SPR Portfolio <onboarding@resend.dev>",
      to: "selvinpaulgomathi@gmail.com",
      subject: `Portfolio message from ${name}`,
      replyTo: email,
      react: React.createElement(CustomEmail, { senderName: name, email, message }),
    });
    if (error) {
      console.error("[sendEmail] Resend rejected the message:", error);
      return { ok: false, error: GENERIC_ERROR };
    }
  } catch (err) {
    console.error("[sendEmail] Failed to send:", err);
    return { ok: false, error: GENERIC_ERROR };
  }

  return { ok: true };
}
