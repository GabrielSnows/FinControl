import { useState } from "react";

import { useLiveQuery } from "dexie-react-hooks";

import {
  ArrowDownLeft,
  ArrowUpRight,
  Pencil,
  Plus,
  ReceiptText,
  Trash2,
} from "lucide-react";

import AlertModal from "../components/AlertModal/AlertModal";
import type { AlertType } from "../components/AlertModal/AlertModal";

import ConfirmModal from "../components/ConfirmModal/ConfirmModal";

import TransactionModal from "../components/TransactionModal/TransactionModal";
import type { TransactionFormData } from "../components/TransactionModal/TransactionModal";

import { db } from "../database/database";

import FinButton from "../finui/Button/FinButton";

import {
  FinCard,
  FinCardContent,
} from "../finui/Card/FinCard";

import FinPageHeader from "../finui/PageHeader/FinPageHeader";

import type {
  Transaction,
  TransactionType,
} from "../types/Transaction";

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

  const [
    editingTransaction,
    setEditingTransaction,
  ] = useState<Transaction | undefined>();

  const [
    transactionToDelete,
    setTransactionToDelete,
  ] = useState<Transaction | undefined>();

  const [alert, setAlert] = useState<AlertData>();
  const [alertOpen, setAlertOpen] = useState(false);

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

    setAlertOpen(true);
  }

  function handleCloseAlert() {
    setAlertOpen(false);
  }

  function clearAlert() {
    setAlert(undefined);
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
            await db.accounts.get(
              formData.accountId,
            );

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

            const oldImpact =
              getBalanceImpact(
                editingTransaction.type,
                editingTransaction.amount,
              );

            await db.accounts.update(
              oldAccount.id,
              {
                balance:
                  oldAccount.balance -
                  oldImpact,
              },
            );

            const updatedDestinationAccount =
              await db.accounts.get(
                formData.accountId,
              );

            if (!updatedDestinationAccount) {
              throw new Error(
                "A nova conta não existe.",
              );
            }

            const newImpact =
              getBalanceImpact(
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
                accountId:
                  formData.accountId,
                type: formData.type,
                category:
                  formData.category,
                description:
                  formData.description,
                amount: formData.amount,
                date: formData.date,
              },
            );

            return;
          }

          const balanceImpact =
            getBalanceImpact(
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
            accountId:
              formData.accountId,
            type: formData.type,
            category:
              formData.category,
            description:
              formData.description,
            amount: formData.amount,
            date: formData.date,
            createdAt:
              new Date().toISOString(),
          };

          await db.transactions.add(
            newTransaction,
          );
        },
      );

      setModalOpen(false);
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
          const account =
            await db.accounts.get(
              transactionToDelete.accountId,
            );

          if (!account) {
            throw new Error(
              "A conta da movimentação não existe.",
            );
          }

          const impact =
            getBalanceImpact(
              transactionToDelete.type,
              transactionToDelete.amount,
            );

          await db.accounts.update(
            account.id,
            {
              balance:
                account.balance -
                impact,
            },
          );

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
    return value.toLocaleString(
      "pt-BR",
      {
        style: "currency",
        currency: "BRL",
      },
    );
  }

  function formatDate(value: string) {
    const [year, month, day] =
      value.split("-");

    if (!year || !month || !day) {
      return value;
    }

    return `${day}/${month}/${year}`;
  }

  function getAccountName(
    accountId: number,
  ) {
    return (
      accounts?.find(
        (account) =>
          account.id === accountId,
      )?.name ?? "Conta removida"
    );
  }

  if (
    accounts === undefined ||
    transactions === undefined
  ) {
    return (
      <div className="flex min-h-64 items-center justify-center">
        <div className="text-center">
          <div className="mx-auto h-7 w-7 animate-spin rounded-full border-2 border-zinc-800 border-t-zinc-300" />

          <p className="mt-3 text-sm text-zinc-500">
            Carregando movimentações...
          </p>
        </div>
      </div>
    );
  }

  return (
    <div>
      <FinPageHeader
        title="Movimentações"
        description="Registre e acompanhe todas as suas receitas e despesas."
        action={
          <div className="grid w-full grid-cols-2 gap-2 sm:flex sm:w-auto">
            <FinButton
              variant="secondary"
              leftIcon={<ArrowUpRight />}
              onClick={() =>
                openNewTransaction(
                  "income",
                )
              }
              className="w-full sm:w-auto"
            >
              Receita
            </FinButton>

            <FinButton
              leftIcon={<Plus />}
              onClick={() =>
                openNewTransaction(
                  "expense",
                )
              }
              className="w-full sm:w-auto"
            >
              Despesa
            </FinButton>
          </div>
        }
      />

      {transactions.length === 0 ? (
        <FinCard>
          <FinCardContent className="px-5 py-12 text-center sm:px-6 sm:py-16">
            <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl border border-zinc-800 bg-zinc-900/70 sm:h-16 sm:w-16">
              <ReceiptText
                size={26}
                strokeWidth={1.7}
                className="text-zinc-400"
              />
            </div>

            <h2 className="mt-5 text-lg font-semibold tracking-tight text-zinc-100">
              Nenhuma movimentação cadastrada
            </h2>

            <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-zinc-500">
              Registre sua primeira receita ou
              despesa para começar a acompanhar
              suas contas.
            </p>

            <div className="mt-7 grid grid-cols-2 gap-2 sm:flex sm:justify-center">
              <FinButton
                variant="secondary"
                leftIcon={<ArrowUpRight />}
                onClick={() =>
                  openNewTransaction(
                    "income",
                  )
                }
              >
                Receita
              </FinButton>

              <FinButton
                leftIcon={<Plus />}
                onClick={() =>
                  openNewTransaction(
                    "expense",
                  )
                }
              >
                Despesa
              </FinButton>
            </div>
          </FinCardContent>
        </FinCard>
      ) : (
        <section>
          <div className="mb-4">
            <h2 className="text-lg font-semibold tracking-tight text-zinc-100">
              Histórico
            </h2>

            <p className="mt-1 text-sm text-zinc-500">
              {transactions.length === 1
                ? "1 movimentação registrada"
                : `${transactions.length} movimentações registradas`}
            </p>
          </div>

          <div className="space-y-3">
            {transactions.map(
              (transaction) => {
                const isIncome =
                  transaction.type ===
                  "income";

                const transactionTitle =
                  transaction.description ||
                  transaction.category;

                return (
                  <FinCard
                    key={transaction.id}
                    className="group transition-colors duration-200 hover:border-zinc-700 hover:bg-zinc-950/90"
                  >
                    <FinCardContent className="p-0">
                      <article className="p-4 sm:flex sm:items-center sm:justify-between sm:gap-5 sm:p-5">
                        <div className="flex items-start justify-between gap-3 sm:min-w-0 sm:flex-1 sm:items-center sm:justify-start">
                          <div className="flex min-w-0 flex-1 items-start gap-3 sm:items-center">
                            <div
                              className={[
                                "flex h-11 w-11 shrink-0 items-center justify-center rounded-xl border sm:h-12 sm:w-12 sm:rounded-2xl",
                                isIncome
                                  ? "border-emerald-900/60 bg-emerald-950/40"
                                  : "border-red-900/60 bg-red-950/40",
                              ].join(" ")}
                            >
                              {isIncome ? (
                                <ArrowUpRight
                                  size={20}
                                  strokeWidth={1.8}
                                  className="text-emerald-400"
                                />
                              ) : (
                                <ArrowDownLeft
                                  size={20}
                                  strokeWidth={1.8}
                                  className="text-red-400"
                                />
                              )}
                            </div>

                            <div className="min-w-0 flex-1">
                              <div className="flex min-w-0 items-center gap-2">
                                <h3 className="min-w-0 flex-1 truncate text-sm font-medium text-zinc-100 sm:text-base">
                                  {
                                    transactionTitle
                                  }
                                </h3>

                                <span
                                  className={[
                                    "hidden shrink-0 rounded-full border px-2 py-0.5 text-[11px] font-medium sm:inline-flex",
                                    isIncome
                                      ? "border-emerald-900/60 bg-emerald-950/30 text-emerald-400"
                                      : "border-red-900/60 bg-red-950/30 text-red-400",
                                  ].join(" ")}
                                >
                                  {isIncome
                                    ? "Receita"
                                    : "Despesa"}
                                </span>
                              </div>

                              <p className="mt-1 truncate text-xs text-zinc-500 sm:text-sm">
                                {
                                  transaction.category
                                }
                              </p>
                            </div>
                          </div>

                          <div className="flex shrink-0 items-center gap-0.5 sm:hidden">
                            <button
                              type="button"
                              aria-label={`Editar ${transactionTitle}`}
                              title="Editar movimentação"
                              onClick={() =>
                                openEditTransaction(
                                  transaction,
                                )
                              }
                              className="flex h-9 w-9 cursor-pointer items-center justify-center rounded-lg text-zinc-500 transition-colors hover:bg-zinc-800 hover:text-zinc-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-zinc-600"
                            >
                              <Pencil
                                size={16}
                                strokeWidth={
                                  1.8
                                }
                              />
                            </button>

                            <button
                              type="button"
                              aria-label={`Excluir ${transactionTitle}`}
                              title="Excluir movimentação"
                              onClick={() =>
                                setTransactionToDelete(
                                  transaction,
                                )
                              }
                              className="flex h-9 w-9 cursor-pointer items-center justify-center rounded-lg text-zinc-500 transition-colors hover:bg-red-950/60 hover:text-red-400 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-900"
                            >
                              <Trash2
                                size={16}
                                strokeWidth={
                                  1.8
                                }
                              />
                            </button>
                          </div>
                        </div>

                        <div className="mt-4 border-t border-zinc-900 pt-3 sm:mt-0 sm:flex sm:shrink-0 sm:items-center sm:gap-4 sm:border-0 sm:pt-0">
                          <div className="flex items-end justify-between gap-4 sm:block sm:text-right">
                            <div className="min-w-0 text-xs text-zinc-500 sm:hidden">
                              <p className="truncate">
                                {getAccountName(
                                  transaction.accountId,
                                )}
                              </p>

                              <time
                                dateTime={
                                  transaction.date
                                }
                                className="mt-1 block"
                              >
                                {formatDate(
                                  transaction.date,
                                )}
                              </time>
                            </div>

                            <div className="hidden text-xs text-zinc-500 sm:block">
                              <p>
                                {getAccountName(
                                  transaction.accountId,
                                )}
                              </p>

                              <time
                                dateTime={
                                  transaction.date
                                }
                                className="mt-1 block"
                              >
                                {formatDate(
                                  transaction.date,
                                )}
                              </time>
                            </div>

                            <strong
                              className={[
                                "shrink-0 text-base font-semibold tracking-tight sm:mt-2 sm:block",
                                isIncome
                                  ? "text-emerald-400"
                                  : "text-red-400",
                              ].join(" ")}
                            >
                              {isIncome
                                ? "+"
                                : "-"}{" "}
                              {formatCurrency(
                                transaction.amount,
                              )}
                            </strong>
                          </div>

                          <div className="hidden shrink-0 items-center gap-0.5 opacity-60 transition-opacity group-hover:opacity-100 sm:flex">
                            <button
                              type="button"
                              aria-label={`Editar ${transactionTitle}`}
                              title="Editar movimentação"
                              onClick={() =>
                                openEditTransaction(
                                  transaction,
                                )
                              }
                              className="flex h-9 w-9 cursor-pointer items-center justify-center rounded-lg text-zinc-500 transition-colors hover:bg-zinc-800 hover:text-zinc-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-zinc-600"
                            >
                              <Pencil
                                size={16}
                                strokeWidth={
                                  1.8
                                }
                              />
                            </button>

                            <button
                              type="button"
                              aria-label={`Excluir ${transactionTitle}`}
                              title="Excluir movimentação"
                              onClick={() =>
                                setTransactionToDelete(
                                  transaction,
                                )
                              }
                              className="flex h-9 w-9 cursor-pointer items-center justify-center rounded-lg text-zinc-500 transition-colors hover:bg-red-950/60 hover:text-red-400 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-900"
                            >
                              <Trash2
                                size={16}
                                strokeWidth={
                                  1.8
                                }
                              />
                            </button>
                          </div>
                        </div>
                      </article>
                    </FinCardContent>
                  </FinCard>
                );
              },
            )}
          </div>
        </section>
      )}

      <TransactionModal
        open={modalOpen}
        type={modalType}
        transaction={editingTransaction}
        accounts={accounts}
        saving={saving}
        onClose={closeModal}
        onSave={saveTransaction}
      />

      <ConfirmModal
        open={
          transactionToDelete !==
          undefined
        }
        title="Excluir movimentação"
        message="Tem certeza que deseja excluir esta movimentação? O saldo da conta será atualizado automaticamente."
        confirmText="Excluir"
        onConfirm={
          confirmDeleteTransaction
        }
        onCancel={() =>
          setTransactionToDelete(
            undefined,
          )
        }
      />

      <AlertModal
        open={alertOpen}
        title={alert?.title ?? ""}
        message={alert?.message ?? ""}
        type={alert?.type}
        onClose={handleCloseAlert}
        onClosed={clearAlert}
      />
    </div>
  );
}