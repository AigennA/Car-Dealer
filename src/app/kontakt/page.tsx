import Link from "next/link";

export default function KontaktPage() {
  return (
    <section className="bg-surface min-h-screen">
      <div className="max-w-7xl mx-auto px-4 py-12">
        {/* Hero Section */}
        <div className="text-center mb-12">
          <h1 className="text-4xl md:text-5xl font-bold text-navy mb-4">
            Kontakta oss
          </h1>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Vi finns här för att hjälpa dig hitta din drömvagn. Kontakta oss idag!
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-8 mb-12">
          {/* Contact Form */}
          <div className="bg-white rounded-xl p-8 shadow-sm">
            <h2 className="text-2xl font-bold text-navy mb-6">Skicka ett meddelande</h2>
            <form className="space-y-4">
              <div>
                <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-2">
                  Namn
                </label>
                <input
                  type="text"
                  id="name"
                  name="name"
                  className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-primary"
                  placeholder="Ditt namn"
                />
              </div>

              <div>
                <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
                  E-post
                </label>
                <input
                  type="email"
                  id="email"
                  name="email"
                  className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-primary"
                  placeholder="din@email.se"
                />
              </div>

              <div>
                <label htmlFor="phone" className="block text-sm font-medium text-gray-700 mb-2">
                  Telefon
                </label>
                <input
                  type="tel"
                  id="phone"
                  name="phone"
                  className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-primary"
                  placeholder="070-000 00 00"
                />
              </div>

              <div>
                <label htmlFor="subject" className="block text-sm font-medium text-gray-700 mb-2">
                  Ämne
                </label>
                <select
                  id="subject"
                  name="subject"
                  className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-primary"
                >
                  <option value="">Välj ämne</option>
                  <option value="köpa">Jag vill köpa en bil</option>
                  <option value="sälja">Jag vill sälja min bil</option>
                  <option value="finansiering">Frågor om finansiering</option>
                  <option value="service">Service och reservdelar</option>
                  <option value="annat">Annat</option>
                </select>
              </div>

              <div>
                <label htmlFor="message" className="block text-sm font-medium text-gray-700 mb-2">
                  Meddelande
                </label>
                <textarea
                  id="message"
                  name="message"
                  rows={5}
                  className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-primary"
                  placeholder="Skriv ditt meddelande här..."
                />
              </div>

              <button
                type="submit"
                className="w-full bg-primary text-white px-6 py-3 rounded-lg hover:bg-primary-dark transition font-medium"
              >
                Skicka meddelande
              </button>
            </form>
          </div>

          {/* Contact Information */}
          <div className="space-y-6">
            <div className="bg-white rounded-xl p-8 shadow-sm">
              <h2 className="text-2xl font-bold text-navy mb-6">Kontaktinformation</h2>
              
              <div className="space-y-4">
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center flex-shrink-0">
                    <span className="text-primary text-xl">📞</span>
                  </div>
                  <div>
                    <h3 className="font-semibold text-navy mb-1">Telefon</h3>
                    <p className="text-gray-600">070-000 00 00</p>
                    <p className="text-sm text-gray-500">Mån-Fre 09:00-18:00</p>
                  </div>
                </div>

                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center flex-shrink-0">
                    <span className="text-primary text-xl">✉️</span>
                  </div>
                  <div>
                    <h3 className="font-semibold text-navy mb-1">E-post</h3>
                    <p className="text-gray-600">info@cardealer.se</p>
                    <p className="text-sm text-gray-500">Vi svarar inom 24 timmar</p>
                  </div>
                </div>

                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center flex-shrink-0">
                    <span className="text-primary text-xl">📍</span>
                  </div>
                  <div>
                    <h3 className="font-semibold text-navy mb-1">Besöksadress</h3>
                    <p className="text-gray-600">Bilvägen 123</p>
                    <p className="text-gray-600">123 45 Stockholm</p>
                  </div>
                </div>

                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center flex-shrink-0">
                    <span className="text-primary text-xl">🕒</span>
                  </div>
                  <div>
                    <h3 className="font-semibold text-navy mb-1">Öppettider</h3>
                    <p className="text-gray-600">Måndag-Fredag: 09:00-18:00</p>
                    <p className="text-gray-600">Lördag: 10:00-15:00</p>
                    <p className="text-gray-600">Söndag: Stängt</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Quick Links */}
            <div className="bg-gradient-to-br from-primary to-[#0099CC] rounded-xl p-8 text-white">
              <h3 className="text-xl font-bold mb-4">Vill du veta mer?</h3>
              <p className="mb-6 opacity-90">
                Besök vår showroom och låt våra experter guida dig till rätt bil
              </p>
              <Link
                href="/bilar"
                className="inline-block bg-white text-primary px-6 py-3 rounded-lg hover:bg-gray-100 transition font-medium"
              >
                Se vårt lager
              </Link>
            </div>
          </div>
        </div>

        {/* Map Section */}
        <div className="bg-white rounded-xl p-8 shadow-sm">
          <h2 className="text-2xl font-bold text-navy mb-6">Hitta till oss</h2>
          <div className="bg-gray-200 rounded-lg h-96 flex items-center justify-center">
            <p className="text-gray-500">Karta (integration kommer snart)</p>
          </div>
        </div>
      </div>
    </section>
  );
}
