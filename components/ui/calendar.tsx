"use client"

import * as React from "react"
import DatePicker from "react-datepicker"
import "react-datepicker/dist/react-datepicker.css"

function Calendar({
  selected,
  onChange,
  ...props
}: {
  selected: Date | null
  onChange: (date: Date | null) => void
  [key: string]: unknown
}) {
  return (
    <DatePicker
      selected={selected}
      onChange={onChange}
      className="p-2 border rounded"
      {...props}
    />
  )
}

export { Calendar }