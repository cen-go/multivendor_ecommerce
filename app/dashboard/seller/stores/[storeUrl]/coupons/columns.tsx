"use client";

// React, Next.js imports
import { useState } from "react";
import { useParams, useRouter } from "next/navigation";

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
  Edit,
  MoreHorizontal,
  Trash,
} from "lucide-react";

// Queries
import { deleteCoupon, getCoupon } from "@/actions/coupon";

// Tanstack React Table
import { ColumnDef } from "@tanstack/react-table";

// Types
import { Coupon } from "@prisma/client";
import CustomModal from "@/components/dashboard/shared/custom-modal";
import CouponDetailsForm from "@/components/dashboard/forms/coupon-details";
import { getTimeLeft } from "@/lib/utils";

export const columns: ColumnDef<Coupon>[] = [
  {
    accessorKey: "code",
    id: "name",
    header: "Code",
    cell: ({ row }) => {
      return <span>{row.original.code}</span>;
    },
  },
  {
    accessorKey: "discount",
    header: "Discount",
    cell: ({ row }) => {
      return <span>{row.original.discount}</span>;
    },
  },
  {
    accessorKey: "startDate",
    header: "Starts",
    cell: ({ row }) => {
      return <span>{new Date(row.original.startDate).toDateString()}</span>;
    },
  },
  {
    accessorKey: "endDate",
    header: "Ends",
    cell: ({ row }) => {
      return <span>{new Date(row.original.endDate).toDateString()}</span>;
    },
  },
  {
    accessorKey: "timeLeft",
    header: "Time Left",
    cell: ({ row }) => {
      const { days, hours } = getTimeLeft(row.original.endDate);
      return (
        <span>
          {days} days and {hours} hours
        </span>
      );
    },
  },
  {
    id: "actions",
    cell: ({ row }) => {
      const rowData = row.original;

      return <CellActions coupon={rowData} />;
    },
  },
];

// Define props interface for CellActions component
interface CellActionsProps {
  coupon: Coupon;
}

// CellActions component definition
function CellActions({ coupon }: CellActionsProps) {
  // Hooks
  const { setOpen, setClose } = useModal();
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const params = useParams<{ storeUrl: string }>();

  // Return null if rowData or rowData.id don't exist
  if (!coupon || !coupon.id) return null;

  return (
    <AlertDialog>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" className="h-8 w-8 p-0">
            <span className="sr-only">Open menu</span>
            <MoreHorizontal className="h-4 w-4" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <DropdownMenuLabel>Actions</DropdownMenuLabel>
          <DropdownMenuItem
            className="flex gap-2"
            onClick={() => {
              setOpen(
                // Custom modal component
                <CustomModal>
                  {/* Store details component */}
                  <CouponDetailsForm
                    data={{ ...coupon }}
                    storeUrl={params.storeUrl}
                    setClose={setClose}
                  />
                </CustomModal>,
                async () => {
                  return {
                    rowData: await getCoupon(coupon?.id),
                  };
                }
              );
            }}
          >
            <Edit size={15} />
            Edit Details
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          <AlertDialogTrigger asChild>
            <DropdownMenuItem className="flex gap-2" onClick={() => {}}>
              <Trash size={15} /> Delete coupon
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
            coupon.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter className="flex items-center">
          <AlertDialogCancel className="mb-2">Cancel</AlertDialogCancel>
          <AlertDialogAction
            disabled={loading}
            className="bg-destructive hover:bg-destructive mb-2 text-white"
            onClick={async () => {
              setLoading(true);
              const res = await deleteCoupon(coupon.id, params.storeUrl);
              toast.info(res.message);
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
};