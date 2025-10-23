import Image from "next/image";
// Types
import { StoreOrderType } from "@/lib/types";
import { OrderStatus, PaymentStatus, ProductStatus } from "@prisma/client";
// Utils
import { calculateShippingDateRange, formatCurrency } from "@/lib/utils";
// Components
import PaymentStatusTag from "../shared/payment-status-tag";
import OrderStatusUpdate from "./forms/order-status-update";
import ProductStatusUpdate from "./forms/product-status-update";

interface Props {
  group: StoreOrderType;
}

export default function StoreOrderSummary({ group }: Props)  {
  const paymentDetails = group.order.paymentDetails;
  const paymentStatus = group.order.paymentStatus as PaymentStatus;
  const shippingAddress = group.order.shippingAddress;

  const { minDate, maxDate } = calculateShippingDateRange(
    group.deliveryTimeMin,
    group.deliveryTimeMax,
    group.createdAt
  );

  const {
    address1,
    address2,
    city,
    country,
    firstName,
    lastName,
    phone,
    zip_code,
    user,
  } = shippingAddress;

  return (
    <div className="py-2 relative">
      <div className="w-full px-1">
        <div className="space-y-3">
          <h2 className="font-bold text-3xl leading-10 overflow-ellipsis line-clamp-1">
            Order Details
          </h2>
          <h6 className="font-semibold text-2xl leading-9">#{group.id}</h6>
          <div className="flex items-center gap-x-2">
            <PaymentStatusTag status={paymentStatus} />
            <OrderStatusUpdate
              storeId={group.storeId}
              orderGroupId={group.id}
              orderStatus={group.status as OrderStatus}
            />
          </div>
        </div>
        <div className="mt-3 grid grid-cols-1 gap-3 py-4 border-gray-100 mb-6">
          {/* Shipping info */}
          <div className="grid grid-cols-2">
            <div>
              <p className="font-normal text-base leading-7 text-gray-500 mb-3 transition-all duration-500 ">
                Shipping Service
              </p>
              <h6 className="font-semibold text-lg leading-9">
                {group.shippingService}
              </h6>
            </div>
            <div>
              <p className="font-normal text-base leading-7 text-gray-500 mb-3 transition-all duration-500 ">
                Expected Delivery Date
              </p>
              <h6 className="font-semibold text-lg leading-9">
                {minDate} - {maxDate}
              </h6>
            </div>
          </div>
          {/* Payment info */}
          <div className="grid grid-cols-2">
            <div>
              <p className="font-normal text-base leading-7 text-gray-500 mb-3 transition-all duration-500 ">
                Payment Method
              </p>
              <h6 className="font-semibold text-lg leading-9">
                {paymentDetails?.paymentMethod || "-"}
              </h6>
            </div>
            <div>
              <p className="font-normal text-base leading-7 text-gray-500 mb-3 transition-all duration-500 ">
                Payment Reference
              </p>
              <h6 className="font-semibold text-lg leading-9">
                {paymentDetails?.paymentIntentId || "-"}
              </h6>
            </div>
          </div>
          {/* Address */}
          <div>
            <p className="font-normal text-base leading-7 text-gray-500 mb-3 transition-all duration-500 ">
              Address
            </p>
            <h6 className="font-semibold text-lg leading-9">
              {address1}, {address2 && `${address2},`}, {city},&nbsp;
              {zip_code}, {country.name}
            </h6>
          </div>
          {/* Customer */}
          <div>
            <p className="font-normal text-base leading-7 text-gray-500 mb-3 transition-all duration-500 ">
              Customer
            </p>
            <h6 className="font-semibold text-lg leading-9">
              {firstName} {lastName}, {phone}, {user.email}
            </h6>
          </div>
        </div>
        {/* Products */}
        {group.orderItems.map((product) => (
          <div
            key={product.id}
            className="grid gap-4 py-3 w-full border-t border-gray-100"
            style={{ gridTemplateColumns: "144px 1.3fr 1fr" }}
          >
            {/* Product image  */}
            <div className="w-full h-full">
              <Image
                src={product.image}
                alt=""
                width={200}
                height={200}
                className="w-36 h-36 rounded-xl object-cover"
              />
            </div>
            {/* Product info  */}
            <div className="flex flex-col gap-y-1">
              <h5 className="font-semibold text-sm leading-4 line-clamp-1 overflow-ellipsis">
                {product.name}
              </h5>
              <div className="text-sm">
                <p className="font-normal text-gray-500">
                  Sku : <span className="ms-1">{product.sku}</span>
                </p>
              </div>
              <div className="text-sm">
                <p className="font-normal text-gray-500">
                  Size : <span className="ms-1">{product.size}</span>
                </p>
              </div>
              <div className="text-sm">
                <p className="font-normal text-gray-500">
                  Quantity : <span className="ms-1">{product.quantity}</span>
                </p>
              </div>
              <div className="text-sm">
                <p className="font-normal text-gray-500">
                  Price :&nbsp;
                  <span className="ms-1">{formatCurrency(product.price)}</span>
                </p>
              </div>
              <div className="text-sm">
                <p className="font-normal text-gray-500">
                  Shipping Fee :{" "}
                  <span className="ms-1">
                    {formatCurrency(product.shippingFee)}
                  </span>
                </p>
              </div>
            </div>
            {/* Product status - total  */}
            <div className="flex flex-col items-center justify-center">
              <ProductStatusUpdate
                orderItemId={product.id}
                storeId={group.storeId}
                status={product.status as ProductStatus}
              />
              <div className="grid place-items-center">
                <h5 className="font-semibold text-3xl leading-10 mt-3">
                  {formatCurrency(product.totalPrice)}
                </h5>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};