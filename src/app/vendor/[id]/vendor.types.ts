export type VendorImage = {
  id: string;
  url: string;
  order: number;
};

export type Slot = {
  id: string;
  weekDay: number;
  startTime: string;
  endTime: string;
  active: boolean;
};

export type VendorTrade = {
  id: string;
  trade: string;
  customName?: string | null;
};

export type Vendor = {
  id: string;
  name: string;
  description: string | null;
  status: string;
  visible: boolean;
  reviewCount: number | null;
  averageRating: number | null;
  vendorImages?: VendorImage[];
  trades?: VendorTrade[];
  location?: {
    id: string;
    name: string;
    street: string | null;
    city: string | null;
    zipcode: string | null;
    country: string | null;
    lat?: number | string | null;
    lng?: number | string | null;
  } | null;
  availability?: {
    id: string;
    name: string;
    timezone: string | null;
    slots?: Slot[];
  } | null;
};

export type VendorService = {
  id: string;
  name: string;
  description?: string | null;
  price?: number | null;
  currency?: string | null;
  duration?: number | null;
  durationMetric?: string | null;
  categoryId?: string | { id?: string; name?: string } | null;
  photo?: string | null;
  images?: Array<{ id: string; url: string; order: number }>;
  serviceImages?: Array<{ id: string; url: string; order: number }>;
  visible: boolean;
  serviceType?: "BOOKING" | "INSTANT" | string;
  bookingLocationType?: "ONLINE" | "AT_STORE" | "AT_CLIENT" | string;
  actionRadiusKm?: number | null;
};

export type ServiceCategoryGroup = {
  id: string;
  name: string;
  services: VendorService[];
};

export type VendorServicesResponse = {
  data: VendorService[];
  meta?: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
};

export type Category = {
  id: string;
  name: string;
};

export type CategoriesResponse = {
  data: Category[];
  meta?: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
};

export type VendorReview = {
  id: string;
  rate?: number | null;
  comment?: string | null;
  createdAt?: string;
  user?: {
    id?: string;
    firstName?: string | null;
    lastName?: string | null;
    name?: string | null;
  } | null;
};

export type BookingSlot = {
  id: string;
  label: string;
  value: string;
  available: boolean;
};

export type ClientLocation = {
  name: string;
  street: string;
  city: string;
  zipcode: string;
  country: string;
  lng: number;
  lat: number;
};
