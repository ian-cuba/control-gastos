import {
  Banknote,
  Bed,
  Bus,
  Car,
  Coffee,
  CreditCard,
  Fuel,
  Gift,
  Hotel,
  Map,
  Plane,
  ShoppingBag,
  Tag,
  Ticket,
  Train,
  Utensils,
  type LucideIcon,
} from "lucide-react"

export const CATEGORY_ICONS: Record<string, LucideIcon> = {
  tag: Tag,
  fuel: Fuel,
  hotel: Hotel,
  bed: Bed,
  utensils: Utensils,
  coffee: Coffee,
  car: Car,
  bus: Bus,
  train: Train,
  plane: Plane,
  ticket: Ticket,
  shopping: ShoppingBag,
  gift: Gift,
  map: Map,
  banknote: Banknote,
  card: CreditCard,
}

export const ICON_OPTIONS = Object.keys(CATEGORY_ICONS)

export function getCategoryIcon(name: string): LucideIcon {
  return CATEGORY_ICONS[name] ?? Tag
}
