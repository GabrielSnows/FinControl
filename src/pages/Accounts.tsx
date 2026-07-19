import { useState } from "react";
import type { FormEvent } from "react";
import { useLiveQuery } from "dexie-react-hooks";
import {
  Pencil,
  Plus,
  Scale,
  Trash2,
  WalletCards,
} from "lucide-react";

import BankSelect from "../components/BankSelect/BankSelect";
import ConfirmModal from "../components/ConfirmModal/ConfirmModal";
import AlertModal from "../components/AlertModal/AlertModal";

import FinButton from "../finui/Button/FinButton";
import FinInput from "../finui/Input/FinInput";
import FinPageHeader from "../finui/PageHeader/FinPageHeader";

import {
  FinCard,
  FinCardContent,
  FinCardDescription,
  FinCardFooter,
  FinCardHeader,
  FinCardTitle,
} from "../finui/Card/FinCard";

import FinModal, {
  FinModalContent,
  FinModalDescription,
  FinModalFooter,
  FinModalHeader,
  FinModalTitle,
} from "../finui/Modal/FinModal";

import { db } from "../database/database";

import type { Account } from "../types/Account";
import type { Transaction } from "../types/Transaction";
import type { Bank } from "../data/banks";
import type { AlertType } from "../components/AlertModal/AlertModal";

type AlertData = {
  title: string;
  message: string;
  type: AlertType;
};

function getLocalDate() {
  const today = new Date();

  const year = today.getFullYear();
  const month = String(today.getMonth() + 1).padStart(2, "0");
  const day = String(today.getDate()).padStart(2, "0");

  return `${year}-${month}-${day}`;
}

function parseCurrencyValue(value: string) {
  const normalizedValue = value
    .trim()
    .replace(/\./g, "")
    .replace(",", ".");

  return Number(normalizedValue);
}

function formatCurrency(value: number) {
  return value.toLocaleString("pt-BR", {
    style: "currency",
    currency: "BRL",
  });
}

