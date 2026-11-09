import { LIMITS, MESSAGES } from "./messages";

export type ContactInput = {
  name: string;
  email: string;
  phone: string;
  message: string;
};

export type ContactErrors = Partial<Record<keyof ContactInput, string>>;

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
const PHONE_RE = /^[+\d][\d\s-]{6,}$/;

/** Name, e-mail and (optional) phone — shared by every form. */
export function validateContactDetails(input: Pick<ContactInput, "name" | "email" | "phone">): ContactErrors {
  const errors: ContactErrors = {};
  if (!input.name.trim()) errors.name = MESSAGES.contact.nameRequired;
  if (!input.email.trim()) errors.email = MESSAGES.contact.emailRequired;
  else if (!EMAIL_RE.test(input.email.trim()))
    errors.email = MESSAGES.contact.emailInvalid;
  if (input.phone.trim() && !PHONE_RE.test(input.phone.trim()))
    errors.phone = MESSAGES.contact.phoneInvalid;
  return errors;
}

/** Contact form: details + a message (WCAG 3.3.1 / 3.3.3: specific, actionable errors). */
export function validateContact(input: ContactInput): ContactErrors {
  const errors = validateContactDetails(input);
  if (input.message.trim().length < LIMITS.messageMinLength)
    errors.message = MESSAGES.contact.messageTooShort(LIMITS.messageMinLength);
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
  const errors: TradeInErrors = validateContactDetails(input);
  if (!input.brand.trim()) errors.brand = MESSAGES.tradeIn.brandRequired;
  if (!input.model.trim()) errors.model = MESSAGES.tradeIn.modelRequired;
  const year = Number(input.year);
  if (!input.year.trim()) errors.year = MESSAGES.tradeIn.yearRequired;
  else if (!Number.isInteger(year) || year < LIMITS.tradeInMinYear || year > currentYear + 1)
    errors.year = MESSAGES.tradeIn.yearRange(LIMITS.tradeInMinYear, currentYear + 1);
  const mileage = Number(input.mileage.replace(/\s/g, ""));
  if (!input.mileage.trim()) errors.mileage = MESSAGES.tradeIn.mileageRequired;
  else if (!Number.isFinite(mileage) || mileage < 0 || mileage > LIMITS.maxMileage)
    errors.mileage = MESSAGES.tradeIn.mileageInvalid;
  return errors;
}

export type BookingDetails = { name: string; email: string; phone: string; regNumber: string; message: string };
export type BookingSelection = { service: string; date: string; time: string };
export type BookingErrors = Partial<Record<keyof BookingDetails | keyof BookingSelection, string>>;

/** Swedish registration number: ABC 123 or ABC 12D (spaces and case ignored). */
export const REG_NUMBER_RE = /^\s*[A-Za-z]{3}\s?\d{2}[A-Za-z0-9]\s*$/;

/** Workshop booking: a chosen slot plus contact details; phone is required so the workshop can call. */
export function validateBooking(selection: BookingSelection, details: BookingDetails): BookingErrors {
  const errors: BookingErrors = {};
  if (!selection.service) errors.service = MESSAGES.booking.serviceRequired;
  if (!selection.date) errors.date = MESSAGES.booking.dateRequired;
  if (!selection.time) errors.time = MESSAGES.booking.timeRequired;
  Object.assign(errors, validateContactDetails(details));
  if (!details.phone.trim()) errors.phone = MESSAGES.contact.phoneRequiredForWorkshop;
  if (!details.regNumber.trim()) errors.regNumber = MESSAGES.booking.regRequired;
  else if (!REG_NUMBER_RE.test(details.regNumber)) errors.regNumber = MESSAGES.booking.regInvalid;
  return errors;
}

export type TestDriveDetails = { name: string; email: string; phone: string; message: string };
export type TestDriveSelection = { date: string; time: string };
export type TestDriveErrors = Partial<Record<"date" | "time" | keyof TestDriveDetails, string>>;

/** Test drive: a chosen slot plus contact details; no registration number, but a phone so we can reach the customer. */
export function validateTestDrive(selection: TestDriveSelection, details: TestDriveDetails): TestDriveErrors {
  const errors: TestDriveErrors = {};
  if (!selection.date) errors.date = MESSAGES.booking.dateRequired;
  if (!selection.time) errors.time = MESSAGES.booking.timeRequired;
  Object.assign(errors, validateContactDetails(details));
  if (!details.phone.trim()) errors.phone = MESSAGES.testDrive.phoneRequired;
  return errors;
}
