"use client";

import { useState } from "react";

type ProductPhoto = {
  image_url: string | null;
  alt_text?: string | null;
  is_primary?: boolean;
  sort_order?: number;
};

type Props = { photos: ProductPhoto[]; productName: string; className?: string };

export default function ProductPhotoCarousel({ photos, productName, className = "" }: Props) {
  const images = [...photos]
    .filter((photo): photo is ProductPhoto & { image_url: string } => typeof photo.image_url === "string" && photo.image_url.length > 0)
    .sort((a, b) => Number(Boolean(b.is_primary)) - Number(Boolean(a.is_primary)) || (a.sort_order ?? 0) - (b.sort_order ?? 0));
  const [active, setActive] = useState(0);

  if (!images.length) {
    return <div className={`flex h-52 items-center justify-center bg-pink-50 text-6xl ${className}`}>🎁</div>;
  }

  const move = (direction: number) => setActive((current) => (current + direction + images.length) % images.length);

  return (
    <div className={`relative overflow-hidden bg-pink-50 ${className}`}>
      <img src={images[active].image_url!} alt={images[active].alt_text || productName} className="h-full w-full object-cover" />
      {images.length > 1 ? (
        <>
          <button type="button" aria-label="Fotografia anterior" onClick={() => move(-1)} className="absolute left-2 top-1/2 -translate-y-1/2 rounded-full bg-white/90 px-3 py-2 text-lg font-bold text-berry shadow">‹</button>
          <button type="button" aria-label="Fotografia seguinte" onClick={() => move(1)} className="absolute right-2 top-1/2 -translate-y-1/2 rounded-full bg-white/90 px-3 py-2 text-lg font-bold text-berry shadow">›</button>
          <span className="absolute bottom-2 right-2 rounded-full bg-black/60 px-2 py-1 text-xs font-semibold text-white">{active + 1}/{images.length}</span>
          <div className="absolute bottom-2 left-1/2 flex -translate-x-1/2 gap-1.5">
            {images.map((photo, index) => (
              <button key={`${photo.image_url}-${index}`} type="button" aria-label={`Ver fotografia ${index + 1}`} onClick={() => setActive(index)} className={`h-2.5 w-2.5 rounded-full border border-white ${active === index ? "bg-white" : "bg-white/40"}`} />
            ))}
          </div>
        </>
      ) : null}
    </div>
  );
}
