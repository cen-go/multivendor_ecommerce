import { getStoreDefaultShippingDetails, getStoreShippingRates } from "@/actions/store"
import StoreShippingDetails from "@/components/dashboard/forms/store-shipping-details";
import DataTable from "@/components/ui/data-table";
import { columns } from "./columns";

export default async function SellerStoreShippingPage({
  params,
}: {
  params: Promise<{ storeUrl: string }>;
}) {
  const { storeUrl } = await params;

  const shippingDetails = await getStoreDefaultShippingDetails(storeUrl);

  const shippingRateForCountries = await getStoreShippingRates(storeUrl);

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
      <div className="mt-12">
        <DataTable
          filterValue="countryName"
          searchPlaceHolder="Search country"
          data={shippingRateForCountries}
          columns={columns}
        />
      </div>
    </div>
  );
}
