"use client"

// React, Next.js imports
import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";

// UI components
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { toast } from "sonner";

// Hooks and utilities
import { useModal } from "@/lib/modal-provider";

// Lucide icons
import {
  Trash,
  Ellipsis,
  CopyPlusIcon,
  FilePenLineIcon,
} from "lucide-react";

// Tanstack React Table
import { ColumnDef } from "@tanstack/react-table";

// Types
import { StoreProductType } from "@/lib/types";

// Server Actions
import { deleteProduct } from "@/actions/product";

// COLUMNS definition
export const columns: ColumnDef<StoreProductType>[] = [
  {
    accessorKey: "name",
    header: "",
    cell: ({row}) => {
      return (
        <div className="flex flex-col gap-y-3">
          <h2 className="font-bold truncate pb-2 border-b capitalize">
            {row.original.name}
          </h2>
          {/* Product Variants */}
          <div className="relative flex flex-wrap gap-2">
            {row.original.variants.map((variant) => (
              <div key={variant.id} className="flex flex-col gap-y-2">
                <div className="relative cursor-pointer group">
                  <Image
                    src={variant.images[0].url}
                    alt={`${variant.variantName} image`}
                    width={300}
                    height={300}
                    className="h-40 w-40 object-cover rounded-md shadow-md"
                  />
                  <Link
                    href={`/dashboard/seller/stores/${row.original.store.url}/products/${row.original.id}/variants/${variant.id}`}
                  >
                    <div className="w-40 h-full absolute top-0 left-0 bottom-0 right-0 z-10 rounded-md bg-black/50 transition-all duration-150 hidden group-hover:block">
                      <FilePenLineIcon className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-white" />
                    </div>
                  </Link>
                </div>
                {/* Variant info */}
                <div className="flex mt-2 gap-1">
                  <div className="w-7 flex flex-col gap-1 rounded-md">
                    {variant.colors.map(color => (
                      <span key={color.id} className="w-4 h-4 rounded-full" style={{backgroundColor: color.name}} />
                    ))}
                  </div>
                  <div>
                    <h3 className="font-medium text-sm truncate capitalize">{variant.variantName}</h3>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      );
    },
  },
  {
    accessorKey: "brand",
    header: "Brand",
    cell: ({row}) => {
      return <span className="capitalize">{row.original.brand}</span>;
    },
  },
  {
    accessorKey: "category",
    header: "Category",
    cell: ({row}) => {
      return <span>{row.original.category.name}</span>;
    },
  },
  {
    accessorKey: "subcategory",
    header: "Subcategory",
    cell: ({row}) => {
      return <span>{row.original.subcategory.name}</span>;
    },
  },
  {
    accessorKey: "new-variant",
    header: "",
    cell: ({row}) => {
      return (
        <Link
          href={`/dashboard/seller/stores/${row.original.store.url}/products/${row.original.id}/variants/new`}
        >
          <CopyPlusIcon className="hover:text-indigo-300" />
        </Link>
      );
    },
  },
  {
    id: "actions",
    cell: ({row}) => {
      const rowData = row.original
      return (
        <CellActions rowData={rowData} />
      )
    },
  },
];

// define types for CellActions props
interface CellActionsProps {
  rowData: StoreProductType;
};

// CellActions component definition
function CellActions({ rowData }: CellActionsProps) {
  const  { setClose } = useModal();
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  // Return null if rowData or rowData.id don't exist
  if (!rowData || !rowData.id) {
    return null;
  }

  return (
    <AlertDialog>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" className="h-8 w-8 p-0">
            <Ellipsis />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <DropdownMenuLabel>Actions</DropdownMenuLabel>
          <DropdownMenuSeparator />
          <AlertDialogTrigger asChild>
            <DropdownMenuItem>
              <Trash size={15} className="stroke-destructive" /> Delete Product
            </DropdownMenuItem>
          </AlertDialogTrigger>
        </DropdownMenuContent>
      </DropdownMenu>
      <AlertDialogContent className="max-w-lg">
        <AlertDialogHeader>
          <AlertDialogTitle className="text-left">
            Are you absolutely sure?
          </AlertDialogTitle>
          <AlertDialogDescription className="text-left">
            This action cannot be undone. This will permanently delete the
            product and the variants that exists in the product.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter className="flex items-center">
          <AlertDialogCancel className="mb-2">Cancel</AlertDialogCancel>
          <AlertDialogAction
            disabled={loading}
            className="bg-destructive hover:bg-destructive/80 text-white mb-2"
            onClick={async () => {
              setLoading(true);
              const res = await deleteProduct(rowData);

              if (!res.success) {
                toast.error(res.message);
              } else {
                toast.success("The product has been deleted.");
              }

              setLoading(false);
              router.refresh();
              setClose();
            }}
          >
            Delete
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}