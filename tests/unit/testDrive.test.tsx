import { describe, expect, it } from "vitest";
import { render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { cars, type Car } from "@/lib/cars";
import { freeStarts } from "@/lib/workshop";
import { testDriveCatalog, testDriveService } from "@/lib/testDrive";
import { validateTestDrive } from "@/lib/validation";
import { MESSAGES } from "@/lib/messages";
import { DemoBookingRepository, memoryStore } from "@/lib/booking/demoRepository";
import TestDriveWizard from "@/components/workshop/TestDriveWizard";
import MyBooking from "@/components/workshop/manage/MyBooking";

const NOW = new Date("2026-11-09T06:00:00Z"); // Monday 07:00 Stockholm
const TUESDAY = "2026-11-10";
const WEDNESDAY = "2026-11-11";
const SATURDAY = "2026-11-14";

const bySlug = (slug: string) => cars.find((c) => c.slug === slug)!;
const volvo = bySlug("volvo-v90-d4-awd");
const bmw = bySlug("bmw-x5-xdrive30d");
const reserved = bySlug("mazda-mx-30-ev");
const sold = bySlug("mini-cooper-se");

function setup(findCar: (slug: string) => Car | undefined = (slug) => cars.find((c) => c.slug === slug)) {
  const store = memoryStore();
  return { store, repo: new DemoBookingRepository(() => NOW, undefined, store, findCar) };
}

const request = (carSlug: string, date: string, time: string) => ({
  carSlug, date, time, name: "Anna", email: "Anna@Example.se", phone: "0701234567", message: "",
});

describe("test-drive schedule (showroom hours, one car at a time)", () => {
  const free = (date: string, taken: { start: string; minutes: number }[] = []) =>
    freeStarts(testDriveService, date, NOW, taken, testDriveCatalog);

  it("uses the showroom's opening hours and the lead time", () => {
    const monday = free("2026-11-09");
    expect(monday[0]).toBe("09:00");        // 07:00 + 2 h lead
    expect(monday.at(-1)).toBe("17:30");    // a 30-minute visit must end by 18:00
    expect(monday).toHaveLength(18);
  });

  it("is open on Saturday 10-15 and closed on Sunday", () => {
    expect(free(SATURDAY)).toEqual(["10:00", "10:30", "11:00", "11:30", "12:00", "12:30", "13:00", "13:30", "14:00", "14:30"]);
    expect(free("2026-11-15")).toEqual([]);
  });

  it("a booked time is taken because the car can only be out once", () => {
    expect(free(TUESDAY, [{ start: "10:00", minutes: 30 }])).not.toContain("10:00");
    expect(free(TUESDAY, [{ start: "10:00", minutes: 30 }])).toContain("10:30");
  });
});

describe("validateTestDrive", () => {
  const ok = { name: "Anna", email: "anna@example.se", phone: "070-123 45 67", message: "" };
  it("accepts a complete request (no registration number needed)", () => {
    expect(validateTestDrive({ date: TUESDAY, time: "10:00" }, ok)).toEqual({});
  });
  it("needs a slot and a phone number", () => {
    expect(validateTestDrive({ date: "", time: "" }, { ...ok, phone: "" })).toEqual({
      date: MESSAGES.booking.dateRequired, time: MESSAGES.booking.timeRequired, phone: MESSAGES.testDrive.phoneRequired,
    });
  });
});

describe("test drives in the demo repository", () => {
  it("books a free car and confirms with the car in the name", async () => {
    const { repo } = setup();
    const c = await repo.createTestDrive(request(volvo.slug, TUESDAY, "10:00"));
    expect(c).toMatchObject({ kind: "testdrive", demo: true, durationMinutes: 30, serviceName: `Provkörning – ${volvo.title}` });
    expect(c.reference).toMatch(/^DEMO-/);
  });

  it("one car cannot be booked twice at the same time, another car can", async () => {
    const { repo } = setup();
    await repo.createTestDrive(request(volvo.slug, TUESDAY, "10:00"));
    await expect(repo.createTestDrive(request(volvo.slug, TUESDAY, "10:00"))).rejects.toMatchObject({ status: 409 });
    expect(await repo.loadTestDriveSlots(volvo.slug, TUESDAY)).not.toContain("10:00");
    await expect(repo.createTestDrive(request(bmw.slug, TUESDAY, "10:00"))).resolves.toMatchObject({ kind: "testdrive" });
  });

  it("test drives and the workshop do not block each other", async () => {
    const { repo } = setup();
    const workshop = { serviceCode: "dackbyte", date: WEDNESDAY, time: "12:00", name: "A", email: "a@b.se", phone: "0701234567", regNumber: "ABC123", message: "" };
    await repo.create(workshop);
    await repo.create(workshop);                                                  // both bays full at 12:00
    await expect(repo.createTestDrive(request(volvo.slug, WEDNESDAY, "12:00"))).resolves.toBeDefined();

    const before = await repo.loadSlots("dackbyte", TUESDAY);
    await repo.createTestDrive(request(bmw.slug, TUESDAY, "15:00"));
    expect(await repo.loadSlots("dackbyte", TUESDAY)).toEqual(before);            // unchanged by a test drive
  });

  it("sold, reserved and unknown cars cannot be test driven", async () => {
    const { repo } = setup();
    for (const slug of [sold.slug, reserved.slug]) {
      await expect(repo.createTestDrive(request(slug, TUESDAY, "10:00"))).rejects.toMatchObject({ status: 409 });
      await expect(repo.loadTestDriveDays(slug)).rejects.toMatchObject({ status: 409 });
    }
    await expect(repo.createTestDrive(request("finns-inte", TUESDAY, "10:00"))).rejects.toMatchObject({ status: 404 });
  });

  it("is found with the link secret or the e-mail, never by a registration number", async () => {
    const { repo } = setup();
    const c = await repo.createTestDrive(request(volvo.slug, TUESDAY, "10:00"));
    const byToken = await repo.find({ reference: c.reference, token: c.manageToken });
    expect(byToken).toMatchObject({ category: "provkorning", serviceName: "Provkörning", carSlug: volvo.slug, carTitle: volvo.title, regNumber: "" });
    expect((await repo.find({ reference: c.reference, contact: "anna@example.se" })).canChange).toBe(true);
    for (const contact of ["ABC12D", "---", "   "]) {
      await expect(repo.find({ reference: c.reference, contact })).rejects.toMatchObject({ status: 404 });
    }
  });

  it("moves (its own slot does not block it) and cancelling frees the time for the car", async () => {
    const { repo } = setup();
    const mine = await repo.createTestDrive(request(volvo.slug, WEDNESDAY, "10:00"));
    await repo.createTestDrive(request(volvo.slug, WEDNESDAY, "15:00"));
    const access = { reference: mine.reference, token: mine.manageToken };

    expect((await repo.reschedule(access, WEDNESDAY, "10:30")).time).toBe("10:30");
    await expect(repo.reschedule(access, WEDNESDAY, "15:00")).rejects.toMatchObject({ status: 409 });

    expect((await repo.cancel(access)).status).toBe("Cancelled");
    expect(await repo.loadTestDriveSlots(volvo.slug, WEDNESDAY)).toContain("10:30");
  });

  it("cannot be moved once the car is reserved, but can be cancelled", async () => {
    const live: Car = { ...volvo };                       // the car as the stock currently has it
    const { repo } = setup((slug) => (slug === volvo.slug ? live : undefined));
    const c = await repo.createTestDrive(request(volvo.slug, WEDNESDAY, "16:00"));
    const access = { reference: c.reference, token: c.manageToken };

    live.status = "Reserved";
    await expect(repo.reschedule(access, WEDNESDAY, "16:30")).rejects.toMatchObject({ status: 409 });
    expect((await repo.cancel(access)).status).toBe("Cancelled");
  });

  it("is locked inside the change window", async () => {
    const { repo } = setup();
    const c = await repo.createTestDrive(request(volvo.slug, "2026-11-09", "14:00")); // today
    const access = { reference: c.reference, token: c.manageToken };
    expect((await repo.find(access)).canChange).toBe(false);
    await expect(repo.cancel(access)).rejects.toMatchObject({ status: 409 });
  });
});

describe("<TestDriveWizard>", () => {
  it("has no registration number field, validates and confirms with the car and a QR code", async () => {
    const { repo } = setup();
    render(<TestDriveWizard car={volvo} repository={repo} />);

    await userEvent.click(await screen.findByRole("radio", { name: /10 nov/i }));
    await userEvent.click(await screen.findByRole("radio", { name: "10:00" }));
    expect(screen.queryByLabelText(/Registreringsnummer/)).not.toBeInTheDocument();
    expect(screen.getByText(/Du bokar provkörning av/)).toHaveTextContent(`${volvo.title} tisdag 10 november kl. 10:00`);

    // Missing phone number -> error summary with the focus
    await userEvent.type(screen.getByLabelText(/^Namn/), "Anna Svensson");
    await userEvent.type(screen.getByLabelText(/^E-post/), "anna@example.se");
    await userEvent.click(screen.getByRole("button", { name: "Boka provkörning" }));
    const summary = await screen.findByRole("alert");
    expect(summary).toHaveTextContent(MESSAGES.testDrive.phoneRequired);

    await userEvent.type(screen.getByLabelText(/^Telefon/), "070-123 45 67");
    await userEvent.click(screen.getByRole("button", { name: "Boka provkörning" }));
    const status = await screen.findByRole("status");
    expect(status).toHaveTextContent("Demobokning sparad");
    expect(status).toHaveTextContent(`Provkörning – ${volvo.title}`);
    expect(status).toHaveTextContent("ta med giltigt körkort");
    expect(within(status).getByRole("img", { name: /QR-kod till din bokning/ })).toBeInTheDocument();
    expect(status).not.toHaveTextContent("registreringsnummer kan du"); // test drives have no registration number
  });
});

describe("test drive in Min bokning", () => {
  it("shows the car, links to it and offers the test drive's times when moving", async () => {
    const { repo } = setup();
    const c = await repo.createTestDrive(request(volvo.slug, WEDNESDAY, "10:00"));
    window.history.replaceState(null, "", `/min-bokning/?ref=${c.reference}#t=${c.manageToken}`);
    render(<MyBooking repository={repo} />);

    expect(await screen.findByRole("heading", { name: "Provkörning" })).toBeInTheDocument();
    const card = screen.getByRole("article");
    expect(within(card).getByRole("link", { name: volvo.title })).toHaveAttribute("href", expect.stringMatching(new RegExp(`/bilar/${volvo.slug}/?$`)));
    expect(card).toHaveTextContent("onsdag 11 november kl. 10:00");

    await userEvent.click(screen.getByRole("button", { name: "Ändra tid" }));
    expect(await screen.findByRole("heading", { name: `Välj ny tid för Provkörning – ${volvo.title}` })).toBeInTheDocument();
    await userEvent.click(await screen.findByRole("radio", { name: /14 nov/i }));        // a Saturday: showroom only 10-15
    expect(await screen.findByRole("radio", { name: "10:00" })).toBeInTheDocument();
    expect(screen.queryByRole("radio", { name: "15:00" })).not.toBeInTheDocument();
    window.history.replaceState(null, "", "/");
  });
});
