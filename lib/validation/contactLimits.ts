// lib/validation/contactLimits.ts
// Contact field limits, kept zod-free so client components (the contact form's
// maxLength attributes) can import them without pulling zod into the bundle.
export const CONTACT_LIMITS = {
  nameMax: 200,
  emailMax: 254,
  messageMin: 2,
  messageMax: 5000,
} as const;
