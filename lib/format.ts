export const CURRENCIES = [
  { code: "ARS", label: "Peso argentino ($)", locale: "es-AR" },
  { code: "USD", label: "Dólar (US$)", locale: "en-US" },
  { code: "EUR", label: "Euro (€)", locale: "es-ES" },
] as const

export function formatMoney(amount: number, currency = "ARS") {
  const cfg = CURRENCIES.find((c) => c.code === currency) ?? CURRENCIES[0]
  try {
    return new Intl.NumberFormat(cfg.locale, {
      style: "currency",
      currency: cfg.code,
      maximumFractionDigits: amount % 1 === 0 ? 0 : 2,
    }).format(amount)
  } catch {
    return `$${amount.toLocaleString()}`
  }
}

export function formatDate(value: string) {
  // value is YYYY-MM-DD
  const [y, m, d] = value.split("-").map(Number)
  if (!y) return value
  return new Date(y, m - 1, d).toLocaleDateString("es-AR", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  })
}

export function todayISO() {
  return new Date().toISOString().slice(0, 10)
}
