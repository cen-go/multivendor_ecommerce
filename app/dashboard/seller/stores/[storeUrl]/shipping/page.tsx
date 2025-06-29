import { getStoreDefaultShippingDetails } from "@/actions/store"
import StoreShippingDetails from "@/components/dashboard/forms/store-shipping-details";

export default async function SellerStoreShippingPage({
  params,
}: {
  params: Promise<{ storeUrl: string }>;
}) {
  const { storeUrl } = await params;

  const shippingDetails = await getStoreDefaultShippingDetails(storeUrl);

  if (!shippingDetails) {
    return (
      <div>
        <h2 className="text-lg font-bold">Store not found</h2>
      </div>
    );
  }

  return (
    <div>
      <StoreShippingDetails data={shippingDetails} storeUrl={storeUrl} />
    </div>
  );
}
