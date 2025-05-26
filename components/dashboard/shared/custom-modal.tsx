"use client";

// Provider
import { useModal } from "@/lib/modal-provider";

// UI components
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogDescription,
  DialogHeader,
} from "@/components/ui/dialog";
import { cn } from "@/lib/utils";

type CustomModalProps = {
  heading?: string;
  subheading?: string;
  children: React.ReactNode;
  defaultOpen?: boolean;
  maxWidth?: string;
};

export default function CustomModal({
  children,
  defaultOpen,
  subheading,
  heading,
  maxWidth,
}: CustomModalProps) {
  const { isOpen, setClose } = useModal();

  return (
    <Dialog open={isOpen || defaultOpen} onOpenChange={setClose}>
      <DialogContent
        className={cn(
          "overflow-y-scroll max-h-90vh md:max-h-[800px] m md:h-fit h-screen bg-card",
          maxWidth
        )}
      >
        <DialogHeader className="pt-8 text-left">
            <DialogTitle className="text-2xl font-bold">{heading || ""}</DialogTitle>
          
          {subheading && <DialogDescription>{subheading}</DialogDescription>}
        </DialogHeader>
        {children}
      </DialogContent>
    </Dialog>
  );
}
