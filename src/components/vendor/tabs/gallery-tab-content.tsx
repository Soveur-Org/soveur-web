import type { VendorImage } from "@/app/vendor/[id]/vendor.types";

type GalleryTabContentProps = {
  images: VendorImage[];
  vendorName: string;
};

export function GalleryTabContent({ images, vendorName }: GalleryTabContentProps) {
  return (
    <section className="py-3">
      {images.length === 0 ? (
        <p className="py-4 text-center text-sm text-ink-secondary">Aucune image dans la galerie.</p>
      ) : (
        <div className="grid grid-cols-3 gap-2">
          {images.map((image) => (
            <img
              key={image.id}
              src={image.url}
              alt={vendorName}
              className="aspect-square w-full rounded-[20px] object-cover"
            />
          ))}
        </div>
      )}
    </section>
  );
}
