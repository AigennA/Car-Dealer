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
    expect(name).toHaveAccessibleDescription("Fyll i ditt namn.");
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
    expect(screen.getByLabelText("Ämne")).toHaveValue("provkorning");
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
