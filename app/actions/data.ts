"use server"

import { db } from "@/lib/db"
import { categories, expenses, trips } from "@/lib/db/schema"
import { isAuthenticated } from "@/lib/session"
import { and, asc, desc, eq } from "drizzle-orm"
import { revalidatePath } from "next/cache"
import { redirect } from "next/navigation"

async function requireAuth() {
  if (!(await isAuthenticated())) redirect("/login")
}

// ---------- Trips ----------

export async function getTrips() {
  await requireAuth()
  return db.select().from(trips).orderBy(desc(trips.createdAt))
}

export async function getTrip(id: number) {
  await requireAuth()
  const rows = await db.select().from(trips).where(eq(trips.id, id)).limit(1)
  return rows[0] ?? null
}

export async function createTrip(formData: FormData) {
  await requireAuth()
  const name = String(formData.get("name") || "").trim()
  const startDate = String(formData.get("startDate") || "")
  const endDate = String(formData.get("endDate") || "")
  const currency = String(formData.get("currency") || "ARS")
  if (!name || !startDate || !endDate) return
  await db.insert(trips).values({ name, startDate, endDate, currency })
  revalidatePath("/")
}

export async function updateTrip(formData: FormData) {
  await requireAuth()
  const id = Number(formData.get("id"))
  const name = String(formData.get("name") || "").trim()
  const startDate = String(formData.get("startDate") || "")
  const endDate = String(formData.get("endDate") || "")
  const currency = String(formData.get("currency") || "ARS")
  if (!id || !name) return
  await db.update(trips).set({ name, startDate, endDate, currency }).where(eq(trips.id, id))
  revalidatePath("/")
  revalidatePath(`/trips/${id}`)
}

export async function deleteTrip(formData: FormData) {
  await requireAuth()
  const id = Number(formData.get("id"))
  if (!id) return
  await db.delete(expenses).where(eq(expenses.tripId, id))
  await db.delete(categories).where(eq(categories.tripId, id))
  await db.delete(trips).where(eq(trips.id, id))
  revalidatePath("/")
}

// ---------- Categories ----------

export async function getCategories(tripId: number) {
  await requireAuth()
  return db.select().from(categories).where(eq(categories.tripId, tripId)).orderBy(asc(categories.createdAt))
}

export async function createCategory(formData: FormData) {
  await requireAuth()
  const tripId = Number(formData.get("tripId"))
  const name = String(formData.get("name") || "").trim()
  const budget = String(formData.get("budget") || "0")
  const icon = String(formData.get("icon") || "tag")
  if (!tripId || !name) return
  await db.insert(categories).values({ tripId, name, budget, icon })
  revalidatePath(`/trips/${tripId}`)
}

export async function updateCategory(formData: FormData) {
  await requireAuth()
  const id = Number(formData.get("id"))
  const tripId = Number(formData.get("tripId"))
  const name = String(formData.get("name") || "").trim()
  const budget = String(formData.get("budget") || "0")
  const icon = String(formData.get("icon") || "tag")
  if (!id || !name) return
  await db.update(categories).set({ name, budget, icon }).where(eq(categories.id, id))
  revalidatePath(`/trips/${tripId}`)
}

export async function deleteCategory(formData: FormData) {
  await requireAuth()
  const id = Number(formData.get("id"))
  const tripId = Number(formData.get("tripId"))
  if (!id) return
  await db.update(expenses).set({ categoryId: null }).where(eq(expenses.categoryId, id))
  await db.delete(categories).where(eq(categories.id, id))
  revalidatePath(`/trips/${tripId}`)
}

// ---------- Expenses ----------

export async function getExpenses(tripId: number) {
  await requireAuth()
  return db.select().from(expenses).where(eq(expenses.tripId, tripId)).orderBy(desc(expenses.expenseDate), desc(expenses.id))
}

export async function createExpense(formData: FormData) {
  await requireAuth()
  const tripId = Number(formData.get("tripId"))
  const amount = String(formData.get("amount") || "0")
  const description = String(formData.get("description") || "").trim()
  const categoryIdRaw = formData.get("categoryId")
  const categoryId = categoryIdRaw && String(categoryIdRaw) !== "" ? Number(categoryIdRaw) : null
  const expenseDate = String(formData.get("expenseDate") || new Date().toISOString().slice(0, 10))
  if (!tripId || !amount || Number(amount) <= 0) return
  await db.insert(expenses).values({ tripId, amount, description, categoryId, expenseDate })
  revalidatePath(`/trips/${tripId}`)
}

export async function updateExpense(formData: FormData) {
  await requireAuth()
  const id = Number(formData.get("id"))
  const tripId = Number(formData.get("tripId"))
  const amount = String(formData.get("amount") || "0")
  const description = String(formData.get("description") || "").trim()
  const categoryIdRaw = formData.get("categoryId")
  const categoryId = categoryIdRaw && String(categoryIdRaw) !== "" ? Number(categoryIdRaw) : null
  const expenseDate = String(formData.get("expenseDate") || "")
  if (!id || Number(amount) <= 0) return
  await db.update(expenses).set({ amount, description, categoryId, expenseDate }).where(and(eq(expenses.id, id), eq(expenses.tripId, tripId)))
  revalidatePath(`/trips/${tripId}`)
}

export async function deleteExpense(formData: FormData) {
  await requireAuth()
  const id = Number(formData.get("id"))
  const tripId = Number(formData.get("tripId"))
  if (!id) return
  await db.delete(expenses).where(eq(expenses.id, id))
  revalidatePath(`/trips/${tripId}`)
}
