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

export type Vendor = {
  id: string;
  name: string;
  description: string | null;
  status: string;
  visible: boolean;
  reviewCount: number | null;
  averageRating: number | null;
  vendorImages?: VendorImage[];
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
