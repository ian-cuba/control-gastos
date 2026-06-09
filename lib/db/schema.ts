import { date, integer, numeric, pgTable, serial, text, timestamp } from "drizzle-orm/pg-core"

export const trips = pgTable("trips", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  startDate: date("start_date").notNull(),
  endDate: date("end_date").notNull(),
  currency: text("currency").notNull().default("ARS"),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
})

export const categories = pgTable("categories", {
  id: serial("id").primaryKey(),
  tripId: integer("trip_id").notNull(),
  name: text("name").notNull(),
  budget: numeric("budget", { precision: 14, scale: 2 }).notNull().default("0"),
  icon: text("icon").notNull().default("tag"),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
})

export const expenses = pgTable("expenses", {
  id: serial("id").primaryKey(),
  tripId: integer("trip_id").notNull(),
  categoryId: integer("category_id"),
  amount: numeric("amount", { precision: 14, scale: 2 }).notNull(),
  description: text("description").notNull().default(""),
  expenseDate: date("expense_date").notNull(),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
})

export type Trip = typeof trips.$inferSelect
export type Category = typeof categories.$inferSelect
export type Expense = typeof expenses.$inferSelect
