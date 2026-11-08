"use client";

import { useCallback, useEffect, useMemo, useState, type ReactNode } from "react";
import {
  ArrowDownLeft,
  ArrowUpRight,
  BadgeRussianRuble,
  BarChart3,
  CalendarRange,
  Calculator,
  GraduationCap,
  Home,
  PiggyBank,
  Plus,
  Search,
  Target,
  X,
} from "lucide-react";
import { AnimatePresence, motion, useSpring, useTransform } from "motion/react";
import type { BudgetLimit, SavingGoal, Transaction } from "@/db/schema";
import {
  EXPENSE_CATEGORIES,
  INCOME_CATEGORIES,
  currentMonth,
  formatMoney,
  getCategoryInfo,
} from "@/lib/constants";
import {
  GlowButton,
  NavTab,
  PressButton,
  PressCard,
  TiltCard,
  TransactionItem,
} from "@/components/interactive";

type Tab = "overview" | "operations" | "goals" | "calculator" | "stats" | "budget";
type ModalType = "income" | "expense" | "goal" | "budget" | null;
type TxFilter = "all" | "income" | "expense";

const NAV_ITEMS: { id: Tab; label: string; icon: React.ComponentType<{ className?: string }> }[] =
  [
    { id: "overview", label: "Главная", icon: Home },
    { id: "operations", label: "Операции", icon: BadgeRussianRuble },
    { id: "goals", label: "Цели", icon: Target },
    { id: "calculator", label: "Расчёт", icon: Calculator },
    { id: "stats", label: "Статистика", icon: BarChart3 },
    { id: "budget", label: "План", icon: CalendarRange },
  ];

