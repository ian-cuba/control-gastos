"use client"

import type { Category, Expense, Trip } from "@/lib/db/schema"
import { formatDate, formatMoney } from "@/lib/format"
import { getCategoryIcon } from "@/lib/category-icons"
import { Card } from "@/components/ui/card"
import { ExpenseDialog } from "@/components/expense-dialog"
import { CategoriesDialog } from "@/components/categories-dialog"
import { HistoryDialog } from "@/components/history-dialog"
import { LogoutButton } from "@/components/logout-button"
import { ThemeToggle } from "@/components/theme-toggle"
import Link from "next/link"
import { useMemo, useState } from "react"
import {
  ArrowLeft,
  CalendarDays,
  MapPin,
  Plus,
  TrendingDown,
  Wallet,
  PieChart as PieChartIcon,
  DollarSign,
} from "lucide-react"

export function TripDashboard({
  trip,
  categories,
  expenses,
}: {
  trip: Trip
  categories: Category[]
  expenses: Expense[]
}) {
  const [expenseOpen, setExpenseOpen] = useState(false)
  const [categoriesOpen, setCategoriesOpen] = useState(false)
  const [historyOpen, setHistoryOpen] = useState(false)

  const { totalBudget, spent, byCategory } = useMemo(() => {
    const totalBudget = categories.reduce((sum, c) => sum + Number(c.budget), 0)
    const spent = expenses.reduce((sum, e) => sum + Number(e.amount), 0)
    const byCategory = categories.map((c) => {
      const catSpent = expenses
        .filter((e) => e.categoryId === c.id)
        .reduce((sum, e) => sum + Number(e.amount), 0)
      const budget = Number(c.budget)
      return {
        category: c,
        spent: catSpent,
        budget,
        remaining: budget - catSpent,
        pct: budget > 0 ? Math.min((catSpent / budget) * 100, 100) : 0,
        over: catSpent > budget && budget > 0,
      }
    })
    return { totalBudget, spent, byCategory }
  }, [categories, expenses])

  const remaining = totalBudget - spent
  const pctSpent = totalBudget > 0 ? (spent / totalBudget) * 100 : 0

  return (
    <main className="mx-auto min-h-screen w-full max-w-3xl px-3 pb-[max(5rem,env(safe-area-inset-bottom))] sm:px-4">
      <header className="flex items-center justify-between gap-2 py-4 sm:gap-3 sm:py-5">
        <Link
          href="/"
          className="flex items-center gap-1.5 rounded-lg px-2 py-1.5 text-sm font-medium text-muted-foreground transition hover:text-foreground"
        >
          <ArrowLeft className="h-4 w-4" />
          Viajes
        </Link>
        <div className="flex items-center gap-2">
          <ThemeToggle />
          <LogoutButton />
        </div>
      </header>

      {/* Trip summary card */}
      <Card className="mb-3 p-4 sm:mb-4 sm:p-5">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between sm:gap-4">
          <div className="flex min-w-0 items-start gap-3">
            <MapPin className="mt-0.5 h-5 w-5 shrink-0 text-primary" />
            <div className="min-w-0">
              <h1 className="text-base font-bold leading-snug tracking-tight text-foreground sm:text-xl text-balance">
                {trip.name}
              </h1>
              <p className="mt-1.5 flex flex-wrap items-center gap-x-1.5 gap-y-0.5 text-xs text-muted-foreground sm:text-sm">
                <CalendarDays className="h-3.5 w-3.5 shrink-0" />
                <span className="whitespace-nowrap">{formatDate(trip.startDate)}</span>
                <span aria-hidden>—</span>
                <span className="whitespace-nowrap">{formatDate(trip.endDate)}</span>
              </p>
            </div>
          </div>
          <div className="flex items-center justify-between gap-3 border-t border-border pt-3 sm:block sm:shrink-0 sm:border-0 sm:pt-0 sm:text-right">
            <p className="text-xs text-muted-foreground">Presupuesto</p>
            <p className="text-lg font-bold text-primary sm:text-2xl">{formatMoney(totalBudget, trip.currency)}</p>
          </div>
        </div>
      </Card>

      {/* Metrics — 2+1 en mobile, 3 columnas en tablet+ */}
      <div className="mb-3 grid grid-cols-2 gap-2 sm:mb-4 sm:grid-cols-3 sm:gap-3">
        <Card className="flex flex-col items-center justify-center p-3 text-center sm:flex-row sm:items-center sm:justify-between sm:p-5 sm:text-left">
          <div className="min-w-0">
            <p className="text-xs text-muted-foreground sm:text-sm">Gastado</p>
            <p className="text-base font-bold text-destructive sm:text-2xl">{formatMoney(spent, trip.currency)}</p>
          </div>
          <TrendingDown className="hidden h-6 w-6 shrink-0 text-destructive sm:block" />
        </Card>

        <Card className="flex flex-col items-center justify-center p-3 text-center sm:flex-row sm:items-center sm:justify-between sm:p-5 sm:text-left">
          <div className="min-w-0">
            <p className="text-xs text-muted-foreground sm:text-sm">Restante</p>
            <p className={`text-base font-bold sm:text-2xl ${remaining < 0 ? "text-destructive" : "text-chart-3"}`}>
              {formatMoney(remaining, trip.currency)}
            </p>
          </div>
          <Wallet className={`hidden h-6 w-6 shrink-0 sm:block ${remaining < 0 ? "text-destructive" : "text-chart-3"}`} />
        </Card>

        <Card className="col-span-2 p-3 sm:col-span-1 sm:p-5">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs text-muted-foreground sm:text-sm">% Gastado</p>
              <p className="text-base font-bold text-foreground sm:text-2xl">{pctSpent.toFixed(1)}%</p>
            </div>
            <PieChartIcon className="hidden h-6 w-6 shrink-0 text-primary sm:block" />
          </div>
          <div className="mt-2 h-2 w-full overflow-hidden rounded-full bg-secondary sm:mt-3">
            <div
              className="h-full rounded-full bg-gradient-to-r from-primary to-accent transition-all"
              style={{ width: `${Math.min(pctSpent, 100)}%` }}
            />
          </div>
        </Card>
      </div>

      {/* Actions */}
      <div className="mb-5 grid gap-2 sm:mb-6 sm:grid-cols-3 sm:gap-3">
        <button
          onClick={() => setExpenseOpen(true)}
          className="flex h-12 items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-primary to-accent text-sm font-semibold text-primary-foreground shadow-sm transition hover:opacity-95 sm:text-base"
        >
          <Plus className="h-5 w-5" />
          Agregar Gasto
        </button>
        <div className="grid grid-cols-2 gap-2 sm:contents">
          <button
            onClick={() => setCategoriesOpen(true)}
            className="flex h-11 items-center justify-center gap-2 rounded-xl border border-border bg-card text-sm font-medium text-foreground transition hover:bg-secondary sm:h-12"
          >
            <DollarSign className="h-4 w-4 sm:h-5 sm:w-5" />
            Categorías
          </button>
          <button
            onClick={() => setHistoryOpen(true)}
            className="flex h-11 items-center justify-center gap-2 rounded-xl border border-border bg-card text-sm font-medium text-foreground transition hover:bg-secondary sm:h-12"
          >
            <CalendarDays className="h-4 w-4 sm:h-5 sm:w-5" />
            Historial
          </button>
        </div>
      </div>

      {/* Category status */}
      <Card className="p-5">
        <h2 className="mb-4 text-lg font-bold text-foreground">Estado por Categorías</h2>
        {byCategory.length === 0 ? (
          <p className="py-6 text-center text-sm text-muted-foreground">
            No hay categorías. Crea una desde &quot;Gestionar Categorías&quot;.
          </p>
        ) : (
          <div className="flex flex-col gap-5">
            {byCategory.map(({ category, spent, budget, remaining, pct, over }) => {
              const Icon = getCategoryIcon(category.icon)
              return (
                <div key={category.id} className="flex flex-col gap-2">
                  <div className="flex items-center justify-between gap-3">
                    <div className="flex min-w-0 items-center gap-3">
                      <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary">
                        <Icon className="h-4 w-4" />
                      </div>
                      <div className="min-w-0">
                        <p className="truncate font-semibold text-foreground">{category.name}</p>
                        <p className="text-xs text-muted-foreground">
                          {formatMoney(spent, trip.currency)} de {formatMoney(budget, trip.currency)}
                        </p>
                      </div>
                    </div>
                    <div className="shrink-0 text-right">
                      <span
                        className={`inline-block rounded-full px-2.5 py-1 text-xs font-semibold text-white ${
                          over ? "bg-destructive" : "bg-primary"
                        }`}
                      >
                        {formatMoney(remaining, trip.currency)}
                      </span>
                      <p className="mt-0.5 text-xs text-muted-foreground">{over ? "excedido" : "restante"}</p>
                    </div>
                  </div>
                  <div className="h-1.5 w-full overflow-hidden rounded-full bg-secondary">
                    <div
                      className={`h-full rounded-full transition-all ${over ? "bg-destructive" : "bg-gradient-to-r from-primary to-accent"}`}
                      style={{ width: `${pct}%` }}
                    />
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </Card>

      <ExpenseDialog
        open={expenseOpen}
        onOpenChange={setExpenseOpen}
        tripId={trip.id}
        categories={categories}
      />
      <CategoriesDialog
        open={categoriesOpen}
        onOpenChange={setCategoriesOpen}
        tripId={trip.id}
        categories={categories}
        currency={trip.currency}
      />
      <HistoryDialog
        open={historyOpen}
        onOpenChange={setHistoryOpen}
        tripId={trip.id}
        categories={categories}
        expenses={expenses}
        currency={trip.currency}
      />
    </main>
  )
}
