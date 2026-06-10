import { isAuthenticated } from "@/lib/session"
import { redirect } from "next/navigation"
import { LoginForm } from "@/components/login-form"
import { Mountain } from "lucide-react"

export default async function LoginPage() {
  if (await isAuthenticated()) redirect("/")

  return (
    <main className="flex min-h-screen items-center justify-center px-4">
      <div className="w-full max-w-sm">
        <div className="mb-8 flex flex-col items-center gap-3 text-center">
          <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-primary to-accent text-primary-foreground shadow-md">
            <Mountain className="h-8 w-8" />
          </div>
          <div>
            <h1 className="text-xl font-semibold tracking-tight text-foreground text-balance">
              Gastómetro
            </h1>
            <p className="mt-1 text-sm text-muted-foreground">Ingresa tu PIN para continuar</p>
          </div>
        </div>
        <LoginForm />
      </div>
    </main>
  )
}
