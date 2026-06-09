"use server"

import { checkPin, createSession, destroySession } from "@/lib/session"
import { redirect } from "next/navigation"

export async function login(_prevState: { error?: string } | undefined, formData: FormData) {
  const pin = String(formData.get("pin") || "")
  if (!checkPin(pin)) {
    return { error: "PIN incorrecto" }
  }
  await createSession()
  redirect("/")
}

export async function logout() {
  await destroySession()
  redirect("/login")
}
