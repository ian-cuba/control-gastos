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
      <div className="flex items-center justify-between">
        <h2 className="text-base font-semibold text-foreground">Mis viajes</h2>
        <button
          onClick={() => setCreateOpen(true)}
          className="flex items-center gap-2 rounded-lg bg-gradient-to-r from-primary to-accent px-3 py-2 text-sm font-medium text-primary-foreground transition hover:opacity-95"
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
              <div className="flex items-center justify-between gap-3 p-4">
                <Link href={`/trips/${trip.id}`} className="flex min-w-0 flex-1 items-center gap-3">
                  <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary">
                    <MapPin className="h-5 w-5" />
                  </div>
                  <div className="min-w-0">
                    <p className="truncate font-semibold text-foreground">{trip.name}</p>
                    <p className="flex items-center gap-1.5 text-sm text-muted-foreground">
                      <CalendarDays className="h-3.5 w-3.5" />
                      {formatDate(trip.startDate)} - {formatDate(trip.endDate)}
                    </p>
                  </div>
                </Link>
                <div className="flex shrink-0 items-center gap-1">
                  <button
                    onClick={() => setEditTrip(trip)}
                    aria-label="Editar viaje"
                    className="flex h-9 w-9 items-center justify-center rounded-lg text-muted-foreground transition hover:bg-secondary hover:text-foreground"
                  >
                    <Pencil className="h-4 w-4" />
                  </button>
                  <button
                    onClick={() => setDeleteTarget(trip)}
                    aria-label="Eliminar viaje"
                    className="flex h-9 w-9 items-center justify-center rounded-lg text-muted-foreground transition hover:bg-destructive/10 hover:text-destructive"
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
