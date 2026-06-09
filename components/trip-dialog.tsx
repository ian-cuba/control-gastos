"use client"

import { createTrip, updateTrip } from "@/app/actions/data"
import type { Trip } from "@/lib/db/schema"
import { CURRENCIES } from "@/lib/format"
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { useRef, useState, useTransition } from "react"
import { Loader2 } from "lucide-react"

export function TripDialog({
  open,
  onOpenChange,
  trip,
}: {
  open: boolean
  onOpenChange: (open: boolean) => void
  trip?: Trip
}) {
  const formRef = useRef<HTMLFormElement>(null)
  const [pending, startTransition] = useTransition()
  const [currency, setCurrency] = useState(trip?.currency ?? "ARS")
  const isEdit = Boolean(trip)

  function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    const formData = new FormData(e.currentTarget)
    formData.set("currency", currency)
    startTransition(async () => {
      if (isEdit) await updateTrip(formData)
      else await createTrip(formData)
      onOpenChange(false)
    })
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{isEdit ? "Editar viaje" : "Nuevo viaje"}</DialogTitle>
          <DialogDescription>
            {isEdit ? "Actualiza los datos del viaje." : "Completa los datos para crear un viaje."}
          </DialogDescription>
        </DialogHeader>
        <form ref={formRef} onSubmit={onSubmit} className="flex flex-col gap-4">
          {trip ? <input type="hidden" name="id" value={trip.id} /> : null}
          <div className="flex flex-col gap-2">
            <Label htmlFor="name">Nombre</Label>
            <Input id="name" name="name" defaultValue={trip?.name} placeholder="Vacaciones de Verano 2024" required />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className="flex flex-col gap-2">
              <Label htmlFor="startDate">Desde</Label>
              <Input id="startDate" name="startDate" type="date" defaultValue={trip?.startDate} required />
            </div>
            <div className="flex flex-col gap-2">
              <Label htmlFor="endDate">Hasta</Label>
              <Input id="endDate" name="endDate" type="date" defaultValue={trip?.endDate} required />
            </div>
          </div>
          <div className="flex flex-col gap-2">
            <Label htmlFor="currency">Moneda</Label>
            <Select value={currency} onValueChange={(v) => setCurrency(v ?? "ARS")}>
              <SelectTrigger id="currency">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {CURRENCIES.map((c) => (
                  <SelectItem key={c.code} value={c.code}>
                    {c.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <DialogFooter className="mt-2">
            <button
              type="submit"
              disabled={pending}
              className="flex h-10 items-center justify-center gap-2 rounded-lg bg-primary px-4 font-medium text-primary-foreground transition hover:opacity-95 disabled:opacity-50"
            >
              {pending ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
              {isEdit ? "Guardar cambios" : "Crear viaje"}
            </button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
