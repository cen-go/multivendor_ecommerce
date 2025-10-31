import { UserShippingAddressType } from '@/lib/types'
import React from 'react'

export default function SimpleAddressCard({address}: {address: UserShippingAddressType}) {
  return (
    <div className="w-full border py-2 px-6 rounded-xl">
          {/* Full name - Phone number */}
          <div className="flex max-w-[328px] overflow-hidden text-ellipsis whitespace-nowrap">
            <span className="mr-4 text-sm text-black font-semibold capitalize">
              {address.title} - {address.firstName} {address.lastName}
            </span>
            <span>{address.phone}</span>
          </div>
          {/* Address 1 - Address 2 */}
          <div className="text-sm max-w-[90%] text-gray-600 leading-4 overflow-hidden text-ellipsis whitespace-nowrap">
            {address.address1}
            {address.address2 && `, ${address.address2}`}
          </div>
          {/* City - Country - Zipcode */}
          <div className="text-sm max-w-[90%] text-gray-600 leading-4 overflow-hidden text-ellipsis whitespace-nowrap">
            {address.city}, {address.country.name},&nbsp;
            {address.zip_code}
          </div>
        </div>
  )
}
