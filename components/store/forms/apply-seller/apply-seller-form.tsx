"use client"

import { useState } from "react";

import { StoreType } from "@/lib/types";
import Instructions from "./instructions";
import ProgressBar from "./progress-bar";
import Step1 from "./steps/step-1/step-1";
import Step4 from "./steps/step-4/step-4";
import Step2 from "./steps/step-2/step-2";
import Step3 from "./steps/step-3/step-3";

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
    defaultShippingService: undefined,
    defaultShippingFeePerItem: 0,
    defaultShippingFeePerAdditionalItem: 0,
    defaultShippingFeePerKg: 0,
    defaultShippingFeeFixed: 0,
    defaultDeliveryTimeMin: 7,
    defaultDeliveryTimeMax: 31,
    returnPolicy: undefined,
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
          <Step2
            formData={formData}
            setFormData={setFormData}
            step={step}
            setStep={setStep}
          />
        ) : step === 3 ? (
          <Step3
            formData={formData}
            setFormData={setFormData}
            step={step}
            setStep={setStep}
          />
        ) : step === 4 ? (
          <Step4 />
        ) : null}
      </div>
    </div>
  )
}