export default function StudentFinPage() {
  const [tab, setTab] = useState<Tab>("operations");
  const [modal, setModal] = useState<ModalType>(null);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [goals, setGoals] = useState<SavingGoal[]>([]);
  const [budgets, setBudgets] = useState<BudgetLimit[]>([]);
  const [txFilter, setTxFilter] = useState<TxFilter>("all");
  const [query, setQuery] = useState("");

  const loadData = useCallback(async () => {
    try {
      const [t, g, b] = await Promise.all([
        fetch("/api/transactions", { cache: "no-store" }).then((r) => r.json()),
        fetch("/api/goals", { cache: "no-store" }).then((r) => r.json()),
        fetch(`/api/budget?month=${currentMonth()}`, { cache: "no-store" }).then((r) =>
          r.json()
        ),
      ]);
      setTransactions(t.items ?? []);
      setGoals(g.items ?? []);
      setBudgets(b.items ?? []);
    } catch (e) {
      console.error(e);
    }
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const totalIncome = useMemo(
    () =>
      transactions
        .filter((t) => t.type === "income")
        .reduce((s, t) => s + Number(t.amount), 0),
    [transactions]
  );
  const totalExpense = useMemo(
    () =>
      transactions
        .filter((t) => t.type === "expense")
        .reduce((s, t) => s + Number(t.amount), 0),
    [transactions]
  );
  const balance = totalIncome - totalExpense;
  const totalSaved = useMemo(
    () => goals.reduce((s, g) => s + Number(g.currentAmount), 0),
    [goals]
  );

  const filteredTransactions = useMemo(() => {
    const q = query.trim().toLowerCase();
    return transactions.filter((txn) => {
      if (txFilter !== "all" && txn.type !== txFilter) return false;
      if (!q) return true;
      const info = getCategoryInfo(txn.category);
      return `${info.label} ${txn.description ?? ""}`.toLowerCase().includes(q);
    });
  }, [transactions, txFilter, query]);

  const currentMonthExpenses = useMemo(() => {
    const m = currentMonth();
    return transactions.filter(
      (t) => t.type === "expense" && new Date(t.date).toISOString().slice(0, 7) === m
    );
  }, [transactions]);

  const deleteTransaction = async (id: string) => {
    setTransactions((p) => p.filter((t) => t.id !== id));
    await fetch(`/api/transactions/${id}`, { method: "DELETE" });
  };

  const deleteGoal = async (id: string) => {
    setGoals((p) => p.filter((g) => g.id !== id));
    await fetch(`/api/goals/${id}`, { method: "DELETE" });
  };

  const headerMeta: Record<
    Tab,
    { title: string; subtitle: string; action: { label: string; modal: ModalType } }
  > = {
    overview: {
      title: "Главная",
      subtitle: "Смотри баланс, активность и прогресс по накоплениям.",
      action: { label: "Добавить", modal: "expense" },
    },
    operations: {
      title: "Транзакции",
      subtitle: "Записывайте доходы и расходы, чтобы видеть полную картину.",
      action: { label: "Добавить", modal: "expense" },
    },
    goals: {
      title: "Цели",
      subtitle: "Копи на важные вещи и следи за сроком достижения.",
      action: { label: "Новая цель", modal: "goal" },
    },
    calculator: {
      title: "Расчёт",
      subtitle: "Посчитай, когда достигнешь финансовой цели.",
      action: { label: "Новая цель", modal: "goal" },
    },
    stats: {
      title: "Статистика",
      subtitle: "Аналитика расходов по категориям.",
      action: { label: "Лимит", modal: "budget" },
    },
    budget: {
      title: "План бюджета",
      subtitle: "Установи лимиты на месяц и держи расходы под контролем.",
      action: { label: "Новый лимит", modal: "budget" },
    },
  };
  const header = headerMeta[tab];

  return (
    <div className="min-h-screen px-3 py-3 sm:px-5 sm:py-5 lg:px-8">
      <div className="app-shell relative mx-auto flex min-h-[calc(100vh-24px)] max-w-6xl flex-col overflow-hidden rounded-[34px] border border-white/60 bg-panel sm:min-h-[calc(100vh-40px)]">
        {/* ── Header ── */}
        <div className="border-b border-border bg-[linear-gradient(180deg,#ece8ff_0%,#f6f3ff_100%)] px-4 pb-6 pt-5 sm:px-6 sm:pb-7 sm:pt-6">
          <div className="mb-6 flex items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="grid h-11 w-11 place-items-center rounded-2xl bg-primary text-white shadow-[0_10px_24px_rgba(124,92,255,0.35)]">
                <GraduationCap className="h-5 w-5" />
              </div>
              <div>
                <p className="text-xl font-black tracking-tight text-ink">StudentFin</p>
                <p className="text-xs text-dim">Умные финансы для студентов</p>
              </div>
            </div>
            <TiltCard className="hidden rounded-2xl sm:block">
              <div className="rounded-2xl border border-white/60 bg-white/70 px-4 py-2 text-right shadow-sm">
                <p className="text-[11px] uppercase tracking-[0.22em] text-dim">Баланс</p>
                <p
                  className={`text-lg font-black ${balance >= 0 ? "text-green" : "text-red"}`}
                >
                  {formatMoney(balance)}
                </p>
              </div>
            </TiltCard>
          </div>

          <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
            <div>
              <h1 className="text-3xl font-black tracking-tight text-ink sm:text-4xl">
                {header.title}
              </h1>
              <p className="mt-2 max-w-2xl text-sm text-[#5f688d]">{header.subtitle}</p>
            </div>
            <GlowButton
              onClick={() => setModal(header.action.modal)}
              glowColor="rgba(124, 92, 255, 0.5)"
              className="inline-flex items-center justify-center gap-2 rounded-2xl bg-primary px-5 py-3 text-sm font-bold text-white"
            >
              <Plus className="h-4 w-4" />
              {header.action.label}
            </GlowButton>
          </div>
        </div>

        {/* ── Content ── */}
        <div className="flex-1 bg-[linear-gradient(180deg,#ffffff_0%,#fcfbff_100%)] px-4 pb-32 pt-5 sm:px-6 sm:pt-6">
          <AnimatePresence mode="wait">
            <motion.div
              key={tab}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -12 }}
              transition={{ duration: 0.22, ease: [0.22, 1, 0.36, 1] }}
            >
              {tab === "overview" && (
                <OverviewView
                  balance={balance}
                  totalIncome={totalIncome}
                  totalExpense={totalExpense}
                  totalSaved={totalSaved}
                  transactions={transactions}
                  goals={goals}
                  onShowExpenses={() => setTab("operations")}
                  onShowGoals={() => setTab("goals")}
                  onAddIncome={() => setModal("income")}
                  onAddExpense={() => setModal("expense")}
                />
              )}
              {tab === "operations" && (
                <OperationsView
                  transactions={filteredTransactions}
                  totalIncome={totalIncome}
                  totalExpense={totalExpense}
                  txFilter={txFilter}
                  setTxFilter={setTxFilter}
                  query={query}
                  setQuery={setQuery}
                  onDelete={deleteTransaction}
                  onAddIncome={() => setModal("income")}
                  onAddExpense={() => setModal("expense")}
                />
              )}
              {tab === "goals" && (
                <GoalsView
                  goals={goals}
                  onDelete={deleteGoal}
                  onReload={loadData}
                  onCreate={() => setModal("goal")}
                />
              )}
              {tab === "calculator" && <CalculatorView />}
              {tab === "stats" && <StatsView transactions={transactions} />}
              {tab === "budget" && (
                <BudgetView
                  budgets={budgets}
                  monthExpenses={currentMonthExpenses}
                  onCreate={() => setModal("budget")}
                />
              )}
            </motion.div>
          </AnimatePresence>
        </div>

        {/* ── Bottom Nav ── */}
        <div className="fixed inset-x-0 bottom-3 z-30 px-3 sm:static sm:z-0 sm:px-0">
          <div className="mx-auto max-w-6xl sm:max-w-none">
            <div className="mx-auto flex max-w-[780px] items-center justify-between rounded-[26px] border border-border bg-white/95 px-3 py-2.5 shadow-[0_18px_40px_rgba(31,35,64,0.10)] backdrop-blur sm:rounded-t-[26px] sm:rounded-b-none sm:border-x-0 sm:border-b-0 sm:shadow-none">
              {NAV_ITEMS.map((item) => (
                <NavTab
                  key={item.id}
                  icon={item.icon}
                  label={item.label}
                  active={tab === item.id}
                  onClick={() => setTab(item.id)}
                />
              ))}
            </div>
          </div>
        </div>
      </div>

      {modal === "income" && (
        <TransactionModal type="income" onClose={() => setModal(null)} onSaved={loadData} />
      )}
      {modal === "expense" && (
        <TransactionModal type="expense" onClose={() => setModal(null)} onSaved={loadData} />
      )}
      {modal === "goal" && (
        <GoalModal onClose={() => setModal(null)} onSaved={loadData} />
      )}
      {modal === "budget" && (
        <BudgetModal onClose={() => setModal(null)} onSaved={loadData} />
      )}
    </div>
  );
}

