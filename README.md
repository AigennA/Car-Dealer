# Car Dealer - Premium Bilhandel

Modern car sales website built with Next.js, React and Tailwind CSS.

![Car Dealer Website](https://github.com/user-attachments/assets/695f8c3a-460e-4cf4-9764-0cce4a424981)

## 🚀 Live Demo

Visit the live site: [https://AigennA.github.io/Car-Dealer/](https://AigennA.github.io/Car-Dealer/)

## ✨ Features

- 🚗 **Car Listings** – 24 quality-checked cars, rendered into static HTML (works without JS, crawlable)
- 🔍 **Search & filters** – make, body type, fuel, price, year, mileage; live result count
- 💰 **Loan calculators** – live monthly cost with inline validation
- 🙋 **Customer service** – named advisor with photo, phone, e-mail and booking on home, car and contact pages; team portraits on "Om oss"
- 📨 **Contact & trade-in forms** – accessible validation, pre-filled from the car page
- 📱 **Responsive** – mobile-first, no horizontal scroll down to 320 px
- ♿ **Accessible** – WCAG 2.2 AA: 0 axe violations, keyboard & screen-reader friendly
- ⚡ **Fast** – responsive AVIF/WebP images, self-hosted fonts, Lighthouse 91–100 (mobile)
- 🔎 **SEO** – per-car titles/descriptions, Open Graph, sitemap, robots, schema.org JSON-LD
- 🍪 **Privacy** – no tracking cookies; Google Maps loads only after consent; privacy policy, cookie page and accessibility statement
- 🔧 **Admin demo** – add/edit/delete cars (stored in your browser's localStorage)

## 📊 Quality

| | Before | After |
|---|---|---|
| Lighthouse accessibility | 86–96 | **100** on every page |
| Lighthouse performance (mobile, `/bilar`) | 79 (live site: 58) | **91** |
| axe WCAG 2.2 AA violations | 237 | **0** |
| Contrast failures on gradients/photos (pixel test) | 10 | **0** |
| ESLint errors | 10 | **0** |
| Automated tests | 0 | **69 unit + 124 E2E/a11y/contrast** |

Reports (Swedish): [docs/](docs/README.md) – Lighthouse, WCAG audit, heuristic evaluation, code review, test strategy.

## 🛠️ Technology Stack

- **Framework:** Next.js 16
- **UI Library:** React 19
- **Styling:** Tailwind CSS 4
- **Language:** TypeScript
- **Deployment:** GitHub Pages

## 📋 Getting Started

### Prerequisites

- Node.js 22.22 or higher (see `.nvmrc`)
- npm, yarn, pnpm, or bun

### Installation

1. Clone the repository:
```bash
git clone https://github.com/AigennA/Car-Dealer.git
cd Car-Dealer
```

2. Install dependencies:
```bash
npm install
```

3. Run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

4. Open [http://localhost:3000](http://localhost:3000) in your browser

### Building for Production

```bash
npm run build
```

The static site will be generated in the `out` directory.

### Testing

```bash
npm test             # unit + component tests (Vitest)
npm run build:test   # build for "/" (no GitHub Pages base path)
npm run test:e2e     # end-to-end + WCAG tests (Playwright + axe)
npm run lighthouse   # Lighthouse CI with performance budgets
npm run check        # lint + types + unit + build + e2e
```

See [docs/teststrategi.md](docs/teststrategi.md).

## 📦 Project Structure

```
Car-Dealer/
├── src/
│   ├── app/              # Next.js App Router pages, sitemap, robots, 404
│   ├── components/       # React components (ui/, layout/, contact/)
│   └── lib/              # Pure logic: cars, filters, finance, validation, image loader
├── tests/
│   ├── unit/             # Vitest unit + component tests
│   └── e2e/              # Playwright E2E + axe accessibility tests
├── docs/                 # Quality reports (Lighthouse, WCAG, heuristics, code review)
└── lighthouserc.json     # Lighthouse CI budgets
```

## 🔧 Admin Panel (demo)

`/admin` (linked as "Personalinloggning" in the footer) lets you add, edit and delete cars.
Demo login: `admin` / `admin123`.

> ⚠️ This is a **front-end demo only**: accounts and cars are stored in the browser's
> localStorage and the login is not secure. A real deployment needs a backend with
> authentication. See [docs/kodgranskning.md](docs/kodgranskning.md).

## 🚀 Deployment

### GitHub Pages (Current)

This project is configured for GitHub Pages deployment.

**Setup:**
1. Go to Repository Settings > Pages > Source
2. Select **GitHub Actions**
3. Push to `main` branch
4. GitHub Actions runs lint, type-check and unit tests, then builds and deploys

The site will be available at: `https://[username].github.io/Car-Dealer/`

### Alternative Platforms

For a real backend (forms, secure admin), deploy to:
- **Vercel** (recommended for Next.js)
- Railway
- Heroku  
- Any Node.js hosting platform

## 📝 License

This project is available for educational and personal use.

## 👤 Author

**AigennA**
- GitHub: [@AigennA](https://github.com/AigennA)

---

Built with ❤️ using Next.js
