// React, Next.js
import { Input } from "@/components/ui/input";
import { Dispatch, SetStateAction } from "react";

// Define the interface for each detail object
export interface Detail {
  [key: string]: string | number | undefined;
}

// define props for ClickToAddInputs component
interface ClickToAddInputsProps<T extends Detail> {
  details: T[];
  setDetails: Dispatch<SetStateAction<T[]>>;
  initialDetail?: T; // Optional initial detail object
  header?: string;
}

export default function ClickToAddInputs<T extends Detail>({
  details,
  setDetails,
  header,
  initialDetail = {} as T, // Default of the initial value is an empty object
}: ClickToAddInputsProps<T>) {

  // Function to handle changes in detail properties
  function handleDetailsChange(index: number, key: string, value: string | number) {
    // Update the details state array with the new property value
    setDetails((prevDetails) => {
      const updatedDetails = [...prevDetails];
      updatedDetails[index] = { ...updatedDetails[index], [key]: value };
      return updatedDetails;
    });
  }

  // Function to add new detail row
  function handleAddDetail() {
    setDetails((prevDetails) => [...prevDetails, {...initialDetail}]);
  }

  // Function to remove a detail row
  function handleRemoveDetail(index:number) {
    // We must keep at least one detail field
    if (details.length === 1) return;

    setDetails((prevDetails) => {
      const copyDetails = [...prevDetails];
      const updatedDetails = copyDetails.filter((_, i) => i !== index);
      return updatedDetails;
    });
  }

  // PlusButton component for adding new details
  const PlusButton = ({ onClick }: { onClick: () => void }) => {
    return (
      <button
        type="button"
        title="Add new detail"
        className="group cursor-pointer outline-none hover:rotate-90 duration-300"
        onClick={onClick}
      >
        {/* Plus icon */}
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="50px"
          height="50px"
          viewBox="0 0 24 24"
          className="w-8 h-8 stroke-blue-400 fill-none group-hover:fill-blue-primary group-active:stroke-blue-200 group-active:fill-blue-700 group-active:duration-0 duration-300"
        >
          <path
            d="M12 22C17.5 22 22 17.5 22 12C22 6.5 17.5 2 12 2C6.5 2 2 6.5 2 12C2 17.5 6.5 22 12 22Z"
            strokeWidth="1.5"
          />
          <path d="M8 12H16" strokeWidth="1.5" />
          <path d="M12 16V8" strokeWidth="1.5" />
        </svg>
      </button>
    );
  };

  // MinusButton component for removing details
  const MinusButton = ({ onClick }: { onClick: () => void }) => {
    return (
      <button
        type="button"
        title="Remove detail"
        className="group cursor-pointer outline-none hover:rotate-90 duration-300"
        onClick={onClick}
      >
        {/* Minus icon */}
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="50px"
          height="50px"
          viewBox="0 0 24 24"
          className="w-8 h-8 stroke-blue-400 fill-none group-hover:fill-white group-active:stroke-blue-200 group-active:fill-blue-700 group-active:duration-0 duration-300"
        >
          <path
            d="M12 22C17.5 22 22 17.5 22 12C22 6.5 17.5 2 12 2C6.5 2 2 6.5 2 12C2 17.5 6.5 22 12 22Z"
            strokeWidth="1.5"
          />
          <path d="M8 12H16" strokeWidth="1.5" />
        </svg>
      </button>
    );
  };

  return (
    <div className="flex flex-col gap-y-4">
      {/* Header */}
      <div>{header}</div>
      {/* Display Plus Button if no detail exists */}
      {details.length === 0 && <PlusButton onClick={handleAddDetail} />}
      {/* Map through details and render input fields */}
      {details.map((detail, i) => (
        <div key={i} className="flex items-center gap-x-2">
          {Object.keys(detail).map((keyName, keyIndex) => (
            <div key={keyIndex} className="flex items-center gap-x-4">
              <Input
                className="w-24"
                type={typeof detail[keyName] === "number" ? "number" : "text"}
                name={keyName}
                placeholder={keyName}
                value={detail[keyName] as string}
                min={typeof detail[keyName] === "number" ? 0 : undefined}
                onChange={(e) =>
                  handleDetailsChange(
                    i,
                    keyName,
                    e.target.type === "number"
                      ? parseFloat(e.target.value)
                      : e.target.value
                  )
                }
              />
            </div>
          ))}
          {/* Show buttons for each row of inputs */}
          <MinusButton onClick={() => handleRemoveDetail(i)} />
          <PlusButton onClick={handleAddDetail} />
        </div>
      ))}
    </div>
  );
}
