type VendorTabId = "about" | "services" | "gallery" | "reviews";

type TabItem = {
  id: VendorTabId;
  label: string;
};

const TABS: TabItem[] = [
  { id: "about", label: "À propos" },
  { id: "services", label: "Services" },
  { id: "gallery", label: "Galerie" },
  { id: "reviews", label: "Avis" },
];

type VendorTabsProps = {
  activeTab: VendorTabId;
  onChange: (tab: VendorTabId) => void;
  showServices: boolean;
  showGallery: boolean;
};

export function VendorTabs({ activeTab, onChange, showServices, showGallery }: VendorTabsProps) {
  const visibleTabs = TABS.filter((tab) => {
    if (tab.id === "services") return showServices;
    if (tab.id === "gallery") return showGallery;
    return true;
  });

  return (
    <nav
      className="mt-4 flex gap-2 overflow-x-auto text-sm whitespace-nowrap [scrollbar-width:none] lg:mt-0 [&::-webkit-scrollbar]:hidden"
      aria-label="Sections vendeur"
    >
      {visibleTabs.map((tab) => {
        const isActive = activeTab === tab.id;
        return (
          <button
            key={tab.id}
            type="button"
            onClick={() => onChange(tab.id)}
            className={`shrink-0 rounded-[20px] px-[17px] py-2.5 transition-colors ${
              isActive ? "bg-ink font-bold text-white" : "text-ink hover:bg-surface"
            }`}
          >
            {tab.label}
          </button>
        );
      })}
    </nav>
  );
}

export type { VendorTabId };
