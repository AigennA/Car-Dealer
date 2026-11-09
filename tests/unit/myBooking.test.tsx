import { describe, expect, it, beforeEach } from "vitest";
import { act, render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import MyBooking from "@/components/workshop/manage/MyBooking";
import { BookingConfirmation } from "@/components/workshop/booking/BookingConfirmation";
import { DemoBookingRepository, memoryStore } from "@/lib/booking/demoRepository";
import { MESSAGES } from "@/lib/messages";

const NOW = new Date("2026-11-09T06:00:00Z"); // Monday 07:00 Stockholm

async function setup() {
  const repo = new DemoBookingRepository(() => NOW, undefined, memoryStore());
  const c = await repo.create({
    serviceCode: "service-liten", date: "2026-11-17", time: "10:00", name: "Anna", email: "anna@example.se",
    phone: "0701234567", regNumber: "ABC 12D", message: "",
  });
  return { repo, c };
}

beforeEach(() => window.history.replaceState(null, "", "/min-bokning/"));

describe("<MyBooking>", () => {
  it("validates the lookup form with an error summary", async () => {
    const { repo } = await setup();
    render(<MyBooking repository={repo} />);
    await userEvent.click(screen.getByRole("button", { name: "Visa bokningen" }));
    const summary = await screen.findByRole("alert");
    expect(summary).toHaveTextContent(MESSAGES.myBooking.referenceRequired);
    expect(summary).toHaveTextContent(MESSAGES.myBooking.contactRequired);
    expect(screen.getByLabelText(/^Bokningsnummer/)).toHaveAttribute("aria-invalid", "true");
  });

  it("finds the booking by number + registration number and focuses it", async () => {
    const { repo, c } = await setup();
    render(<MyBooking repository={repo} />);
    await userEvent.type(screen.getByLabelText(/^Bokningsnummer/), c.reference.toLowerCase());
    await userEvent.type(screen.getByLabelText(/^E-post eller registreringsnummer/), "abc12d");
    await userEvent.click(screen.getByRole("button", { name: "Visa bokningen" }));

    const heading = await screen.findByRole("heading", { name: "Service liten" });
    expect(heading).toHaveFocus();
    const card = screen.getByRole("article");
    expect(card).toHaveTextContent("tisdag 17 november kl. 10:00");
    expect(card).toHaveTextContent("Bokad");
    expect(within(card).getByRole("img", { name: new RegExp(`QR-kod för bokning ${c.reference}`) })).toBeInTheDocument();
    expect(within(card).getByRole("link", { name: "Lägg till i kalendern" })).toHaveAttribute("download", `bokning-${c.reference}.ics`);
  });

  it("shows one message for wrong details", async () => {
    const { repo, c } = await setup();
    render(<MyBooking repository={repo} />);
    await userEvent.type(screen.getByLabelText(/^Bokningsnummer/), c.reference);
    await userEvent.type(screen.getByLabelText(/^E-post eller registreringsnummer/), "fel@example.se");
    await userEvent.click(screen.getByRole("button", { name: "Visa bokningen" }));
    const alert = await screen.findByRole("alert");
    expect(alert).toHaveTextContent(MESSAGES.myBooking.notFound);
    expect(alert).toHaveFocus();
  });

  it("opens straight from the personal link and cancels after confirmation", async () => {
    const { repo, c } = await setup();
    window.history.replaceState(null, "", `/min-bokning/?ref=${c.reference}#t=${c.manageToken}`);
    render(<MyBooking repository={repo} />);
    await screen.findByRole("heading", { name: "Service liten" });

    await userEvent.click(screen.getByRole("button", { name: "Avboka" }));
    expect(screen.getByText(/Vill du avboka Service liten/)).toHaveFocus();
    await userEvent.click(screen.getByRole("button", { name: "Ja, avboka" }));

    const status = await screen.findByText(MESSAGES.myBooking.cancelled);
    expect(status).toHaveFocus();
    expect(screen.getByRole("article")).toHaveTextContent("Avbokad");
    expect(screen.queryByRole("button", { name: "Ändra tid" })).not.toBeInTheDocument();
  });

  it("moves the booking to a new time", async () => {
    const { repo, c } = await setup();
    window.history.replaceState(null, "", `/min-bokning/?ref=${c.reference}#t=${c.manageToken}`);
    render(<MyBooking repository={repo} />);
    await userEvent.click(await screen.findByRole("button", { name: "Ändra tid" }));
    expect(screen.getByRole("heading", { name: /Välj ny tid/ })).toHaveFocus();

    await userEvent.click(await screen.findByRole("radio", { name: /18 nov/i }));
    await userEvent.click(await screen.findByRole("radio", { name: "14:00" }));
    await act(() => userEvent.click(screen.getByRole("button", { name: "Spara ny tid" })));

    expect(await screen.findByText(/Din nya tid är onsdag 18 november kl\. 14:00/)).toHaveFocus();
    expect(screen.getByRole("article")).toHaveTextContent("onsdag 18 november kl. 14:00");
  });
});

describe("<BookingConfirmation>", () => {
  it("gives the booking number, a personal link, a QR code and a calendar file", () => {
    render(
      <BookingConfirmation onBookAnother={() => {}} confirmation={{
        reference: "CD-ABC234", manageToken: "secret", serviceName: "Däckbyte", date: "2026-11-10", time: "08:00",
        durationMinutes: 30, demo: false, kind: "service",
      }} />,
    );
    const status = screen.getByRole("status");
    expect(status).toHaveTextContent("Tack! Din tid är bokad.");
    expect(status).toHaveTextContent("CD-ABC234");
    expect(screen.getByRole("link", { name: "Hantera bokningen" })).toHaveAttribute("href", expect.stringMatching(/^\/min-bokning\/?\?ref=CD-ABC234#t=secret$/));
    expect(screen.getByRole("img", { name: /QR-kod till din bokning CD-ABC234/ })).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "Lägg till i kalendern" }).getAttribute("href")).toMatch(/^data:text\/calendar/);
    expect(status).not.toHaveTextContent("Demoläge");
  });
});
