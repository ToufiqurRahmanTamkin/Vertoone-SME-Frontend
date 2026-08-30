export interface PublicShopProfile {
  slug: string;
  name: string;
  tagline: string;
  description: string;
  logoUrl: string | null;
  bannerUrl: string | null;
  accentColor: string;
  currency: string;
  contactEmail: string;
  contactPhone: string;
  address: string;
  acceptsOrders: boolean;
  deliveryCharge: number;
  minimumOrderValue: number;
  orderInstructions: string;
}

export interface PublicShopProduct {
  _id: string;
  name: string;
  sku: string;
  description: string;
  imageUrl: string | null;
  categoryId: string | null;
  categoryName: string;
  brandName: string;
  sellingPrice: number;
  taxRate: number;
  inStock: boolean;
  availableQuantity: number;
}

export interface PublicShopCategory {
  _id: string;
  name: string;
  productCount: number;
}

export interface PublicShopCatalog {
  shop: PublicShopProfile;
  categories: PublicShopCategory[];
  products: PublicShopProduct[];
  total: number;
  page: number;
  limit: number;
}

export interface PublicShopCatalogQuery {
  slug: string;
  search?: string;
  categoryId?: string;
  page?: number;
  limit?: number;
}

export interface PublicOrderPayload {
  customerName: string;
  customerEmail?: string;
  customerPhone: string;
  shippingAddress: string;
  note?: string;
  items: { productId: string; quantity: number }[];
}

export interface PublicOrderReceiptLine {
  name: string;
  quantity: number;
  unitPrice: number;
  total: number;
}

export interface PublicOrderReceipt {
  orderNumber: string;
  placedAt: string;
  customerName: string;
  currency: string;
  items: PublicOrderReceiptLine[];
  subTotal: number;
  taxTotal: number;
  deliveryCharge: number;
  grandTotal: number;
  paymentNote: string;
  shopName: string;
  contactEmail: string;
  contactPhone: string;
}

export interface PublicCartLine {
  productId: string;
  name: string;
  imageUrl: string | null;
  unitPrice: number;
  quantity: number;
  availableQuantity: number;
  inStock: boolean;
}
