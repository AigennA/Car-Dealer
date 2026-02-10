import { NextRequest, NextResponse } from "next/server";
import { carStorage } from "@/lib/storage";
import { type Car } from "@/lib/cars";

export const dynamic = "force-dynamic";

// GET single car
export async function GET(
  request: NextRequest,
  context: { params: { id: string } }
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
  context: { params: { id: string } }
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
    
    // Update car with new data
    const updatedCar: Car = {
      ...existingCar,
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
      images: body.images || existingCar.images,
      featured: body.featured !== undefined ? body.featured : existingCar.featured,
      description: body.description,
      features: body.features || existingCar.features,
    };
    
    carStorage.update(id, updatedCar);
    
    return NextResponse.json(updatedCar);
  } catch (error) {
    console.error("Failed to update car:", error);
    return NextResponse.json(
      { error: "Failed to update car" },
      { status: 400 }
    );
  }
}

// DELETE a car
export async function DELETE(
  request: NextRequest,
  context: { params: { id: string } }
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
