import { NextRequest, NextResponse } from "next/server";
import { carStorage } from "@/lib/storage";
import { type Car } from "@/lib/cars";

export const dynamic = "force-dynamic";

// GET single car
export async function GET(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  const { id } = await context.params;
  const car = carStorage.getById(id);

  if (!car) {
    return NextResponse.json(
      { error: "Car not found" },
      { status: 404 }
    );
  }

  return NextResponse.json(car);
}

// PUT - Update a car
export async function PUT(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await context.params;
    const body = await request.json();

    const existingCar = carStorage.getById(id);

    if (!existingCar) {
      return NextResponse.json(
        { error: "Car not found" },
        { status: 404 }
      );
    }

    if (!body.make || !body.model || !body.year || !body.price) {
      return NextResponse.json(
        { error: "Märke, modell, årsmodell och pris krävs" },
        { status: 400 }
      );
    }

    const updatedCar: Car = {
      ...existingCar,
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
        : existingCar.images,
      featured: body.featured !== undefined ? body.featured === true : existingCar.featured,
      description: body.description ? String(body.description).trim() : existingCar.description,
      features: Array.isArray(body.features) ? body.features.map((f: unknown) => String(f).trim()) : existingCar.features,
    };

    carStorage.update(id, updatedCar);

    return NextResponse.json(updatedCar);
  } catch {
    return NextResponse.json(
      { error: "Ogiltigt request-format" },
      { status: 400 }
    );
  }
}

// DELETE a car
export async function DELETE(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  const { id } = await context.params;
  const deletedCar = carStorage.delete(id);

  if (!deletedCar) {
    return NextResponse.json(
      { error: "Car not found" },
      { status: 404 }
    );
  }

  return NextResponse.json(deletedCar);
}
