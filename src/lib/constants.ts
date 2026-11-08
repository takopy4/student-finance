import { 
  Utensils, Bus, Gamepad2, GraduationCap, Shirt, 
  Pill, Home, Smartphone, Package, Briefcase, 
  Laptop, GraduationCap as Scholarship, Heart, UserCircle 
} from "lucide-react";

export const EXPENSE_CATEGORIES = [
  { id: "food", label: "Еда", icon: Utensils, color: "#f97316" },
  { id: "transport", label: "Транспорт", icon: Bus, color: "#3b82f6" },
  { id: "entertainment", label: "Развлечения", icon: Gamepad2, color: "#a855f7" },
  { id: "education", label: "Образование", icon: GraduationCap, color: "#06b6d4" },
  { id: "clothes", label: "Одежда", icon: Shirt, color: "#ec4899" },
  { id: "health", label: "Здоровье", icon: Pill, color: "#10b981" },
  { id: "housing", label: "Жильё", icon: Home, color: "#eab308" },
  { id: "subscriptions", label: "Подписки", icon: Smartphone, color: "#6366f1" },
  { id: "other", label: "Другое", icon: Package, color: "#8b5cf6" },
] as const;

export const INCOME_CATEGORIES = [
  { id: "salary", label: "Зарплата", icon: Briefcase, color: "#34d399" },
  { id: "freelance", label: "Фриланс", icon: Laptop, color: "#60a5fa" },
  { id: "scholarship", label: "Стипендия", icon: Scholarship, color: "#fbbf24" },
  { id: "parents", label: "Родители", icon: Heart, color: "#f472b6" },
  { id: "other_income", label: "Другое", icon: UserCircle, color: "#a78bfa" },
] as const;

export function getCategoryInfo(id: string) {
  const all = [...EXPENSE_CATEGORIES, ...INCOME_CATEGORIES];
  return all.find((c) => c.id === id) || { label: id, icon: Package, color: "#8888a0" };
}

export function formatMoney(n: number): string {
  return new Intl.NumberFormat("ru-RU", {
    style: "currency",
    currency: "RUB",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(n);
}

export function currentMonth(): string {
  return new Date().toISOString().slice(0, 7);
}