export default function Accounts() {
  const accounts = useLiveQuery(
    () =>
      db.accounts
        .orderBy("createdAt")
        .reverse()
        .toArray(),
    [],
  );

  const [accountModalOpen, setAccountModalOpen] = useState(false);
  const [adjustmentModalOpen, setAdjustmentModalOpen] =
    useState(false);

  const [selectedBank, setSelectedBank] = useState<Bank>();
  const [balance, setBalance] = useState("");

  const [editingAccountId, setEditingAccountId] =
    useState<number | null>(null);

  const [adjustingAccount, setAdjustingAccount] =
    useState<Account>();

  const [accountToDelete, setAccountToDelete] =
    useState<Account>();

  const [adjustedBalance, setAdjustedBalance] =
    useState("");

  const [alert, setAlert] = useState<AlertData>();
  const [alertOpen, setAlertOpen] = useState(false);

  const [saving, setSaving] = useState(false);

  function showAlert(
    title: string,
    message: string,
    type: AlertType = "info",
  ) {
    setAlert({
      title,
      message,
      type,
    });

    setAlertOpen(true);
  }

  function closeAlert() {
    setAlertOpen(false);
  }

  function openNewAccountModal() {
    setEditingAccountId(null);
    setSelectedBank(undefined);
    setBalance("");
    setAccountModalOpen(true);
  }

  function openEditAccountModal(account: Account) {
    setEditingAccountId(account.id);

    setSelectedBank({
      id: account.bankId,
      name: account.name,
      image: account.image,
      type: account.type,
    });

    setBalance("");
    setAccountModalOpen(true);
  }

  function closeAccountModal() {
    if (saving) return;

    setAccountModalOpen(false);
    setSelectedBank(undefined);
    setBalance("");
    setEditingAccountId(null);
  }

  function openAdjustmentModal(account: Account) {
    setAdjustingAccount(account);
    setAdjustedBalance(String(account.balance));
    setAdjustmentModalOpen(true);
  }

  function closeAdjustmentModal() {
    if (saving) return;

    setAdjustmentModalOpen(false);
    setAdjustingAccount(undefined);
    setAdjustedBalance("");
  }

  async function saveAccount(
    event: FormEvent<HTMLFormElement>,
  ) {
    event.preventDefault();

    if (!selectedBank) {
      showAlert(
        "Banco não selecionado",
        "Selecione um banco ou carteira antes de salvar a conta.",
        "warning",
      );

      return;
    }

    try {
      setSaving(true);

      if (editingAccountId !== null) {
        await db.accounts.update(editingAccountId, {
          bankId: selectedBank.id,
          name: selectedBank.name,
          image: selectedBank.image,
          type: selectedBank.type,
        });
      } else {
        const numericBalance =
          parseCurrencyValue(balance);

        if (
          balance.trim() === "" ||
          Number.isNaN(numericBalance)
        ) {
          showAlert(
            "Saldo inválido",
            "Digite um saldo inicial válido para criar a conta.",
            "warning",
          );

          return;
        }

        const newAccount: Account = {
          id: Date.now(),
          bankId: selectedBank.id,
          name: selectedBank.name,
          image: selectedBank.image,
          type: selectedBank.type,
          balance: numericBalance,
          createdAt: new Date().toISOString(),
        };

        await db.accounts.add(newAccount);
      }

      setAccountModalOpen(false);
      setSelectedBank(undefined);
      setBalance("");
      setEditingAccountId(null);
    } catch (error) {
      console.error("Erro ao salvar conta:", error);

      showAlert(
        "Não foi possível salvar",
        "Ocorreu um erro ao salvar a conta. Tente novamente.",
        "error",
      );
    } finally {
      setSaving(false);
    }
  }

  async function saveBalanceAdjustment(
    event: FormEvent<HTMLFormElement>,
  ) {
    event.preventDefault();

    if (!adjustingAccount) return;

    const newBalance =
      parseCurrencyValue(adjustedBalance);

    if (
      adjustedBalance.trim() === "" ||
      Number.isNaN(newBalance)
    ) {
      showAlert(
        "Saldo inválido",
        "Digite um saldo válido para realizar o ajuste.",
        "warning",
      );

      return;
    }

    const difference =
      newBalance - adjustingAccount.balance;

    if (difference === 0) {
      closeAdjustmentModal();
      return;
    }

    try {
      setSaving(true);

      await db.transaction(
        "rw",
        db.accounts,
        db.transactions,
        async () => {
          await db.accounts.update(
            adjustingAccount.id,
            {
              balance: newBalance,
            },
          );

          const adjustmentTransaction: Transaction = {
            id: Date.now(),
            accountId: adjustingAccount.id,
            type:
              difference > 0
                ? "income"
                : "expense",
            category: "Ajuste de saldo",
            description: `Saldo corrigido de ${formatCurrency(
              adjustingAccount.balance,
            )} para ${formatCurrency(newBalance)}`,
            amount: Math.abs(difference),
            date: getLocalDate(),
            createdAt: new Date().toISOString(),
            isAdjustment: true,
          };

          await db.transactions.add(
            adjustmentTransaction,
          );
        },
      );

      setAdjustmentModalOpen(false);
      setAdjustingAccount(undefined);
      setAdjustedBalance("");
    } catch (error) {
      console.error(
        "Erro ao ajustar saldo:",
        error,
      );

      showAlert(
        "Não foi possível ajustar",
        "Ocorreu um erro ao ajustar o saldo da conta. Tente novamente.",
        "error",
      );
    } finally {
      setSaving(false);
    }
  }

  function requestDeleteAccount(account: Account) {
    setAccountToDelete(account);
  }

  async function confirmDeleteAccount() {
    if (!accountToDelete) return;

    try {
      setSaving(true);

      await db.transaction(
        "rw",
        db.accounts,
        db.transactions,
        async () => {
          await db.transactions
            .where("accountId")
            .equals(accountToDelete.id)
            .delete();

          await db.accounts.delete(accountToDelete.id);
        },
      );

      setAccountToDelete(undefined);
    } catch (error) {
      console.error("Erro ao excluir conta:", error);

      setAccountToDelete(undefined);

      showAlert(
        "Não foi possível excluir",
        "Ocorreu um erro ao excluir a conta e suas movimentações. Tente novamente.",
        "error",
      );
    } finally {
      setSaving(false);
    }
  }

  if (accounts === undefined) {
    return (
      <div className="flex min-h-64 items-center justify-center">
        <div className="text-center">
          <div className="mx-auto h-7 w-7 animate-spin rounded-full border-2 border-zinc-800 border-t-zinc-300" />

          <p className="mt-3 text-sm text-zinc-500">
            Carregando contas...
          </p>
        </div>
      </div>
    );
  }

  return (
    <div>
      <FinPageHeader
        title="Contas"
        description="Gerencie seus bancos, carteiras digitais e dinheiro."
        action={
          <FinButton
            leftIcon={<Plus />}
            onClick={openNewAccountModal}
          >
            Nova conta
          </FinButton>
        }
      />

      {accounts.length === 0 ? (
        <FinCard>
          <FinCardContent className="px-6 py-16 text-center">
            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl border border-zinc-800 bg-zinc-900/70">
              <WalletCards
                size={27}
                strokeWidth={1.7}
                className="text-zinc-400"
              />
            </div>

            <h2 className="mt-5 text-lg font-semibold tracking-tight text-zinc-100">
              Nenhuma conta cadastrada
            </h2>

            <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-zinc-500">
              Cadastre sua primeira conta para
              começar a controlar seus saldos e
              registrar suas movimentações.
            </p>

            <FinButton
              className="mt-7"
              leftIcon={<Plus />}
              onClick={openNewAccountModal}
            >
              Criar primeira conta
            </FinButton>
          </FinCardContent>
        </FinCard>
      ) : (
        <section>
          <div className="mb-4">
            <h2 className="text-lg font-semibold tracking-tight text-zinc-100">
              Suas contas
            </h2>

            <p className="mt-1 text-sm text-zinc-500">
              {accounts.length === 1
                ? "1 conta cadastrada"
                : `${accounts.length} contas cadastradas`}
            </p>
          </div>

          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
            {accounts.map((account) => {
              const isNegative =
                account.balance < 0;

              return (
                <FinCard
                  key={account.id}
                  variant="interactive"
                  className="group flex min-h-60 flex-col"
                >
                  <FinCardHeader className="flex-row items-start justify-between gap-4">
                    <div className="flex min-w-0 items-center gap-3.5">
                      <div className="flex h-13 w-13 shrink-0 items-center justify-center rounded-2xl border border-zinc-800 bg-white p-2">
                        <img
                          src={account.image}
                          alt=""
                          className="h-full w-full object-contain"
                        />
                      </div>

                      <div className="min-w-0">
                        <FinCardTitle className="truncate text-base">
                          {account.name}
                        </FinCardTitle>

                        <FinCardDescription className="mt-1">
                          {account.type === "bank"
                            ? "Conta bancária"
                            : "Carteira"}
                        </FinCardDescription>
                      </div>
                    </div>

                    <div className="flex shrink-0 items-center gap-0.5 opacity-70 transition-opacity group-hover:opacity-100">
                      <button
                        type="button"
                        title="Editar conta"
                        aria-label={`Editar ${account.name}`}
                        onClick={() =>
                          openEditAccountModal(
                            account,
                          )
                        }
                        className="flex h-9 w-9 cursor-pointer items-center justify-center rounded-lg text-zinc-500 transition-colors hover:bg-zinc-800 hover:text-zinc-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-zinc-600"
                      >
                        <Pencil
                          size={16}
                          strokeWidth={1.8}
                        />
                      </button>

                      <button
                        type="button"
                        title="Ajustar saldo"
                        aria-label={`Ajustar saldo de ${account.name}`}
                        onClick={() =>
                          openAdjustmentModal(
                            account,
                          )
                        }
                        className="flex h-9 w-9 cursor-pointer items-center justify-center rounded-lg text-zinc-500 transition-colors hover:bg-amber-950/60 hover:text-amber-400 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-900"
                      >
                        <Scale
                          size={16}
                          strokeWidth={1.8}
                        />
                      </button>

                      <button
                        type="button"
                        title="Excluir conta"
                        aria-label={`Excluir ${account.name}`}
                        onClick={() =>
                          requestDeleteAccount(
                            account,
                          )
                        }
                        className="flex h-9 w-9 cursor-pointer items-center justify-center rounded-lg text-zinc-500 transition-colors hover:bg-red-950/60 hover:text-red-400 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-900"
                      >
                        <Trash2
                          size={16}
                          strokeWidth={1.8}
                        />
                      </button>
                    </div>
                  </FinCardHeader>

                  <FinCardContent className="mt-auto">
                    <p className="text-xs font-medium uppercase tracking-[0.12em] text-zinc-600">
                      Saldo disponível
                    </p>

                    <strong
                      className={`mt-2 block text-2xl font-semibold tracking-tight ${
                        isNegative
                          ? "text-red-400"
                          : "text-zinc-100"
                      }`}
                    >
                      {formatCurrency(
                        account.balance,
                      )}
                    </strong>
                  </FinCardContent>

                  <FinCardFooter className="border-t border-zinc-900">
                    <button
                      type="button"
                      onClick={() =>
                        openAdjustmentModal(account)
                      }
                      className="flex cursor-pointer items-center gap-2 text-xs font-medium text-zinc-500 transition-colors hover:text-zinc-200"
                    >
                      <Scale
                        size={14}
                        strokeWidth={1.8}
                      />

                      Corrigir saldo
                    </button>
                  </FinCardFooter>
                </FinCard>
              );
            })}
          </div>
        </section>
      )}

      <FinModal
        open={accountModalOpen}
        onClose={closeAccountModal}
        size="md"
        closeOnOverlayClick={!saving}
        closeOnEscape={!saving}
      >
        <form onSubmit={saveAccount}>
          <FinModalHeader>
            <FinModalTitle>
              {editingAccountId === null
                ? "Nova conta"
                : "Editar conta"}
            </FinModalTitle>

            <FinModalDescription>
              {editingAccountId === null
                ? "Selecione o banco ou carteira e informe o saldo inicial."
                : "Altere o banco ou carteira exibido nesta conta."}
            </FinModalDescription>
          </FinModalHeader>

          <FinModalContent className="space-y-5">
            <div>
              <p className="mb-2.5 text-sm font-medium text-zinc-300">
                Banco ou carteira
              </p>

              <BankSelect
                value={selectedBank}
                onChange={setSelectedBank}
              />
            </div>

            {editingAccountId === null ? (
              <FinInput
                label="Saldo inicial"
                type="text"
                inputMode="decimal"
                placeholder="0,00"
                value={balance}
                onChange={(event) =>
                  setBalance(event.target.value)
                }
                helperText="Use vírgula para informar os centavos."
              />
            ) : (
              <div className="rounded-xl border border-zinc-800 bg-zinc-900/60 p-4">
                <div className="flex items-start gap-3">
                  <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border border-zinc-800 bg-zinc-950">
                    <Scale
                      size={16}
                      strokeWidth={1.8}
                      className="text-zinc-500"
                    />
                  </div>

                  <p className="text-sm leading-6 text-zinc-500">
                    Para corrigir o valor
                    disponível, salve as alterações
                    e use a opção{" "}
                    <strong className="font-medium text-zinc-300">
                      Ajustar saldo
                    </strong>{" "}
                    no card da conta.
                  </p>
                </div>
              </div>
            )}
          </FinModalContent>

          <FinModalFooter>
            <FinButton
              variant="secondary"
              onClick={closeAccountModal}
              disabled={saving}
            >
              Cancelar
            </FinButton>

            <FinButton
              type="submit"
              disabled={!selectedBank}
              loading={saving}
            >
              {editingAccountId === null
                ? "Salvar conta"
                : "Salvar alterações"}
            </FinButton>
          </FinModalFooter>
        </form>
      </FinModal>

      <FinModal
        open={adjustmentModalOpen}
        onClose={closeAdjustmentModal}
        size="sm"
        closeOnOverlayClick={!saving}
        closeOnEscape={!saving}
      >
        <form onSubmit={saveBalanceAdjustment}>
          <FinModalHeader>
            <FinModalTitle>
              Ajustar saldo
            </FinModalTitle>

            <FinModalDescription>
              Corrija o saldo disponível sem
              apagar o histórico da conta.
            </FinModalDescription>
          </FinModalHeader>

          <FinModalContent className="space-y-5">
            {adjustingAccount && (
              <div className="rounded-xl border border-zinc-800 bg-zinc-900/60 p-4">
                <div className="flex items-center gap-3">
                  <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl border border-zinc-800 bg-white p-2">
                    <img
                      src={adjustingAccount.image}
                      alt=""
                      className="h-full w-full object-contain"
                    />
                  </div>

                  <div className="min-w-0">
                    <p className="truncate text-sm font-medium text-zinc-200">
                      {adjustingAccount.name}
                    </p>

                    <p className="mt-0.5 text-xs text-zinc-500">
                      Saldo registrado atualmente
                    </p>
                  </div>
                </div>

                <strong
                  className={`mt-4 block text-xl font-semibold tracking-tight ${
                    adjustingAccount.balance < 0
                      ? "text-red-400"
                      : "text-zinc-100"
                  }`}
                >
                  {formatCurrency(
                    adjustingAccount.balance,
                  )}
                </strong>
              </div>
            )}

            <FinInput
              label="Novo saldo atual"
              type="text"
              inputMode="decimal"
              placeholder="0,00"
              value={adjustedBalance}
              onChange={(event) =>
                setAdjustedBalance(
                  event.target.value,
                )
              }
            />

            <p className="text-sm leading-6 text-zinc-500">
              A diferença será registrada
              automaticamente no histórico como
              uma receita ou despesa de ajuste.
            </p>
          </FinModalContent>

          <FinModalFooter>
            <FinButton
              variant="secondary"
              onClick={closeAdjustmentModal}
              disabled={saving}
            >
              Cancelar
            </FinButton>

            <FinButton
              type="submit"
              loading={saving}
            >
              Confirmar ajuste
            </FinButton>
          </FinModalFooter>
        </form>
      </FinModal>

      <ConfirmModal
        open={Boolean(accountToDelete)}
        title="Excluir conta e movimentações"
        message={`Tem certeza de que deseja excluir a conta ${
          accountToDelete?.name ?? ""
        }? Todas as receitas, despesas e ajustes vinculados a ela também serão excluídos. Esta ação não pode ser desfeita.`}
        confirmText="Excluir tudo"
        onConfirm={confirmDeleteAccount}
        onCancel={() => {
          if (!saving) {
            setAccountToDelete(undefined);
          }
        }}
      />
      
      <AlertModal
        open={alertOpen}
        title={alert?.title ?? ""}
        message={alert?.message ?? ""}
        type={alert?.type}
        onClose={closeAlert}
      />
    </div>
  );
}