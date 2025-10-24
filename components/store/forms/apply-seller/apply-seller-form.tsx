"use client"

import { StoreType } from "@/lib/types";
import { useState } from "react";
import Instructions from "./instructions";
import ProgressBar from "./progress-bar";

export default function ApplySellerMultiForm() {
  const [step, setStep] = useState<number>(1);
  const [formData, setFormData] = useState<StoreType>({
    name: "",
    description: "",
    email: "",
    phone: "",
    url: "",
    logo: "",
    cover: "",
    defaultShippingService: "",
    defaultShippingFeePerItem: undefined,
    defaultShippingFeeForAdditionalItem: undefined,
    defaultShippingFeePerKg: undefined,
    defaultShippingFeeFixed: undefined,
    defaultDeliveryTimeMin: undefined,
    defaultDeliveryTimeMax: undefined,
    returnPolicy: "",
  });

  return (
    <div className="grid lg:grid-cols-[400px_1fr]">
      {/* instructions */}
      <Instructions />
      <div className="relative p-5 w-full">
        {/* Progress bar */}
        <ProgressBar step={step} />
        {/* Steps */}
      </div>
    </div>
  )
}