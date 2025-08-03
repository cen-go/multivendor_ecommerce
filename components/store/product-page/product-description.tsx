"use client"

import DOMPurify from "dompurify";

interface Props {
  description: [string, string]; // [product description, variant description]
}

export default function ProductDescription({description}: Props) {
  const sanitizedDescription1 = DOMPurify.sanitize(description[0]);
  const sanitizedDescription2 = DOMPurify.sanitize(description[1]);

  console.log(sanitizedDescription1)

  return (
    <div className="pt-6">
      {/* Title */}
      <div className="h-12">
        <h2 className="text-main-primary text-2xl font-bold">Description</h2>
      </div>
      {/* Display both descriptions */}
      <div dangerouslySetInnerHTML={{__html: sanitizedDescription1}}></div>
      <div dangerouslySetInnerHTML={{__html: sanitizedDescription2}}></div>
    </div>
  );
}
