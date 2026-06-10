"use client"

import { createExpense } from "@/app/actions/data"
import type { Category } from "@/lib/db/schema"
import { todayISO } from "@/lib/format"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { MoneyInput } from "@/components/ui/money-input"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
} from "@/components/ui/select"
import { useState, useTransition } from "react"
import { Loader2 } from "lucide-react"

const NO_CATEGORY = "none"

export function ExpenseDialog({
  open,
  onOpenChange,
  tripId,
  categories,
}: {
  open: boolean
  onOpenChange: (open: boolean) => void
  tripId: number
  categories: Category[]
}) {
  const [pending, startTransition] = useTransition()
  const [categoryId, setCategoryId] = useState<string>(NO_CATEGORY)

  function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    const formData = new FormData(e.currentTarget)
    formData.set("tripId", String(tripId))
    formData.set("categoryId", categoryId === NO_CATEGORY ? "" : categoryId)
    startTransition(async () => {
      await createExpense(formData)
      setCategoryId(NO_CATEGORY)
      onOpenChange(false)
    })
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Agregar gasto</DialogTitle>
          <DialogDescription>Registra un nuevo gasto del viaje.</DialogDescription>
        </DialogHeader>
        <form onSubmit={onSubmit} className="flex flex-col gap-4">
          <div className="flex flex-col gap-2">
            <Label htmlFor="amount">Monto</Label>
            <MoneyInput
              id="amount"
              name="amount"
              placeholder="0"
              required
              autoFocus
            />
          </div>
          <div className="flex flex-col gap-2">
            <Label htmlFor="description">Descripción</Label>
            <Input id="description" name="description" placeholder="Ej: Cena en restaurante" />
          </div>
          <div className="flex flex-col gap-2">
            <Label htmlFor="category">Categoría</Label>
            <Select value={categoryId} onValueChange={(v) => setCategoryId(v ?? NO_CATEGORY)}>
              <SelectTrigger id="category" className="w-full">
                <span className={`flex flex-1 text-left text-sm ${categoryId === NO_CATEGORY ? "text-muted-foreground" : ""}`}>
                  {categoryId === NO_CATEGORY
                    ? "Sin categoría"
                    : (categories.find((c) => String(c.id) === categoryId)?.name ?? "Sin categoría")}
                </span>
              </SelectTrigger>
              <SelectContent>
                <SelectItem value={NO_CATEGORY}>Sin categoría</SelectItem>
                {categories.map((c) => (
                  <SelectItem key={c.id} value={String(c.id)}>
                    {c.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="flex flex-col gap-2">
            <Label htmlFor="expenseDate">Fecha</Label>
            <Input id="expenseDate" name="expenseDate" type="date" defaultValue={todayISO()} required />
          </div>
          <DialogFooter className="mt-2">
            <button
              type="submit"
              disabled={pending}
              className="flex h-10 items-center justify-center gap-2 rounded-lg bg-gradient-to-r from-primary to-accent px-4 font-medium text-primary-foreground transition hover:opacity-95 disabled:opacity-50"
            >
              {pending ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
              Guardar gasto
            </button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
