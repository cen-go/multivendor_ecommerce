"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
// Types
import { UserOrderType } from "@/lib/types";
import { UserOrdersFilter, UserOrdersTimePeriod } from "@/actions/profile";
// Server actions & db queries
import { getUserOrders } from "@/actions/profile";
// Utils
import { formatCurrency } from "@/lib/utils";
// Components
import PaymentStatusTag from "@/components/shared/payment-status-tag";
import OrderStatusTag from "@/components/shared/order-status-tag";
import Pagination from "@/components/shared/pagination";
import OrdersTableHeader from "./orders-table-header";

interface Props {
  orders: UserOrderType[];
  totalPages: number;
  initialFilter?: UserOrdersFilter;
}

export default function OrdersTable({
  orders,
  totalPages,
  initialFilter,
}: Props) {
  const [tableData, setTableData] = useState<UserOrderType[]>(orders);
  const [page, setPage] = useState(1);
  const [totalDataPages, setTotalDataPages] = useState(totalPages);

  // States for filtering and search
  const [filter, setFilter] = useState<UserOrdersFilter>(
    initialFilter ?? "all"
  );
  const [timePeriod, setTimePeriod] = useState<UserOrdersTimePeriod>("all");
  const [searchTerm, setSearchTerm] = useState<string>("");

  useEffect(() => {
    setPage(1);
  }, [filter, timePeriod, searchTerm]);

  useEffect(() => {
    async function getOrders() {
      const response = await getUserOrders({
        page,
        filter,
        period: timePeriod,
        search: searchTerm,
      });
      if (response.orders) {
        setTableData(response.orders);
        setTotalDataPages(response.totalPages);
      }
    }

    getOrders();
  }, [page, filter, timePeriod, searchTerm]);

  return (
    <div>
      {/* Header */}
      <OrdersTableHeader
        filter={filter}
        setFilter={setFilter}
        timePeriod={timePeriod}
        setTimePeriod={setTimePeriod}
        searchTerm={searchTerm}
        setSearchTerm={setSearchTerm}
      />
      {/* Table */}
      <div className="bg-white px-6 pt-1 pb-8 overflow-hidden">
        {/* Scrollable Table container */}
        <div className="max-h-[700px] overflow-x-auto overflow-y-auto scrollbar border rounded-md">
          <table className="w-full min-w-max table-auto text-left">
            <thead>
              <tr className="border-b">
                <th className="cursor-pointer text-sm p-4">Order</th>
                <th className="cursor-pointer text-sm p-4">Products</th>
                <th className="cursor-pointer text-sm p-4 hidden md:inline-block">
                  Items
                </th>
                <th className="cursor-pointer text-sm p-4 hidden md:inline-block">
                  Payment
                </th>
                <th className="cursor-pointer text-sm p-4 hidden md:inline-block">
                  Delivery
                </th>
                <th className="cursor-pointer text-sm p-4">Total</th>
                <th className="cursor-pointer text-sm p-4"></th>
              </tr>
            </thead>
            <tbody>
              {tableData.map((order) => {
                const totalItemsCount = order.orderGroups.reduce(
                  (tot, gr) =>
                    tot +
                    gr.orderItems.reduce(
                      (grTot, item) => grTot + item.quantity,
                      0
                    ),
                  0
                );

                const images = order.orderGroups.flatMap((gr) =>
                  gr.orderItems.map((item) => item.image)
                );
                return (
                  <tr key={order.id} className="border-b">
                    <td className="p-4">
                      <div className="flex items-center gap-3">
                        <div className="flex flex-col w-[80px] xl:w-auto">
                          <p className="block antialiased font-sans text-sm leading-normal font-normal whitespace-nowrap overflow-hidden overflow-ellipsis">
                            #{order.id}
                          </p>
                          <p className="antialiased font-sans text-sm leading-normal font-normal">
                            {order.createdAt.toDateString().slice(4)}
                          </p>
                        </div>
                      </div>
                    </td>
                    <td>
                      <div className="flex">
                        {images.slice(0, 4).map((img, i) => (
                          <Image
                            key={img}
                            src={img}
                            alt=""
                            width={50}
                            height={50}
                            className="w-8 h-8 object-cover shadow-sm rounded-full"
                            style={{ transform: `translateX(-${i * 8}px)` }}
                          />
                        ))}
                      </div>
                    </td>
                    <td className="p-4 hidden md:inline-block">
                      {totalItemsCount} pcs
                    </td>
                    <td className="p-4 text-center hidden md:inline-block">
                      <PaymentStatusTag status={order.paymentStatus} isTable />
                    </td>
                    <td className="p-4 hidden md:inline-block">
                      <OrderStatusTag status={order.orderStatus} />
                    </td>
                    <td className="p-4 text-sm md:text-base">
                      {formatCurrency(order.total)}
                    </td>
                    <td className="p-4">
                      <Link href={`/order/${order.id}`}>
                        <span className="text-sm text-blue-primary cursor-pointer hover:underline">
                          View
                        </span>
                      </Link>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
          <Pagination
            totalPages={totalDataPages}
            page={page}
            setPage={setPage}
          />
        </div>
      </div>
    </div>
  );
}
