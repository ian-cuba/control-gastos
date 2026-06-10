import { getTrips } from "@/app/actions/data"
import { isAuthenticated } from "@/lib/session"
import { redirect } from "next/navigation"
import { TripsList } from "@/components/trips-list"
import { LogoutButton } from "@/components/logout-button"
import { ThemeToggle } from "@/components/theme-toggle"
import { Mountain } from "lucide-react"

export default async function Home() {
  if (!(await isAuthenticated())) redirect("/login")
  const trips = await getTrips()

  return (
    <main className="mx-auto min-h-screen w-full max-w-3xl px-3 pb-[max(5rem,env(safe-area-inset-bottom))] sm:px-4">
      <header className="flex items-center justify-between gap-2 py-4 sm:gap-3 sm:py-6">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-primary to-accent text-primary-foreground shadow-sm">
            <Mountain className="h-5 w-5" />
          </div>
          <h1 className="text-lg font-semibold leading-tight tracking-tight text-foreground text-balance">
            Gastómetro
          </h1>
        </div>
        <div className="flex items-center gap-2">
          <ThemeToggle />
          <LogoutButton />
        </div>
      </header>

      <TripsList trips={trips} />
    </main>
  )
}
