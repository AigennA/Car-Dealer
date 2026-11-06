'use client';

import { useRouter } from 'next/navigation';
import { ROUTES } from '@/config/navigation';

interface SearchFormProps {
  makes: string[];
  bodyTypes: string[];
  fuels: string[];
}

const SELECT_CLASS =
  'w-full border border-gray-400 rounded-lg px-4 py-3 text-gray-900 bg-white ' +
  'focus:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:border-primary';

const LABEL_CLASS = 'block text-xs font-semibold uppercase tracking-wider text-gray-700 mb-1.5';

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
    router.push(`${ROUTES.cars}${query ? `?${query}` : ''}`);
  }

  return (
    <form
      onSubmit={handleSubmit}
      role="search"
      aria-label="Sök bilar"
      className="bg-white rounded-2xl shadow-2xl p-5 sm:p-8"
    >
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 items-end">
        <div>
          <label htmlFor="search-make" className={LABEL_CLASS}>Märke</label>
          <select id="search-make" name="make" className={SELECT_CLASS}>
            <option value="">Alla märken</option>
            {makes.map((m) => (
              <option key={m} value={m}>{m}</option>
            ))}
          </select>
        </div>

        <div>
          <label htmlFor="search-bodyType" className={LABEL_CLASS}>Kaross</label>
          <select id="search-bodyType" name="bodyType" className={SELECT_CLASS}>
            <option value="">Alla karosser</option>
            {bodyTypes.map((bt) => (
              <option key={bt} value={bt}>{bt}</option>
            ))}
          </select>
        </div>

        <div>
          <label htmlFor="search-fuel" className={LABEL_CLASS}>Bränsle</label>
          <select id="search-fuel" name="fuel" className={SELECT_CLASS}>
            <option value="">Alla bränslen</option>
            {fuels.map((f) => (
              <option key={f} value={f}>{f}</option>
            ))}
          </select>
        </div>

        <button
          type="submit"
          className="bg-primary text-white px-6 py-3 rounded-lg hover:bg-primary-dark transition-colors font-semibold text-center flex items-center justify-center gap-2 cursor-pointer"
        >
          <span>Sök bilar</span>
          <svg aria-hidden="true" className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
        </button>
      </div>
    </form>
  );
}
