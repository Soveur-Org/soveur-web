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
};

export function VendorTabs({ activeTab, onChange }: VendorTabsProps) {
  return (
    <nav className="mb-4 flex gap-2 text-sm" aria-label="Sections vendeur">
      {TABS.map((tab) => {
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
