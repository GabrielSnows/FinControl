import { useLiveQuery } from "dexie-react-hooks";

import {
  ArrowDownCircle,
  ArrowUpCircle,
  Landmark,
  WalletCards,
} from "lucide-react";

import Card from "../components/Card/Card";
import { db } from "../database/database";

export default function Dashboard() {
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

  function formatCurrency(value: number) {
    return value.toLocaleString("pt-BR", {
      style: "currency",
      currency: "BRL",
    });
  }

  function getCurrentMonthKey() {
    const today = new Date();

    const year = today.getFullYear();
    const month = String(today.getMonth() + 1).padStart(2, "0");

    return `${year}-${month}`;
  }

  function getCurrentMonthName() {
    return new Intl.DateTimeFormat("pt-BR", {
      month: "long",
      year: "numeric",
    }).format(new Date());
  }

  if (dashboardData === undefined) {
    return (
      <div className="flex min-h-64 items-center justify-center text-slate-400">
        Carregando dashboard...
      </div>
    );
  }

  const { accounts, transactions } = dashboardData;

  const currentMonthKey = getCurrentMonthKey();

  const currentMonthTransactions = transactions.filter(
    (transaction) =>
      transaction.date.startsWith(currentMonthKey) &&
      !transaction.isAdjustment,
  );

  const incomeTransactions = currentMonthTransactions.filter(
    (transaction) => transaction.type === "income",
  );

  const expenseTransactions = currentMonthTransactions.filter(
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
      <div className="mb-8">
        <h1 className="text-4xl font-bold">
          Dashboard
        </h1>

        <p className="mt-2 text-slate-400">
          Resumo financeiro de{" "}
          <span className="capitalize">
            {getCurrentMonthName()}
          </span>
          .
        </p>
      </div>

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
        <div className="rounded-2xl border border-slate-700 bg-slate-800 p-5">
          <div className="flex items-center gap-3">
            <div className="rounded-xl bg-emerald-950 p-3 text-emerald-400">
              <ArrowUpCircle size={24} />
            </div>

            <div>
              <p className="text-sm text-slate-400">
                Receitas registradas
              </p>

              <strong className="text-xl">
                {incomeTransactions.length}
              </strong>
            </div>
          </div>
        </div>

        <div className="rounded-2xl border border-slate-700 bg-slate-800 p-5">
          <div className="flex items-center gap-3">
            <div className="rounded-xl bg-red-950 p-3 text-red-400">
              <ArrowDownCircle size={24} />
            </div>

            <div>
              <p className="text-sm text-slate-400">
                Despesas registradas
              </p>

              <strong className="text-xl">
                {expenseTransactions.length}
              </strong>
            </div>
          </div>
        </div>

        <div className="rounded-2xl border border-slate-700 bg-slate-800 p-5">
          <p className="text-sm text-slate-400">
            Resultado do mês
          </p>

          <strong
            className={`mt-2 block text-2xl ${
              monthResult < 0
                ? "text-red-400"
                : "text-emerald-400"
            }`}
          >
            {formatCurrency(monthResult)}
          </strong>
        </div>
      </section>

      <section className="mt-8 rounded-2xl border border-slate-700 bg-slate-800 p-6">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <h2 className="text-xl font-semibold">
              Minhas contas
            </h2>

            <p className="mt-1 text-sm text-slate-400">
              {accounts.length === 1
                ? "1 conta cadastrada"
                : `${accounts.length} contas cadastradas`}
            </p>
          </div>

          <div className="flex items-center gap-2 rounded-xl bg-slate-900 px-4 py-2 text-sm text-slate-300">
            <WalletCards size={18} />

            <span>
              Total: {formatCurrency(totalBalance)}
            </span>
          </div>
        </div>

        {accounts.length === 0 ? (
          <div className="mt-6 rounded-xl border border-dashed border-slate-700 px-6 py-10 text-center">
            <Landmark
              size={42}
              className="mx-auto text-slate-500"
            />

            <h3 className="mt-4 font-semibold">
              Nenhuma conta cadastrada
            </h3>

            <p className="mt-2 text-sm text-slate-400">
              Acesse a página Contas para cadastrar sua primeira conta.
            </p>
          </div>
        ) : (
          <div className="mt-6 divide-y divide-slate-700">
            {accounts.map((account) => (
              <div
                key={account.id}
                className="flex items-center justify-between gap-4 py-4 first:pt-0 last:pb-0"
              >
                <div className="flex min-w-0 items-center gap-4">
                  <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-white p-2">
                    <img
                      src={account.image}
                      alt={account.name}
                      className="h-full w-full object-contain"
                    />
                  </div>

                  <div className="min-w-0">
                    <h3 className="truncate font-medium">
                      {account.name}
                    </h3>

                    <p className="mt-1 text-sm text-slate-400">
                      {account.type === "bank"
                        ? "Banco"
                        : "Carteira"}
                    </p>
                  </div>
                </div>

                <strong
                  className={
                    account.balance < 0
                      ? "shrink-0 text-red-400"
                      : "shrink-0 text-white"
                  }
                >
                  {formatCurrency(account.balance)}
                </strong>
              </div>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}