# Car Dealer - Premium Bilhandel

Modern car sales website built with Next.js, React and Tailwind CSS.

![Car Dealer Website](https://github.com/user-attachments/assets/695f8c3a-460e-4cf4-9764-0cce4a424981)

## 🚀 Live Demo

Visit the live site: [https://AigennA.github.io/Car-Dealer/](https://AigennA.github.io/Car-Dealer/)

## ✨ Features

- 🚗 **Car Listings** - Browse through a curated selection of premium vehicles
- 🔍 **Advanced Search** - Filter by brand, model, and location
- 📱 **Responsive Design** - Optimized for all devices
- ⚡ **Fast Performance** - Built with Next.js for optimal speed
- 🎨 **Modern UI/UX** - Clean and intuitive interface
- 🔧 **Admin Panel** - CRUD operations for managing vehicle inventory

## 🛠️ Technology Stack

- **Framework:** Next.js 16
- **UI Library:** React 19
- **Styling:** Tailwind CSS 4
- **Language:** TypeScript
- **Deployment:** GitHub Pages

## 📋 Getting Started

### Prerequisites

- Node.js 20.x or higher
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

## 📦 Project Structure

```
Car-Dealer/
├── src/
│   ├── app/              # Next.js app directory
│   │   ├── page.tsx      # Homepage
│   │   ├── bilar/        # Car listings
│   │   ├── admin/        # Admin panel
│   │   └── ...
│   ├── components/       # React components
│   └── lib/             # Utility functions and data
├── public/              # Static assets
└── scripts/             # Build scripts
```

## 🔧 Admin Panel

The application includes an admin interface for managing car listings at `/admin`.

### Features:
- View all vehicles in a sortable table
- Add new vehicles with detailed information
- Edit existing vehicles
- Delete vehicles from inventory

### API Endpoints:
- `GET /api/cars` - List all cars
- `POST /api/cars` - Create a new car
- `GET /api/cars/[id]` - Get a single car
- `PUT /api/cars/[id]` - Update a car
- `DELETE /api/cars/[id]` - Delete a car

**Note:** Admin panel and API routes require a Node.js server environment. For static deployment (GitHub Pages), these features are not available.

## 🚀 Deployment

### GitHub Pages (Current)

This project is configured for GitHub Pages deployment.

**Setup:**
1. Go to Repository Settings > Pages > Source
2. Select **GitHub Actions**
3. Push to `main` branch
4. GitHub Actions will automatically build and deploy

The site will be available at: `https://[username].github.io/Car-Dealer/`

### Alternative Platforms

For full functionality including admin panel and API routes, deploy to:
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
