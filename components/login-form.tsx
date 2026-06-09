"use client"

import { login } from "@/app/actions/auth"
import { Card, CardContent } from "@/components/ui/card"
import { useActionState, useRef, useState } from "react"
import { Loader2 } from "lucide-react"

const PIN_LENGTH = 4

export function LoginForm() {
  const [state, formAction, pending] = useActionState(login, undefined)
  const [digits, setDigits] = useState<string[]>(Array(PIN_LENGTH).fill(""))
  const inputs = useRef<Array<HTMLInputElement | null>>([])

  const pin = digits.join("")

  function handleChange(index: number, value: string) {
    const char = value.replace(/\D/g, "").slice(-1)
    const next = [...digits]
    next[index] = char
    setDigits(next)
    if (char && index < PIN_LENGTH - 1) {
      inputs.current[index + 1]?.focus()
    }
  }

  function handleKeyDown(index: number, e: React.KeyboardEvent<HTMLInputElement>) {
    if (e.key === "Backspace" && !digits[index] && index > 0) {
      inputs.current[index - 1]?.focus()
    }
  }

  function handlePaste(e: React.ClipboardEvent<HTMLInputElement>) {
    e.preventDefault()
    const pasted = e.clipboardData.getData("text").replace(/\D/g, "").slice(0, PIN_LENGTH)
    if (!pasted) return
    const next = Array(PIN_LENGTH).fill("")
    pasted.split("").forEach((c, i) => (next[i] = c))
    setDigits(next)
    inputs.current[Math.min(pasted.length, PIN_LENGTH - 1)]?.focus()
  }

  return (
    <Card className="border-border/60 shadow-sm">
      <CardContent className="pt-6">
        <form action={formAction} className="flex flex-col gap-5">
          <input type="hidden" name="pin" value={pin} />
          <div className="flex justify-center gap-3">
            {digits.map((digit, i) => (
              <input
                key={i}
                ref={(el) => {
                  inputs.current[i] = el
                }}
                inputMode="numeric"
                type="password"
                aria-label={`Dígito ${i + 1} del PIN`}
                maxLength={1}
                value={digit}
                onChange={(e) => handleChange(i, e.target.value)}
                onKeyDown={(e) => handleKeyDown(i, e)}
                onPaste={handlePaste}
                className="h-14 w-12 rounded-xl border border-input bg-background text-center text-2xl font-semibold text-foreground outline-none transition focus:border-primary focus:ring-2 focus:ring-ring/30"
              />
            ))}
          </div>

          {state?.error ? (
            <p className="text-center text-sm text-destructive">{state.error}</p>
          ) : null}

          <button
            type="submit"
            disabled={pending || pin.length !== PIN_LENGTH}
            className="flex h-11 items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-primary to-accent font-medium text-primary-foreground transition hover:opacity-95 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {pending ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
            Ingresar
          </button>
        </form>
      </CardContent>
    </Card>
  )
}
