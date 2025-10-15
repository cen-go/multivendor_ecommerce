import {
  Cart,
  CartItem,
  Category,
  Color,
  Country,
  Coupon,
  FreeShipping,
  FreeShippingCountry,
  OrderGroup,
  OrderItem,
  Prisma,
  ProductVariantImage,
  Review,
  ReviewImage,
  ShippingAddress,
  ShippingFeeMethod,
  ShippingRate,
  Size,
  Store,
  SubCategory,
  User,
} from "@prisma/client";
import { getAllSubcategories } from "@/actions/subcategory";
import {
  getAllStoreProducts,
  getProductPageData,
  getProducts,
  getRatingStatistics,
  getShippingDetails,
} from "@/actions/product";
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
  images: {id?: string; url: string}[];
  categoryId: string;
  subcategoryId: string;
  isSale: boolean;
  saleEndDate?: string;
  brand: string;
  sku: string;
  weight: number | null;
  keywords: string[];
  colors: {id?: string; color: string}[];
  sizes: {
    id?: string;
    size: string;
    quantity: number;
    price: number;
    discount: number;
  }[];
  product_specs: {id?: string; name: string; value: string;}[];
  variant_specs: {id?: string; name: string; value: string;}[];
  questions?: {id?: string; question: string; answer: string}[];
  freeShippingForAllCountries: boolean;
  freeShippingCountriesIds?: {id?: string; label: string; value: string}[];
  shippingFeeMethod: ShippingFeeMethod;
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
import { getOrder } from "@/actions/order";
import { getUserOrders, getUserWishlist } from "@/actions/profile";

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

export type ProductShippingDetailsType = Prisma.PromiseReturnType<typeof getShippingDetails>;

export type CountriesWithFreeShippingType = FreeShipping & {
  eligibleCountries : FreeShippingCountry[];
};

export type CartProductType = {
  productId: string;
  variantId: string;
  productSlug: string;
  variantSlug: string;
  name: string;
  brand: string;
  variantName: string;
  image: string;
  variantImage: string;
  sizeId: string;
  size: string;
  quantity: number;
  price: number;
  stock: number;
  weight: number | null;
  shippingMethod: string;
  shippingService: string;
  shippingFee: number;
  extraShippingFee: number;
  deliveryTimeMin: number;
  deliveryTimeMax: number;
  freeShipping: boolean;
}

export type ProductQueryFiltersType = {
  category?: string;
  subcategory?: string;
  storeUrl?: string;
  search?: string;
  offer?: string;
  size?: string[];
}

export type RatingStatisticsType = Prisma.PromiseReturnType<typeof getRatingStatistics>

export type ReviewWithImagesType = Review & {
  images: ReviewImage[];
  user: User;
}

export type ReviewSortOptionType = "latest" | "oldest" | "highest" | "lowest";

export type ReviewDetailsType = {
  id: string;
  review: string;
  rating: number;
  images: {url: string}[];
  variant: string;
  size: string;
  color: string;
}

export type VariantInfoType = {
  variantUrl: string;
  image: string;
  variantSlug: string;
  variantName: string;
  sizes: Size[];
  colors: Partial<Color>[];
};

export type CartWithCartItemsType = Cart & {
  cartItems: CartItem[];
  coupon: Coupon & {store: Store} | null;
}

export type UserShippingAddressType = ShippingAddress & {
  country: Country;
  user: User;
}

export type OrderExtendedType = Prisma.PromiseReturnType<typeof getOrder>;

export type OrderGroupWithItemsType = OrderGroup & {
  orderItems: OrderItem[];
  coupon: Coupon | null;
  store: Store;
};

export type SearchResultsType = {
  name: string;
  link: string;
  image: string;
}

export type UserOrderType = Prisma.PromiseReturnType<typeof getUserOrders>["orders"][0];

export type ProductWishlistType = Prisma.PromiseReturnType<typeof getUserWishlist>["wishlist"][0];

export type CategoryWithSubsType = Category & {
  subCategories: SubCategory[];
}