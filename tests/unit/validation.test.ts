import { describe, expect, it } from "vitest";
import { validateContact } from "@/lib/validation";

const valid = { name: "Anna Svensson", email: "anna@example.se", phone: "070-123 45 67", message: "Hej, är bilen kvar?" };

describe("validateContact", () => {
  it("accepts a valid message", () => {
    expect(validateContact(valid)).toEqual({});
  });

  it("phone is optional", () => {
    expect(validateContact({ ...valid, phone: "" })).toEqual({});
  });

  it("reports every invalid field with a specific message", () => {
    const errors = validateContact({ name: " ", email: "anna@", phone: "abc", message: "hej" });
    expect(Object.keys(errors).sort()).toEqual(["email", "message", "name", "phone"]);
    expect(errors.email).toMatch(/namn@exempel\.se/); // tells the user how to fix it
  });

  it("distinguishes a missing e-mail from a malformed one", () => {
    expect(validateContact({ ...valid, email: "" }).email).toBe("Fyll i din e-postadress.");
    expect(validateContact({ ...valid, email: "anna.se" }).email).toMatch(/verkar inte stämma/);
  });
});
