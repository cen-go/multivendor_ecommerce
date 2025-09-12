import { XIcon } from "lucide-react";
import { Dispatch, ReactNode, SetStateAction } from "react";

interface Props {
  title: string;
  show: boolean;
  setShow: Dispatch<SetStateAction<boolean>>;
  children: ReactNode;
}

export default function Modal({children, title, show, setShow}: Props) {
  return show ? (
    <div>
      {/* Backdrop */}
      <div
        className="fixed inset-0 z-20 bg-black/35"
        onClick={() => setShow(false)}
      />
      {/* Content container */}
      <div className="absolute left-1/2 -translate-x-1/2 z-50 w-full max-w-[900px] px-8">
        <div className="bg-white p-8 pb-12 rounded-lg shadow-lg z-50">
          <div className="flex items-center justify-between border-b pb-2">
            <h1 className="font-bold text-xl">{title}</h1>
            <XIcon
              className="w-4 h-4 cursor-pointer hover:text-destructive"
              onClick={() => setShow(false)}
            />
          </div>
          <div className="mt-6">{children}</div>
        </div>
      </div>
    </div>
  ) : null;
}
