export type ContactInput = {
  name: string;
  email: string;
  phone: string;
  message: string;
};

export type ContactErrors = Partial<Record<keyof ContactInput, string>>;

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
const PHONE_RE = /^[+\d][\d\s-]{6,}$/;

/** Field-level validation with specific, actionable Swedish messages (WCAG 3.3.1 / 3.3.3). */
export function validateContact(input: ContactInput): ContactErrors {
  const errors: ContactErrors = {};
  if (!input.name.trim()) errors.name = "Fyll i ditt namn.";
  if (!input.email.trim()) errors.email = "Fyll i din e-postadress.";
  else if (!EMAIL_RE.test(input.email.trim()))
    errors.email = "E-postadressen verkar inte stämma. Exempel: namn@exempel.se";
  if (input.phone.trim() && !PHONE_RE.test(input.phone.trim()))
    errors.phone = "Telefonnumret får bara innehålla siffror, mellanslag och bindestreck.";
  if (input.message.trim().length < 10)
    errors.message = "Skriv ett meddelande på minst 10 tecken.";
  return errors;
}
