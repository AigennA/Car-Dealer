import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { cars } from "@/lib/cars";
import { SITE } from "@/lib/site";
import { statusOf } from "@/lib/carStatus";
import { unsplashUrl } from "@/lib/imageLoader";
import CarDetailClient from "./CarDetailClient";

type Params = { params: Promise<{ slug: string }> };

export const dynamicParams = false;

/** schema.org availability per state, for the search engines' rich results. */
const AVAILABILITY = {
  Available: "https://schema.org/InStock",
  Reserved: "https://schema.org/LimitedAvailability",
  Sold: "https://schema.org/SoldOut",
} as const;

export function generateStaticParams() {
  return cars.map((car) => ({ slug: car.slug }));
}

function findCar(slug: string) {
  return cars.find((c) => c.slug === slug);
}

function ogImage(src: string) {
  return src.startsWith("https://images.unsplash.com/") ? unsplashUrl(src, 1200, 70) : src;
}

export async function generateMetadata({ params }: Params): Promise<Metadata> {
  const { slug } = await params;
  const car = findCar(slug);
  if (!car) return { title: "Bilen hittades inte" };
  const price = car.price.toLocaleString("sv-SE");
  const description = `${car.title}, ${car.year}, ${car.mileage.toLocaleString("sv-SE")} mil, ${car.fuel.toLowerCase()}, ${car.transmission.toLowerCase()}. Pris ${price} kr. ${car.description}`;
  return {
    title: `${car.title} (${car.year}) – ${price} kr${statusOf(car) === "Sold" ? " (såld)" : ""}`,
    description,
    alternates: { canonical: `./` },
    openGraph: {
      title: `${car.title} (${car.year})`,
      description,
      images: [{ url: ogImage(car.images[0]), alt: car.title }],
    },
  };
}

export default async function CarDetailPage({ params }: Params) {
  const { slug } = await params;
  const car = findCar(slug);
  if (!car) notFound();

  // schema.org/Car structured data — eligible for rich results in search.
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Car",
    name: car.title,
    brand: { "@type": "Brand", name: car.make },
    model: car.model,
    vehicleModelDate: String(car.year),
    bodyType: car.bodyType,
    color: car.color,
    fuelType: car.fuel,
    vehicleTransmission: car.transmission,
    driveWheelConfiguration: car.drivetrain,
    mileageFromOdometer: { "@type": "QuantitativeValue", value: car.mileage * 10, unitCode: "KMT" },
    image: car.images.map(ogImage),
    description: car.description,
    url: `${SITE.url}/bilar/${car.slug}/`,
    offers: {
      "@type": "Offer",
      price: car.price,
      priceCurrency: "SEK",
      availability: AVAILABILITY[statusOf(car)],
      itemCondition: "https://schema.org/UsedCondition",
      seller: { "@type": "AutoDealer", name: SITE.legalName },
    },
  };

  return (
    <>
      <CarDetailClient slug={slug} />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
    </>
  );
}
