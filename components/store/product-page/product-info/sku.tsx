"use client";

import toast from "react-hot-toast";
import { CopyIcon } from "@/components/store/icons";

export default function Sku({ sku }: { sku: string }) {
  // Function to copy the SKU to the clipboard
  async function copySkuToClipboard() {
    try {
      await navigator.clipboard.writeText(sku);
      toast.success("Copied to clipboard.");
    } catch {
      toast.error("Failed to copy.");
    }
  }

  return (
    <div className="whitespace-nowrap flex items-center">
      <span className="sm:flex-1 overflow-hidden overflow-ellipsis whitespace-nowrap text-gray-500">
        SKU: {sku}
      </span>
      <span
        className="inline-block align-middle text-[#2f68a8] mx-1 cursor-pointer"
        onClick={copySkuToClipboard}
      >
        <CopyIcon />
      </span>
    </div>
  );
}
