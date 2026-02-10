"use client";

import { useState } from "react";

type Props = {
  images: string[];
  title: string;
};

export default function ImageGallery({ images, title }: Props) {
  const [selectedImage, setSelectedImage] = useState(0);

  if (images.length === 0) {
    return null;
  }

  return (
    <div className="bg-white rounded-2xl shadow-sm overflow-hidden">
      <div className="aspect-[16/10] bg-gray-100">
        <img
          src={images[selectedImage]}
          alt={title}
          className="w-full h-full object-cover"
        />
      </div>

      <div className="p-5 border-t">
        <div className="flex gap-3 overflow-x-auto">
          {images.map((img, index) => (
            <button
              key={index}
              type="button"
              onClick={() => setSelectedImage(index)}
              aria-label={`Select image ${index + 1} of ${images.length}`}
              className={`h-20 w-32 flex-shrink-0 rounded-xl border-2 transition-all ${
                selectedImage === index
                  ? "border-primary shadow-md"
                  : "border-gray-200 hover:border-primary/50"
              }`}
            >
              <img
                src={img}
                alt={`${title} - bild ${index + 1}`}
                className="w-full h-full object-cover rounded-lg"
              />
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
