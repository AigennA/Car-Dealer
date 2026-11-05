"use client";

import { useState } from "react";
import Image from "next/image";

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
    <div className="bg-white rounded-2xl shadow-sm overflow-hidden h-fit">
      <div className="aspect-[16/10] bg-gray-100 relative">
        <Image
          src={images[selectedImage]}
          alt={title}
          fill
          sizes="(max-width: 1024px) 100vw, 60vw"
          className="object-cover"
          preload
          fetchPriority="high"
        />
      </div>

      {images.length > 1 && (
        <div className="p-5 border-t">
          <div className="flex gap-3 overflow-x-auto">
            {images.map((img, index) => (
              <button
                key={index}
                type="button"
                onClick={() => setSelectedImage(index)}
                aria-label={`Visa bild ${index + 1} av ${images.length}`}
                aria-pressed={selectedImage === index}
                className={`h-20 w-32 flex-shrink-0 rounded-xl border-2 transition-colors relative overflow-hidden ${
                  selectedImage === index
                    ? "border-primary shadow-md"
                    : "border-gray-200 hover:border-primary/50"
                }`}
              >
                <Image
                  src={img}
                  alt=""
                  fill
                  sizes="128px"
                  className="object-cover"
                />
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
