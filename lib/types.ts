import { Prisma } from "@prisma/client";
import { getAllSubcategories } from "@/actions/subcategory";
import { getAllStoreProducts } from "@/actions/product";

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
  createdAt?: Date;
  updatedAt?: Date;
}

// Store product
export type StoreProductType = Prisma.PromiseReturnType<typeof getAllStoreProducts>[0];
