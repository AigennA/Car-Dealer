import { cars } from "@/lib/cars";
import CarDetailClient from "./CarDetailClient";

export function generateStaticParams() {
  return cars.map((car) => ({
    slug: car.slug,
  }));
}

export default async function CarDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  return <CarDetailClient slug={slug} />;
}
