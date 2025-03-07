import React from 'react'

interface Props {
  checked?: boolean
  name: string
  value: string
  endpoint?: string
}

export function ChartButton({ checked, name, value, endpoint }: Props) {
  return (
    <label className="Chart-Button">
      <input
        defaultChecked={checked}
        type="radio"
        name={name}
        value={value}
        data-endpoint={endpoint}
      />
      <span>{value}</span>
    </label>
  )
}
