"use server";

import { Resend } from "resend";
import { validateString, getErrorMessage } from "@/lib/utils";
import CustomEmail from "@/email/custom-email";
import React from "react";

const resend = new Resend(process.env.RESEND_API_KEY);

export const sendEmail = async (formData: FormData) => {
  const senderName = formData.get("senderName");
  const email = formData.get("email");
  const message = formData.get("message");

  if (!validateString(senderName, 500)) {
    return { error: "Invalid sender name" };
  }
  if (!validateString(email, 500)) {
    return { error: "Invalid sender email" };
  }
  if (!validateString(message, 5000)) {
    return { error: "Invalid message" };
  }

  let data;
  try {
    data = await resend.emails.send({
      from: "SPR Portfolio <onboarding@resend.dev>",
      to: "selvinpaulgomathi@gmail.com",
      subject: "Message from portfolio contact form",
      replyTo: email as string,
      react: React.createElement(CustomEmail, {
        senderName: senderName,
        message: message,
        email: email,
      }),
    });
  } catch (error: unknown) {
    return { error: getErrorMessage(error) };
  }

  return { data };
};
