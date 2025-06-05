// React & Next.js
import { Metadata } from 'next'
import { redirect } from 'next/navigation';
// db queries
import { getStoreByUrl } from '@/actions/store';
// Custom Components
import StoreDetails from '@/components/dashboard/forms/store-details';

export const metadata: Metadata = {
  title: "Store Settings"
};

export default async function SellerStoreSettingsPage({
  params,
}: {
  params: Promise<{ storeUrl: string }>;
}) {
  const { storeUrl } = await params;

  const storeData = await getStoreByUrl(storeUrl);
  // redirect if storeData returns null or undefined
  if (!storeData) redirect("/dashboard/seller/stores");

  return <div>
    <StoreDetails data={storeData} />
  </div>;
}
