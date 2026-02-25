import type { VendorImage } from "@/app/vendor/[id]/vendor.types";

type GalleryTabContentProps = {
  images: VendorImage[];
  vendorName: string;
};

export function GalleryTabContent({ images, vendorName }: GalleryTabContentProps) {
  return (
    <section className="pb-20">
      {images.length === 0 ? (
        <p className="text-sm text-[#7f8395]">Aucune image dans la galerie.</p>
      ) : (
        <div className="grid grid-cols-2 gap-3">
          {images.map((image) => (
            <img
              key={image.id}
              src={image.url}
              alt={vendorName}
              className="h-28 w-full rounded-xl object-cover"
            />
          ))}
        </div>
      )}
    </section>
  );
}
