import { getCategories, getExpenses, getTrip } from "@/app/actions/data"
import { isAuthenticated } from "@/lib/session"
import { notFound, redirect } from "next/navigation"
import { TripDashboard } from "@/components/trip-dashboard"

export default async function TripPage({ params }: { params: Promise<{ id: string }> }) {
  if (!(await isAuthenticated())) redirect("/login")
  const { id } = await params
  const tripId = Number(id)
  if (!Number.isFinite(tripId)) notFound()

  const trip = await getTrip(tripId)
  if (!trip) notFound()

  const [categories, expenses] = await Promise.all([getCategories(tripId), getExpenses(tripId)])

  return <TripDashboard trip={trip} categories={categories} expenses={expenses} />
}
