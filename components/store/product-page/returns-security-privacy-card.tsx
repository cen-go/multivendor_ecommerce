import { ShieldCheckIcon, Undo2Icon } from "lucide-react"

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

export const SecurityPrivacyCard = () => {
  return (
    <div>
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-x-1">
          <ShieldCheckIcon className="w-3.5 stroke-green-500" />
          <span className="text-xs font-bold">Security & Privacy</span>
        </div>
      </div>
      <p className="text-xs text-main-secondary ml-5 flex  gap-x-1">
        Safe payments: We do not share your personal details with any third
        parties without your consent. Secure personal details: We protect your
        privacy and keep your personal details safe and secure.
      </p>
    </div>
  );
};