/* ═══════════════ VIEWS ═══════════════ */

function OverviewView({
  balance, totalIncome, totalExpense, totalSaved,
  transactions, goals, onShowExpenses, onShowGoals, onAddIncome, onAddExpense,
}: {
  balance: number; totalIncome: number; totalExpense: number; totalSaved: number;
  transactions: Transaction[]; goals: SavingGoal[];
  onShowExpenses: () => void; onShowGoals: () => void;
  onAddIncome: () => void; onAddExpense: () => void;
}) {
  return (
    <div className="space-y-5">
      {/* Metric cards with TiltCard 3D effect */}
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {[
          { label: "Баланс", value: balance, tone: "primary" as const, icon: <BadgeRussianRuble className="h-4 w-4" /> },
          { label: "Доходы", value: totalIncome, tone: "green" as const, icon: <ArrowDownLeft className="h-4 w-4" /> },
          { label: "Расходы", value: totalExpense, tone: "red" as const, icon: <ArrowUpRight className="h-4 w-4" /> },
          { label: "Накоплено", value: totalSaved, tone: "yellow" as const, icon: <PiggyBank className="h-4 w-4" /> },
        ].map((card) => (
          <TiltCard key={card.label} className="tilt-wrap rounded-[28px]">
            <TopMetricCard {...card} />
          </TiltCard>
        ))}
      </div>

      {/* Quick action cards */}
      <div className="grid gap-3 sm:grid-cols-2">
        <PressCard
          onClick={onAddIncome}
          rippleColor="rgba(16, 185, 129, 0.12)"
          className="rounded-[24px] border border-[#d9f1e7] bg-[linear-gradient(180deg,#f2fff8_0%,#ffffff_100%)] px-5 py-4 shadow-sm"
        >
          <p className="text-sm font-black text-green">+ Добавить доход</p>
          <p className="mt-1 text-xs text-dim">Стипендия, зарплата, помощь родителей</p>
        </PressCard>
        <PressCard
          onClick={onAddExpense}
          rippleColor="rgba(255, 79, 122, 0.12)"
          className="rounded-[24px] border border-[#ffdbe6] bg-[linear-gradient(180deg,#fff3f7_0%,#ffffff_100%)] px-5 py-4 shadow-sm"
        >
          <p className="text-sm font-black text-red">+ Добавить расход</p>
          <p className="mt-1 text-xs text-dim">Продукты, транспорт, подписки, жильё</p>
        </PressCard>
      </div>

      <div className="grid gap-4 xl:grid-cols-[1.2fr_0.8fr]">
        <section className="soft-card rounded-[28px] p-5 sm:p-6">
          <div className="mb-5 flex items-center justify-between">
            <div>
              <h3 className="text-lg font-black text-ink">Последние операции</h3>
              <p className="text-sm text-dim">Быстрый обзор.</p>
            </div>
            <PressButton
              onClick={() => onShowExpenses()}
              rippleColor="rgba(124, 92, 255, 0.15)"
              className="rounded-2xl bg-primary-soft px-4 py-2 text-xs font-bold text-primary"
            >
              Все →
            </PressButton>
          </div>
          <div>
            {transactions.length === 0 ? (
              <EmptyState title="Нет операций" text="Добавь первую транзакцию." />
            ) : (
              transactions.slice(0, 6).map((txn) => (
                <TransactionRow key={txn.id} txn={txn} />
              ))
            )}
          </div>
        </section>

        <section className="soft-card rounded-[28px] p-5 sm:p-6">
          <div className="mb-5 flex items-center justify-between">
            <h3 className="text-lg font-black text-ink">Цели накоплений</h3>
            <PressButton
              onClick={() => onShowGoals()}
              rippleColor="rgba(124, 92, 255, 0.15)"
              className="rounded-2xl bg-primary-soft px-4 py-2 text-xs font-bold text-primary"
            >
              Смотреть →
            </PressButton>
          </div>
          <div className="space-y-4">
            {goals.length === 0 ? (
              <EmptyState title="Пока нет целей" text="Создай первую финансовую цель." />
            ) : (
              goals.slice(0, 3).map((g) => <GoalProgressCard key={g.id} goal={g} compact />)
            )}
          </div>
        </section>
      </div>
    </div>
  );
}

