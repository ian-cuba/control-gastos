import { getTrips } from "@/app/actions/data"
import { isAuthenticated } from "@/lib/session"
import { redirect } from "next/navigation"
import { TripsList } from "@/components/trips-list"
import { LogoutButton } from "@/components/logout-button"
import { Plane } from "lucide-react"

export default async function Home() {
  if (!(await isAuthenticated())) redirect("/login")
  const trips = await getTrips()

  return (
    <main className="mx-auto min-h-screen w-full max-w-2xl px-4 pb-16">
      <header className="flex items-center justify-between gap-3 py-6">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary text-primary-foreground">
            <Plane className="h-5 w-5" />
          </div>
          <h1 className="text-lg font-semibold leading-tight tracking-tight text-foreground text-balance">
            Travel Expense Tracker
          </h1>
        </div>
        <LogoutButton />
      </header>

      <TripsList trips={trips} />
    </main>
  )
}
