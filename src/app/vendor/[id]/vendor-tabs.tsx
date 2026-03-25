type VendorTabId = "about" | "services" | "gallery" | "reviews";

type TabItem = {
  id: VendorTabId;
  label: string;
};

const TABS: TabItem[] = [
  { id: "about", label: "A propos" },
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
    <nav className="mb-4 flex gap-2 overflow-x-auto pb-1 text-sm whitespace-nowrap" aria-label="Sections vendeur">
      {visibleTabs.map((tab) => {
        const isActive = activeTab === tab.id;
        return (
          <button
            key={tab.id}
            type="button"
            onClick={() => onChange(tab.id)}
            className={`rounded-full px-3 py-1.5 transition-colors ${
              isActive ? "bg-[#1f2436] text-white" : "text-[#7f8395]"
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
