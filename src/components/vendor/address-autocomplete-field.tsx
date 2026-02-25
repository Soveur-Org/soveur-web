"use client";

import { useEffect, useRef, useState } from "react";
import type { ClientLocation } from "@/app/vendor/[id]/vendor.types";

type NominatimItem = {
  display_name: string;
  lat: string;
  lon: string;
  address?: {
    road?: string;
    house_number?: string;
    city?: string;
    town?: string;
    village?: string;
    postcode?: string;
    country?: string;
  };
};

type AddressAutocompleteFieldProps = {
  value: string;
  onInputChange: (value: string) => void;
  onSelectLocation: (location: ClientLocation) => void;
};

function toClientLocation(item: NominatimItem): ClientLocation {
  const road = item.address?.road ?? "";
  const houseNumber = item.address?.house_number ?? "";
  const street = [houseNumber, road].filter(Boolean).join(" ").trim();

  return {
    name: item.display_name,
    street: street || item.display_name,
    city: item.address?.city ?? item.address?.town ?? item.address?.village ?? "",
    zipcode: item.address?.postcode ?? "",
    country: item.address?.country ?? "",
    lng: Number.parseFloat(item.lon),
    lat: Number.parseFloat(item.lat),
  };
}

export function AddressAutocompleteField({
  value,
  onInputChange,
  onSelectLocation,
}: AddressAutocompleteFieldProps) {
  const [suggestions, setSuggestions] = useState<NominatimItem[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const selectedValueRef = useRef<string | null>(null);

  useEffect(() => {
    if (selectedValueRef.current && selectedValueRef.current === value) {
      selectedValueRef.current = null;
      setSuggestions([]);
      setIsLoading(false);
      return;
    }

    if (value.trim().length < 3) {
      setSuggestions([]);
      return;
    }

    const controller = new AbortController();
    const timeout = setTimeout(async () => {
      try {
        setIsLoading(true);
        const params = new URLSearchParams({
          q: value,
          format: "json",
          addressdetails: "1",
          limit: "5",
        });
        const response = await fetch(
          `https://nominatim.openstreetmap.org/search?${params.toString()}`,
          {
            signal: controller.signal,
          },
        );
        if (!response.ok) {
          setSuggestions([]);
          return;
        }
        const payload = (await response.json()) as NominatimItem[];
        setSuggestions(Array.isArray(payload) ? payload : []);
      } catch {
        setSuggestions([]);
      } finally {
        setIsLoading(false);
      }
    }, 250);

    return () => {
      controller.abort();
      clearTimeout(timeout);
    };
  }, [value]);

  return (
    <div className="relative">
      <input
        type="text"
        value={value}
        onChange={(event) => onInputChange(event.target.value)}
        placeholder="Saisissez votre adresse"
        className="w-full rounded-lg border border-[#d8dbe5] px-3 py-2 text-sm outline-none"
      />
      {isLoading ? <p className="mt-1 text-xs text-[#7f8395]">Recherche...</p> : null}
      {suggestions.length > 0 ? (
        <ul className="absolute z-20 mt-1 max-h-56 w-full overflow-auto rounded-lg border border-[#e6e8ef] bg-white shadow-lg">
          {suggestions.map((item) => (
            <li key={`${item.lat}-${item.lon}`}>
              <button
                type="button"
                onClick={() => {
                  const location = toClientLocation(item);
                  selectedValueRef.current = item.display_name;
                  onInputChange(item.display_name);
                  onSelectLocation(location);
                  setSuggestions([]);
                }}
                className="w-full px-3 py-2 text-left text-sm hover:bg-[#f3f4f6]"
              >
                {item.display_name}
              </button>
            </li>
          ))}
        </ul>
      ) : null}
    </div>
  );
}
