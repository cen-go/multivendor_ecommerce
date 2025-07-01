"use client"

// React, Next.js imports
import { useState } from "react";
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
  EllipsisVertical,
} from "lucide-react";

// Tanstack React Table
import { ColumnDef } from "@tanstack/react-table";

// Types
import { StoreShippingRateForCountry } from "@/lib/types";

// Server Actions
import { deleteProduct } from "@/actions/product";

// COLUMNS definition
export const columns: ColumnDef<StoreShippingRateForCountry>[] = [
  {
    id: "actions",
    cell: ({row}) => {
      const rowData = row.original
      return (
        <CellActions rowData={rowData} />
      )
    },
  },
  {
    accessorKey: "countryName",
    header: "Country",
    cell: ({row}) => {
      return <span className="capitalize">{row.original.countryName}</span>;
    },
  },
  {
    accessorKey: "shippingService",
    header: "Shipping Service",
    cell: ({row}) => {
      return (
        <span className="capitalize">
          {row.original.shippingRate?.shippingService ?? "Default"}
        </span>
      );
    },
  },
  {
    accessorKey: "shippingFeePerItem",
    header: "Per Item",
    cell: ({row}) => {
      return <span>{row.original.shippingRate?.shippingFeePerItem ?? "Default"}</span>;
    },
  },
  {
    accessorKey: "shippingFeePerAdditionalItem",
    header: "Additional Item",
    cell: ({row}) => {
      return <span>{row.original.shippingRate?.shippingFeePerAdditionalItem ?? "Default"}</span>;
    },
  },
  {
    accessorKey: "shippingFeePerKg",
    header: "Per Kg",
    cell: ({row}) => {
      return <span>{row.original.shippingRate?.shippingFeePerKg ?? "Default"}</span>;
    },
  },
  {
    accessorKey: "shippingFeeFixed",
    header: "Fixed Fee",
    cell: ({row}) => {
      return <span>{row.original.shippingRate?.shippingFeeFixed ?? "Default"}</span>;
    },
  },
  {
    accessorKey: "deliveryTimeMin",
    header: "Min Delivery Time",
    cell: ({row}) => {
      return <span>{row.original.shippingRate?.deliveryTimeMin ?? "Default"}</span>;
    },
  },
  {
    accessorKey: "deliveryTimeMax",
    header: "Max Delivery Time",
    cell: ({row}) => {
      return <span>{row.original.shippingRate?.deliveryTimeMax ?? "Default"}</span>;
    },
  },
];

// define types for CellActions props
interface CellActionsProps {
  rowData: StoreShippingRateForCountry;
};

// CellActions component definition
function CellActions({ rowData }: CellActionsProps) {
  const  { setClose } = useModal();
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  // Return null if rowData or rowData.id don't exist
  if (!rowData) {
    return null;
  }

  return (
    <AlertDialog>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" className="h-8 w-8 p-0">
            <EllipsisVertical />
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