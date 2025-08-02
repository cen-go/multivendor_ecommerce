import { ChevronDown, ChevronUp, ShieldCheckIcon, Undo2Icon } from "lucide-react"
import { Dispatch, SetStateAction, useState } from "react";

export default function ReturnPrivacySecurityCard({returnPolicy}: {returnPolicy: string}) {
  const [securityOpen, setSecurityOpen] = useState<boolean>(false);
  return (
    <div className="space-y-1">
      <Returns returnPolicy={returnPolicy} />
      <SecurityPrivacyCard open={securityOpen} setOpen={setSecurityOpen} />
    </div>
  )
}

export const Returns = ({returnPolicy}: {returnPolicy: string}) => {
  return (
    <div>
      <div className="flex items-center gap-x-1">
        <Undo2Icon className="w-3.5 pb-1" />
        <span className="text-xs font-bold">Return Policy</span>
      </div>
      <div className="text-xs ml-5 text-main-secondary">{returnPolicy}</div>
    </div>
  );
}

export const SecurityPrivacyCard = ({
  open,
  setOpen,
}: {
  open: boolean;
  setOpen: Dispatch<SetStateAction<boolean>>;
}) => {
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
