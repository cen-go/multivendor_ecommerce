"use client"

// React Next.js
import { useEffect, useState } from "react";
// Types
import { CartWithCartItemsType, UserCountry, UserShippingAddressType } from "@/lib/types"
import { Country } from "@prisma/client";
// Components
import UserAddresses from "../shared/user-address/user-addresses";
import CheckoutProductCard from "../cards/checkout-product-card";
import PlaceOrderCard from "../cards/place-order-card";
import CountryNote from "../shared/country-note";
import toast from "react-hot-toast";
// Server actions & queries
import { revalidateCheckoutCart } from "@/actions/user";

interface Props {
  cart: CartWithCartItemsType;
  countries: Country[];
  addresses: UserShippingAddressType[];
  userCountry: UserCountry;
}

export default function CheckoutContainer({cart, countries, addresses, userCountry}: Props) {
  const [selectedAddress, setSelectedAddress] = useState<UserShippingAddressType>();
  const [cartState, setCartState] = useState<CartWithCartItemsType>(cart);

  useEffect(() => {
    const updateShippingData = async () => {
      const res = await revalidateCheckoutCart(cart, selectedAddress?.countryId);
      if (res.success) {
        setCartState(res.cartData);
      } else {
        toast.error(res.message)
      }
    }

    updateShippingData();
  }, [selectedAddress?.countryId, cart, userCountry.name])

  let discount = 0;
  // calculate the discount amount if a coupon is applied
  if (cartState.coupon) {
    const { coupon } = cartState;
    const applicableItems = cartState.cartItems.filter(
      (item) => item.storeId === coupon.storeId
    );
    const subtotalOfCouponProducts = applicableItems.reduce(
      (sum, item) => sum + item.price * item.quantity,
      0
    );

    discount = Math.round((subtotalOfCouponProducts * coupon.discount) / 100);
  }

  return (
    <div className="w-full flex flex-col gap-y-2 lg:flex-row">
      <div className="space-y-2 lg:flex-1">
        {/* Address */}
        <UserAddresses
          addresses={addresses}
          countries={countries}
          selectedAddress={selectedAddress}
          setSelectedAddress={setSelectedAddress}
        />
        {/* country note */}
        <div className="mt-5">
          <CountryNote
            userCountry={
              selectedAddress
                ? {
                    name: selectedAddress.country.name,
                    code: selectedAddress.country.code,
                  }
                : userCountry
            }
          />
        </div>
        {/* Checkout Table */}
        <div className="my-5">
          {cartState.cartItems.map((product) => (
            <CheckoutProductCard key={product.id} product={product} />
          ))}
        </div>
      </div>
      {/* Place order card */}
      <PlaceOrderCard
        cartId={cart.id}
        selectedAddress={selectedAddress}
        shippingFees={cartState.shippingFees}
        subtotal={cartState.subtotal}
        discount={discount}
        total={cartState.total}
        setCart={setCartState}
        coupon={cartState.coupon}
      />
    </div>
  );
}
