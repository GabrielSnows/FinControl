import { useState } from "react";
import { useLiveQuery } from "dexie-react-hooks";

import {
  ArrowDownCircle,
  ArrowUpCircle,
  Pencil,
  Receipt,
  Trash2,
} from "lucide-react";

import TransactionModal from "../components/TransactionModal/TransactionModal";
import ConfirmModal from "../components/ConfirmModal/ConfirmModal";
import AlertModal from "../components/AlertModal/AlertModal";

import { db } from "../database/database";

import type {
  Transaction,
  TransactionType,
} from "../types/Transaction";

import type { TransactionFormData } from "../components/TransactionModal/TransactionModal";
import type { AlertType } from "../components/AlertModal/AlertModal";

type AlertData = {
  title: string;
  message: string;
  type: AlertType;
};

export default function Transactions() {
  const accounts = useLiveQuery(
    () => db.accounts.toArray(),
    [],
  );

  const transactions = useLiveQuery(
    () =>
      db.transactions
        .orderBy("createdAt")
        .reverse()
        .toArray(),
    [],
  );

  const [modalOpen, setModalOpen] = useState(false);

  const [modalType, setModalType] =
    useState<TransactionType>("expense");

  const [editingTransaction, setEditingTransaction] =
    useState<Transaction>();

  const [transactionToDelete, setTransactionToDelete] =
    useState<Transaction>();

  const [alert, setAlert] = useState<AlertData>();
  const [saving, setSaving] = useState(false);

  function showAlert(
    title: string,
    message: string,
    alertType: AlertType = "error",
  ) {
    setAlert({
      title,
      message,
      type: alertType,
    });
  }

  function openNewTransaction(
    type: TransactionType,
  ) {
    setEditingTransaction(undefined);
    setModalType(type);
    setModalOpen(true);
  }

  function openEditTransaction(
    transaction: Transaction,
  ) {
    setEditingTransaction(transaction);
    setModalType(transaction.type);
    setModalOpen(true);
  }

  function closeModal() {
    if (saving) return;

    setModalOpen(false);
    setEditingTransaction(undefined);
  }

  function getBalanceImpact(
    type: TransactionType,
    amount: number,
  ) {
    return type === "income"
      ? amount
      : -amount;
  }

  async function saveTransaction(
    formData: TransactionFormData,
  ) {
    try {
      setSaving(true);

      await db.transaction(
        "rw",
        db.accounts,
        db.transactions,
        async () => {
          const selectedAccount =
            await db.accounts.get(formData.accountId);

          if (!selectedAccount) {
            throw new Error(
              "A conta selecionada não existe.",
            );
          }

          if (editingTransaction) {
            const oldAccount =
              await db.accounts.get(
                editingTransaction.accountId,
              );

            if (!oldAccount) {
              throw new Error(
                "A conta original não existe.",
              );
            }

            const oldImpact = getBalanceImpact(
              editingTransaction.type,
              editingTransaction.amount,
            );

            await db.accounts.update(oldAccount.id, {
              balance: oldAccount.balance - oldImpact,
            });

            const updatedDestinationAccount =
              await db.accounts.get(formData.accountId);

            if (!updatedDestinationAccount) {
              throw new Error(
                "A nova conta não existe.",
              );
            }

            const newImpact = getBalanceImpact(
              formData.type,
              formData.amount,
            );

            await db.accounts.update(
              updatedDestinationAccount.id,
              {
                balance:
                  updatedDestinationAccount.balance +
                  newImpact,
              },
            );

            await db.transactions.update(
              editingTransaction.id,
              {
                accountId: formData.accountId,
                type: formData.type,
                category: formData.category,
                description: formData.description,
                amount: formData.amount,
                date: formData.date,
              },
            );

            return;
          }

          const balanceImpact = getBalanceImpact(
            formData.type,
            formData.amount,
          );

          await db.accounts.update(
            selectedAccount.id,
            {
              balance:
                selectedAccount.balance +
                balanceImpact,
            },
          );

          const newTransaction: Transaction = {
            id: Date.now(),
            accountId: formData.accountId,
            type: formData.type,
            category: formData.category,
            description: formData.description,
            amount: formData.amount,
            date: formData.date,
            createdAt: new Date().toISOString(),
          };

          await db.transactions.add(newTransaction);
        },
      );

      setModalOpen(false);
      setEditingTransaction(undefined);
    } catch (error) {
      console.error(
        "Erro ao salvar movimentação:",
        error,
      );

      showAlert(
        "Não foi possível salvar",
        "Ocorreu um erro ao salvar a movimentação. Tente novamente.",
      );
    } finally {
      setSaving(false);
    }
  }

  async function confirmDeleteTransaction() {
    if (!transactionToDelete) return;

    try {
      await db.transaction(
        "rw",
        db.accounts,
        db.transactions,
        async () => {
          const account = await db.accounts.get(
            transactionToDelete.accountId,
          );

          if (!account) {
            throw new Error(
              "A conta da movimentação não existe.",
            );
          }

          const impact = getBalanceImpact(
            transactionToDelete.type,
            transactionToDelete.amount,
          );

          await db.accounts.update(account.id, {
            balance: account.balance - impact,
          });

          await db.transactions.delete(
            transactionToDelete.id,
          );
        },
      );

      setTransactionToDelete(undefined);
    } catch (error) {
      console.error(
        "Erro ao excluir movimentação:",
        error,
      );

      setTransactionToDelete(undefined);

      showAlert(
        "Não foi possível excluir",
        "Ocorreu um erro ao excluir a movimentação. Tente novamente.",
      );
    }
  }

  function formatCurrency(value: number) {
    return value.toLocaleString("pt-BR", {
      style: "currency",
      currency: "BRL",
    });
  }

  function formatDate(value: string) {
    const [year, month, day] = value.split("-");

    return `${day}/${month}/${year}`;
  }

  function getAccountName(accountId: number) {
    return (
      accounts?.find(
        (account) => account.id === accountId,
      )?.name ?? "Conta removida"
    );
  }

  if (
    accounts === undefined ||
    transactions === undefined
  ) {
    return (
      <div className="flex min-h-64 items-center justify-center text-slate-400">
        Carregando movimentações...
      </div>
    );
  }

  return (
    <div>
      <div className="mb-8 flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-4xl font-bold">
            Movimentações
          </h1>

          <p className="mt-2 text-slate-400">
            Registre todas as suas receitas e despesas.
          </p>
        </div>

        <div className="flex flex-wrap gap-3">
          <button
            type="button"
            onClick={() =>
              openNewTransaction("income")
            }
            className="flex cursor-pointer items-center gap-2 rounded-xl bg-emerald-600 px-5 py-3 font-medium text-white transition hover:bg-emerald-700"
          >
            <ArrowUpCircle size={20} />
            Receita
          </button>

          <button
            type="button"
            onClick={() =>
              openNewTransaction("expense")
            }
            className="flex cursor-pointer items-center gap-2 rounded-xl bg-red-600 px-5 py-3 font-medium text-white transition hover:bg-red-700"
          >
            <ArrowDownCircle size={20} />
            Despesa
          </button>
        </div>
      </div>

      {transactions.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-slate-700 bg-slate-800/60 px-6 py-16 text-center">
          <Receipt
            size={50}
            className="mx-auto text-slate-500"
          />

          <h2 className="mt-5 text-xl font-semibold">
            Nenhuma movimentação cadastrada
          </h2>

          <p className="mt-2 text-slate-400">
            Cadastre sua primeira receita ou despesa.
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {transactions.map((transaction) => (
            <article
              key={transaction.id}
              className="flex flex-wrap items-center justify-between gap-4 rounded-2xl border border-slate-700 bg-slate-800 p-5"
            >
              <div className="flex min-w-0 items-center gap-4">
                <div
                  className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-xl ${
                    transaction.type === "income"
                      ? "bg-emerald-950 text-emerald-400"
                      : "bg-red-950 text-red-400"
                  }`}
                >
                  {transaction.type === "income" ? (
                    <ArrowUpCircle size={24} />
                  ) : (
                    <ArrowDownCircle size={24} />
                  )}
                </div>

                <div className="min-w-0">
                  <h2 className="truncate font-semibold">
                    {transaction.description ||
                      transaction.category}
                  </h2>

                  <p className="mt-1 text-sm text-slate-400">
                    {transaction.category}
                    {" • "}
                    {getAccountName(
                      transaction.accountId,
                    )}
                    {" • "}
                    {formatDate(transaction.date)}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-4">
                <strong
                  className={
                    transaction.type === "income"
                      ? "text-emerald-400"
                      : "text-red-400"
                  }
                >
                  {transaction.type === "income"
                    ? "+"
                    : "-"}
                  {formatCurrency(transaction.amount)}
                </strong>

                <div className="flex gap-1">
                  <button
                    type="button"
                    onClick={() =>
                      openEditTransaction(transaction)
                    }
                    aria-label="Editar movimentação"
                    className="cursor-pointer rounded-lg p-2 text-slate-400 transition hover:bg-slate-700 hover:text-white"
                  >
                    <Pencil size={18} />
                  </button>

                  <button
                    type="button"
                    onClick={() =>
                      setTransactionToDelete(transaction)
                    }
                    aria-label="Excluir movimentação"
                    className="cursor-pointer rounded-lg p-2 text-slate-400 transition hover:bg-red-950 hover:text-red-400"
                  >
                    <Trash2 size={18} />
                  </button>
                </div>
              </div>
            </article>
          ))}
        </div>
      )}

      <TransactionModal
        open={modalOpen}
        type={modalType}
        accounts={accounts}
        transaction={editingTransaction}
        saving={saving}
        onClose={closeModal}
        onSave={saveTransaction}
      />

      <ConfirmModal
        open={Boolean(transactionToDelete)}
        title="Excluir movimentação"
        message={`Tem certeza de que deseja excluir "${
          transactionToDelete?.description ||
          transactionToDelete?.category ||
          ""
        }"? O saldo da conta será corrigido automaticamente.`}
        confirmText="Excluir movimentação"
        onConfirm={confirmDeleteTransaction}
        onCancel={() =>
          setTransactionToDelete(undefined)
        }
      />

      <AlertModal
        open={Boolean(alert)}
        title={alert?.title ?? ""}
        message={alert?.message ?? ""}
        type={alert?.type}
        onClose={() => setAlert(undefined)}
      />
    </div>
  );
}