function OperationsView({
  transactions, totalIncome, totalExpense, txFilter, setTxFilter,
  query, setQuery, onDelete, onAddIncome, onAddExpense,
}: {
  transactions: Transaction[]; totalIncome: number; totalExpense: number;
  txFilter: TxFilter; setTxFilter: (v: TxFilter) => void;
  query: string; setQuery: (v: string) => void;
  onDelete: (id: string) => void;
  onAddIncome: () => void; onAddExpense: () => void;
}) {
  const balance = totalIncome - totalExpense;
  const monthLabel = new Intl.DateTimeFormat("ru-RU", { month: "long", year: "numeric" })
    .format(new Date())
    .toUpperCase();

  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        {/* Filter chips */}
        <div className="soft-chip flex w-full max-w-[360px] rounded-2xl p-1.5">
          {(["all", "income", "expense"] as const).map((id) => (
            <PressButton
              key={id}
              onClick={() => setTxFilter(id)}
              rippleColor="rgba(124, 92, 255, 0.14)"
              className={`flex-1 rounded-xl px-4 py-2 text-sm font-semibold transition-colors ${
                txFilter === id ? "bg-white text-primary shadow-sm" : "text-[#586288]"
              }`}
            >
              {id === "all" ? "Все" : id === "income" ? "Доходы" : "Расходы"}
            </PressButton>
          ))}
        </div>

        {/* Search */}
        <label className="soft-chip flex w-full max-w-[360px] items-center gap-3 rounded-2xl px-4 py-3">
          <Search className="h-4 w-4 shrink-0 text-dim" />
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Поиск по названию или категории"
            className="w-full bg-transparent text-sm text-ink outline-none placeholder:text-[#a3abc9]"
          />
        </label>
      </div>

      {/* Quick add buttons */}
      <div className="grid gap-3 sm:grid-cols-2">
        <PressCard onClick={onAddIncome} rippleColor="rgba(16,185,129,0.12)"
          className="rounded-[22px] border border-[#d9f1e7] bg-green-soft px-4 py-3 text-left">
          <p className="text-sm font-black text-green">+ Доход</p>
          <p className="mt-1 text-xs text-dim">Добавить поступление</p>
        </PressCard>
        <PressCard onClick={onAddExpense} rippleColor="rgba(255,79,122,0.12)"
          className="rounded-[22px] border border-[#ffdbe6] bg-red-soft px-4 py-3 text-left">
          <p className="text-sm font-black text-red">+ Расход</p>
          <p className="mt-1 text-xs text-dim">Добавить трату</p>
        </PressCard>
      </div>

      {/* Summary strip */}
      <div className="metric-strip grid rounded-[24px] p-4 text-center sm:grid-cols-3 sm:p-5">
        <SummaryMetric label="Доходы" value={formatMoney(totalIncome)} tone="green" />
        <SummaryMetric label="Расходы" value={formatMoney(totalExpense)} tone="red" />
        <SummaryMetric label="Разница" value={formatMoney(balance)} tone={balance >= 0 ? "default" : "dark"} />
      </div>

      {/* Transaction list */}
      <section className="rounded-[28px] border border-border bg-white shadow-[0_8px_24px_rgba(31,35,64,0.04)]">
        <div className="px-5 pb-2 pt-4 text-xs uppercase tracking-[0.18em] text-[#adb4d0]">
          {monthLabel}
        </div>
        <div>
          {transactions.length === 0 ? (
            <div className="px-5 pb-5">
              <EmptyState title="Ничего не найдено" text="Попробуй убрать фильтр или добавь первую транзакцию." />
            </div>
          ) : (
            transactions.map((txn) => (
              <TransactionRow key={txn.id} txn={txn} onDelete={() => onDelete(txn.id)} detailed />
            ))
          )}
        </div>
      </section>
    </div>
  );
}

function GoalsView({ goals, onDelete, onReload, onCreate }: {
  goals: SavingGoal[]; onDelete: (id: string) => void;
  onReload: () => void; onCreate: () => void;
}) {
  const addFunds = async (goal: SavingGoal) => {
    const monthly = Number(goal.monthlyDeposit) || 1000;
    await fetch("/api/goals", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ...goal, targetAmount: Number(goal.targetAmount), currentAmount: Number(goal.currentAmount) + monthly, monthlyDeposit: monthly }),
    });
    onReload();
  };

  return (
    <div className="space-y-4">
      {goals.length === 0 ? (
        <section className="soft-card rounded-[28px] p-8">
          <EmptyState title="Пока нет целей" text="Накопления станут наглядными, когда появится первая финансовая цель." actionLabel="Создать цель" onAction={onCreate} />
        </section>
      ) : (
        <div className="grid gap-4 md:grid-cols-2">
          {goals.map((goal) => (
            <TiltCard key={goal.id} className="tilt-wrap rounded-[28px]">
              <GoalProgressCard goal={goal} onDelete={() => onDelete(goal.id)} onAddFunds={() => addFunds(goal)} />
            </TiltCard>
          ))}
        </div>
      )}
    </div>
  );
}

