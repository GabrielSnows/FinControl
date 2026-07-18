import { useMemo, useState } from "react";

import { useLiveQuery } from "dexie-react-hooks";

import {
  ArrowDownCircle,
  ArrowUpCircle,
  Landmark,
  WalletCards,
} from "lucide-react";

import Card from "../components/Card/Card";
import FinStatCard from "../components/FinStatCard/FinStatCard";
import { db } from "../database/database";
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
      <div className="flex min-h-64 items-center justify-center text-slate-400">
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
      <header className="mb-8 flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight sm:text-4xl">
            Dashboard
          </h1>

          <p className="mt-2 text-slate-400">
            Seu resumo financeiro do período selecionado.
          </p>
        </div>

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
      </header>

      <div className="grid gap-5 lg:grid-cols-3">
        <Card
          title="Saldo total"
          value={formatCurrency(totalBalance)}
          color={
            totalBalance < 0
              ? "text-red-400"
              : "text-white"
          }
        />

        <Card
          title="Receitas do mês"
          value={formatCurrency(totalIncome)}
          color="text-emerald-400"
        />

        <Card
          title="Despesas do mês"
          value={formatCurrency(totalExpense)}
          color="text-red-400"
        />
      </div>

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

      <section className="mt-8 rounded-2xl border border-slate-800 bg-slate-900/60 p-4 sm:p-6">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h2 className="text-xl font-semibold text-white">
              Minhas contas
            </h2>

            <p className="mt-1 text-sm text-slate-400">
              {accounts.length === 1
                ? "1 conta cadastrada"
                : `${accounts.length} contas cadastradas`}
            </p>
          </div>

          <div className="flex w-fit items-center gap-2 rounded-xl border border-slate-800 bg-slate-950/70 px-4 py-2.5">
            <WalletCards
              size={18}
              className="text-slate-400"
            />

            <span className="text-sm text-slate-400">
              Saldo total
            </span>

            <strong
              className={
                totalBalance < 0
                  ? "text-sm text-red-400"
                  : "text-sm text-white"
              }
            >
              {formatCurrency(totalBalance)}
            </strong>
          </div>
        </div>

        {accounts.length === 0 ? (
          <div className="mt-6 rounded-2xl border border-dashed border-slate-700 bg-slate-950/30 px-5 py-10 text-center">
            <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-slate-800">
              <Landmark
                size={26}
                className="text-slate-400"
              />
            </div>

            <h3 className="mt-4 font-semibold text-white">
              Nenhuma conta cadastrada
            </h3>

            <p className="mx-auto mt-2 max-w-sm text-sm leading-6 text-slate-400">
              Acesse a página Contas para cadastrar sua primeira conta.
            </p>
          </div>
        ) : (
          <div className="mt-6 grid gap-3 md:grid-cols-2 xl:grid-cols-3">
            {accounts.map((account) => (
              <article
                key={account.id}
                className="group flex min-w-0 items-center justify-between gap-4 rounded-2xl border border-slate-800 bg-slate-950/40 p-4 transition-colors hover:border-slate-700 hover:bg-slate-950/70"
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
                    <h3 className="truncate font-medium text-white">
                      {account.name}
                    </h3>

                    <span className="mt-1 inline-flex rounded-full bg-slate-800 px-2 py-0.5 text-xs text-slate-400">
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
                      : "shrink-0 text-sm text-white sm:text-base"
                  }
                >
                  {formatCurrency(account.balance)}
                </strong>
              </article>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}