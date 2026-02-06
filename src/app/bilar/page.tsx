import { cars } from "@/lib/cars";
import CarCard from "@/components/ui/CarCard";
import FilterPanel from "@/components/ui/FilterPanel";

export default function CarsPage() {
  return (
    <section className="bg-surface min-h-screen">
      <div className="max-w-7xl mx-auto px-4 py-16">
        <h1 className="text-3xl font-bold text-navy mb-8">Våra bilar</h1>

        <div className="grid grid-cols-1 lg:grid-cols-[280px_1fr] gap-8">
          <FilterPanel />
          <div className="grid sm:grid-cols-2 xl:grid-cols-3 gap-6">
            {cars.map((car) => (
              <CarCard key={car.id} car={car} />
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
