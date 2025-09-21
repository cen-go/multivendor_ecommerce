import CouponDetailsForm from "@/components/dashboard/forms/coupon-details";

export default async function NewSellerCouponPage({
  params,
}: {
  params: Promise<{ storeUrl: string }>;
}) {

  const { storeUrl } = await params;
  return (
    <div>
      <CouponDetailsForm storeUrl={storeUrl} />
    </div>
  );
}
