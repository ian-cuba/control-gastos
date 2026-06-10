"use client"

import { deleteTrip } from "@/app/actions/data"
import type { Trip } from "@/lib/db/schema"
import { formatDate } from "@/lib/format"
import { Card } from "@/components/ui/card"
import { TripDialog } from "@/components/trip-dialog"
import { ConfirmDialog } from "@/components/confirm-dialog"
import Link from "next/link"
import { useState, useTransition } from "react"
import { CalendarDays, MapPin, Pencil, Plus, Trash2 } from "lucide-react"

export function TripsList({ trips }: { trips: Trip[] }) {
  const [createOpen, setCreateOpen] = useState(false)
  const [editTrip, setEditTrip] = useState<Trip | null>(null)
  const [deleteTarget, setDeleteTarget] = useState<Trip | null>(null)
  const [pending, startTransition] = useTransition()

  function handleDelete() {
    if (!deleteTarget) return
    const formData = new FormData()
    formData.set("id", String(deleteTarget.id))
    startTransition(async () => {
      await deleteTrip(formData)
      setDeleteTarget(null)
    })
  }

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center justify-between gap-2">
        <h2 className="text-base font-semibold text-foreground">Mis viajes</h2>
        <button
          onClick={() => setCreateOpen(true)}
          className="flex shrink-0 items-center gap-1.5 rounded-lg bg-gradient-to-r from-primary to-accent px-3 py-2 text-sm font-medium text-primary-foreground transition hover:opacity-95"
        >
          <Plus className="h-4 w-4" />
          Nuevo viaje
        </button>
      </div>

      {trips.length === 0 ? (
        <Card className="flex flex-col items-center gap-3 border-dashed py-12 text-center">
          <div className="flex h-12 w-12 items-center justify-center rounded-full bg-secondary text-muted-foreground">
            <MapPin className="h-6 w-6" />
          </div>
          <div>
            <p className="font-medium text-foreground">Aún no tienes viajes</p>
            <p className="text-sm text-muted-foreground">Crea tu primer viaje para empezar a registrar gastos.</p>
          </div>
        </Card>
      ) : (
        <div className="flex flex-col gap-3">
          {trips.map((trip) => (
            <Card key={trip.id} className="group p-0">
              <div className="flex gap-2 p-3 sm:gap-3 sm:p-4">
                <Link href={`/trips/${trip.id}`} className="flex min-w-0 flex-1 items-start gap-3">
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary sm:h-11 sm:w-11">
                    <MapPin className="h-5 w-5" />
                  </div>
                  <div className="min-w-0 flex-1 py-0.5">
                    <p className="font-semibold leading-snug text-foreground line-clamp-2">{trip.name}</p>
                    <p className="mt-1 flex flex-wrap items-center gap-x-1 gap-y-0.5 text-xs text-muted-foreground sm:text-sm">
                      <CalendarDays className="h-3.5 w-3.5 shrink-0" />
                      <span className="whitespace-nowrap">{formatDate(trip.startDate)}</span>
                      <span aria-hidden>—</span>
                      <span className="whitespace-nowrap">{formatDate(trip.endDate)}</span>
                    </p>
                  </div>
                </Link>
                <div className="flex shrink-0 items-center gap-1 self-start">
                  <button
                    onClick={() => setEditTrip(trip)}
                    aria-label="Editar viaje"
                    className="flex h-8 w-8 items-center justify-center rounded-lg text-muted-foreground transition hover:bg-secondary hover:text-foreground sm:h-9 sm:w-9"
                  >
                    <Pencil className="h-4 w-4" />
                  </button>
                  <button
                    onClick={() => setDeleteTarget(trip)}
                    aria-label="Eliminar viaje"
                    className="flex h-8 w-8 items-center justify-center rounded-lg text-muted-foreground transition hover:bg-destructive/10 hover:text-destructive sm:h-9 sm:w-9"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}

      <TripDialog open={createOpen} onOpenChange={setCreateOpen} />
      {editTrip ? (
        <TripDialog
          open={Boolean(editTrip)}
          onOpenChange={(o) => !o && setEditTrip(null)}
          trip={editTrip}
        />
      ) : null}
      <ConfirmDialog
        open={Boolean(deleteTarget)}
        onOpenChange={(o) => !o && setDeleteTarget(null)}
        title="Eliminar viaje"
        description={`Se eliminará "${deleteTarget?.name}" junto con sus categorías y gastos. Esta acción no se puede deshacer.`}
        confirmLabel="Eliminar"
        pending={pending}
        onConfirm={handleDelete}
      />
    </div>
  )
}
