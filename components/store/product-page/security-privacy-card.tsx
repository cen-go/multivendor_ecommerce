"use client"

import { ChevronDown, ChevronUp, ShieldCheckIcon } from "lucide-react";
import { useState } from "react";

export const SecurityPrivacyCard = () => {
  const [open, setOpen] = useState<boolean>(false);
  return (
    <div>
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-x-1 cursor-pointer" onClick={() => setOpen(!open)} >
          <ShieldCheckIcon className="w-3.5 stroke-green-500" />
          <span className="text-xs font-bold">Security & Privacy</span>
          {!open ? (<ChevronDown className="w-3" />): (<ChevronUp className="w-3" />)}
        </div>
      </div>
      {open && (
        <p className="text-xs text-main-secondary ml-5 flex  gap-x-1">
        Safe payments: We do not share your personal details with any third
        parties without your consent. Secure personal details: We protect your
        privacy and keep your personal details safe and secure.
      </p>
      )}
    </div>
  );
};