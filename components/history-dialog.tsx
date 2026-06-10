"use client"

import { deleteExpense, updateExpense } from "@/app/actions/data"
import type { Category, Expense } from "@/lib/db/schema"
import { formatDate, formatMoney } from "@/lib/format"
import { getCategoryIcon } from "@/lib/category-icons"
import {
  Dialog,
  DialogContent,
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
import { ConfirmDialog } from "@/components/confirm-dialog"
import { useMemo, useState, useTransition } from "react"
import { Check, Loader2, Pencil, Tag, Trash2, X } from "lucide-react"

const NO_CATEGORY = "none"
const ALL = "all"

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
  const [filterCat, setFilterCat] = useState<string>(ALL)

  const catMap = useMemo(() => new Map(categories.map((c) => [c.id, c])), [categories])

  const filtered = useMemo(() => {
    if (filterCat === ALL) return expenses
    const id = Number(filterCat)
    return expenses.filter((e) => e.categoryId === id)
  }, [expenses, filterCat])

  const summary = useMemo(() => {
    const total = filtered.reduce((s, e) => s + Number(e.amount), 0)
    const avg = filtered.length > 0 ? total / filtered.length : 0
    return { total, avg, count: filtered.length }
  }, [filtered])

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
        <DialogContent className="flex max-h-[90vh] max-w-[calc(100%-1rem)] flex-col gap-0 overflow-hidden p-0 sm:max-w-lg">
          {/* Header fijo */}
          <DialogHeader className="shrink-0 border-b border-border px-4 py-3.5 sm:px-5 sm:py-4">
            <DialogTitle className="text-base">Historial de gastos</DialogTitle>
          </DialogHeader>

          {/* Contenido scrollable */}
          <div className="flex flex-col gap-4 overflow-y-auto px-4 py-4 sm:px-5">

            {/* Resumen */}
            <div className="grid grid-cols-3 gap-1.5 rounded-xl bg-secondary/60 p-3 sm:gap-2 sm:p-4">
              <div className="flex min-w-0 flex-col items-center gap-0.5 px-1">
                <p className="text-[10px] text-muted-foreground sm:text-[11px]">Total</p>
                <p className="w-full truncate text-center text-xs font-bold text-foreground sm:text-base">{formatMoney(summary.total, currency)}</p>
              </div>
              <div className="flex min-w-0 flex-col items-center gap-0.5 border-x border-border px-1">
                <p className="text-[10px] text-muted-foreground sm:text-[11px]">Gastos</p>
                <p className="text-xs font-bold text-foreground sm:text-base">{summary.count}</p>
              </div>
              <div className="flex min-w-0 flex-col items-center gap-0.5 px-1">
                <p className="text-[10px] text-muted-foreground sm:text-[11px]">Promedio</p>
                <p className="w-full truncate text-center text-xs font-bold text-foreground sm:text-base">{formatMoney(summary.avg, currency)}</p>
              </div>
            </div>

            {/* Filtro por categoría */}
            {categories.length > 0 && (
              <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-none">
                <button
                  onClick={() => setFilterCat(ALL)}
                  className={`shrink-0 rounded-full px-3 py-1.5 text-xs font-medium transition ${
                    filterCat === ALL
                      ? "bg-primary text-primary-foreground"
                      : "bg-secondary text-muted-foreground hover:text-foreground"
                  }`}
                >
                  Todos
                </button>
                {categories.map((c) => {
                  const Icon = getCategoryIcon(c.icon)
                  return (
                    <button
                      key={c.id}
                      onClick={() => setFilterCat(String(c.id))}
                      className={`flex shrink-0 items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-medium transition ${
                        filterCat === String(c.id)
                          ? "bg-primary text-primary-foreground"
                          : "bg-secondary text-muted-foreground hover:text-foreground"
                      }`}
                    >
                      <Icon className="h-3 w-3" />
                      {c.name}
                    </button>
                  )
                })}
              </div>
            )}

            {/* Lista */}
            <div className="flex flex-col gap-1">
              <div className="flex items-center justify-between">
                <p className="text-sm font-semibold text-foreground">
                  {filterCat === ALL
                    ? "Todos los gastos"
                    : (catMap.get(Number(filterCat))?.name ?? "Gastos")}
                </p>
                <span className="rounded-full bg-secondary px-2 py-0.5 text-xs text-muted-foreground">
                  {filtered.length} {filtered.length === 1 ? "gasto" : "gastos"}
                </span>
              </div>

              {filtered.length === 0 ? (
                <p className="py-8 text-center text-sm text-muted-foreground">Sin gastos en esta categoría.</p>
              ) : (
                <div className="mt-2 flex flex-col divide-y divide-border overflow-hidden rounded-xl border border-border">
                  {filtered.map((e) => {
                    const cat = e.categoryId ? catMap.get(e.categoryId) : null
                    const Icon = cat ? getCategoryIcon(cat.icon) : Tag
                    const isEditing = editingId === e.id
                    return (
                      <div key={e.id} className="bg-card">
                        {isEditing ? (
                          <div className="flex flex-col gap-3 p-4">
                            <div className="flex flex-col gap-2">
                              <Label htmlFor={`amt-${e.id}`}>Monto</Label>
                              <MoneyInput
                                id={`amt-${e.id}`}
                                value={edit.amount}
                                onChange={(raw) => setEdit((d) => ({ ...d, amount: raw }))}
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
                                <SelectTrigger className="w-full">
                                  <span className={`flex flex-1 text-left text-sm ${edit.categoryId === NO_CATEGORY ? "text-muted-foreground" : ""}`}>
                                    {edit.categoryId === NO_CATEGORY
                                      ? "Sin categoría"
                                      : (catMap.get(Number(edit.categoryId))?.name ?? "Sin categoría")}
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
                          <div className="flex items-start gap-3 px-3 py-3 sm:items-center sm:px-4">
                            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary sm:mt-0">
                              <Icon className="h-4 w-4" />
                            </div>
                            <div className="min-w-0 flex-1">
                              {/* Fila 1: nombre + acciones (mobile) / nombre solo (desktop) */}
                              <div className="flex items-center justify-between gap-2">
                                <p className="min-w-0 flex-1 text-sm font-medium leading-snug text-foreground">
                                  {e.description || cat?.name || "Gasto"}
                                </p>
                                <div className="flex shrink-0 items-center gap-0.5 sm:hidden">
                                  <button
                                    onClick={() => startEdit(e)}
                                    aria-label="Editar gasto"
                                    className="flex h-9 w-9 items-center justify-center rounded-lg text-muted-foreground transition hover:bg-secondary hover:text-foreground"
                                  >
                                    <Pencil className="h-4 w-4" />
                                  </button>
                                  <button
                                    onClick={() => setDeleteTarget(e)}
                                    aria-label="Eliminar gasto"
                                    className="flex h-9 w-9 items-center justify-center rounded-lg text-muted-foreground transition hover:bg-destructive/10 hover:text-destructive"
                                  >
                                    <Trash2 className="h-4 w-4" />
                                  </button>
                                </div>
                              </div>
                              {/* Fila 2: monto + fecha/categoría (mobile) */}
                              <div className="mt-1 flex items-center justify-between gap-2 sm:mt-0.5">
                                <span className="shrink-0 text-sm font-semibold text-foreground sm:hidden">
                                  {formatMoney(Number(e.amount), currency)}
                                </span>
                                <p className="text-right text-xs text-muted-foreground sm:text-left">
                                  {formatDate(e.expenseDate)}
                                  {cat ? ` · ${cat.name}` : ""}
                                </p>
                              </div>
                            </div>
                            {/* Desktop: monto + acciones */}
                            <div className="hidden shrink-0 items-center gap-1 sm:flex">
                              <span className="mr-1 text-sm font-semibold text-foreground">
                                {formatMoney(Number(e.amount), currency)}
                              </span>
                              <button
                                onClick={() => startEdit(e)}
                                aria-label="Editar gasto"
                                className="flex h-8 w-8 items-center justify-center rounded-lg text-muted-foreground transition hover:bg-secondary hover:text-foreground"
                              >
                                <Pencil className="h-3.5 w-3.5" />
                              </button>
                              <button
                                onClick={() => setDeleteTarget(e)}
                                aria-label="Eliminar gasto"
                                className="flex h-8 w-8 items-center justify-center rounded-lg text-muted-foreground transition hover:bg-destructive/10 hover:text-destructive"
                              >
                                <Trash2 className="h-3.5 w-3.5" />
                              </button>
                            </div>
                          </div>
                        )}
                      </div>
                    )
                  })}
                </div>
              )}
            </div>
          </div>
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
