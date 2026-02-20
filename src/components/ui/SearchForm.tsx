'use client';

import { useRouter } from 'next/navigation';

interface SearchFormProps {
  makes: string[];
  bodyTypes: string[];
  fuels: string[];
}

export default function SearchForm({ makes, bodyTypes, fuels }: SearchFormProps) {
  const router = useRouter();

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const form = e.currentTarget;
    const params = new URLSearchParams();
    const make = (form.elements.namedItem('make') as HTMLSelectElement).value;
    const bodyType = (form.elements.namedItem('bodyType') as HTMLSelectElement).value;
    const fuel = (form.elements.namedItem('fuel') as HTMLSelectElement).value;
    if (make) params.set('make', make);
    if (bodyType) params.set('bodyType', bodyType);
    if (fuel) params.set('fuel', fuel);
    const query = params.toString();
    router.push(`/bilar${query ? `?${query}` : ''}`);
  }

  return (
    <form onSubmit={handleSubmit} className="bg-white rounded-2xl shadow-2xl p-8">
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <select name="make" className="border border-gray-300 rounded-lg px-4 py-3 text-gray-900 focus:outline-none focus:ring-2 focus:ring-primary">
          <option value="">Välj märke</option>
          {makes.map((m) => (
            <option key={m} value={m}>{m}</option>
          ))}
        </select>

        <select name="bodyType" className="border border-gray-300 rounded-lg px-4 py-3 text-gray-900 focus:outline-none focus:ring-2 focus:ring-primary">
          <option value="">Välj kaross</option>
          {bodyTypes.map((bt) => (
            <option key={bt} value={bt}>{bt}</option>
          ))}
        </select>

        <select name="fuel" className="border border-gray-300 rounded-lg px-4 py-3 text-gray-900 focus:outline-none focus:ring-2 focus:ring-primary">
          <option value="">Välj bränsle</option>
          {fuels.map((f) => (
            <option key={f} value={f}>{f}</option>
          ))}
        </select>

        <button
          type="submit"
          className="bg-primary text-white px-6 py-3 rounded-lg hover:brightness-90 transition font-medium text-center flex items-center justify-center gap-2 cursor-pointer"
        >
          <span>SÖK</span>
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
        </button>
      </div>
    </form>
  );
}
