"use client"

import { StoreType } from "@/lib/types";
import { useState } from "react";
import Instructions from "./instructions";
import ProgressBar from "./progress-bar";
import Step1 from "./steps/step-1/step-1";

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
         {step === 1 ? (
          <Step1 step={step} setStep={setStep} />
        ) : step === 2 ? (
          <div></div>
          // <Step2
          //   formData={formData}
          //   setFormData={setFormData}
          //   step={step}
          //   setStep={setStep}
          // />
        ) : step === 3 ? (
          <div></div>
          // <Step3
          //   formData={formData}
          //   setFormData={setFormData}
          //   step={step}
          //   setStep={setStep}
          // />
        ) : step === 4 ? (
          <div></div>
          // <Step4 />
        ) : null}
      </div>
    </div>
  )
}