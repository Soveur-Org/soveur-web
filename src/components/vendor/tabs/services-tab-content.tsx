import type { ServiceCategoryGroup, VendorService } from "@/app/vendor/[id]/vendor.types";

type DataState = "idle" | "loading" | "success" | "error";

type SelectedService = {
  categoryId: string;
  service: VendorService;
} | null;

type ServicesTabContentProps = {
  servicesState: DataState;
  servicesError: string | null;
  serviceCategories: ServiceCategoryGroup[];
  selectedService: SelectedService;
  onOpenCategory: (categoryId: string) => void;
  formatServicePrice: (service: VendorService) => string | null;
};

export function ServicesTabContent({
  servicesState,
  servicesError,
  serviceCategories,
  selectedService,
  onOpenCategory,
  formatServicePrice,
}: ServicesTabContentProps) {
  return (
    <section className="space-y-3 pb-20">
      {servicesState === "loading" ? (
        <p className="text-sm text-[#7f8395]">Chargement des services...</p>
      ) : null}
      {servicesState === "error" ? (
        <p className="text-sm text-red-600">{servicesError ?? "Erreur API services."}</p>
      ) : null}
      {servicesState === "success" && serviceCategories.length === 0 ? (
        <p className="text-sm text-[#7f8395]">Aucun service disponible.</p>
      ) : null}
      {servicesState === "success"
        ? serviceCategories.map((category) => (
            <button
              key={category.id}
              type="button"
              onClick={() => onOpenCategory(category.id)}
              className={`flex w-full items-center justify-between rounded-xl border px-4 py-4 text-left ${
                selectedService?.categoryId === category.id
                  ? "border-[#1f2436] bg-[#f3f4f6]"
                  : "border-[#d8dbe5] bg-[#f3f4f6]"
              }`}
            >
              <span className="min-w-0">
                <span className="block text-sm font-medium text-[#1f2436]">{category.name}</span>
                {selectedService?.categoryId === category.id ? (
                  <>
                    <span className="mt-1 block truncate text-xs text-[#49506a]">
                      {selectedService.service.name}
                    </span>
                    <span className="mt-0.5 block text-sm font-bold text-[#1f2436]">
                      + {formatServicePrice(selectedService.service) ?? "--"}
                    </span>
                  </>
                ) : null}
              </span>
              <span className="ml-3 flex items-center gap-3 text-sm text-[#49506a]">
                {selectedService?.categoryId === category.id ? null : (
                  <span>{category.services.length}</span>
                )}
                <span className="text-[#1f2436]">▶</span>
              </span>
            </button>
          ))
        : null}
    </section>
  );
}
