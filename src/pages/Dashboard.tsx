import { useMemo, useState } from "react";

import { useLiveQuery } from "dexie-react-hooks";

import {
  ArrowDownCircle,
  ArrowUpCircle,
  Landmark,
  TrendingDown,
  TrendingUp,
  Wallet,
  WalletCards,
} from "lucide-react";

import FinStatCard from "../components/FinStatCard/FinStatCard";
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

  return (
    <div>
      <FinPageHeader
        title="Dashboard"
        description="Seu resumo financeiro do período selecionado."
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

      <section className="grid gap-5 lg:grid-cols-3">
        <FinCard>
          <FinCardContent>
            <div className="flex items-start justify-between gap-4">
              <div className="min-w-0">
                <p className="text-sm font-medium text-zinc-500">
                  Saldo total
                </p>

                <strong
                  className={
                    totalBalance < 0
                      ? "mt-3 block truncate text-2xl font-semibold tracking-tight text-red-400 sm:text-3xl"
                      : "mt-3 block truncate text-2xl font-semibold tracking-tight text-zinc-100 sm:text-3xl"
                  }
                >
                  {formatCurrency(totalBalance)}
                </strong>
              </div>

              <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-zinc-900">
                <Wallet
                  size={21}
                  strokeWidth={1.8}
                  className="text-zinc-400"
                />
              </div>
            </div>
          </FinCardContent>
        </FinCard>

        <FinCard>
          <FinCardContent>
            <div className="flex items-start justify-between gap-4">
              <div className="min-w-0">
                <p className="text-sm font-medium text-zinc-500">
                  Receitas do mês
                </p>

                <strong className="mt-3 block truncate text-2xl font-semibold tracking-tight text-emerald-400 sm:text-3xl">
                  {formatCurrency(totalIncome)}
                </strong>
              </div>

              <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-emerald-950/60">
                <TrendingUp
                  size={21}
                  strokeWidth={1.8}
                  className="text-emerald-400"
                />
              </div>
            </div>
          </FinCardContent>
        </FinCard>

        <FinCard>
          <FinCardContent>
            <div className="flex items-start justify-between gap-4">
              <div className="min-w-0">
                <p className="text-sm font-medium text-zinc-500">
                  Despesas do mês
                </p>

                <strong className="mt-3 block truncate text-2xl font-semibold tracking-tight text-red-400 sm:text-3xl">
                  {formatCurrency(totalExpense)}
                </strong>
              </div>

              <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-red-950/60">
                <TrendingDown
                  size={21}
                  strokeWidth={1.8}
                  className="text-red-400"
                />
              </div>
            </div>
          </FinCardContent>
        </FinCard>
      </section>

      <section className="mt-8 grid gap-5 md:grid-cols-3">
        <FinStatCard
          title="Receitas registradas"
          value={incomeTransactions.length}
          icon={ArrowUpCircle}
          iconBackgroundClassName="bg-emerald-950"
          iconColorClassName="text-emerald-400"
        />

        <FinStatCard
          title="Despesas registradas"
          value={expenseTransactions.length}
          icon={ArrowDownCircle}
          iconBackgroundClassName="bg-red-950"
          iconColorClassName="text-red-400"
        />

        <FinStatCard
          title="Resultado do mês"
          value={formatCurrency(monthResult)}
          valueClassName={
            monthResult < 0
              ? "text-red-400"
              : "text-emerald-400"
          }
        />
      </section>

      <section className="mt-8 rounded-2xl border border-zinc-800 bg-[#111113] p-4 sm:p-6">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h2 className="text-xl font-semibold text-zinc-100">
              Minhas contas
            </h2>

            <p className="mt-1 text-sm text-zinc-500">
              {accounts.length === 1
                ? "1 conta cadastrada"
                : `${accounts.length} contas cadastradas`}
            </p>
          </div>

          <div className="flex w-fit items-center gap-2 rounded-xl border border-zinc-800 bg-[#0d0d0f] px-4 py-2.5">
            <WalletCards
              size={18}
              className="text-zinc-500"
            />

            <span className="text-sm text-zinc-500">
              Saldo total
            </span>

            <strong
              className={
                totalBalance < 0
                  ? "text-sm text-red-400"
                  : "text-sm text-zinc-100"
              }
            >
              {formatCurrency(totalBalance)}
            </strong>
          </div>
        </div>

        {accounts.length === 0 ? (
          <div className="mt-6 rounded-2xl border border-dashed border-zinc-800 bg-[#0d0d0f] px-5 py-10 text-center">
            <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-zinc-900">
              <Landmark
                size={26}
                className="text-zinc-500"
              />
            </div>

            <h3 className="mt-4 font-semibold text-zinc-100">
              Nenhuma conta cadastrada
            </h3>

            <p className="mx-auto mt-2 max-w-sm text-sm leading-6 text-zinc-500">
              Acesse a página Contas para cadastrar sua primeira conta.
            </p>
          </div>
        ) : (
          <div className="mt-6 grid gap-3 md:grid-cols-2 xl:grid-cols-3">
            {accounts.map((account) => (
              <FinCard
                key={account.id}
                variant="interactive"
                className="flex min-w-0 items-center justify-between gap-4 p-4"
              >
                <div className="flex min-w-0 items-center gap-3">
                  <div className="flex h-12 w-12 shrink-0 items-center justify-center overflow-hidden rounded-xl bg-white p-2">
                    <img
                      src={account.image}
                      alt={`Logo de ${account.name}`}
                      className="h-full w-full object-contain"
                    />
                  </div>

                  <div className="min-w-0">
                    <h3 className="truncate font-medium text-zinc-100">
                      {account.name}
                    </h3>

                    <span className="mt-1 inline-flex rounded-full bg-zinc-900 px-2 py-0.5 text-xs text-zinc-500">
                      {account.type === "bank"
                        ? "Banco"
                        : "Carteira"}
                    </span>
                  </div>
                </div>

                <strong
                  className={
                    account.balance < 0
                      ? "shrink-0 text-sm text-red-400 sm:text-base"
                      : "shrink-0 text-sm text-zinc-100 sm:text-base"
                  }
                >
                  {formatCurrency(account.balance)}
                </strong>
              </FinCard>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}