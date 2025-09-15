# GoShop Product Server Actions

This file documents the **server actions** related to product management in the GoShop multi-vendor e-commerce platform. These actions are implemented as async functions in [`actions/product.ts`](./actions/product.ts) and are responsible for all product-related business logic, including CRUD operations, filtering, shipping calculations, and more.

---

## Table of Contents

- [Overview](#overview)
- [Function List](#function-list)
- [Function Details](#function-details)
- [Strong Points & Best Practices](#strong-points--best-practices)

---

## Overview

The server actions in this module are designed to:
- Provide a secure, type-safe API for product management.
- Integrate with Prisma ORM for robust database operations.
- Support advanced features like multi-variant products, dynamic filtering, and shipping calculations.
- Ensure data integrity and validation using Zod schemas.
- Handle authentication and authorization for seller-only actions.

---

## Function List

- `upsertProduct`
- `getProductMainInfo`
- `getAllStoreProducts`
- `deleteProduct`
- `getProducts`
- `getProductPageData`
- `getShippingDetails`
- `getRatingStatistics`
- Helper functions: `retrieveProductDetails`, `formatProductResponse`, `getStoreFollowersCount`, `checkIfUserFollowingStore`, `getUserCountry`

---

## Function Details

### `upsertProduct(product, storeUrl)`
- **Purpose:** Create or update a product and its variant, ensuring association with the correct store.
- **Highlights:**  
  - Authenticates the user and checks for seller role.
  - Validates input using Zod (`ProductFormSchema`).
  - Handles both new and existing products/variants.
  - Ensures unique slugs for SEO-friendly URLs.
  - Supports nested creation of specs, questions, images, colors, and sizes.

---

### `getProductMainInfo(productId)`
- **Purpose:** Retrieve main information for a specific product.
- **Highlights:**  
  - Returns essential product details for display or editing.

---

### `getAllStoreProducts(storeUrl)`
- **Purpose:** Fetch all products for a given store, including variants and related data.
- **Highlights:**  
  - Includes category, subcategory, variants, images, colors, and sizes.
  - Converts Prisma Decimal fields (e.g., weight) to plain numbers for client compatibility.

---

### `deleteProduct(product)`
- **Purpose:** Delete a product and its associated images from the database and Cloudinary.
- **Highlights:**  
  - Authenticates and authorizes the user.
  - Deletes all related images in parallel.
  - Handles errors gracefully and revalidates relevant paths for ISR.

---

### `getProducts(filters, page, pageSize)`
- **Purpose:** Fetch products based on dynamic filters and pagination.
- **Highlights:**  
  - Supports filtering by category, subcategory, store, and more.
  - Returns paginated results with variant and image data.
  - Uses type-safe, dynamic Prisma queries.

---

### `getProductPageData(productSlug, variantSlug)`
- **Purpose:** Fetch detailed data for a specific product variant, including shipping, reviews, and store info.
- **Highlights:**  
  - Aggregates product, variant, store, shipping, and review data.
  - Calculates shipping details based on user country and store settings.
  - Returns a normalized, client-friendly object.

---

### `getShippingDetails(shippingFeeMethod, userCountry, store, freeShipping)`
- **Purpose:** Calculate shipping fees and details for a product based on method, country, and store settings.
- **Highlights:**  
  - Supports per-item, per-weight, and fixed shipping fee methods.
  - Checks for free shipping eligibility.
  - Returns all relevant shipping info for checkout and display.

---

### `getRatingStatistics(productId)`
- **Purpose:** Aggregate and return rating statistics for a product.
- **Highlights:**  
  - Groups reviews by rating.
  - Calculates total reviews, percentage breakdown, and reviews with images.

---

### Helper Functions

- **`retrieveProductDetails`**: Fetches all relational data for a product and its variants.
- **`formatProductResponse`**: Normalizes and formats product data for client use.
- **`getStoreFollowersCount`**: Returns the number of followers for a store.
- **`checkIfUserFollowingStore`**: Checks if a user is following a store.
- **`getUserCountry`**: Retrieves the user's country from cookies or defaults.

---

## Strong Points & Best Practices

- **Type Safety:**  
  All database operations use Prisma's type-safe client, reducing runtime errors.

- **Validation:**  
  All product input is validated with Zod schemas before any database operation.

- **Security:**  
  Seller-only actions require authentication and role checks.

- **Performance:**  
  - Uses parallel operations (e.g., image deletion).
  - Supports pagination and efficient querying.

- **Client Compatibility:**  
  Converts Prisma Decimal fields to numbers before sending to client components, avoiding serialization errors.

- **Extensibility:**  
  Modular design and helper functions make it easy to add new features or filters.

- **SEO & Usability:**  
  Generates unique, human-readable slugs for products and variants.

---

## Usage

Import and call these functions from your Next.js server components, API routes, or server actions as needed.  
**Do not use these functions directly in client components.**

---

**For more details, see the code comments in [`actions/product.ts`](./actions/product.ts).**