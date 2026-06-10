"use client"

import { createCategory, deleteCategory, updateCategory } from "@/app/actions/data"
import type { Category } from "@/lib/db/schema"
import { formatMoney } from "@/lib/format"
import { CATEGORY_ICONS, ICON_OPTIONS, getCategoryIcon } from "@/lib/category-icons"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { MoneyInput } from "@/components/ui/money-input"
import { ConfirmDialog } from "@/components/confirm-dialog"
import { useState, useTransition } from "react"
import { Check, Loader2, Pencil, Plus, Trash2, X } from "lucide-react"

type Draft = { name: string; budget: string; icon: string }

const emptyDraft: Draft = { name: "", budget: "", icon: "tag" }

export function CategoriesDialog({
  open,
  onOpenChange,
  tripId,
  categories,
  currency,
}: {
  open: boolean
  onOpenChange: (open: boolean) => void
  tripId: number
  categories: Category[]
  currency: string
}) {
  const [pending, startTransition] = useTransition()
  const [adding, setAdding] = useState(false)
  const [draft, setDraft] = useState<Draft>(emptyDraft)
  const [editingId, setEditingId] = useState<number | null>(null)
  const [editDraft, setEditDraft] = useState<Draft>(emptyDraft)
  const [deleteTarget, setDeleteTarget] = useState<Category | null>(null)

  function resetAdd() {
    setAdding(false)
    setDraft(emptyDraft)
  }

  function handleCreate() {
    if (!draft.name.trim()) return
    const fd = new FormData()
    fd.set("tripId", String(tripId))
    fd.set("name", draft.name)
    fd.set("budget", draft.budget || "0")
    fd.set("icon", draft.icon)
    startTransition(async () => {
      await createCategory(fd)
      resetAdd()
    })
  }

  function startEdit(c: Category) {
    setEditingId(c.id)
    setEditDraft({ name: c.name, budget: String(Number(c.budget)), icon: c.icon })
  }

  function handleUpdate() {
    if (editingId == null || !editDraft.name.trim()) return
    const fd = new FormData()
    fd.set("id", String(editingId))
    fd.set("tripId", String(tripId))
    fd.set("name", editDraft.name)
    fd.set("budget", editDraft.budget || "0")
    fd.set("icon", editDraft.icon)
    startTransition(async () => {
      await updateCategory(fd)
      setEditingId(null)
    })
  }

  function handleDelete() {
    if (!deleteTarget) return
    const fd = new FormData()
    fd.set("id", String(deleteTarget.id))
    fd.set("tripId", String(tripId))
    startTransition(async () => {
      await deleteCategory(fd)
      setDeleteTarget(null)
    })
  }

  return (
    <>
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="max-h-[85vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Gestionar categorías</DialogTitle>
            <DialogDescription>Crea categorías con su presupuesto para este viaje.</DialogDescription>
          </DialogHeader>

          <div className="flex flex-col gap-3">
            {categories.length === 0 && !adding ? (
              <p className="py-4 text-center text-sm text-muted-foreground">Aún no hay categorías.</p>
            ) : null}

            {categories.map((c) => {
              const Icon = getCategoryIcon(c.icon)
              const isEditing = editingId === c.id
              return (
                <div key={c.id} className="rounded-xl border border-border p-3">
                  {isEditing ? (
                    <div className="flex flex-col gap-3">
                      <IconPicker
                        value={editDraft.icon}
                        onChange={(icon) => setEditDraft((d) => ({ ...d, icon }))}
                      />
                      <Input
                        value={editDraft.name}
                        onChange={(e) => setEditDraft((d) => ({ ...d, name: e.target.value }))}
                        placeholder="Nombre"
                      />
                      <MoneyInput
                        value={editDraft.budget}
                        onChange={(raw) => setEditDraft((d) => ({ ...d, budget: raw }))}
                        placeholder="Presupuesto"
                      />
                      <div className="flex justify-end gap-2">
                        <button
                          onClick={() => setEditingId(null)}
                          className="flex h-9 items-center gap-1.5 rounded-lg border border-border px-3 text-sm font-medium text-foreground transition hover:bg-secondary"
                        >
                          <X className="h-4 w-4" /> Cancelar
                        </button>
                        <button
                          onClick={handleUpdate}
                          disabled={pending}
                          className="flex h-9 items-center gap-1.5 rounded-lg bg-primary px-3 text-sm font-medium text-primary-foreground transition hover:opacity-95 disabled:opacity-50"
                        >
                          {pending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Check className="h-4 w-4" />}
                          Guardar
                        </button>
                      </div>
                    </div>
                  ) : (
                    <div className="flex items-center justify-between gap-3">
                      <div className="flex min-w-0 items-center gap-3">
                        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary">
                          <Icon className="h-4 w-4" />
                        </div>
                        <div className="min-w-0">
                          <p className="truncate font-medium text-foreground">{c.name}</p>
                          <p className="text-xs text-muted-foreground">{formatMoney(Number(c.budget), currency)}</p>
                        </div>
                      </div>
                      <div className="flex shrink-0 items-center gap-1">
                        <button
                          onClick={() => startEdit(c)}
                          aria-label="Editar categoría"
                          className="flex h-8 w-8 items-center justify-center rounded-lg text-muted-foreground transition hover:bg-secondary hover:text-foreground"
                        >
                          <Pencil className="h-4 w-4" />
                        </button>
                        <button
                          onClick={() => setDeleteTarget(c)}
                          aria-label="Eliminar categoría"
                          className="flex h-8 w-8 items-center justify-center rounded-lg text-muted-foreground transition hover:bg-destructive/10 hover:text-destructive"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              )
            })}

            {adding ? (
              <div className="flex flex-col gap-3 rounded-xl border border-primary/40 bg-primary/5 p-3">
                <IconPicker value={draft.icon} onChange={(icon) => setDraft((d) => ({ ...d, icon }))} />
                <div className="flex flex-col gap-2">
                  <Label htmlFor="new-cat-name">Nombre</Label>
                  <Input
                    id="new-cat-name"
                    value={draft.name}
                    onChange={(e) => setDraft((d) => ({ ...d, name: e.target.value }))}
                    placeholder="Ej: Comida"
                    autoFocus
                  />
                </div>
                <div className="flex flex-col gap-2">
                  <Label htmlFor="new-cat-budget">Presupuesto</Label>
                  <MoneyInput
                    id="new-cat-budget"
                    value={draft.budget}
                    onChange={(raw) => setDraft((d) => ({ ...d, budget: raw }))}
                    placeholder="0"
                  />
                </div>
                <div className="flex justify-end gap-2">
                  <button
                    onClick={resetAdd}
                    className="flex h-9 items-center gap-1.5 rounded-lg border border-border px-3 text-sm font-medium text-foreground transition hover:bg-secondary"
                  >
                    <X className="h-4 w-4" /> Cancelar
                  </button>
                  <button
                    onClick={handleCreate}
                    disabled={pending}
                    className="flex h-9 items-center gap-1.5 rounded-lg bg-primary px-3 text-sm font-medium text-primary-foreground transition hover:opacity-95 disabled:opacity-50"
                  >
                    {pending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Check className="h-4 w-4" />}
                    Agregar
                  </button>
                </div>
              </div>
            ) : (
              <button
                onClick={() => setAdding(true)}
                className="flex h-11 items-center justify-center gap-2 rounded-xl border border-dashed border-border font-medium text-foreground transition hover:bg-secondary"
              >
                <Plus className="h-4 w-4" />
                Nueva categoría
              </button>
            )}
          </div>
        </DialogContent>
      </Dialog>

      <ConfirmDialog
        open={Boolean(deleteTarget)}
        onOpenChange={(o) => !o && setDeleteTarget(null)}
        title="Eliminar categoría"
        description={`Se eliminará "${deleteTarget?.name}". Los gastos asociados quedarán sin categoría.`}
        confirmLabel="Eliminar"
        pending={pending}
        onConfirm={handleDelete}
      />
    </>
  )
}

function IconPicker({ value, onChange }: { value: string; onChange: (icon: string) => void }) {
  return (
    <div className="flex flex-wrap gap-2">
      {ICON_OPTIONS.map((key) => {
        const Icon = CATEGORY_ICONS[key]
        const active = key === value
        return (
          <button
            key={key}
            type="button"
            onClick={() => onChange(key)}
            aria-label={`Icono ${key}`}
            aria-pressed={active}
            className={`flex h-9 w-9 items-center justify-center rounded-lg border transition ${
              active
                ? "border-primary bg-primary text-primary-foreground"
                : "border-border bg-card text-muted-foreground hover:bg-secondary"
            }`}
          >
            <Icon className="h-4 w-4" />
          </button>
        )
      })}
    </div>
  )
}
