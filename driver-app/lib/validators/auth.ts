import { z } from 'zod';

// Nigerian mobile numbers, accepting either local (0801...) or E.164-ish
// (+234801...) formats since drivers will type this on a basic keypad.
export const phoneEntrySchema = z.object({
  fullName: z.string().trim().min(2, 'Enter your full name'),
  phone: z
    .string()
    .trim()
    .regex(/^(\+234|0)[789][01]\d{8}$/, 'Enter a valid Nigerian phone number'),
});

export type PhoneEntryFormData = z.infer<typeof phoneEntrySchema>;

// Converts a local 0801... number to E.164 (+234801...) for Firebase Phone Auth.
export function toE164(phone: string): string {
  const trimmed = phone.trim();
  if (trimmed.startsWith('+234')) return trimmed;
  if (trimmed.startsWith('0')) return `+234${trimmed.slice(1)}`;
  return trimmed;
}
