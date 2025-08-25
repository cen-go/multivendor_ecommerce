import { Undo2Icon } from "lucide-react"
import { SecurityPrivacyCard } from "./security-privacy-card";

export default function ReturnPrivacySecurityCard({returnPolicy}: {returnPolicy: string}) {
  return (
    <div className="space-y-1">
      <Returns returnPolicy={returnPolicy} />
      <SecurityPrivacyCard />
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