function CalculatorView() {
  const [target, setTarget] = useState(100000);
  const [current, setCurrent] = useState(20000);
  const [monthly, setMonthly] = useState(5000);

  const remaining = Math.max(0, target - current);
  const months = monthly > 0 ? Math.ceil(remaining / monthly) : 0;
  const years = Math.floor(months / 12);
  const restMonths = months % 12;

  return (
    <div className="grid gap-4 xl:grid-cols-[0.95fr_1.05fr]">
      <TiltCard className="tilt-wrap rounded-[28px]">
        <section className="soft-card rounded-[28px] p-5 sm:p-6">
          <h3 className="text-lg font-black text-ink">Параметры цели</h3>
          <div className="mt-5 space-y-4">
            <InputField label="Цель" value={target} onChange={setTarget} />
            <InputField label="Уже накоплено" value={current} onChange={setCurrent} />
            <InputField label="Ежемесячное пополнение" value={monthly} onChange={setMonthly} />
          </div>
        </section>
      </TiltCard>

      <section className="soft-card rounded-[28px] p-5 sm:p-6">
        <h3 className="text-lg font-black text-ink">Результат</h3>
        <div className="mt-5 rounded-[24px] bg-[linear-gradient(180deg,#f3efff_0%,#fbfaff_100%)] p-6">
          {remaining <= 0 ? (
            <div className="text-center">
              <p className="text-4xl">🎉</p>
              <p className="mt-3 text-xl font-black text-green">Цель уже достигнута!</p>
            </div>
          ) : monthly <= 0 ? (
            <p className="text-sm text-dim">Укажи ежемесячное пополнение, чтобы увидеть прогноз.</p>
          ) : (
            <>
              <p className="text-sm text-dim">До цели осталось</p>
              <p className="mt-2 text-3xl font-black text-ink">
                {years > 0 ? `${years} г. ` : ""}{restMonths} мес.
              </p>
              <p className="mt-2 text-sm text-dim">Нужно накопить ещё {formatMoney(remaining)}</p>
              <div className="mt-6 space-y-3">
                {Array.from({ length: Math.min(months, 6) }, (_, i) => {
                  const val = Math.min(current + monthly * (i + 1), target);
                  const pct = (val / target) * 100;
                  return (
                    <div key={i}>
                      <div className="mb-1 flex justify-between text-xs text-dim">
                        <span>Месяц {i + 1}</span><span>{formatMoney(val)}</span>
                      </div>
                      <div className="h-2 overflow-hidden rounded-full bg-white">
                        <motion.div
                          initial={{ width: 0 }}
                          animate={{ width: `${pct}%` }}
                          transition={{ delay: i * 0.08, duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
                          className="h-full rounded-full bg-primary"
                        />
                      </div>
                    </div>
                  );
                })}
                {months > 6 && <p className="text-xs text-dim">...ещё {months - 6} мес.</p>}
              </div>
            </>
          )}
        </div>
      </section>
    </div>
  );
}

function StatsView({ transactions }: { transactions: Transaction[] }) {
  const expenses = transactions.filter((t) => t.type === "expense");
  const total = expenses.reduce((s, t) => s + Number(t.amount), 0);
  const grouped = expenses.reduce<Record<string, number>>((acc, txn) => {
    acc[txn.category] = (acc[txn.category] ?? 0) + Number(txn.amount);
    return acc;
  }, {});
  const rows = Object.entries(grouped).sort((a, b) => b[1] - a[1]);

  return (
    <div className="grid gap-4 xl:grid-cols-[1.05fr_0.95fr]">
      <section className="soft-card rounded-[28px] p-5 sm:p-6">
        <h3 className="text-lg font-black text-ink">Расходы по категориям</h3>
        <div className="mt-5 space-y-4">
          {rows.length === 0 ? (
            <EmptyState title="Нет данных" text="Добавь несколько расходов, чтобы увидеть статистику." />
          ) : (
            rows.map(([category, amount]) => {
              const info = getCategoryInfo(category);
              const pct = total > 0 ? (amount / total) * 100 : 0;
              return (
                <div key={category}>
                  <div className="mb-1 flex items-center justify-between text-sm">
                    <span className="font-semibold text-ink">{info.label}</span>
                    <span className="font-bold text-ink">{formatMoney(amount)}</span>
                  </div>
                  <div className="h-3 overflow-hidden rounded-full bg-panel-muted">
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${pct}%` }}
                      transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
                      className="h-full rounded-full"
                      style={{ backgroundColor: info.color }}
                    />
                  </div>
                  <p className="mt-1 text-right text-[11px] text-dim">{pct.toFixed(1)}%</p>
                </div>
              );
            })
          )}
        </div>
      </section>

      <section className="soft-card rounded-[28px] p-5 sm:p-6">
        <h3 className="text-lg font-black text-ink">Сводка</h3>
        <div className="mt-5 space-y-3">
          {[
            ["Всего расходов", formatMoney(total)],
            ["Категорий", String(rows.length)],
            ["Операций", String(expenses.length)],
            ["Крупнейшая статья", rows[0] ? getCategoryInfo(rows[0][0]).label : "—"],
          ].map(([label, value]) => (
            <TiltCard key={label} className="tilt-wrap rounded-2xl">
              <div className="rounded-2xl bg-panel-muted px-4 py-3 text-sm flex items-center justify-between">
                <span className="text-dim">{label}</span>
                <span className="font-bold text-ink">{value}</span>
              </div>
            </TiltCard>
          ))}
        </div>
      </section>
    </div>
  );
}

function BudgetView({ budgets, monthExpenses, onCreate }: {
  budgets: BudgetLimit[]; monthExpenses: Transaction[]; onCreate: () => void;
}) {
  const spentMap = monthExpenses.reduce<Record<string, number>>((acc, txn) => {
    acc[txn.category] = (acc[txn.category] ?? 0) + Number(txn.amount);
    return acc;
  }, {});

  return (
    <div className="space-y-4">
      {budgets.length === 0 ? (
        <section className="soft-card rounded-[28px] p-8">
          <EmptyState title="Лимиты не настроены" text="Установи месячные лимиты по категориям." actionLabel="Добавить лимит" onAction={onCreate} />
        </section>
      ) : (
        budgets.map((budget) => {
          const limit = Number(budget.limitAmount);
          const spent = spentMap[budget.category] ?? 0;
          const pct = limit > 0 ? Math.min(100, (spent / limit) * 100) : 0;
          const over = spent > limit;
          return (
            <TiltCard key={budget.id} className="tilt-wrap rounded-[28px]">
              <section className="soft-card rounded-[28px] p-5 sm:p-6">
                <div className="mb-3 flex items-center justify-between gap-3">
                  <div>
                    <h3 className="text-base font-black text-ink">{getCategoryInfo(budget.category).label}</h3>
                    <p className="text-sm text-dim">Лимит на {budget.month}</p>
                  </div>
                  <div className="text-right text-sm font-bold text-ink">
                    {formatMoney(spent)} / {formatMoney(limit)}
                  </div>
                </div>
                <div className="h-3 overflow-hidden rounded-full bg-panel-muted">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${pct}%` }}
                    transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
                    className={`h-full rounded-full ${over ? "bg-red" : "bg-green"}`}
                  />
                </div>
                <p className={`mt-2 text-xs ${over ? "text-red" : "text-dim"}`}>
                  {over ? `Превышение на ${formatMoney(spent - limit)}` : `Остаток ${formatMoney(limit - spent)}`}
                </p>
              </section>
            </TiltCard>
          );
        })
      )}
    </div>
  );
}

