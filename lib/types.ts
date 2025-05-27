import { Prisma } from "@prisma/client";
import { getAllSubcategories } from "@/actions/subcategory";

export interface DashboardSidebarMenuInterface {
    label: string;
    icon: string;
    link: string;
  }

  // Subcategory + Parent category
  export type SubcategoryWithParentCategoryType = Prisma.PromiseReturnType<typeof getAllSubcategories>[0]