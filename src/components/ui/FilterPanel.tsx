export default function FilterPanel() {
  return (
    <aside className="bg-white rounded-2xl p-5 shadow-sm">
      <h2 className="font-bold text-navy mb-4">Filter</h2>

      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Märke</label>
          <select className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-primary" title="Välj märke">
            <option>Alla</option>
            <option>Volvo</option>
            <option>BMW</option>
            <option>Audi</option>
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Bränsle</label>
          <select className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-primary" title="Välj bränsle">
            <option>Alla</option>
            <option>Bensin</option>
            <option>Diesel</option>
            <option>Hybrid</option>
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Växellåda</label>
          <select className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-primary" title="Välj växellåda">
            <option>Alla</option>
            <option>Automat</option>
            <option>Manuell</option>
          </select>
        </div>

        <button className="w-full mt-4 bg-primary text-white py-2 rounded-xl hover:bg-primary-dark">
          Uppdatera
        </button>
      </div>
    </aside>
  );
}
