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
  FinCardDescription,
  FinCardFooter,
  FinCardHeader,
  FinCardTitle,
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
            <div className="pointer-events-none absolute -right-20 -top-24 h-56 w-56 rounded-full bg-white/3 blur-2xl" />

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
          <FinCardHeader>
            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-zinc-900">
              <ReceiptText
                size={21}
                strokeWidth={1.8}
                className="text-zinc-400"
              />
            </div>

            <div>
              <FinCardTitle>
                Movimentações
              </FinCardTitle>

              <FinCardDescription>
                Registros no período selecionado.
              </FinCardDescription>
            </div>
          </FinCardHeader>

          <FinCardContent>
            <strong className="block text-4xl font-semibold tracking-tight text-zinc-100">
              {totalRegisteredTransactions}
            </strong>
          </FinCardContent>

          <FinCardFooter className="justify-between text-sm">
            <span className="text-zinc-500">
              {incomeTransactions.length} receitas
            </span>

            <span className="text-zinc-500">
              {expenseTransactions.length} despesas
            </span>
          </FinCardFooter>
        </FinCard>
      </section>

      <section className="mt-5 grid gap-5 md:grid-cols-3">
        <FinCard>
          <FinCardHeader>
            <div>
              <FinCardTitle>
                Receitas
              </FinCardTitle>

              <FinCardDescription>
                Valores recebidos no período.
              </FinCardDescription>
            </div>

            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-emerald-950/50">
              <TrendingUp
                size={19}
                strokeWidth={1.8}
                className="text-emerald-400"
              />
            </div>
          </FinCardHeader>

          <FinCardContent>
            <strong className="block wrap-break-word text-2xl font-semibold tracking-tight text-emerald-400">
              {formatCurrency(totalIncome)}
            </strong>
          </FinCardContent>

          <FinCardFooter>
            <span className="text-sm text-zinc-500">
              {incomeTransactions.length === 1
                ? "1 receita registrada"
                : `${incomeTransactions.length} receitas registradas`}
            </span>
          </FinCardFooter>
        </FinCard>

        <FinCard>
          <FinCardHeader>
            <div>
              <FinCardTitle>
                Despesas
              </FinCardTitle>

              <FinCardDescription>
                Valores gastos no período.
              </FinCardDescription>
            </div>

            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-red-950/50">
              <TrendingDown
                size={19}
                strokeWidth={1.8}
                className="text-red-400"
              />
            </div>
          </FinCardHeader>

          <FinCardContent>
            <strong className="block wrap-break-word text-2xl font-semibold tracking-tight text-red-400">
              {formatCurrency(totalExpense)}
            </strong>
          </FinCardContent>

          <FinCardFooter>
            <span className="text-sm text-zinc-500">
              {expenseTransactions.length === 1
                ? "1 despesa registrada"
                : `${expenseTransactions.length} despesas registradas`}
            </span>
          </FinCardFooter>
        </FinCard>

        <FinCard>
          <FinCardHeader>
            <div>
              <FinCardTitle>
                Resultado
              </FinCardTitle>

              <FinCardDescription>
                Diferença entre receitas e despesas.
              </FinCardDescription>
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
          </FinCardHeader>

          <FinCardContent>
            <strong
              className={
                resultIsPositive
                  ? "block wrap-break-word text-2xl font-semibold tracking-tight text-emerald-400"
                  : "block wrap-break-word text-2xl font-semibold tracking-tight text-red-400"
              }
            >
              {formatCurrency(monthResult)}
            </strong>
          </FinCardContent>

          <FinCardFooter>
            <span className="text-sm text-zinc-500">
              {resultIsPositive
                ? "O período terminou positivo."
                : "As despesas superaram as receitas."}
            </span>
          </FinCardFooter>
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

        {accounts.length === 0 ? (
          <FinCard>
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
          </FinCard>
        ) : (
          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
            {accounts.map((account) => (
              <FinCard
                key={account.id}
                variant="interactive"
              >
                <FinCardHeader>
                  <div className="flex min-w-0 items-center gap-3">
                    <div className="flex h-11 w-11 shrink-0 items-center justify-center overflow-hidden rounded-xl bg-white p-2">
                      <img
                        src={account.image}
                        alt={`Logo de ${account.name}`}
                        className="h-full w-full object-contain"
                      />
                    </div>

                    <div className="min-w-0">
                      <FinCardTitle className="truncate">
                        {account.name}
                      </FinCardTitle>

                      <FinCardDescription>
                        {account.type === "bank"
                          ? "Conta bancária"
                          : "Carteira"}
                      </FinCardDescription>
                    </div>
                  </div>
                </FinCardHeader>

                <FinCardContent>
                  <strong
                    className={
                      account.balance < 0
                        ? "block wrap-break-word text-2xl font-semibold tracking-tight text-red-400"
                        : "block wrap-break-word text-2xl font-semibold tracking-tight text-zinc-100"
                    }
                  >
                    {formatCurrency(account.balance)}
                  </strong>
                </FinCardContent>

                <FinCardFooter>
                  <span className="text-sm text-zinc-500">
                    Saldo disponível
                  </span>
                </FinCardFooter>
              </FinCard>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}