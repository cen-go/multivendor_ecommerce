import Image from "next/image";
import { UserShippingAddressType } from "@/lib/types";

export default function OrderUserDetailsCard({shippingAddress}: {shippingAddress: UserShippingAddressType}) {
  const { user } = shippingAddress;
  return (
    <section className="p-2 shadow-sm w-full">
      <div className="w-fit mx-auto">
        <Image src={user.picture} height={100} width={100} alt="Profile Picture" className="rounded-full w-22 h-22 object-cover" />
      </div>
      <div className="text-main-primary mt-2 space-y-2">
          <h2 className="text-center font-bold text-2xl tracking-wide capitalize">
            {shippingAddress.firstName} {shippingAddress.lastName}
          </h2>
          <h6 className="text-center py-2 border-t border-neutral-400 border-dashed">
            {user.email}
          </h6>
          <h6 className="text-center">{shippingAddress.phone}</h6>
          <p className="text-sm  py-2 border-t border-neutral-400 border-dashed">
            {shippingAddress.address1}, {shippingAddress.address2} ,{shippingAddress.city} , {shippingAddress.zip_code}, {shippingAddress.country.name}
          </p>
        </div>
    </section>
  )
}
