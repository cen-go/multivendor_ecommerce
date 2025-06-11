"use client"

import Image from "next/image";
import { CldUploadWidget } from 'next-cloudinary';
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { deleteCloudinaryImage } from "@/actions/cloudinary";
import { getCloudinaryPublicId } from "@/lib/utils";
import { toast } from "sonner";

interface ImageUploadProps {
  disabled?: boolean;
  onChange: (value: string) => void;
  onRemove: (value: string) => void;
  value: string[];
  type: "standard" | "profile" | "cover";
  dontShowPreview?: boolean;
}

export default function ImageUpload({
  disabled,
  onChange,
  onRemove,
  type,
  value,
  dontShowPreview,
}: ImageUploadProps) {
  const [isMounted, setIsMounted] = useState(false);
  const preset = process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET;

  // to Avoid hydration issues. open() render prop of cloudinary widget can 
  // be undefined at the beginning.
  useEffect(() => {
    setIsMounted(true);
  }, []);

  async function handleRemove(imageUrl: string) {
    const publicId = getCloudinaryPublicId(imageUrl);
    const result = await deleteCloudinaryImage(publicId);
    if (result.success) {
      onRemove(imageUrl); // delete from UI and local state
    } else {
      toast.error(result.message);
    }
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  function onUpload(result:any) {
    onChange(result.info.secure_url);
  }

  if (type === "profile") {
    return (
      <div
        style={{ pointerEvents: "auto" }}
        className="relative rounded-full w-40 h-40 bg-slate-300 border-2 border-white shadow-2xl"
      >
        {value.length > 0 && (
          <Image
            src={value[0]}
            alt=""
            width={300}
            height={300}
            className="w-40 h-40 rounded-full object-cover absolute top-0 bottom-0 right-0 left-0"
          />
        )}
        <CldUploadWidget
          uploadPreset={preset}
          onSuccess={onUpload}
          onClose={() => {
            // Restore the pointer events (adjust as needed)
            document.body.style.pointerEvents = "";
          }}
        >
          {({ open }) => {
            return (
              <>
                <button
                  type="button"
                  className="z-20 absolute right-0 bottom-0 flex items-center font-medium text-[17px] h-14 w-14 justify-center  text-white bg-gradient-to-t from-blue-primary to-blue-300 border-none shadow-lg rounded-full hover:shadow-md active:shadow-sm cursor-pointer"
                  disabled={disabled || !isMounted || !open}
                  onClick={() => {
                    document.body.style.pointerEvents = "auto";
                    if (open) open();
                  }}
                >
                  <svg
                    viewBox="0 0 640 512"
                    fill="white"
                    height="1em"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path d="M144 480C64.5 480 0 415.5 0 336c0-62.8 40.2-116.2 96.2-135.9c-.1-2.7-.2-5.4-.2-8.1c0-88.4 71.6-160 160-160c59.3 0 111 32.2 138.7 80.2C409.9 102 428.3 96 448 96c53 0 96 43 96 96c0 12.2-2.3 23.8-6.4 34.6C596 238.4 640 290.1 640 352c0 70.7-57.3 128-128 128H144zm79-217c-9.4 9.4-9.4 24.6 0 33.9s24.6 9.4 33.9 0l39-39V392c0 13.3 10.7 24 24 24s24-10.7 24-24V257.9l39 39c9.4 9.4 24.6 9.4 33.9 0s9.4-24.6 0-33.9l-80-80c-9.4-9.4-24.6-9.4-33.9 0l-80 80z" />
                  </svg>
                </button>
              </>
            );
          }}
        </CldUploadWidget>
      </div>
    );
  } else if (type === "cover") {
    return (
      <div
        style={{ pointerEvents: "auto", height: "280px" }}
        className="relative w-full bg-gray-100 rounded-lg bg-gradient-to-b from-gray-100 via-gray-100 to-gray-400 overflow-hidden"
      >
        {value.length > 0 && (
          <Image
            src={value[0]}
            alt=""
            width={1200}
            height={600}
            className="w-full h-full rounded-lg object-cover"
          />
        )}
        <CldUploadWidget
          uploadPreset={preset}
          onSuccess={onUpload}
          onClose={() => {
            // Restore the pointer events (adjust as needed)
            document.body.style.pointerEvents = "";
          }}
        >
          {({ open }) => {
            return (
              <>
                <button
                  type="button"
                  className="absolute bottom-4 right-4 flex items-center font-medium text-[17px] py-3 px-6 text-white bg-gradient-to-t from-blue-primary to-blue-300 border-none shadow-lg rounded-full hover:shadow-md active:shadow-sm cursor-pointer"
                  disabled={disabled || !isMounted || !open}
                  onClick={() => {
                    document.body.style.pointerEvents = "auto";
                    if (open) open();
                  }}
                >
                  <svg
                    viewBox="0 0 640 512"
                    fill="white"
                    height="1em"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path d="M144 480C64.5 480 0 415.5 0 336c0-62.8 40.2-116.2 96.2-135.9c-.1-2.7-.2-5.4-.2-8.1c0-88.4 71.6-160 160-160c59.3 0 111 32.2 138.7 80.2C409.9 102 428.3 96 448 96c53 0 96 43 96 96c0 12.2-2.3 23.8-6.4 34.6C596 238.4 640 290.1 640 352c0 70.7-57.3 128-128 128H144zm79-217c-9.4 9.4-9.4 24.6 0 33.9s24.6 9.4 33.9 0l39-39V392c0 13.3 10.7 24 24 24s24-10.7 24-24V257.9l39 39c9.4 9.4 24.6 9.4 33.9 0s9.4-24.6 0-33.9l-80-80c-9.4-9.4-24.6-9.4-33.9 0l-80 80z" />
                  </svg>
                  <span className="ms-2 text-sm">Upload image</span>
                </button>
              </>
            );
          }}
        </CldUploadWidget>
      </div>
    );
  } else {
    return (
      <div style={{ pointerEvents: "auto" }}>
        <div className="mb-4 flex items-center gap-4">
          {value.length > 0 &&
            !dontShowPreview &&
            value.map((imageUrl) => (
              <div
                key={imageUrl}
                className="relative w-[120px] h-[120px] rounded-md overflow-hidden bg-slate-100/20 border-2 border-slate-300"
              >
                {/* Delete image btn */}
                <Button
                  type="button"
                  size="sm"
                  variant="secondary"
                  onClick={() => handleRemove(imageUrl)}
                  className="absolute z-10 !text-white top-1 right-1 rounded-full text-xs w-4 h-6 font-semibold bg-red-800 hover:bg-red-700"
                >
                  X
                </Button>
                {/* Image */}
                <Image src={imageUrl} alt="Prodcut image" fill className="object-contain" />
              </div>
            ))}
        </div>
        <CldUploadWidget
          uploadPreset={preset}
          onSuccess={onUpload}
          onClose={() => {
            // Restore the pointer events (adjust as needed)
            document.body.style.pointerEvents = "";
          }}
        >
          {({ open }) => {
            return (
              <>
                <button
                  type="button"
                  className="flex items-center font-medium text-[17px] py-3 px-6 text-white bg-gradient-to-t from-blue-primary to-blue-300 border-none shadow-lg rounded-full hover:shadow-md active:shadow-sm cursor-pointer"
                  disabled={disabled || !isMounted || !open}
                  onClick={() => {
                    document.body.style.pointerEvents = "auto";
                    if (open) open();
                  }}
                >
                  <svg
                    viewBox="0 0 640 512"
                    fill="white"
                    height="1em"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path d="M144 480C64.5 480 0 415.5 0 336c0-62.8 40.2-116.2 96.2-135.9c-.1-2.7-.2-5.4-.2-8.1c0-88.4 71.6-160 160-160c59.3 0 111 32.2 138.7 80.2C409.9 102 428.3 96 448 96c53 0 96 43 96 96c0 12.2-2.3 23.8-6.4 34.6C596 238.4 640 290.1 640 352c0 70.7-57.3 128-128 128H144zm79-217c-9.4 9.4-9.4 24.6 0 33.9s24.6 9.4 33.9 0l39-39V392c0 13.3 10.7 24 24 24s24-10.7 24-24V257.9l39 39c9.4 9.4 24.6 9.4 33.9 0s9.4-24.6 0-33.9l-80-80c-9.4-9.4-24.6-9.4-33.9 0l-80 80z" />
                  </svg>
                  <span className="ms-2 text-sm">Upload image</span>
                </button>
              </>
            );
          }}
        </CldUploadWidget>
      </div>
    );
  }
}
