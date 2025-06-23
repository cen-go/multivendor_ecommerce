"use client"

// React Next.js
import Link from "next/link";
import { ReactNode } from "react";
// Tanstack React Table imports
import {
  ColumnDef,
  flexRender,
  getCoreRowModel,
  getFilteredRowModel,
  useReactTable,
} from "@tanstack/react-table"
// Shadcn imports
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
// Icons
import { Search, PlusIcon } from "lucide-react"
// Modal provider hook
import { useModal } from "@/lib/modal-provider";
import CustomModal from "../dashboard/shared/custom-modal";

interface DataTableProps<TData, TValue> {
  columns: ColumnDef<TData, TValue>[];
  data: TData[];
  filterValue: string;
  actionButtonText?: ReactNode;
  modalChildren?: ReactNode;
  newTabLink?: string;
  searchPlaceHolder: string;
  heading?: string;
  subheading?: string;
  noHeader?: true;
}

export default function DataTable<TData, TValue>({
  columns,
  data,
  filterValue,
  actionButtonText,
  modalChildren,
  newTabLink,
  searchPlaceHolder,
  heading,
  subheading,
  noHeader,
}: DataTableProps<TData, TValue>) {
  // Modal state
  const { setOpen } = useModal()

  // React Table instance
  const table = useReactTable({
    data,
    columns,
    getCoreRowModel: getCoreRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
  });

  return (
    <>
      {/* Search input and action buttons */}
      <div className="flex items-center justify-between">
        <div className="flex items-center py-4 gap-2">
          <Search />
          <Input
            placeholder={searchPlaceHolder}
            value={
              (table.getColumn(filterValue)?.getFilterValue() as string) ?? ""
            }
            onChange={(e) =>
              table.getColumn(filterValue)?.setFilterValue(e.target.value)
            }
            className="h-12 me-1"
          />
        </div>
        <div className="flex flex-col lg:flex-row gap-2">
          {modalChildren && (
            <Button
              className="flex gap-2"
              onClick={() => {
                setOpen(
                  <CustomModal
                    heading={heading || ""}
                    subheading={subheading || ""}
                  >
                    {modalChildren}
                  </CustomModal>
                );
              }}
            >
              {actionButtonText}
            </Button>
          )}
          {newTabLink && (
            <Link href={newTabLink}>
              <Button variant="primary">
                <PlusIcon className="me-1" /> Create New
              </Button>
            </Link>
          )}
        </div>
      </div>

      {/* Table */}
      <div className="border bg-background rounded-lg mt-2">
        <Table>
          {/* Table Header */}
          {!noHeader && (
            <TableHeader>
              {table.getHeaderGroups().map((headerGroup) => (
                <TableRow key={headerGroup.id}>
                  {headerGroup.headers.map((header) => (
                    <TableHead key={header.id}>
                      {header.isPlaceholder
                        ? null
                        : flexRender(
                            header.column.columnDef.header,
                            header.getContext()
                          )}
                    </TableHead>
                  ))}
                </TableRow>
              ))}
            </TableHeader>
          )}

          {/* Table Body */}
          <TableBody>
            {table.getRowModel().rows.length ? (
              table.getRowModel().rows.map((row) => (
                <TableRow
                  key={row.id}
                  data-state={row.getIsSelected() && "selected"}
                >
                  {row.getVisibleCells().map((cell) => (
                    <TableCell
                      key={cell.id}
                      className="max-w-[400px] break-words"
                    >
                      {flexRender(
                        cell.column.columnDef.cell,
                        cell.getContext()
                      )}
                    </TableCell>
                  ))}
                </TableRow>
              ))
            ) : (
              // No results message
              <TableRow>
                <TableCell
                  colSpan={columns.length}
                  className="h-24 text-center"
                >
                  No Results.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
    </>
  );
}