"use client"

// React, Next.js imports
import { useState } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";

// Custom components
import CategoryDetails from "@/components/dashboard/forms/category-details";
import CustomModal from "@/components/dashboard/shared/custom-modal";

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
  BadgeCheck,
  BadgeMinus,
  Edit,
  Trash,
  Ellipsis,
} from "lucide-react";

// Tanstack React Table
import { ColumnDef } from "@tanstack/react-table";

// Prisma models
import { Category } from "@prisma/client";

// Server actions
import { getCategoryById, deleteCategory } from "@/actions/category";

// COLUMNS definition
export const columns: ColumnDef<Category>[] = [
  {
    accessorKey: "image",
    header: "",
    cell: ({row}) => {
      return (
        <div className="relative h-34 min-w-42 rounded-md overflow-hidden">
          <Image
            src={row.original.image}
            alt="Category image"
            width={500}
            height={500}
            className="w-32 h-32 rounded-full object-cover shadow-2xl"
          />
        </div>
      );
    },
  },
  {
    accessorKey: "name",
    header: "Name",
    cell: ({row}) => {
      return (
        <span className="font-extrabold text-lg capitalize">
          {row.original.name}
        </span>
      )
    },
  },
  {
    accessorKey: "url",
    header: "URL",
    cell: ({row}) => {
      return (
        <span>{row.original.url}</span>
      )
    },
  },
  {
    accessorKey: "featured",
    header: "Featured",
    cell: ({row}) => {
      return (
        <span className="text-muted-foreground flex justify-center">
          {row.original.featured ? (
            <BadgeCheck className="stroke-green-300" />
          ) : (
            <BadgeMinus />
          )}
        </span>
      )
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
  rowData: Category;
};

// CellActions component definition
function CellActions({ rowData }: CellActionsProps) {
  const  {setOpen, setClose } = useModal();
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
          <DropdownMenuItem
            className="flex gap-2 cursor-pointer"
            onClick={() => {
              setOpen(
                // Custom model wrapper
                <CustomModal>
                  <CategoryDetails data={{ ...rowData }} />
                </CustomModal>,
                // get the latest data by passing data fetching function as 2. arg. of setOpen
                async () => {
                  return {
                    rowData: await getCategoryById(rowData.id)
                  }
                }
              );
            }}
          >
            <Edit size={15} />
            Edit Details
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          <AlertDialogTrigger asChild>
            <DropdownMenuItem>
              <Trash size={15} className="stroke-destructive" /> Delete Category
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
            category and the related data.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter className="flex items-center">
          <AlertDialogCancel className="mb-2">Cancel</AlertDialogCancel>
          <AlertDialogAction
            disabled={loading}
            className="bg-destructive hover:bg-destructive/80 text-white mb-2"
            onClick={async () => {
              setLoading(true);
              const res = await deleteCategory(rowData.id);

              if (!res.success) {
                toast.error(res.message);
              }

              toast.success("The category has been deleted.");
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