import { Prisma, ProductVariantImage, ShippingRate, Size } from "@prisma/client";
import { getAllSubcategories } from "@/actions/subcategory";
import { getAllStoreProducts, getProductPageData, getProducts } from "@/actions/product";
import { getStoreDefaultShippingDetails } from "@/actions/store";

export interface DashboardSidebarMenuInterface {
  label: string;
  icon: string;
  link: string;
}

// Subcategory + Parent category
export type SubcategoryWithParentCategoryType = Prisma
  .PromiseReturnType<typeof getAllSubcategories>[0];

// Product + variant
export type ProductWithVariantType = {
  productId?: string;
  name: string;
  description: string;
  variantId?: string;
  variantName: string;
  variantDescription: string;
  variantImage: string;
  images: {url: string}[];
  categoryId: string;
  subcategoryId: string;
  isSale: boolean;
  saleEndDate?: string;
  brand: string;
  sku: string;
  keywords: string[];
  colors: {color: string}[];
  sizes: {
    size: string;
    quantity: number;
    price: number;
    discount: number;
  }[];
  product_specs: {name: string; value: string;}[];
  variant_specs: {name: string; value: string;}[];
  questions?: {question: string; answer: string}[];
  createdAt?: Date;
  updatedAt?: Date;
}

// Store product
export type StoreProductType = Prisma.PromiseReturnType<typeof getAllStoreProducts>[0];

// Store default shipping details type
export type StoreShippingDetailType = Prisma.PromiseReturnType<typeof getStoreDefaultShippingDetails>

export type StoreShippingRateForCountryType  = {
  countryId: string;
  countryName: string;
  countryCode: string;
  shippingRate: ShippingRate | null;
};

export type UserCountry = {
  name: string;
  code: string;
}

import countries from "@/lib/data/countries.json";

export type SelectMenuOption = (typeof countries)[number];

export type ProductType = Prisma.PromiseReturnType<typeof getProducts>["products"][0];

export type VariantSimplified = {
  variantId: string;
  variantSlug: string;
  variantName: string;
  images: ProductVariantImage[];
  sizes: Size[];
}
export type VariantImageType = {
  variantUrl: string;
  imageUrl: string;
}

export type ProductPageDataType = Prisma.PromiseReturnType<typeof getProductPageData>;