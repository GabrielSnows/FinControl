import { useState } from "react";
import type { FormEvent } from "react";

import { useLiveQuery } from "dexie-react-hooks";
import {
  Pencil,
  Plus,
  Trash2,
  WalletCards,
} from "lucide-react";

import AlertModal from "../components/AlertModal/AlertModal";
import BankSelect from "../components/BankSelect/BankSelect";
import ConfirmModal from "../components/ConfirmModal/ConfirmModal";
import { db } from "../database/database";
import type { Bank } from "../data/banks";
import FinButton from "../finui/Button/FinButton";
import {
  FinCard,
  FinCardContent,
  FinCardDescription,
  FinCardHeader,
  FinCardTitle,
} from "../finui/Card/FinCard";
import FinInput from "../finui/Input/FinInput";
import FinModal, {
  FinModalContent,
  FinModalDescription,
  FinModalFooter,
  FinModalHeader,
  FinModalTitle,
} from "../finui/Modal/FinModal";
import FinPageHeader from "../finui/PageHeader/FinPageHeader";
import type { AlertType } from "../components/AlertModal/AlertModal";
import type { Account } from "../types/Account";
import type { Transaction } from "../types/Transaction";

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

  const [selectedBank, setSelectedBank] = useState<Bank>();
  const [balance, setBalance] = useState("");

  const [editingAccountId, setEditingAccountId] =
    useState<number | null>(null);

  const [accountToDelete, setAccountToDelete] =
    useState<Account>();

  const [confirmModalOpen, setConfirmModalOpen] =
    useState(false);

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

  function resetAccountForm() {
    setSelectedBank(undefined);
    setBalance("");
    setEditingAccountId(null);
  }

  function openNewAccountModal() {
    resetAccountForm();
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

    setBalance(String(account.balance));
    setAccountModalOpen(true);
  }

  function closeAccountModal() {
    if (saving) return;

    setAccountModalOpen(false);
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

    const numericBalance = parseCurrencyValue(balance);

    if (
      balance.trim() === "" ||
      Number.isNaN(numericBalance)
    ) {
      showAlert(
        "Saldo inválido",
        editingAccountId === null
          ? "Digite um saldo inicial válido para criar a conta."
          : "Digite um saldo válido para atualizar a conta.",
        "warning",
      );

      return;
    }

    try {
      setSaving(true);

      if (editingAccountId !== null) {
        const existingAccount =
          await db.accounts.get(editingAccountId);

        if (!existingAccount) {
          throw new Error("Conta não encontrada.");
        }

        const difference =
          numericBalance - existingAccount.balance;

        await db.transaction(
          "rw",
          db.accounts,
          db.transactions,
          async () => {
            await db.accounts.update(
              editingAccountId,
              {
                bankId: selectedBank.id,
                name: selectedBank.name,
                image: selectedBank.image,
                type: selectedBank.type,
                balance: numericBalance,
              },
            );

            if (difference !== 0) {
              const adjustmentTransaction: Transaction = {
                id: Date.now(),
                accountId: editingAccountId,
                type:
                  difference > 0
                    ? "income"
                    : "expense",
                category: "Ajuste de saldo",
                description: `Saldo corrigido de ${formatCurrency(
                  existingAccount.balance,
                )} para ${formatCurrency(
                  numericBalance,
                )}`,
                amount: Math.abs(difference),
                date: getLocalDate(),
                createdAt: new Date().toISOString(),
                isAdjustment: true,
              };

              await db.transactions.add(
                adjustmentTransaction,
              );
            }
          },
        );
      } else {
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

  function requestDeleteAccount(account: Account) {
    setAccountToDelete(account);
    setConfirmModalOpen(true);
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

      setConfirmModalOpen(false);
    } catch (error) {
      console.error("Erro ao excluir conta:", error);

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

          <div className="grid gap-3 sm:gap-4 md:grid-cols-2 xl:grid-cols-3">
            {accounts.map((account) => {
              const isNegative =
                account.balance < 0;

              return (
                <FinCard
                  key={account.id}
                  variant="interactive"
                  className="group flex min-h-44 flex-col sm:min-h-56"
                >
                  <FinCardHeader className="flex-row items-start justify-between gap-3 sm:gap-4">
                    <div className="flex min-w-0 items-center gap-3 sm:gap-3.5">
                      <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl border border-zinc-800 bg-white p-2 sm:h-13 sm:w-13 sm:rounded-2xl">
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

                    <div className="flex shrink-0 items-center gap-0.5 opacity-80 transition-opacity group-hover:opacity-100">
                      <button
                        type="button"
                        title="Editar conta"
                        aria-label={`Editar ${account.name}`}
                        onClick={() =>
                          openEditAccountModal(
                            account,
                          )
                        }
                        className="flex h-8 w-8 cursor-pointer items-center justify-center rounded-lg text-zinc-500 transition-colors hover:bg-zinc-800 hover:text-zinc-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-zinc-600 sm:h-9 sm:w-9"
                      >
                        <Pencil
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
                        className="flex h-8 w-8 cursor-pointer items-center justify-center rounded-lg text-zinc-500 transition-colors hover:bg-red-950/60 hover:text-red-400 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-900 sm:h-9 sm:w-9"
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
                      className={`mt-2 block text-2xl font-semibold tracking-tight sm:text-3xl ${
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
                </FinCard>
              );
            })}
          </div>
        </section>
      )}

      <FinModal
        open={accountModalOpen}
        onClose={closeAccountModal}
        onClosed={resetAccountForm}
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

            <FinInput
              label={
                editingAccountId === null
                  ? "Saldo inicial"
                  : "Saldo atual"
              }
              type="text"
              inputMode="decimal"
              placeholder="0,00"
              value={balance}
              onChange={(event) =>
                setBalance(event.target.value)
              }
              helperText={
                editingAccountId === null
                  ? "Use vírgula para informar os centavos."
                  : "Caso o saldo seja alterado, o FinControl registrará automaticamente um ajuste no histórico."
              }
            />
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

      <ConfirmModal
        open={confirmModalOpen}
        title="Excluir conta e movimentações"
        message={`Tem certeza de que deseja excluir a conta ${
          accountToDelete?.name ?? ""
        }? Todas as receitas, despesas e ajustes vinculados a ela também serão excluídos. Esta ação não pode ser desfeita.`}
        confirmText="Excluir tudo"
        onConfirm={confirmDeleteAccount}
        onCancel={() => {
          if (!saving) {
            setConfirmModalOpen(false);
          }
        }}
        onClosed={() => {
          setAccountToDelete(undefined);
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