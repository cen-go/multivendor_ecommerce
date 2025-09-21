import CouponDetailsForm from "@/components/dashboard/forms/coupon-details";
import DataTable from "@/components/ui/data-table"
import { PlusIcon } from "lucide-react"
import { columns } from "./columns";
import { getStoreCoupons } from "@/actions/coupon";

export default async function SellerCouponsPage({
  params,
}: {
  params: Promise<{ storeUrl: string }>;
}) {
  const { storeUrl } = await params;

  const coupons = await getStoreCoupons(storeUrl);
  return (
    <div>
      <DataTable
        actionButtonText={
          <>
            <PlusIcon size={15} />
            Create coupon
          </>
        }
        modalChildren={<CouponDetailsForm storeUrl={storeUrl} />}
        newTabLink={`/dashboard/seller/stores/${storeUrl}/coupons/new`}
        filterValue="name"
        data={coupons}
        columns={columns}
        searchPlaceholder="Search coupon ..."
      />
    </div>
  );
}
