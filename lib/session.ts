import { cookies } from "next/headers"
import { createHmac, timingSafeEqual } from "crypto"

const COOKIE_NAME = "tet_session"
const SESSION_VALUE = "authenticated"

function sign(value: string): string {
  const secret = process.env.SESSION_SECRET || "dev-secret-change-me"
  return createHmac("sha256", secret).update(value).digest("hex")
}

function makeToken(): string {
  return `${SESSION_VALUE}.${sign(SESSION_VALUE)}`
}

function verifyToken(token: string | undefined): boolean {
  if (!token) return false
  const [value, signature] = token.split(".")
  if (value !== SESSION_VALUE || !signature) return false
  const expected = sign(value)
  if (expected.length !== signature.length) return false
  try {
    return timingSafeEqual(Buffer.from(expected), Buffer.from(signature))
  } catch {
    return false
  }
}

export function checkPin(pin: string): boolean {
  const appPin = process.env.APP_PIN
  if (!appPin) return false
  if (pin.length !== appPin.length) return false
  try {
    return timingSafeEqual(Buffer.from(pin), Buffer.from(appPin))
  } catch {
    return false
  }
}

export async function createSession() {
  const cookieStore = await cookies()
  cookieStore.set(COOKIE_NAME, makeToken(), {
    httpOnly: true,
    secure: true,
    sameSite: "none",
    path: "/",
    maxAge: 60 * 60 * 24 * 30,
  })
}

export async function destroySession() {
  const cookieStore = await cookies()
  cookieStore.delete(COOKIE_NAME)
}

export async function isAuthenticated(): Promise<boolean> {
  const cookieStore = await cookies()
  return verifyToken(cookieStore.get(COOKIE_NAME)?.value)
}
