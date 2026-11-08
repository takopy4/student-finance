import { numeric, pgTable, text, timestamp, uuid, varchar } from "drizzle-orm/pg-core";

// Транзакции (доходы и расходы)
export const transactions = pgTable("transactions", {
  id: uuid("id").defaultRandom().primaryKey(),
  type: varchar("type", { length: 10 }).notNull(), // income | expense
  amount: numeric("amount", { precision: 12, scale: 2 }).notNull(),
  category: varchar("category", { length: 50 }).notNull(),
  description: text("description"),
  date: timestamp("date", { withTimezone: true }).defaultNow().notNull(),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
});

// Цели накоплений
export const savingGoals = pgTable("saving_goals", {
  id: uuid("id").defaultRandom().primaryKey(),
  title: text("title").notNull(),
  targetAmount: numeric("target_amount", { precision: 12, scale: 2 }).notNull(),
  currentAmount: numeric("current_amount", { precision: 12, scale: 2 }).default("0").notNull(),
  monthlyDeposit: numeric("monthly_deposit", { precision: 12, scale: 2 }).default("0").notNull(),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
});

// Бюджет на месяц (лимиты по категориям)
export const budgetLimits = pgTable("budget_limits", {
  id: uuid("id").defaultRandom().primaryKey(),
  category: varchar("category", { length: 50 }).notNull(),
  limitAmount: numeric("limit_amount", { precision: 12, scale: 2 }).notNull(),
  month: varchar("month", { length: 7 }).notNull(), // "2026-01"
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
});

export type Transaction = typeof transactions.$inferSelect;
export type SavingGoal = typeof savingGoals.$inferSelect;
export type BudgetLimit = typeof budgetLimits.$inferSelect;
