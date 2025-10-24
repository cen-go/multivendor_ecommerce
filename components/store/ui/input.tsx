import { HTMLInputTypeAttribute } from "react";

interface Props {
  name: string;
  value: string | number;
  type: HTMLInputTypeAttribute;
  placeholder?: string;
  onChange: (value: string) => void;
  readonly: boolean;
}

export default function Input({name, type, value, placeholder, onChange, readonly}: Props) {
  return (
    <div className="w-full relative">
      <input
        type={type}
        name={name}
        placeholder={placeholder}
        value={String(value)}
        onChange={(e) => onChange(e.target.value)}
        readOnly={readonly}
        className="w-full pr-6 pl-8 py-4 bg-white rounded-xl outline-none duration-200 ring-1 ring-transparent focus:ring-[#11BE86]"
      />
    </div>
  );
}
