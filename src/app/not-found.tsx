import Link from "next/link";
import { ROUTES } from "@/config/navigation";

export const metadata = { title: "Sidan hittades inte" };

export default function NotFound() {
  return (
    <section className="bg-surface min-h-[60vh] flex items-center">
      <div className="max-w-2xl mx-auto px-4 py-16 text-center">
        <p className="text-sm font-semibold uppercase tracking-widest text-primary">Fel 404</p>
        <h1 className="mt-2 text-3xl md:text-4xl font-bold text-navy">Sidan hittades inte</h1>
        <p className="mt-4 text-gray-700">
          Sidan du letar efter finns inte längre eller har flyttats. Bilen kan redan vara såld.
        </p>
        <div className="mt-8 flex flex-col sm:flex-row gap-3 justify-center">
          <Link href={ROUTES.cars} className="bg-primary text-white px-6 py-3 rounded-lg font-semibold hover:bg-primary-dark transition-colors">
            Se alla bilar
          </Link>
          <Link href={ROUTES.home} className="border border-gray-400 text-navy px-6 py-3 rounded-lg font-semibold hover:border-primary transition-colors">
            Till startsidan
          </Link>
        </div>
      </div>
    </section>
  );
}
