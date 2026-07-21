import { useState } from "react";

import { useLiveQuery } from "dexie-react-hooks";
import { CreditCard as CreditCardIcon, Landmark, Plus } from "lucide-react";

import AccountCard from "../components/accounts/AccountCard";
import AccountModal from "../components/accounts/AccountModal";
import CreditCardCard from "../components/accounts/CreditCardCard";
import CreditCardModal from "../components/accounts/CreditCardModal";
import AlertModal from "../components/AlertModal/AlertModal";
import type { AlertType } from "../components/AlertModal/AlertModal";
import ConfirmModal from "../components/ConfirmModal/ConfirmModal";
import { db } from "../database/database";
import FinButton from "../finui/Button/FinButton";
import { FinCard, FinCardContent } from "../finui/Card/FinCard";
import FinPageHeader from "../finui/PageHeader/FinPageHeader";
import type { Account } from "../types/Account";
import type { CreditCard } from "../types/CreditCard";

type AlertData = {
  title: string;
  message: string;
  type: AlertType;
};

type DeleteTarget =
  | { type: "account"; item: Account }
  | { type: "creditCard"; item: CreditCard };

export default function Accounts() {
  const accounts = useLiveQuery(
    () => db.accounts.orderBy("createdAt").reverse().toArray(),
    [],
  );

  const creditCards = useLiveQuery(
    () => db.creditCards.orderBy("createdAt").reverse().toArray(),
    [],
  );

  const [accountModalOpen, setAccountModalOpen] = useState(false);
  const [creditCardModalOpen, setCreditCardModalOpen] = useState(false);
  const [editingAccount, setEditingAccount] = useState<Account>();
  const [editingCreditCard, setEditingCreditCard] =
    useState<CreditCard>();
  const [deleteTarget, setDeleteTarget] = useState<DeleteTarget>();
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [alert, setAlert] = useState<AlertData>();
  const [alertOpen, setAlertOpen] = useState(false);

  function showError(title: string, message: string) {
    setAlert({ title, message, type: "error" });
    setAlertOpen(true);
  }

  function openNewAccount() {
    setEditingAccount(undefined);
    setAccountModalOpen(true);
  }

  function openNewCreditCard() {
    setEditingCreditCard(undefined);
    setCreditCardModalOpen(true);
  }

  function openEditAccount(account: Account) {
    setEditingAccount(account);
    setAccountModalOpen(true);
  }

  function openEditCreditCard(creditCard: CreditCard) {
    setEditingCreditCard(creditCard);
    setCreditCardModalOpen(true);
  }

  function requestDelete(target: DeleteTarget) {
    setDeleteTarget(target);
    setDeleteModalOpen(true);
  }

  async function confirmDelete() {
    if (!deleteTarget) return;

    try {
      setDeleting(true);

      if (deleteTarget.type === "account") {
        await db.transaction(
          "rw",
          db.accounts,
          db.transactions,
          async () => {
            await db.transactions
              .where("accountId")
              .equals(deleteTarget.item.id)
              .delete();
            await db.accounts.delete(deleteTarget.item.id);
          },
        );
      } else {
        await db.creditCards.delete(deleteTarget.item.id);
      }

      setDeleteModalOpen(false);
    } catch (error) {
      console.error("Erro ao excluir registro:", error);
      showError(
        "Não foi possível excluir",
        deleteTarget.type === "account"
          ? "Ocorreu um erro ao excluir a conta e suas movimentações. Tente novamente."
          : "Ocorreu um erro ao excluir o cartão. Tente novamente.",
      );
    } finally {
      setDeleting(false);
    }
  }

  if (accounts === undefined || creditCards === undefined) {
    return (
      <div className="flex min-h-64 items-center justify-center">
        <div className="text-center">
          <div className="mx-auto h-7 w-7 animate-spin rounded-full border-2 border-zinc-800 border-t-zinc-300" />
          <p className="mt-3 text-sm text-zinc-500">
            Carregando contas e cartões...
          </p>
        </div>
      </div>
    );
  }

  return (
    <div>
      <FinPageHeader
        title="Contas"
        description="Gerencie suas contas, carteiras e cartões de crédito."
      />

      <div className="space-y-10">
        <section>
          <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <h2 className="text-lg font-semibold tracking-tight text-zinc-100">
                Contas
              </h2>
              <p className="mt-1 text-sm text-zinc-500">
                {accounts.length === 1
                  ? "1 conta cadastrada"
                  : `${accounts.length} contas cadastradas`}
              </p>
            </div>

            <FinButton leftIcon={<Plus />} onClick={openNewAccount}>
              Nova conta
            </FinButton>
          </div>

          {accounts.length === 0 ? (
            <FinCard>
              <FinCardContent className="px-6 py-10 text-center">
                <Landmark
                  size={27}
                  strokeWidth={1.7}
                  className="mx-auto text-zinc-500"
                />
                <p className="mt-3 text-sm text-zinc-500">
                  Nenhuma conta cadastrada.
                </p>
              </FinCardContent>
            </FinCard>
          ) : (
            <div className="grid gap-3 sm:gap-4 md:grid-cols-2 xl:grid-cols-3">
              {accounts.map((account) => (
                <AccountCard
                  key={account.id}
                  account={account}
                  onEdit={openEditAccount}
                  onDelete={(item) =>
                    requestDelete({ type: "account", item })
                  }
                />
              ))}
            </div>
          )}
        </section>

        <section>
          <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <h2 className="text-lg font-semibold tracking-tight text-zinc-100">
                Cartões de crédito
              </h2>
              <p className="mt-1 text-sm text-zinc-500">
                {creditCards.length === 1
                  ? "1 cartão cadastrado"
                  : `${creditCards.length} cartões cadastrados`}
              </p>
            </div>

            <FinButton leftIcon={<Plus />} onClick={openNewCreditCard}>
              Novo cartão
            </FinButton>
          </div>

          {creditCards.length === 0 ? (
            <FinCard>
              <FinCardContent className="px-6 py-10 text-center">
                <CreditCardIcon
                  size={27}
                  strokeWidth={1.7}
                  className="mx-auto text-zinc-500"
                />
                <p className="mt-3 text-sm text-zinc-500">
                  Nenhum cartão de crédito cadastrado.
                </p>
              </FinCardContent>
            </FinCard>
          ) : (
            <div className="grid gap-3 sm:gap-4 md:grid-cols-2 xl:grid-cols-3">
              {creditCards.map((creditCard) => (
                <CreditCardCard
                  key={creditCard.id}
                  creditCard={creditCard}
                  onEdit={openEditCreditCard}
                  onDelete={(item) =>
                    requestDelete({ type: "creditCard", item })
                  }
                />
              ))}
            </div>
          )}
        </section>
      </div>

      <AccountModal
        open={accountModalOpen}
        account={editingAccount}
        onClose={() => setAccountModalOpen(false)}
        onSaved={() => setAccountModalOpen(false)}
        onError={showError}
      />

      <CreditCardModal
        open={creditCardModalOpen}
        creditCard={editingCreditCard}
        onClose={() => setCreditCardModalOpen(false)}
        onSaved={() => setCreditCardModalOpen(false)}
        onError={showError}
      />

      <ConfirmModal
        open={deleteModalOpen}
        title={
          deleteTarget?.type === "account"
            ? "Excluir conta e movimentações"
            : "Excluir cartão"
        }
        message={
          deleteTarget?.type === "account"
            ? `Tem certeza de que deseja excluir a conta ${
                deleteTarget.item.name
              }? Todas as movimentações vinculadas também serão excluídas.`
            : `Tem certeza de que deseja excluir o cartão ${
                deleteTarget?.item.name ?? ""
              }? Esta ação não pode ser desfeita.`
        }
        confirmText={deleting ? "Excluindo..." : "Excluir"}
        cancelText="Cancelar"
        danger
        onConfirm={confirmDelete}
        onCancel={() => setDeleteModalOpen(false)}
        onClosed={() => setDeleteTarget(undefined)}
      />

      <AlertModal
        open={alertOpen}
        title={alert?.title ?? ""}
        message={alert?.message ?? ""}
        type={alert?.type}
        onClose={() => setAlertOpen(false)}
        onClosed={() => setAlert(undefined)}
      />
    </div>
  );
}
