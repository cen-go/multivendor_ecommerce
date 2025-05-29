import React from 'react'
import { Metadata } from 'next'
import StoreDetails from '@/components/dashboard/forms/store-details';

export const metadata: Metadata = {
  title: "Create New Store"
};

export default function SellerCreateStorePage() {
  return (
    <div className="mx-auto p-4 md:p-8">
      <StoreDetails />
    </div>
  );
}
