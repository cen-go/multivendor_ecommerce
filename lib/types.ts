import { Prisma } from "@prisma/client";
import { getAllSubcategories } from "@/actions/subcategory";
import { getAllStoreProducts } from "@/actions/product";
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

