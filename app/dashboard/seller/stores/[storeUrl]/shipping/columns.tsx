"use client";

// React, Next.js imports
import { useParams } from "next/navigation";

// UI components
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

// Hooks and utilities
import { useModal } from "@/lib/modal-provider";

// Lucide icons
import { EditIcon, EllipsisVertical } from "lucide-react";

// Tanstack React Table
import { ColumnDef } from "@tanstack/react-table";
// Types
import { StoreShippingRateForCountryType } from "@/lib/types";
// Custom components
import CustomModal from "@/components/dashboard/shared/custom-modal";
import ShippingRateDetails from "@/components/dashboard/forms/shippingRate-details";
import { formatCurrency } from "@/lib/utils";

// COLUMNS definition
export const columns: ColumnDef<StoreShippingRateForCountryType>[] = [
  {
    id: "actions",
    cell: ({ row }) => {
      const rowData = row.original;
      return <CellActions rowData={rowData} />;
    },
  },
  {
    accessorKey: "countryName",
    header: "Country",
    cell: ({ row }) => {
      return <span className="capitalize">{row.original.countryName}</span>;
    },
  },
  {
    accessorKey: "shippingService",
    header: "Shipping Service",
    cell: ({ row }) => {
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
    cell: ({ row }) => {
      const value = row.original.shippingRate?.shippingFeePerItem;
      return (
        <span>
          {value === undefined ? "Default" : value === 0 ? "Free" : formatCurrency(value)}
        </span>
      );
    },
  },
  {
    accessorKey: "shippingFeePerAdditionalItem",
    header: "Additional Item",
    cell: ({ row }) => {
      const value = row.original.shippingRate?.shippingFeePerAdditionalItem;
      return (
        <span>
          {value === undefined ? "Default" : value === 0 ? "Free" : formatCurrency(value)}
        </span>
      );
    },
  },
  {
    accessorKey: "shippingFeePerKg",
    header: "Per Kg",
    cell: ({ row }) => {
      const value = row.original.shippingRate?.shippingFeePerKg;
      return (
        <span>
          {value === undefined ? "Default" : value === 0 ? "Free" : formatCurrency(value)}
        </span>
      );
    },
  },
  {
    accessorKey: "shippingFeeFixed",
    header: "Fixed Fee",
    cell: ({ row }) => {
      const value = row.original.shippingRate?.shippingFeeFixed;
      return (
        <span>
          {value === undefined ? "Default" : value === 0 ? "Free" : formatCurrency(value)}
        </span>
      );
    },
  },
  {
    accessorKey: "deliveryTimeMin",
    header: "Min Delivery Time",
    cell: ({ row }) => {
      return (
        <span>{row.original.shippingRate?.deliveryTimeMin ?? "Default"}</span>
      );
    },
  },
  {
    accessorKey: "deliveryTimeMax",
    header: "Max Delivery Time",
    cell: ({ row }) => {
      return (
        <span>{row.original.shippingRate?.deliveryTimeMax ?? "Default"}</span>
      );
    },
  },
];

// define types for CellActions props
interface CellActionsProps {
  rowData: StoreShippingRateForCountryType;
}

// CellActions component definition
function CellActions({ rowData }: CellActionsProps) {
  const { setOpen, setClose } = useModal();
  const { storeUrl } = useParams<{ storeUrl: string }>();

  // Return null if rowData or rowData.id don't exist
  if (!rowData) {
    return null;
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" className="h-8 w-8 p-0" aria-label="actions button">
          <EllipsisVertical />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuLabel>Actions</DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuItem
          className="flex items-center gap-2"
          onClick={() => {
            setOpen(
              // Custom modal component
              <CustomModal>
                {/* Shipping Details form component */}
                <ShippingRateDetails
                  data={rowData}
                  storeUrl={storeUrl}
                  closeModal={setClose}
                />
              </CustomModal>
            );
          }}
        >
          <EditIcon size={15} /> Edit Details
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
