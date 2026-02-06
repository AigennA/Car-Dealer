export type Car = {
  id: string;
  title: string;
  year: number;
  mileage: number;
  fuel: string;
  transmission: string;
  price: number;
  images: string[];
};

export const cars: Car[] = [
  {
    id: "volvo-v90",
    title: "Volvo V90 D4 AWD",
    year: 2017,
    mileage: 12300,
    fuel: "Diesel",
    transmission: "Automat",
    price: 249900,
    images: [
      "/cars/volvo-v90-1.jpg",
      "/cars/volvo-v90-2.jpg",
      "/cars/volvo-v90-3.jpg",
    ],
  },
  {
    id: "bmw-x5",
    title: "BMW X5 xDrive30d",
    year: 2019,
    mileage: 8900,
    fuel: "Diesel",
    transmission: "Automat",
    price: 389900,
    images: [
      "/cars/bmw-x5-1.jpg",
      "/cars/bmw-x5-2.jpg",
      "/cars/bmw-x5-3.jpg",
    ],
  },
];
