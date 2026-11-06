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

export type TradeInInput = ContactInput & {
  brand: string;
  model: string;
  year: string;
  mileage: string;
};
export type TradeInErrors = Partial<Record<keyof TradeInInput, string>>;

/** Trade-in request: contact details + enough about the car to value it. */
export function validateTradeIn(input: TradeInInput, currentYear = new Date().getFullYear()): TradeInErrors {
  const { message: _ignored, ...contactErrors } = validateContact({ ...input, message: "x".repeat(10) });
  void _ignored;
  const errors: TradeInErrors = { ...contactErrors };
  if (!input.brand.trim()) errors.brand = "Fyll i bilens märke, t.ex. Volvo.";
  if (!input.model.trim()) errors.model = "Fyll i bilens modell, t.ex. V60.";
  const year = Number(input.year);
  if (!input.year.trim()) errors.year = "Fyll i årsmodell.";
  else if (!Number.isInteger(year) || year < 1950 || year > currentYear + 1)
    errors.year = `Årsmodellen ska vara ett årtal mellan 1950 och ${currentYear + 1}.`;
  const mileage = Number(input.mileage.replace(/\s/g, ""));
  if (!input.mileage.trim()) errors.mileage = "Fyll i miltal.";
  else if (!Number.isFinite(mileage) || mileage < 0 || mileage > 100000)
    errors.mileage = "Ange miltal i mil som en siffra, t.ex. 8500.";
  return errors;
}
