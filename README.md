This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://nextjs.org/docs/app/api-reference/cli/create-next-app).

## Car Dealer - Premium Bilhandel

Modern car sales website built with Next.js, React and Tailwind CSS.

### 🚀 Demo

Live site on GitHub Pages: [https://AigennA.github.io/Car-Dealer/](https://AigennA.github.io/Car-Dealer/)

## Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.

## Deploy on GitHub Pages

This project is configured for GitHub Pages deployment.

### Quick Deployment

1. Go to Repository Settings > Pages > Source: Select **GitHub Actions**
2. Push to `main` branch
3. GitHub Actions will automatically deploy

## Features

- 🚗 Car listing and detail pages
- 🔍 Advanced filtering and search
- 📱 Responsive design
- ⚡ Fast loading with static site generation
- 🎨 Modern UI/UX design
- 🔧 **NEW: Admin Panel with CRUD Operations**
  - Create, Read, Update, and Delete vehicles
  - Business owners can manage their inventory
  - Accessible at `/admin` route

## Admin Panel

The application now includes an admin interface for managing car listings. Business owners can:

- **View all vehicles** in a sortable table
- **Add new vehicles** with detailed information
- **Edit existing vehicles** to update details
- **Delete vehicles** from the inventory

### Accessing the Admin Panel

Navigate to `/admin` or click the "Admin" link in the navigation menu.

### API Endpoints

The admin panel uses the following REST API endpoints:

- `GET /api/cars` - List all cars
- `POST /api/cars` - Create a new car
- `GET /api/cars/[id]` - Get a single car
- `PUT /api/cars/[id]` - Update a car
- `DELETE /api/cars/[id]` - Delete a car

### Development vs Production

**Note:** The CRUD functionality requires a server environment to run. In development mode (`npm run dev`), all features work perfectly. For static deployment (GitHub Pages), the admin panel and API routes will not function as they require a Node.js server.

For production use with CRUD functionality, deploy to:
- Vercel (recommended)
- Railway
- Heroku
- Any Node.js hosting platform