/* ═══════════════ SUB-COMPONENTS ═══════════════ */

function TopMetricCard({ label, value, tone, icon }: {
  label: string; value: number;
  tone: "primary" | "green" | "red" | "yellow"; icon: ReactNode;
}) {
  const styles = {
    primary: "bg-[linear-gradient(180deg,#f3efff_0%,#ffffff_100%)] text-primary",
    green:   "bg-[linear-gradient(180deg,#edfff7_0%,#ffffff_100%)] text-green",
    red:     "bg-[linear-gradient(180deg,#fff1f5_0%,#ffffff_100%)] text-red",
    yellow:  "bg-[linear-gradient(180deg,#fff8e8_0%,#ffffff_100%)] text-yellow",
  } as const;
  return (
    <div className={`soft-card rounded-[28px] p-5 ${styles[tone]}`}>
      <div className="flex items-center justify-between">
        <span className="text-[11px] uppercase tracking-[0.2em] text-dim">{label}</span>
        {icon}
      </div>
      <p className="mt-4 text-2xl font-black tracking-tight">{formatMoney(value)}</p>
    </div>
  );
}

function SummaryMetric({ label, value, tone }: { label: string; value: string; tone: "green" | "red" | "dark" | "default" }) {
  const cls = tone === "green" ? "text-green" : tone === "red" ? "text-red" : "text-ink";
  return (
    <div className="px-3 py-2">
      <p className="text-sm text-[#667198]">{label}</p>
      <p className={`mt-1 text-xl font-black ${cls}`}>{value}</p>
    </div>
  );
}

function TransactionRow({ txn, onDelete, detailed = false }: {
  txn: Transaction; onDelete?: () => void; detailed?: boolean;
}) {
  const info = getCategoryInfo(txn.category);
  const isIncome = txn.type === "income";
  const Icon = info.icon;
  const date = new Date(txn.date).toLocaleDateString("ru-RU", { day: "numeric", month: "short" });

  const inner = (
    <>
      <div className="grid h-11 w-11 shrink-0 place-items-center rounded-2xl"
        style={{ backgroundColor: `${info.color}18`, color: info.color }}>
        <Icon className="h-4 w-4" />
      </div>
      <div className="min-w-0 flex-1 px-3">
        <p className="truncate text-sm font-bold text-ink">{txn.description || info.label}</p>
        <p className="truncate text-xs text-dim">{info.label} · {date}</p>
      </div>
      <p className={`shrink-0 text-sm font-black ${isIncome ? "text-green" : "text-ink"}`}>
        {isIncome ? "+" : "−"}{formatMoney(Number(txn.amount))}
      </p>
    </>
  );

  if (detailed) {
    return (
      <TransactionItem
        onDelete={onDelete}
        className="border-t border-[#f0eef7] px-5 py-4 first:border-t-0"
      >
        {inner}
      </TransactionItem>
    );
  }

  return (
    <div className="flex items-center rounded-2xl bg-panel-muted px-4 py-3">{inner}</div>
  );
}

function GoalProgressCard({ goal, compact = false, onDelete, onAddFunds }: {
  goal: SavingGoal; compact?: boolean; onDelete?: () => void; onAddFunds?: () => void;
}) {
  const current = Number(goal.currentAmount);
  const target = Number(goal.targetAmount);
  const monthly = Number(goal.monthlyDeposit);
  const pct = target > 0 ? Math.min(100, (current / target) * 100) : 0;
  const remaining = Math.max(0, target - current);
  const monthsLeft = monthly > 0 ? Math.ceil(remaining / monthly) : null;

  return (
    <div className={`rounded-[24px] border border-border bg-[linear-gradient(180deg,#ffffff_0%,#faf9ff_100%)] ${compact ? "p-4" : "p-5"}`}>
      <div className="flex items-start justify-between gap-3">
        <div>
          <h4 className="text-sm font-black text-ink">{goal.title}</h4>
          <p className="mt-1 text-xs text-dim">{formatMoney(current)} из {formatMoney(target)}</p>
        </div>
        {onDelete && (
          <PressButton onClick={onDelete} rippleColor="rgba(255,79,122,0.15)"
            className="rounded-xl p-1.5 text-dim hover:bg-red-soft hover:text-red">
            <X className="h-4 w-4" />
          </PressButton>
        )}
      </div>
      <div className="mt-3 h-2.5 overflow-hidden rounded-full bg-panel-soft">
        <motion.div
          initial={{ width: 0 }}
          animate={{ width: `${pct}%` }}
          transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
          className="h-full rounded-full bg-primary"
        />
      </div>
      <div className="mt-2 flex items-center justify-between text-xs">
        <span className="font-bold text-primary">{pct.toFixed(0)}%</span>
        <span className="text-dim">Ежемесячно: {formatMoney(monthly)}</span>
      </div>
      {!compact && (
        <>
          {remaining <= 0 ? (
            <p className="mt-4 rounded-2xl bg-green-soft px-3 py-2 text-center text-xs font-bold text-green">Цель достигнута 🎉</p>
          ) : (
            <p className="mt-4 rounded-2xl bg-primary-soft px-3 py-2 text-center text-xs font-semibold text-primary">
              {monthsLeft ? `≈ ${monthsLeft} мес. до цели` : "Добавь ежемесячное пополнение"}
            </p>
          )}
          {onAddFunds && remaining > 0 && (
            <GlowButton
              onClick={onAddFunds}
              glowColor="rgba(31,35,64,0.25)"
              className="mt-3 w-full rounded-2xl bg-ink px-4 py-3 text-sm font-bold text-white"
            >
              + Пополнить на {formatMoney(monthly || 1000)}
            </GlowButton>
          )}
        </>
      )}
    </div>
  );
}

