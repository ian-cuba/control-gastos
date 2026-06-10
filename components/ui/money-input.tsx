"use client"

import { useState } from "react"
import { Input } from "@/components/ui/input"

interface MoneyInputProps {
  id?: string
  /** Si se provee, agrega un <input type="hidden"> con este name para FormData */
  name?: string
  /** Valor controlado: string numérico crudo, ej. "1500.50" */
  value?: string
  /** Valor inicial para modo no controlado */
  defaultValue?: string
  /** Callback con el valor numérico crudo, ej. "1500.50" */
  onChange?: (rawValue: string) => void
  placeholder?: string
  required?: boolean
  autoFocus?: boolean
}

/** Formatea un string numérico crudo a display con separador de miles (es-AR: punto=miles, coma=decimal) */
function toDisplay(raw: string): string {
  if (!raw) return ""
  const [intPart = "", decPart] = raw.split(".")
  const intFormatted = intPart.replace(/\B(?=(\d{3})+(?!\d))/g, ".")
  return decPart !== undefined ? `${intFormatted},${decPart}` : intFormatted
}

/** Convierte el string de display a numérico crudo */
function toRaw(display: string): string {
  const raw = display.replace(/\./g, "").replace(",", ".")
  return raw.endsWith(".") ? raw.slice(0, -1) : raw
}

export function MoneyInput({
  id,
  name,
  value,
  defaultValue = "",
  onChange,
  placeholder = "0",
  required,
  autoFocus,
}: MoneyInputProps) {
  const isControlled = value !== undefined
  const initial = isControlled ? (value ?? "") : defaultValue

  const [display, setDisplay] = useState(() => (initial ? toDisplay(initial) : ""))
  const [internalRaw, setInternalRaw] = useState(initial)

  const currentRaw = isControlled ? (value ?? "") : internalRaw

  function handleChange(e: React.ChangeEvent<HTMLInputElement>) {
    const input = e.target.value
    // Sólo dígitos y una coma como separador decimal
    const cleaned = input.replace(/[^0-9,]/g, "")
    const parts = cleaned.split(",")
    const sanitized = parts.length > 2 ? parts[0] + "," + parts.slice(1).join("") : cleaned

    // Formatear parte entera con separador de miles mientras se escribe
    const [intPart = "", decPart] = sanitized.split(",")
    const intFormatted = intPart ? intPart.replace(/\B(?=(\d{3})+(?!\d))/g, ".") : ""
    const formatted = decPart !== undefined ? `${intFormatted},${decPart}` : intFormatted

    setDisplay(formatted)
    const rawValue = toRaw(formatted)
    if (!isControlled) setInternalRaw(rawValue)
    onChange?.(rawValue)
  }

  return (
    <>
      <Input
        id={id}
        type="text"
        inputMode="decimal"
        value={display}
        onChange={handleChange}
        placeholder={placeholder}
        required={required}
        autoFocus={autoFocus}
      />
      {name && <input type="hidden" name={name} value={currentRaw} />}
    </>
  )
}
