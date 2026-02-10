import { NextRequest, NextResponse } from "next/server";
import { carStorage } from "@/lib/storage";
import { type Car } from "@/lib/cars";

export const dynamic = "force-dynamic";

// GET all cars
export async function GET() {
  const cars = carStorage.getAll();
  return NextResponse.json(cars);
}

// POST - Create a new car
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    // Generate new ID and slug
    const allCars = carStorage.getAll();
    const newId = String(Math.max(...allCars.map(c => parseInt(c.id))) + 1);
    const slug = `${body.make}-${body.model}-${body.year}`
      .toLowerCase()
      .replace(/\s+/g, "-")
      .replace(/[^a-z0-9-]/g, "");
    
    const newCar: Car = {
      id: newId,
      slug,
      make: body.make,
      model: body.model,
      title: `${body.make} ${body.model}`,
      year: parseInt(body.year),
      mileage: parseInt(body.mileage),
      fuel: body.fuel,
      transmission: body.transmission,
      drivetrain: body.drivetrain,
      body: body.body,
      bodyType: body.bodyType,
      color: body.color,
      price: parseInt(body.price),
      images: body.images || ["https://images.unsplash.com/photo-1494976388531-d1058494cdd8?w=800&h=600&fit=crop"],
      featured: body.featured || false,
      description: body.description,
      features: body.features || [],
    };
    
    carStorage.create(newCar);
    
    return NextResponse.json(newCar, { status: 201 });
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to create car" },
      { status: 400 }
    );
  }
}
