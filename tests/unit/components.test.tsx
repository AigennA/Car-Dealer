import { describe, expect, it } from "vitest";
import { render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { cars } from "@/lib/cars";
import CarCard from "@/components/ui/CarCard";
import SearchForm from "@/components/ui/SearchForm";
import ContactForm from "@/components/contact/ContactForm";
import CarCreditCalculator from "@/components/CarCreditCalculator";
import FilterPanel from "@/components/FilterPanel";
import { initialFilters } from "@/lib/filters";
import { routerPush } from "../setup";

const car = cars[0];

describe("<CarCard>", () => {
  it("exposes one named heading link and a descriptive CTA", () => {
    render(<CarCard car={car} headingLevel="h2" />);
    const heading = screen.getByRole("heading", { level: 2, name: `${car.make} ${car.model}` });
    expect(within(heading).getByRole("link")).toHaveAttribute("href", `/bilar/${car.slug}`);
    // "Visa bil" is not ambiguous for screen-reader users (WCAG 2.4.4)
    expect(screen.getByRole("link", { name: `Visa bil ${car.make} ${car.model}` })).toBeInTheDocument();
    // the duplicate image link is hidden from AT → exactly 2 accessible links
    expect(screen.getAllByRole("link")).toHaveLength(2);
  });

  it("formats price and mileage in Swedish", () => {
    render(<CarCard car={{ ...car, price: 249900, mileage: 12300 }} />);
    expect(screen.getByText(/249\s900/)).toBeInTheDocument();
    expect(screen.getByText(/12\s300 mil/)).toBeInTheDocument();
  });
});

describe("<SearchForm>", () => {
  it("has labelled selects and navigates with the chosen params", async () => {
    const user = userEvent.setup();
    render(<SearchForm makes={["BMW", "Volvo"]} bodyTypes={["SUV"]} fuels={["Diesel"]} />);
    expect(screen.getByRole("search", { name: "Sök bilar" })).toBeInTheDocument();
    await user.selectOptions(screen.getByLabelText("Märke"), "Volvo");
    await user.selectOptions(screen.getByLabelText("Bränsle"), "Diesel");
    await user.click(screen.getByRole("button", { name: "Sök bilar" }));
    expect(routerPush).toHaveBeenCalledWith("/bilar?make=Volvo&fuel=Diesel");
  });
});

describe("<ContactForm>", () => {
  it("shows an error summary, marks fields invalid and moves focus", async () => {
    const user = userEvent.setup();
    render(<ContactForm />);
    await user.click(screen.getByRole("button", { name: "Skicka meddelande" }));

    const summary = await screen.findByRole("alert");
    expect(summary).toHaveTextContent("Formuläret innehåller 3 fel");
    const name = screen.getByLabelText(/Namn/);
    expect(name).toHaveAttribute("aria-invalid", "true");
    // "Fel:" prefix tells screen-reader users it is an error, not a hint
    expect(name).toHaveAccessibleDescription("Fel: Fyll i ditt namn.");
  });

  it("submits a valid message and confirms it", async () => {
    const user = userEvent.setup();
    render(<ContactForm />);
    await user.type(screen.getByLabelText(/Namn/), "Anna");
    await user.type(screen.getByLabelText(/E-post/), "anna@example.se");
    await user.type(screen.getByLabelText(/Meddelande/), "Är bilen fortfarande till salu?");
    await user.click(screen.getByRole("button", { name: "Skicka meddelande" }));
    expect(await screen.findByRole("status")).toHaveTextContent("Tack för ditt meddelande!");
  });

  it("pre-fills the car when arriving from a car page", () => {
    render(<ContactForm carSlug={car.slug} subject="provkorning" />);
    expect(screen.getByText(`${car.title} (${car.year})`)).toBeInTheDocument();
    expect(screen.getByLabelText(/^Ämne/)).toHaveValue("provkorning");
    expect((screen.getByLabelText(/Meddelande/) as HTMLTextAreaElement).value).toContain(car.title);
  });
});

describe("<CarCreditCalculator>", () => {
  it("updates live and shows an inline error instead of alert()", async () => {
    const user = userEvent.setup();
    render(<CarCreditCalculator carPrice={200_000} />);
    expect(screen.getByText("Beräknad månadskostnad")).toBeInTheDocument();

    const down = screen.getByLabelText("Kontantinsats (kr)");
    await user.clear(down);
    await user.type(down, "250000");
    expect(screen.getByText("Kontantinsatsen måste vara lägre än bilens pris.")).toBeInTheDocument();
    expect(down).toHaveAttribute("aria-invalid", "true");
  });
});

describe("<FilterPanel>", () => {
  it("every input has an accessible name", () => {
    render(<FilterPanel filters={initialFilters} onFilterChange={() => {}} onReset={() => {}} />);
    for (const el of screen.getAllByRole("spinbutton")) expect(el).toHaveAccessibleName();
    for (const el of screen.getAllByRole("combobox")) expect(el).toHaveAccessibleName();
    expect(screen.getByRole("searchbox", { name: "Sök märke eller modell" })).toBeInTheDocument();
  });
});

import TradeInForm from "@/components/contact/TradeInForm";
import MapEmbed from "@/components/MapEmbed";
import CookieSettings from "@/components/legal/CookieSettings";

describe("<TradeInForm>", () => {
  it("validates car details and groups fields with fieldsets", async () => {
    const user = userEvent.setup();
    render(<TradeInForm />);
    expect(screen.getByRole("group", { name: "Dina uppgifter" })).toBeInTheDocument();
    expect(screen.getByRole("group", { name: "Din bil" })).toBeInTheDocument();
    await user.type(screen.getByLabelText(/^Årsmodell/), "1800");
    await user.click(screen.getByRole("button", { name: "Skicka förfrågan" }));
    const summary = await screen.findByRole("alert");
    expect(summary).toHaveTextContent("Årsmodellen ska vara ett årtal mellan 1950");
    expect(screen.getByLabelText(/^Miltal/)).toHaveAccessibleDescription(/1 mil = 10 km.*Fyll i miltal/);
  });

  it("accepts a complete request", async () => {
    const user = userEvent.setup();
    render(<TradeInForm />);
    await user.type(screen.getByLabelText(/^Namn/), "Ali");
    await user.type(screen.getByLabelText(/^E-post/), "ali@example.se");
    await user.type(screen.getByLabelText(/^Märke/), "Volvo");
    await user.type(screen.getByLabelText(/^Modell/), "V60");
    await user.type(screen.getByLabelText(/^Årsmodell/), "2019");
    await user.type(screen.getByLabelText(/^Miltal/), "8 500");
    await user.click(screen.getByRole("button", { name: "Skicka förfrågan" }));
    expect(await screen.findByRole("status")).toHaveTextContent("Tack för din förfrågan!");
  });
});

describe("<MapEmbed> och samtycke", () => {
  it("laddar inte Google Maps förrän besökaren godkänner", async () => {
    const user = userEvent.setup();
    const { container } = render(<MapEmbed />);
    expect(container.querySelector("iframe")).toBeNull();
    expect(screen.getByRole("link", { name: /Vägbeskrivning.*ny flik/ })).toBeInTheDocument();
    await user.click(screen.getByRole("button", { name: "Visa karta (Google Maps)" }));
    expect(container.querySelector("iframe")).toHaveAttribute("title", expect.stringContaining("Karta"));
    expect(localStorage.getItem("car_dealer_consent")).toContain('"maps":true');
  });

  it("utan 'Kom ihåg' sparas inget samtycke", async () => {
    const user = userEvent.setup();
    const { container } = render(<MapEmbed />);
    await user.click(screen.getByLabelText("Kom ihåg mitt val"));
    await user.click(screen.getByRole("button", { name: "Visa karta (Google Maps)" }));
    expect(container.querySelector("iframe")).not.toBeNull();
    expect(localStorage.getItem("car_dealer_consent")).toBeNull();
  });

  it("samtycket kan återkallas i cookieinställningarna (switch)", async () => {
    const user = userEvent.setup();
    render(<CookieSettings />);
    const sw = screen.getByRole("switch", { name: "Visa Google Maps-karta" });
    expect(sw).toHaveAttribute("aria-checked", "false");
    await user.click(sw);
    expect(sw).toHaveAttribute("aria-checked", "true");
    await user.click(sw);
    expect(sw).toHaveAttribute("aria-checked", "false");
    expect(screen.getByRole("status")).toHaveTextContent("återkallat");
  });
});