function InputField({ label, value, onChange }: { label: string; value: number; onChange: (v: number) => void }) {
  return (
    <label className="block">
      <span className="mb-2 block text-sm font-medium text-dim">{label}</span>
      <input
        type="number" value={value}
        onChange={(e) => onChange(Number(e.target.value) || 0)}
        className="w-full rounded-2xl border border-border bg-white px-4 py-3 text-lg font-black text-ink outline-none transition focus:border-primary focus:shadow-[0_0_0_3px_rgba(124,92,255,0.12)]"
      />
    </label>
  );
}

function EmptyState({ title, text, actionLabel, onAction }: {
  title: string; text: string; actionLabel?: string; onAction?: () => void;
}) {
  return (
    <div className="rounded-[24px] border border-dashed border-border-strong bg-panel-muted px-5 py-8 text-center">
      <p className="text-base font-black text-ink">{title}</p>
      <p className="mx-auto mt-2 max-w-sm text-sm text-dim">{text}</p>
      {actionLabel && onAction && (
        <GlowButton onClick={onAction} glowColor="rgba(124,92,255,0.4)"
          className="mt-4 rounded-2xl bg-primary px-4 py-2 text-sm font-bold text-white">
          {actionLabel}
        </GlowButton>
      )}
    </div>
  );
}

/* ═══════════════ MODALS ═══════════════ */

function ModalShell({ title, onClose, children }: { title: string; onClose: () => void; children: ReactNode }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <motion.button initial={{ opacity: 0 }} animate={{ opacity: 1 }}
        className="absolute inset-0 bg-[#1f2340]/30 backdrop-blur-sm"
        onClick={onClose}
      />
      <motion.div
        initial={{ opacity: 0, scale: 0.94, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.96, y: 10 }}
        transition={{ type: "spring", stiffness: 420, damping: 32 }}
        className="relative w-full max-w-lg rounded-[32px] border border-white/60 bg-white p-6 shadow-[0_30px_80px_rgba(31,35,64,0.18)]"
      >
        <div className="mb-5 flex items-center justify-between">
          <h3 className="text-2xl font-black text-ink">{title}</h3>
          <PressButton onClick={onClose} rippleColor="rgba(31,35,64,0.08)"
            className="grid h-10 w-10 place-items-center rounded-full bg-panel-muted text-dim hover:text-ink">
            <X className="h-4 w-4" />
          </PressButton>
        </div>
        {children}
      </motion.div>
    </div>
  );
}

function TransactionModal({ type, onClose, onSaved }: { type: "income" | "expense"; onClose: () => void; onSaved: () => void }) {
  const [amount, setAmount] = useState("");
  const [category, setCategory] = useState("");
  const [description, setDescription] = useState("");
  const categories = type === "income" ? INCOME_CATEGORIES : EXPENSE_CATEGORIES;

  const save = async () => {
    if (!amount || !category) return;
    await fetch("/api/transactions", {
      method: "POST", headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ type, amount: Number(amount), category, description: description || null }),
    });
    onSaved(); onClose();
  };

  return (
    <ModalShell title={type === "income" ? "Новый доход" : "Новый расход"} onClose={onClose}>
      <div className="space-y-5">
        <label className="block">
          <span className="mb-2 block text-sm font-medium text-dim">Сумма</span>
          <input type="number" value={amount} onChange={(e) => setAmount(e.target.value)}
            placeholder="0" autoFocus
            className="w-full rounded-2xl border border-border bg-panel-muted px-5 py-4 text-2xl font-black text-ink outline-none transition focus:border-primary focus:shadow-[0_0_0_3px_rgba(124,92,255,0.12)]"
          />
        </label>
        <div>
          <span className="mb-2 block text-sm font-medium text-dim">Категория</span>
          <div className="flex flex-wrap gap-2">
            {categories.map((item) => (
              <PressButton key={item.id} onClick={() => setCategory(item.id)}
                rippleColor="rgba(124,92,255,0.14)"
                className={`inline-flex items-center gap-2 rounded-2xl border px-3.5 py-2 text-xs font-bold transition-colors ${
                  category === item.id ? "border-primary bg-primary-soft text-primary" : "border-border bg-white text-[#54607f]"
                }`}
              >
                <item.icon className="h-3.5 w-3.5" /> {item.label}
              </PressButton>
            ))}
          </div>
        </div>
        <label className="block">
          <span className="mb-2 block text-sm font-medium text-dim">Описание</span>
          <input type="text" value={description} onChange={(e) => setDescription(e.target.value)}
            placeholder="Например: продукты на неделю"
            className="w-full rounded-2xl border border-border bg-panel-muted px-4 py-3 text-sm text-ink outline-none transition focus:border-primary"
          />
        </label>
        <GlowButton onClick={save} disabled={!amount || !category}
          glowColor="rgba(124,92,255,0.5)"
          className="w-full rounded-2xl bg-primary px-5 py-3.5 text-sm font-black text-white disabled:opacity-40">
          Сохранить операцию
        </GlowButton>
      </div>
    </ModalShell>
  );
}

