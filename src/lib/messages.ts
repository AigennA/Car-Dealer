/**
 * All user-facing Swedish validation and status messages in one place.
 * The API returns the same wording (backend/src/CarDealer.Api/Common/Messages.cs).
 */
export const MESSAGES = {
  contact: {
    nameRequired: "Fyll i ditt namn.",
    emailRequired: "Fyll i din e-postadress.",
    emailInvalid: "E-postadressen verkar inte stämma. Exempel: namn@exempel.se",
    phoneInvalid: "Telefonnumret får bara innehålla siffror, mellanslag och bindestreck.",
    phoneRequiredForWorkshop: "Fyll i ditt telefonnummer så att verkstaden kan nå dig.",
    messageTooShort: (min: number) => `Skriv ett meddelande på minst ${min} tecken.`,
  },
  tradeIn: {
    brandRequired: "Fyll i bilens märke, t.ex. Volvo.",
    modelRequired: "Fyll i bilens modell, t.ex. V60.",
    yearRequired: "Fyll i årsmodell.",
    yearRange: (min: number, max: number) => `Årsmodellen ska vara ett årtal mellan ${min} och ${max}.`,
    mileageRequired: "Fyll i miltal.",
    mileageInvalid: "Ange miltal i mil som en siffra, t.ex. 8500.",
  },
  booking: {
    serviceRequired: "Välj en tjänst.",
    dateRequired: "Välj en dag.",
    timeRequired: "Välj en tid.",
    regRequired: "Fyll i bilens registreringsnummer.",
    regInvalid: "Registreringsnumret ska ha formatet ABC 123 eller ABC 12D.",
    loadDaysFailed: "Kunde inte hämta lediga dagar. Ring oss gärna i stället.",
    loadSlotsFailed: "Kunde inte hämta lediga tider. Ring oss gärna i stället.",
    sendFailed: "Bokningen kunde inte skickas. Försök igen eller ring oss.",
  },
  car: {
    make: "Ange märke.",
    model: "Ange modell.",
    yearRange: (min: number, max: number) => `Årsmodellen ska vara mellan ${min} och ${max}.`,
    mileageRange: (max: number) => `Miltal ska anges i mil (0–${max.toLocaleString("sv-SE")}).`,
    price: "Ange ett pris i kronor.",
    color: "Ange färg.",
  },
  loan: {
    priceRequired: "Ange bilens pris.",
    downPaymentNegative: "Kontantinsatsen kan inte vara negativ.",
    downPaymentTooHigh: "Kontantinsatsen måste vara lägre än bilens pris.",
  },
  generic: "Något gick fel. Försök igen.",
} as const;

/** Validation limits shared by the forms. */
export const LIMITS = {
  messageMinLength: 10,
  tradeInMinYear: 1950,
  maxMileage: 100_000,
} as const;
