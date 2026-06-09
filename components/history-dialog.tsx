"use client"

import { deleteExpense, updateExpense } from "@/app/actions/data"
import type { Category, Expense } from "@/lib/db/schema"
import { formatDate, formatMoney } from "@/lib/format"
import { getCategoryIcon } from "@/lib/category-icons"
import {
  Dialog,
  DialogContent,
  DialogDescription,
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
import { ConfirmDialog } from "@/components/confirm-dialog"
import { useMemo, useState, useTransition } from "react"
import { Check, Loader2, Pencil, Tag, Trash2, X } from "lucide-react"

const NO_CATEGORY = "none"

export function HistoryDialog({
  open,
  onOpenChange,
  tripId,
  categories,
  expenses,
  currency,
}: {
  open: boolean
  onOpenChange: (open: boolean) => void
  tripId: number
  categories: Category[]
  expenses: Expense[]
  currency: string
}) {
  const [pending, startTransition] = useTransition()
  const [editingId, setEditingId] = useState<number | null>(null)
  const [edit, setEdit] = useState({ amount: "", description: "", categoryId: NO_CATEGORY, expenseDate: "" })
  const [deleteTarget, setDeleteTarget] = useState<Expense | null>(null)

  const catMap = useMemo(() => new Map(categories.map((c) => [c.id, c])), [categories])

  function startEdit(e: Expense) {
    setEditingId(e.id)
    setEdit({
      amount: String(Number(e.amount)),
      description: e.description,
      categoryId: e.categoryId ? String(e.categoryId) : NO_CATEGORY,
      expenseDate: e.expenseDate,
    })
  }

  function handleUpdate() {
    if (editingId == null) return
    const fd = new FormData()
    fd.set("id", String(editingId))
    fd.set("tripId", String(tripId))
    fd.set("amount", edit.amount || "0")
    fd.set("description", edit.description)
    fd.set("categoryId", edit.categoryId === NO_CATEGORY ? "" : edit.categoryId)
    fd.set("expenseDate", edit.expenseDate)
    startTransition(async () => {
      await updateExpense(fd)
      setEditingId(null)
    })
  }

  function handleDelete() {
    if (!deleteTarget) return
    const fd = new FormData()
    fd.set("id", String(deleteTarget.id))
    fd.set("tripId", String(tripId))
    startTransition(async () => {
      await deleteExpense(fd)
      setDeleteTarget(null)
    })
  }

  return (
    <>
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="max-h-[85vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Historial de gastos</DialogTitle>
            <DialogDescription>
              {expenses.length} {expenses.length === 1 ? "gasto registrado" : "gastos registrados"}.
            </DialogDescription>
          </DialogHeader>

          {expenses.length === 0 ? (
            <p className="py-6 text-center text-sm text-muted-foreground">Todavía no registraste gastos.</p>
          ) : (
            <div className="flex flex-col gap-2">
              {expenses.map((e) => {
                const cat = e.categoryId ? catMap.get(e.categoryId) : null
                const Icon = cat ? getCategoryIcon(cat.icon) : Tag
                const isEditing = editingId === e.id
                return (
                  <div key={e.id} className="rounded-xl border border-border p-3">
                    {isEditing ? (
                      <div className="flex flex-col gap-3">
                        <div className="flex flex-col gap-2">
                          <Label htmlFor={`amt-${e.id}`}>Monto</Label>
                          <Input
                            id={`amt-${e.id}`}
                            type="number"
                            min="0"
                            step="0.01"
                            value={edit.amount}
                            onChange={(ev) => setEdit((d) => ({ ...d, amount: ev.target.value }))}
                          />
                        </div>
                        <div className="flex flex-col gap-2">
                          <Label htmlFor={`desc-${e.id}`}>Descripción</Label>
                          <Input
                            id={`desc-${e.id}`}
                            value={edit.description}
                            onChange={(ev) => setEdit((d) => ({ ...d, description: ev.target.value }))}
                          />
                        </div>
                        <div className="flex flex-col gap-2">
                          <Label>Categoría</Label>
                          <Select
                            value={edit.categoryId}
                            onValueChange={(v) => setEdit((d) => ({ ...d, categoryId: v ?? NO_CATEGORY }))}
                          >
                            <SelectTrigger>
                              <SelectValue />
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
                          <Label htmlFor={`date-${e.id}`}>Fecha</Label>
                          <Input
                            id={`date-${e.id}`}
                            type="date"
                            value={edit.expenseDate}
                            onChange={(ev) => setEdit((d) => ({ ...d, expenseDate: ev.target.value }))}
                          />
                        </div>
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
                            <p className="truncate font-medium text-foreground">
                              {e.description || cat?.name || "Gasto"}
                            </p>
                            <p className="text-xs text-muted-foreground">
                              {formatDate(e.expenseDate)}
                              {cat ? ` · ${cat.name}` : ""}
                            </p>
                          </div>
                        </div>
                        <div className="flex shrink-0 items-center gap-2">
                          <span className="font-semibold text-foreground">{formatMoney(Number(e.amount), currency)}</span>
                          <button
                            onClick={() => startEdit(e)}
                            aria-label="Editar gasto"
                            className="flex h-8 w-8 items-center justify-center rounded-lg text-muted-foreground transition hover:bg-secondary hover:text-foreground"
                          >
                            <Pencil className="h-4 w-4" />
                          </button>
                          <button
                            onClick={() => setDeleteTarget(e)}
                            aria-label="Eliminar gasto"
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
            </div>
          )}
        </DialogContent>
      </Dialog>

      <ConfirmDialog
        open={Boolean(deleteTarget)}
        onOpenChange={(o) => !o && setDeleteTarget(null)}
        title="Eliminar gasto"
        description="Se eliminará este gasto de forma permanente."
        confirmLabel="Eliminar"
        pending={pending}
        onConfirm={handleDelete}
      />
    </>
  )
}
