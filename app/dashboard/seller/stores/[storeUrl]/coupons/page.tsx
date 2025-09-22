import CouponDetailsForm from "@/components/dashboard/forms/coupon-details";
import DataTable from "@/components/ui/data-table"
import { PictureInPicture2 } from "lucide-react"
import { columns } from "./columns";
import { getStoreCoupons } from "@/actions/coupon";
import { Coupon } from "@prisma/client";

export default async function SellerCouponsPage({
  params,
}: {
  params: Promise<{ storeUrl: string }>;
}) {
  const { storeUrl } = await params;

  const coupons: Coupon[] = await getStoreCoupons(storeUrl);

  if (!coupons || coupons.length === 0) {
    return <div className="text-center mt-8">No coupons to display.</div>;
  }

  return (
    <div>
      <DataTable
        actionButtonText={
          <>
          <PictureInPicture2  size={12} />
          Create in modal
        </>
        }
        modalChildren={<CouponDetailsForm storeUrl={storeUrl} />}
        newTabLink={`/dashboard/seller/stores/${storeUrl}/coupons/new`}
        filterValue="name"
        data={coupons}
        columns={columns}
        searchPlaceHolder="Search coupon ..."
      />
    </div>
  );
}
