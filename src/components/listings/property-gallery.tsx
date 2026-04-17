export type GalleryImage = { url: string; alt_text: string | null };

/**
 * Full-bleed hero image, then supporting tiles. Minimal chrome, magazine feel.
 */
export function PropertyGallery({ images }: { images: GalleryImage[] }) {
  if (!images.length) {
    return (
      <div className="flex aspect-[3/2] w-full items-center justify-center bg-brand-soft text-xs uppercase tracking-wide text-brand-accent">
        Photography coming soon
      </div>
    );
  }
  const [hero, ...rest] = images;
  const tiles = rest.slice(0, 4);

  return (
    <div className="space-y-3">
      <div className="relative aspect-[16/10] overflow-hidden bg-brand-soft sm:aspect-[21/9]">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={hero.url}
          alt={hero.alt_text ?? ""}
          className="h-full w-full object-cover"
        />
      </div>
      {tiles.length > 0 && (
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
          {tiles.map((img, i) => (
            <div
              key={i}
              className="relative aspect-[4/5] overflow-hidden bg-brand-soft"
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={img.url}
                alt={img.alt_text ?? ""}
                className="h-full w-full object-cover"
              />
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