function GoalModal({ onClose, onSaved }: { onClose: () => void; onSaved: () => void }) {
  const [title, setTitle] = useState("");
  const [targetAmount, setTargetAmount] = useState("");
  const [currentAmount, setCurrentAmount] = useState("");
  const [monthlyDeposit, setMonthlyDeposit] = useState("");

  const save = async () => {
    if (!title || !targetAmount) return;
    await fetch("/api/goals", {
      method: "POST", headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ title, targetAmount: Number(targetAmount), currentAmount: Number(currentAmount) || 0, monthlyDeposit: Number(monthlyDeposit) || 0 }),
    });
    onSaved(); onClose();
  };

  return (
    <ModalShell title="Новая цель" onClose={onClose}>
      <div className="space-y-4">
        {[
          { label: "Название цели", val: title, set: setTitle, type: "text", placeholder: "Например: новый ноутбук" },
        ].map(({ label, val, set, type, placeholder }) => (
          <label key={label} className="block">
            <span className="mb-2 block text-sm font-medium text-dim">{label}</span>
            <input type={type} value={val} onChange={(e) => set(e.target.value)} placeholder={placeholder}
              className="w-full rounded-2xl border border-border bg-panel-muted px-4 py-3 text-sm text-ink outline-none transition focus:border-primary" />
          </label>
        ))}
        {[
          { label: "Сумма цели", val: targetAmount, set: setTargetAmount, placeholder: "100000" },
          { label: "Уже накоплено", val: currentAmount, set: setCurrentAmount, placeholder: "20000" },
          { label: "Ежемесячное пополнение", val: monthlyDeposit, set: setMonthlyDeposit, placeholder: "5000" },
        ].map(({ label, val, set, placeholder }) => (
          <label key={label} className="block">
            <span className="mb-2 block text-sm font-medium text-dim">{label}</span>
            <input type="number" value={val} onChange={(e) => set(e.target.value)} placeholder={placeholder}
              className="w-full rounded-2xl border border-border bg-panel-muted px-4 py-3 text-sm text-ink outline-none transition focus:border-primary" />
          </label>
        ))}
        <GlowButton onClick={save} disabled={!title || !targetAmount}
          glowColor="rgba(124,92,255,0.5)"
          className="w-full rounded-2xl bg-primary px-5 py-3.5 text-sm font-black text-white disabled:opacity-40">
          Создать цель
        </GlowButton>
      </div>
    </ModalShell>
  );
}

function BudgetModal({ onClose, onSaved }: { onClose: () => void; onSaved: () => void }) {
  const [category, setCategory] = useState("");
  const [limitAmount, setLimitAmount] = useState("");

  const save = async () => {
    if (!category || !limitAmount) return;
    await fetch("/api/budget", {
      method: "POST", headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ category, limitAmount: Number(limitAmount), month: currentMonth() }),
    });
    onSaved(); onClose();
  };

  return (
    <ModalShell title="Лимит бюджета" onClose={onClose}>
      <div className="space-y-5">
        <div>
          <span className="mb-2 block text-sm font-medium text-dim">Категория</span>
          <div className="flex flex-wrap gap-2">
            {EXPENSE_CATEGORIES.map((item) => (
              <PressButton key={item.id} onClick={() => setCategory(item.id)}
                rippleColor="rgba(124,92,255,0.14)"
                className={`inline-flex items-center gap-2 rounded-2xl border px-3.5 py-2 text-xs font-bold transition-colors ${
                  category === item.id ? "border-primary bg-primary-soft text-primary" : "border-border bg-white text-[#54607f]"
                }`}
              >
                <item.icon className="h-3.5 w-3.5" /> {item.label}
              </PressButton>
            ))}
          </div>
        </div>
        <label className="block">
          <span className="mb-2 block text-sm font-medium text-dim">Лимит на месяц</span>
          <input type="number" value={limitAmount} onChange={(e) => setLimitAmount(e.target.value)}
            placeholder="15000" autoFocus
            className="w-full rounded-2xl border border-border bg-panel-muted px-4 py-3 text-lg font-black text-ink outline-none transition focus:border-primary focus:shadow-[0_0_0_3px_rgba(124,92,255,0.12)]"
          />
        </label>
        <GlowButton onClick={save} disabled={!category || !limitAmount}
          glowColor="rgba(124,92,255,0.5)"
          className="w-full rounded-2xl bg-primary px-5 py-3.5 text-sm font-black text-white disabled:opacity-40">
          Сохранить лимит
        </GlowButton>
      </div>
    </ModalShell>
  );
}
