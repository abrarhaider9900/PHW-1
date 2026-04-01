"use client";

import Image from "next/image";
import { useMemo, useState } from "react";

type HorseGalleryProps = {
  name: string;
  imageUrl?: string | null;
  extraImages?: Array<string | null | undefined>;
};

export default function HorseGallery({
  name,
  imageUrl,
  extraImages = [],
}: HorseGalleryProps) {
  const images = useMemo(() => {
    const list = [imageUrl, ...extraImages].filter(Boolean) as string[];
    return list.length > 0 ? list : ["/images/placeholder.jpg"];
  }, [imageUrl, extraImages]);

  const [active, setActive] = useState(0);

  return (
    <div className="w-full">
      <div className="relative aspect-[3/2] w-full overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-[0_10px_30px_rgba(0,0,0,0.05)]">
        <Image
          src={images[active] ?? "/images/placeholder.jpg"}
          alt={name}
          fill
          className="object-cover transition duration-300"
          sizes="(max-width: 1024px) 100vw, 520px"
          priority
        />
      </div>

      {images.length > 1 && (
        <div className="mt-3 flex gap-2">
          {images.slice(0, 5).map((src, idx) => (
            <button
              key={`${src}-${idx}`}
              type="button"
              onClick={() => setActive(idx)}
              className={[
                "relative h-[45px] w-[60px] overflow-hidden rounded-md border-2 transition",
                idx === active ? "border-[#8b3d24]" : "border-transparent",
              ].join(" ")}
              aria-label={`View image ${idx + 1}`}
            >
              <Image src={src} alt="" fill className="object-cover" sizes="60px" />
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

