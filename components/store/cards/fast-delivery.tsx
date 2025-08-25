import { CheckIcon, ChevronRight, PackageIcon } from 'lucide-react';

export default function FastDelivery() {
  return (
    <div className="space-y-1">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-x-1">
          <PackageIcon className="w-4" />
          <span className="text-sm font-bold">Fast Delivery</span>
        </div>
        <ChevronRight className="w-3" />
      </div>
      <span className="text-xs ml-5 flex  gap-x-1">
        <CheckIcon className="w-3 -translate-y-[2px] stroke-green-400" />
        <span>$5.00 coupon code if delayed</span>
      </span>
      <span className="text-xs ml-5 flex  gap-x-1">
        <CheckIcon className="w-3 -translate-y-[2px] stroke-green-400" />
        <span>Refund if package lost</span>
      </span>
      <span className="text-xs ml-5 flex  gap-x-1">
        <CheckIcon className="w-3 -translate-y-[2px] stroke-green-400" />
        <span>Refund if no delivery in time</span>
      </span>
    </div>
  );
}
