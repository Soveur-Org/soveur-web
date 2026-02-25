import type {
  BookingSlot,
  Category,
  ClientLocation,
  Vendor,
  VendorReview,
  VendorService,
} from "@/app/vendor/[id]/vendor.types";

type MaybeData<T> = T | { data: T };

type ServiceOrderPayload = {
  scheduledAt?: string;
  scheduledDuration?: number;
  customerEmail?: string;
  customerName?: string;
  customerPhone?: string;
  bookingLocationId?: string;
  clientLocation?: ClientLocation;
  bookingNotes?: string;
};

function getBaseUrl() {
  const baseUrl = process.env.NEXT_PUBLIC_API_BASE_URL;
  if (!baseUrl) {
    throw new Error("Missing NEXT_PUBLIC_API_BASE_URL in environment variables.");
  }
  return baseUrl;
}

function normalizeApiMessage(message: string) {
  if (message.includes("outside the professional's service area")) {
    return "Cette adresse est hors de la zone d'intervention du professionnel.";
  }
  return message;
}

async function fetchJson<T>(path: string, init?: RequestInit): Promise<T> {
  const response = await fetch(`${getBaseUrl()}${path}`, {
    ...init,
    headers: {
      "Content-Type": "application/json",
      ...(init?.headers ?? {}),
    },
    cache: init?.cache ?? "no-store",
  });

  if (!response.ok) {
    let apiMessage = "";

    try {
      const errorPayload = (await response.json()) as {
        message?: string | string[];
        error?: string;
      };

      if (Array.isArray(errorPayload.message)) {
        apiMessage = errorPayload.message.join(", ");
      } else if (typeof errorPayload.message === "string") {
        apiMessage = errorPayload.message;
      } else if (typeof errorPayload.error === "string") {
        apiMessage = errorPayload.error;
      }
    } catch {
      apiMessage = "";
    }

    const message = apiMessage
      ? normalizeApiMessage(apiMessage)
      : `API error (${response.status}) on ${path}`;
    throw new Error(message);
  }

  return response.json() as Promise<T>;
}

function extractArray<T>(payload: MaybeData<T[]>): T[] {
  if (Array.isArray(payload)) return payload;
  if (payload && typeof payload === "object" && Array.isArray((payload as { data?: T[] }).data)) {
    return (payload as { data: T[] }).data;
  }
  return [];
}

function extractObject<T>(payload: MaybeData<T>): T {
  if (payload && typeof payload === "object" && "data" in payload) {
    return (payload as { data: T }).data;
  }
  return payload as T;
}

function toSlotValue(raw: unknown): string | null {
  if (typeof raw === "string" && raw.length > 0) return raw;
  return null;
}

function toSlotAvailability(raw: unknown): boolean {
  if (typeof raw === "boolean") return raw;
  if (typeof raw === "number") return raw !== 0;
  if (typeof raw === "string") {
    const normalized = raw.trim().toLowerCase();
    if (["false", "0", "no", "non"].includes(normalized)) return false;
    if (["true", "1", "yes", "oui"].includes(normalized)) return true;
  }
  return true;
}

function slotFromObject(item: Record<string, unknown>, idx: number): BookingSlot | null {
  const start = toSlotValue(item.startTime) ?? toSlotValue(item.time) ?? toSlotValue(item.start);
  const end = toSlotValue(item.endTime) ?? toSlotValue(item.end);

  if (!start) return null;

  const value = start;
  const label = end ? `${start} - ${end}` : start;
  const id = typeof item.id === "string" ? item.id : `slot-${idx}-${value}`;
  const available = toSlotAvailability(item.available);

  return { id, label, value, available };
}

export async function fetchVendorById(vendorId: string): Promise<Vendor> {
  const payload = await fetchJson<MaybeData<Vendor>>(`/vendors/${vendorId}`);
  return extractObject(payload);
}

export async function fetchVendorServices(vendorId: string): Promise<VendorService[]> {
  const payload = await fetchJson<MaybeData<VendorService[]>>(
    `/services/vendor/${vendorId}?page=1&limit=100`,
  );
  return extractArray(payload).filter((service) => service.visible !== false);
}

export async function fetchCategories(): Promise<Category[]> {
  const payload = await fetchJson<MaybeData<Category[]>>(`/categories?page=1&limit=100`);
  return extractArray(payload);
}

export async function fetchVendorReviews(vendorId: string): Promise<VendorReview[]> {
  const payload = await fetchJson<MaybeData<VendorReview[]>>(`/reviews/vendor/${vendorId}`);
  return extractArray(payload);
}

export async function fetchServiceDetail(serviceId: string): Promise<VendorService> {
  const payload = await fetchJson<MaybeData<VendorService>>(`/services/${serviceId}`);
  return extractObject(payload);
}

export async function fetchAvailableSlots(
  serviceId: string,
  date: string,
): Promise<BookingSlot[]> {
  const payload = await fetchJson<
    MaybeData<
      | unknown[]
      | {
          date?: string;
          availableSlots?: Array<{
            id?: string;
            startTime?: string;
            endTime?: string;
            available?: boolean;
          }>;
        }
    >
  >(
    `/services/${serviceId}/available-slots?date=${date}`,
  );

  let list: unknown[] = [];

  if (Array.isArray(payload)) {
    list = payload;
  } else if (payload && typeof payload === "object") {
    const maybeData = (payload as { data?: unknown }).data;

    if (Array.isArray(maybeData)) {
      list = maybeData;
    } else if (maybeData && typeof maybeData === "object") {
      const nestedSlots = (maybeData as { availableSlots?: unknown[] }).availableSlots;
      if (Array.isArray(nestedSlots)) {
        list = nestedSlots;
      }
    } else {
      const directSlots = (payload as { availableSlots?: unknown[] }).availableSlots;
      if (Array.isArray(directSlots)) {
        list = directSlots;
      }
    }
  }

  return list
    .map((item, index) => {
      if (typeof item === "string") {
        return { id: `slot-${index}-${item}`, label: item, value: item, available: true };
      }
      if (item && typeof item === "object") {
        return slotFromObject(item as Record<string, unknown>, index);
      }
      return null;
    })
    .filter((slot): slot is BookingSlot => Boolean(slot));
}

export async function createServiceOrder(
  serviceId: string,
  payload: ServiceOrderPayload,
): Promise<{ clientSecret: string }> {
  const response = await fetchJson<MaybeData<{ clientSecret?: string } | { paymentIntentClientSecret?: string }>>(
    `/services/${serviceId}/order`,
    {
      method: "POST",
      body: JSON.stringify(payload),
    },
  );
  const data = extractObject(response);
  const clientSecret =
    ("clientSecret" in data && data.clientSecret) ||
    ("paymentIntentClientSecret" in data && data.paymentIntentClientSecret);

  if (!clientSecret) {
    throw new Error("Missing Stripe clientSecret from order API.");
  }

  return { clientSecret };
}
