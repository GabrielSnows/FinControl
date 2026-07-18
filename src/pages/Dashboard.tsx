import { useMemo, useState } from "react";

import { useLiveQuery } from "dexie-react-hooks";

import {
  ArrowDownRight,
  ArrowUpRight,
  Landmark,
  ReceiptText,
  TrendingDown,
  TrendingUp,
  WalletCards,
} from "lucide-react";

import { db } from "../database/database";
import {
  FinCard,
  FinCardContent,
} from "../finui/Card/FinCard";
import FinPageHeader from "../finui/PageHeader/FinPageHeader";
import FinSelect from "../finui/Select/FinSelect";
import { formatCurrency } from "../utils/currency";
import {
  formatMonthName,
  getCurrentMonthKey,
} from "../utils/date";

export default function Dashboard() {
  const currentMonthKey = getCurrentMonthKey();

  const [selectedMonthKey, setSelectedMonthKey] =
    useState(currentMonthKey);

  const dashboardData = useLiveQuery(async () => {
    const [accounts, transactions] = await Promise.all([
      db.accounts.orderBy("createdAt").reverse().toArray(),
      db.transactions.toArray(),
    ]);

    return {
      accounts,
      transactions,
    };
  }, []);

  const monthOptions = useMemo(() => {
    if (!dashboardData) {
      return [
        {
          value: currentMonthKey,
          label: formatMonthName(currentMonthKey),
        },
      ];
    }

    const availableMonths = new Set<string>();

    availableMonths.add(currentMonthKey);

    dashboardData.transactions.forEach((transaction) => {
      const monthKey = transaction.date.slice(0, 7);

      if (/^\d{4}-\d{2}$/.test(monthKey)) {
        availableMonths.add(monthKey);
      }
    });

    return Array.from(availableMonths)
      .sort((firstMonth, secondMonth) =>
        secondMonth.localeCompare(firstMonth),
      )
      .map((monthKey) => ({
        value: monthKey,
        label: formatMonthName(monthKey),
      }));
  }, [currentMonthKey, dashboardData]);

  if (dashboardData === undefined) {
    return (
      <div className="flex min-h-64 items-center justify-center text-zinc-500">
        Carregando dashboard...
      </div>
    );
  }

  const { accounts, transactions } = dashboardData;

  const selectedMonthTransactions = transactions.filter(
    (transaction) =>
      transaction.date.startsWith(selectedMonthKey) &&
      !transaction.isAdjustment,
  );

  const incomeTransactions = selectedMonthTransactions.filter(
    (transaction) => transaction.type === "income",
  );

  const expenseTransactions = selectedMonthTransactions.filter(
    (transaction) => transaction.type === "expense",
  );

  const totalIncome = incomeTransactions.reduce(
    (total, transaction) => total + transaction.amount,
    0,
  );

  const totalExpense = expenseTransactions.reduce(
    (total, transaction) => total + transaction.amount,
    0,
  );

  const totalBalance = accounts.reduce(
    (total, account) => total + account.balance,
    0,
  );

  const monthResult = totalIncome - totalExpense;

  const totalRegisteredTransactions =
    incomeTransactions.length + expenseTransactions.length;

  const resultIsPositive = monthResult >= 0;

  return (
    <div>
      <FinPageHeader
        title="Dashboard"
        description="Acompanhe seu saldo, movimentações e contas em um só lugar."
        action={
          <div className="w-full lg:w-64">
            <FinSelect
              label="Período"
              value={selectedMonthKey}
              options={monthOptions}
              searchable={false}
              onChange={(value) => {
                setSelectedMonthKey(value);
              }}
            />
          </div>
        }
      />

      <section className="grid gap-5 xl:grid-cols-[minmax(0,1.7fr)_minmax(280px,0.8fr)]">
        <FinCard className="relative overflow-hidden">
          <FinCardContent className="relative p-6 sm:p-8">
            <div className="pointer-events-none absolute -right-20 -top-24 h-56 w-56 rounded-full bg-white/2.5 blur-2xl" />

            <div className="relative">
              <div className="flex items-center gap-2 text-sm font-medium text-zinc-500">
                <WalletCards size={17} />

                <span>Saldo total</span>
              </div>

              <strong
                className={
                  totalBalance < 0
                    ? "mt-4 block wrap-break-word text-4xl font-semibold tracking-[-0.04em] text-red-400 sm:text-5xl"
                    : "mt-4 block wrap-break-word text-4xl font-semibold tracking-[-0.04em] text-zinc-100 sm:text-5xl"
                }
              >
                {formatCurrency(totalBalance)}
              </strong>

              <div className="mt-7 flex flex-wrap items-center gap-3">
                <div
                  className={
                    resultIsPositive
                      ? "inline-flex items-center gap-2 rounded-full border border-emerald-900/70 bg-emerald-950/40 px-3 py-1.5 text-sm text-emerald-400"
                      : "inline-flex items-center gap-2 rounded-full border border-red-900/70 bg-red-950/40 px-3 py-1.5 text-sm text-red-400"
                  }
                >
                  {resultIsPositive ? (
                    <ArrowUpRight size={16} />
                  ) : (
                    <ArrowDownRight size={16} />
                  )}

                  <span>
                    {formatCurrency(monthResult)} no período
                  </span>
                </div>

                <span className="text-sm text-zinc-600">
                  {formatMonthName(selectedMonthKey)}
                </span>
              </div>
            </div>
          </FinCardContent>
        </FinCard>

        <FinCard variant="subtle">
          <FinCardContent className="flex h-full flex-col justify-between p-6">
            <div>
              <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-zinc-900">
                <ReceiptText
                  size={21}
                  strokeWidth={1.8}
                  className="text-zinc-400"
                />
              </div>

              <p className="mt-5 text-sm font-medium text-zinc-500">
                Movimentações no período
              </p>

              <strong className="mt-2 block text-4xl font-semibold tracking-tight text-zinc-100">
                {totalRegisteredTransactions}
              </strong>
            </div>

            <div className="mt-8 flex items-center justify-between border-t border-zinc-900 pt-4 text-sm">
              <span className="text-zinc-500">
                {incomeTransactions.length} receitas
              </span>

              <span className="text-zinc-500">
                {expenseTransactions.length} despesas
              </span>
            </div>
          </FinCardContent>
        </FinCard>
      </section>

      <section className="mt-5 grid gap-5 md:grid-cols-3">
        <FinCard>
          <FinCardContent className="p-5">
            <div className="flex items-start justify-between gap-4">
              <div className="min-w-0">
                <p className="text-sm font-medium text-zinc-500">
                  Receitas
                </p>

                <strong className="mt-3 block wrap-break-word text-2xl font-semibold tracking-tight text-emerald-400">
                  {formatCurrency(totalIncome)}
                </strong>
              </div>

              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-emerald-950/50">
                <TrendingUp
                  size={19}
                  strokeWidth={1.8}
                  className="text-emerald-400"
                />
              </div>
            </div>
          </FinCardContent>
        </FinCard>

        <FinCard>
          <FinCardContent className="p-5">
            <div className="flex items-start justify-between gap-4">
              <div className="min-w-0">
                <p className="text-sm font-medium text-zinc-500">
                  Despesas
                </p>

                <strong className="mt-3 block wrap-break-word text-2xl font-semibold tracking-tight text-red-400">
                  {formatCurrency(totalExpense)}
                </strong>
              </div>

              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-red-950/50">
                <TrendingDown
                  size={19}
                  strokeWidth={1.8}
                  className="text-red-400"
                />
              </div>
            </div>
          </FinCardContent>
        </FinCard>

        <FinCard>
          <FinCardContent className="p-5">
            <div className="flex items-start justify-between gap-4">
              <div className="min-w-0">
                <p className="text-sm font-medium text-zinc-500">
                  Resultado
                </p>

                <strong
                  className={
                    resultIsPositive
                      ? "mt-3 block wrap-break-word text-2xl font-semibold tracking-tight text-emerald-400"
                      : "mt-3 block wrap-break-word text-2xl font-semibold tracking-tight text-red-400"
                  }
                >
                  {formatCurrency(monthResult)}
                </strong>
              </div>

              <div
                className={
                  resultIsPositive
                    ? "flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-emerald-950/50"
                    : "flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-red-950/50"
                }
              >
                {resultIsPositive ? (
                  <ArrowUpRight
                    size={19}
                    strokeWidth={1.8}
                    className="text-emerald-400"
                  />
                ) : (
                  <ArrowDownRight
                    size={19}
                    strokeWidth={1.8}
                    className="text-red-400"
                  />
                )}
              </div>
            </div>
          </FinCardContent>
        </FinCard>
      </section>

      <section className="mt-10">
        <div className="mb-4 flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <h2 className="text-xl font-semibold tracking-tight text-zinc-100">
              Minhas contas
            </h2>

            <p className="mt-1 text-sm text-zinc-500">
              {accounts.length === 1
                ? "1 conta cadastrada"
                : `${accounts.length} contas cadastradas`}
            </p>
          </div>

          <span className="text-sm text-zinc-500">
            Total:{" "}
            <strong
              className={
                totalBalance < 0
                  ? "font-medium text-red-400"
                  : "font-medium text-zinc-200"
              }
            >
              {formatCurrency(totalBalance)}
            </strong>
          </span>
        </div>

        <FinCard>
          {accounts.length === 0 ? (
            <FinCardContent className="px-6 py-12 text-center">
              <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-zinc-900">
                <Landmark
                  size={25}
                  strokeWidth={1.8}
                  className="text-zinc-500"
                />
              </div>

              <h3 className="mt-4 font-semibold text-zinc-100">
                Nenhuma conta cadastrada
              </h3>

              <p className="mx-auto mt-2 max-w-sm text-sm leading-6 text-zinc-500">
                Acesse a página Contas para cadastrar sua primeira conta.
              </p>
            </FinCardContent>
          ) : (
            <div className="divide-y divide-zinc-900">
              {accounts.map((account) => (
                <div
                  key={account.id}
                  className="flex items-center justify-between gap-4 px-4 py-4 transition-colors hover:bg-white/1.5 sm:px-6"
                >
                  <div className="flex min-w-0 items-center gap-3">
                    <div className="flex h-11 w-11 shrink-0 items-center justify-center overflow-hidden rounded-xl bg-white p-2">
                      <img
                        src={account.image}
                        alt={`Logo de ${account.name}`}
                        className="h-full w-full object-contain"
                      />
                    </div>

                    <div className="min-w-0">
                      <h3 className="truncate font-medium text-zinc-200">
                        {account.name}
                      </h3>

                      <p className="mt-1 text-xs text-zinc-600">
                        {account.type === "bank"
                          ? "Conta bancária"
                          : "Carteira"}
                      </p>
                    </div>
                  </div>

                  <strong
                    className={
                      account.balance < 0
                        ? "shrink-0 text-sm font-medium text-red-400 sm:text-base"
                        : "shrink-0 text-sm font-medium text-zinc-200 sm:text-base"
                    }
                  >
                    {formatCurrency(account.balance)}
                  </strong>
                </div>
              ))}
            </div>
          )}
        </FinCard>
      </section>
    </div>
  );
}