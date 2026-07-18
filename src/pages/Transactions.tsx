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

            if (
              !updatedDestinationAccount
            ) {
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

          const newTransaction: Transaction =
            {
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
      <div className="flex min-h-64 items-center justify-center text-zinc-500">
        Carregando movimentações...
      </div>
    );
  }

  return (
    <div>
      <FinPageHeader
        title="Movimentações"
        description="Registre e acompanhe todas as suas receitas e despesas."
        action={
          <div className="flex w-full flex-col gap-2 sm:w-auto sm:flex-row">
            <FinButton
              variant="secondary"
              leftIcon={
                <ArrowUpRight />
              }
              onClick={() =>
                openNewTransaction(
                  "income",
                )
              }
              className="w-full sm:w-auto"
            >
              Nova receita
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
              Nova despesa
            </FinButton>
          </div>
        }
      />

      {transactions.length === 0 ? (
        <FinCard>
          <FinCardContent className="px-6 py-14 text-center">
            <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-zinc-900">
              <ReceiptText
                size={25}
                strokeWidth={1.8}
                className="text-zinc-500"
              />
            </div>

            <h2 className="mt-4 font-semibold text-zinc-100">
              Nenhuma movimentação
              cadastrada
            </h2>

            <p className="mx-auto mt-2 max-w-sm text-sm leading-6 text-zinc-500">
              Cadastre sua primeira
              receita ou despesa para
              começar a acompanhar suas
              finanças.
            </p>

            <div className="mt-6 flex flex-col justify-center gap-2 sm:flex-row">
              <FinButton
                variant="secondary"
                leftIcon={
                  <ArrowUpRight />
                }
                onClick={() =>
                  openNewTransaction(
                    "income",
                  )
                }
              >
                Nova receita
              </FinButton>

              <FinButton
                leftIcon={<Plus />}
                onClick={() =>
                  openNewTransaction(
                    "expense",
                  )
                }
              >
                Nova despesa
              </FinButton>
            </div>
          </FinCardContent>
        </FinCard>
      ) : (
        <section>
          <div className="mb-4 flex items-end justify-between gap-4">
            <div>
              <h2 className="text-lg font-semibold tracking-tight text-zinc-100">
                Histórico
              </h2>

              <p className="mt-1 text-sm text-zinc-500">
                {transactions.length === 1
                  ? "1 movimentação registrada"
                  : `${transactions.length} movimentações registradas`}
              </p>
            </div>
          </div>

          <FinCard>
            <div className="divide-y divide-zinc-900">
              {transactions.map(
                (transaction) => {
                  const isIncome =
                    transaction.type ===
                    "income";

                  const transactionTitle =
                    transaction.description ||
                    transaction.category;

                  return (
                    <article
                      key={
                        transaction.id
                      }
                      className="group flex flex-col gap-4 px-4 py-4 transition-colors hover:bg-white/1.5 sm:flex-row sm:items-center sm:justify-between sm:px-6"
                    >
                      <div className="flex min-w-0 items-start gap-3 sm:items-center">
                        <div
                          className={
                            isIncome
                              ? "flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-emerald-950/50"
                              : "flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-red-950/50"
                          }
                        >
                          {isIncome ? (
                            <ArrowUpRight
                              size={20}
                              strokeWidth={
                                1.8
                              }
                              className="text-emerald-400"
                            />
                          ) : (
                            <ArrowDownLeft
                              size={20}
                              strokeWidth={
                                1.8
                              }
                              className="text-red-400"
                            />
                          )}
                        </div>

                        <div className="min-w-0">
                          <h3 className="truncate font-medium text-zinc-200">
                            {
                              transactionTitle
                            }
                          </h3>

                          <div className="mt-1 flex flex-wrap items-center gap-x-2 gap-y-1 text-xs text-zinc-600">
                            <span>
                              {
                                transaction.category
                              }
                            </span>

                            <span
                              aria-hidden="true"
                              className="text-zinc-800"
                            >
                              •
                            </span>

                            <span>
                              {getAccountName(
                                transaction.accountId,
                              )}
                            </span>

                            <span
                              aria-hidden="true"
                              className="text-zinc-800"
                            >
                              •
                            </span>

                            <time
                              dateTime={
                                transaction.date
                              }
                            >
                              {formatDate(
                                transaction.date,
                              )}
                            </time>
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center justify-between gap-3 pl-14 sm:justify-end sm:pl-0">
                        <strong
                          className={
                            isIncome
                              ? "wrap-break-word text-sm font-semibold text-emerald-400 sm:text-base"
                              : "wrap-break-word text-sm font-semibold text-red-400 sm:text-base"
                          }
                        >
                          {isIncome
                            ? "+"
                            : "-"}{" "}
                          {formatCurrency(
                            transaction.amount,
                          )}
                        </strong>

                        <div className="flex shrink-0 items-center">
                          <button
                            type="button"
                            aria-label={`Editar ${transactionTitle}`}
                            onClick={() =>
                              openEditTransaction(
                                transaction,
                              )
                            }
                            className="flex h-9 w-9 cursor-pointer items-center justify-center rounded-lg text-zinc-600 transition hover:bg-zinc-900 hover:text-zinc-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-zinc-600"
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
                            onClick={() =>
                              setTransactionToDelete(
                                transaction,
                              )
                            }
                            className="flex h-9 w-9 cursor-pointer items-center justify-center rounded-lg text-zinc-600 transition hover:bg-red-950/60 hover:text-red-400 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-900"
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
                  );
                },
              )}
            </div>
          </FinCard>
        </section>
      )}

      <TransactionModal
        open={modalOpen}
        type={modalType}
        transaction={
          editingTransaction
        }
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
      />    
    </div>
  );
}