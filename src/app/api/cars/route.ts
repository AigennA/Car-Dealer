import { NextRequest, NextResponse } from "next/server";
import { carStorage } from "@/lib/storage";
import { type Car } from "@/lib/cars";

export const dynamic = "force-dynamic";

// GET all cars
export async function GET() {
  const cars = carStorage.getAll();
  return NextResponse.json(cars);
}

function validateCarInput(body: Record<string, unknown>): string | null {
  if (!body.make || typeof body.make !== "string") return "Märke krävs";
  if (!body.model || typeof body.model !== "string") return "Modell krävs";
  if (!body.year || isNaN(Number(body.year))) return "Giltigt årsmodell krävs";
  if (!body.mileage || isNaN(Number(body.mileage))) return "Giltigt miltal krävs";
  if (!body.price || isNaN(Number(body.price))) return "Giltigt pris krävs";
  if (!body.fuel || typeof body.fuel !== "string") return "Bränsle krävs";
  if (!body.transmission || typeof body.transmission !== "string") return "Växellåda krävs";
  if (!body.drivetrain || typeof body.drivetrain !== "string") return "Drivning krävs";
  if (!body.bodyType || typeof body.bodyType !== "string") return "Karosstyp krävs";
  if (!body.color || typeof body.color !== "string") return "Färg krävs";
  if (!body.description || typeof body.description !== "string") return "Beskrivning krävs";

  const year = Number(body.year);
  if (year < 1900 || year > 2030) return "Årsmodell måste vara mellan 1900 och 2030";
  if (Number(body.mileage) < 0) return "Miltal kan inte vara negativt";
  if (Number(body.price) < 0) return "Pris kan inte vara negativt";

  return null;
}

// POST - Create a new car
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    const error = validateCarInput(body);
    if (error) {
      return NextResponse.json({ error }, { status: 400 });
    }

    const allCars = carStorage.getAll();
    const newId = String(Math.max(...allCars.map(c => parseInt(c.id)), 0) + 1);
    const slug = `${body.make}-${body.model}-${body.year}`
      .toLowerCase()
      .replace(/\s+/g, "-")
      .replace(/[^a-z0-9-]/g, "");

    const newCar: Car = {
      id: newId,
      slug,
      make: String(body.make).trim(),
      model: String(body.model).trim(),
      title: `${String(body.make).trim()} ${String(body.model).trim()}`,
      year: parseInt(body.year),
      mileage: parseInt(body.mileage),
      fuel: String(body.fuel).trim(),
      transmission: String(body.transmission).trim(),
      drivetrain: String(body.drivetrain).trim(),
      bodyType: String(body.bodyType).trim(),
      color: String(body.color).trim(),
      price: parseInt(body.price),
      images: Array.isArray(body.images) && body.images.length > 0
        ? body.images.map((i: unknown) => String(i).trim())
        : ["https://images.unsplash.com/photo-1494976388531-d1058494cdd8?w=800&h=600&fit=crop"],
      featured: body.featured === true,
      description: String(body.description).trim(),
      features: Array.isArray(body.features) ? body.features.map((f: unknown) => String(f).trim()) : [],
    };

    carStorage.create(newCar);

    return NextResponse.json(newCar, { status: 201 });
  } catch {
    return NextResponse.json(
      { error: "Ogiltigt request-format" },
      { status: 400 }
    );
  }
}
