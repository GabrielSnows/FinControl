import { useState } from "react";
import type { FormEvent } from "react";

import { useLiveQuery } from "dexie-react-hooks";

import {
  CalendarDays,
  CheckCircle2,
  CircleDollarSign,
  Pencil,
  Plus,
  ReceiptText,
  RotateCcw,
  Trash2,
} from "lucide-react";

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

import type { Debt } from "../types/Debt";
import type { AlertType } from "../components/AlertModal/AlertModal";

type AlertData = {
  title: string;
  message: string;
  type: AlertType;
};

function formatCurrency(value: number) {
  return value.toLocaleString("pt-BR", {
    style: "currency",
    currency: "BRL",
  });
}

function formatDate(value: string) {
  if (!value) return "Sem vencimento";

  const [year, month, day] = value.split("-");

  if (!year || !month || !day) {
    return "Sem vencimento";
  }

  return `${day}/${month}/${year}`;
}

function parseCurrencyValue(value: string) {
  const normalizedValue = value
    .trim()
    .replace(/\./g, "")
    .replace(",", ".");

  return Number(normalizedValue);
}

export default function Debts() {
  const debts = useLiveQuery(
    () =>
      db.debts
        .orderBy("createdAt")
        .reverse()
        .toArray(),
    [],
  );

  const [debtModalOpen, setDebtModalOpen] =
    useState(false);

  const [editingDebtId, setEditingDebtId] =
    useState<number | null>(null);

  const [debtToDelete, setDebtToDelete] =
    useState<Debt>();

  const [deleteModalOpen, setDeleteModalOpen] =
    useState(false);

  const [creditor, setCreditor] = useState("");
  const [description, setDescription] = useState("");
  const [amount, setAmount] = useState("");
  const [dueDate, setDueDate] = useState("");

  const [alert, setAlert] = useState<AlertData>();
  const [alertOpen, setAlertOpen] = useState(false);

  const [saving, setSaving] = useState(false);

  function showAlert(
    title: string,
    message: string,
    type: AlertType = "warning",
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

  function clearAlert() {
    setAlert(undefined);
  }

  function resetDebtForm() {
    setEditingDebtId(null);
    setCreditor("");
    setDescription("");
    setAmount("");
    setDueDate("");
  }

  function openNewDebtModal() {
    resetDebtForm();
    setDebtModalOpen(true);
  }

  function openEditDebtModal(debt: Debt) {
    setEditingDebtId(debt.id);
    setCreditor(debt.creditor);
    setDescription(debt.description);
    setAmount(String(debt.amount));
    setDueDate(debt.dueDate);
    setDebtModalOpen(true);
  }

  function closeDebtModal() {
    if (saving) return;

    setDebtModalOpen(false);
  }

  function requestDeleteDebt(debt: Debt) {
    setDebtToDelete(debt);
    setDeleteModalOpen(true);
  }

  function cancelDeleteDebt() {
    if (saving) return;

    setDeleteModalOpen(false);
  }

  function clearDebtToDelete() {
    setDebtToDelete(undefined);
  }

  async function saveDebt(
    event: FormEvent<HTMLFormElement>,
  ) {
    event.preventDefault();

    const normalizedCreditor = creditor.trim();
    const normalizedDescription =
      description.trim();

    if (!normalizedCreditor) {
      showAlert(
        "Credor não informado",
        "Informe para quem você deve.",
      );

      return;
    }

    if (!normalizedDescription) {
      showAlert(
        "Descrição não informada",
        "Informe uma descrição para a dívida.",
      );

      return;
    }

    const numericAmount =
      parseCurrencyValue(amount);

    if (
      amount.trim() === "" ||
      Number.isNaN(numericAmount) ||
      numericAmount <= 0
    ) {
      showAlert(
        "Valor inválido",
        "Digite um valor maior que zero.",
      );

      return;
    }

    try {
      setSaving(true);

      if (editingDebtId !== null) {
        await db.debts.update(editingDebtId, {
          creditor: normalizedCreditor,
          description: normalizedDescription,
          amount: numericAmount,
          dueDate,
        });
      } else {
        const newDebt: Debt = {
          id: Date.now(),
          creditor: normalizedCreditor,
          description: normalizedDescription,
          amount: numericAmount,
          dueDate,
          paid: false,
          createdAt: new Date().toISOString(),
        };

        await db.debts.add(newDebt);
      }

      setDebtModalOpen(false);
    } catch (error) {
      console.error(
        "Erro ao salvar dívida:",
        error,
      );

      showAlert(
        "Não foi possível salvar",
        "Ocorreu um erro ao salvar a dívida. Tente novamente.",
        "error",
      );
    } finally {
      setSaving(false);
    }
  }

  async function toggleDebtStatus(debt: Debt) {
    try {
      await db.debts.update(debt.id, {
        paid: !debt.paid,
      });
    } catch (error) {
      console.error(
        "Erro ao alterar status da dívida:",
        error,
      );

      showAlert(
        "Não foi possível alterar",
        "Ocorreu um erro ao alterar o status da dívida.",
        "error",
      );
    }
  }

  async function confirmDeleteDebt() {
    if (!debtToDelete || saving) return;

    try {
      setSaving(true);

      await db.debts.delete(debtToDelete.id);

      setDeleteModalOpen(false);
    } catch (error) {
      console.error(
        "Erro ao excluir dívida:",
        error,
      );

      setDeleteModalOpen(false);

      showAlert(
        "Não foi possível excluir",
        "Ocorreu um erro ao excluir a dívida. Tente novamente.",
        "error",
      );
    } finally {
      setSaving(false);
    }
  }

  if (debts === undefined) {
    return (
      <div className="flex min-h-64 items-center justify-center">
        <div className="text-center">
          <div className="mx-auto h-7 w-7 animate-spin rounded-full border-2 border-zinc-800 border-t-zinc-300" />

          <p className="mt-3 text-sm text-zinc-500">
            Carregando dívidas...
          </p>
        </div>
      </div>
    );
  }

  const openDebts = debts.filter(
    (debt) => !debt.paid,
  );

  const paidDebts = debts.filter(
    (debt) => debt.paid,
  );

  const totalOpen = openDebts.reduce(
    (total, debt) => total + debt.amount,
    0,
  );

  const totalPaid = paidDebts.reduce(
    (total, debt) => total + debt.amount,
    0,
  );

  return (
    <div>
      <FinPageHeader
        title="Dívidas"
        description="Acompanhe seus compromissos financeiros em aberto e quitados."
        action={
          <FinButton
            leftIcon={<Plus />}
            onClick={openNewDebtModal}
          >
            Nova dívida
          </FinButton>
        }
      />

      <div className="mb-8 grid gap-4 md:grid-cols-3">
        <SummaryCard
          label="Total em aberto"
          value={formatCurrency(totalOpen)}
          description="Valor que ainda precisa ser quitado"
          valueClassName="text-red-400"
        />

        <SummaryCard
          label="Dívidas em aberto"
          value={String(openDebts.length)}
          description={
            openDebts.length === 1
              ? "1 compromisso pendente"
              : `${openDebts.length} compromissos pendentes`
          }
        />

        <SummaryCard
          label="Total já quitado"
          value={formatCurrency(totalPaid)}
          description="Valor dos compromissos concluídos"
          valueClassName="text-emerald-400"
        />
      </div>

      {debts.length === 0 ? (
        <FinCard>
          <FinCardContent className="px-6 py-16 text-center">
            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl border border-zinc-800 bg-zinc-900/70">
              <CircleDollarSign
                size={27}
                strokeWidth={1.7}
                className="text-zinc-400"
              />
            </div>

            <h2 className="mt-5 text-lg font-semibold tracking-tight text-zinc-100">
              Nenhuma dívida cadastrada
            </h2>

            <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-zinc-500">
              Cadastre seus compromissos financeiros
              para acompanhar o que ainda precisa ser
              quitado.
            </p>

            <FinButton
              className="mt-7"
              leftIcon={<Plus />}
              onClick={openNewDebtModal}
            >
              Criar primeira dívida
            </FinButton>
          </FinCardContent>
        </FinCard>
      ) : (
        <div className="space-y-10">
          <section>
            <div className="mb-4">
              <h2 className="text-lg font-semibold tracking-tight text-zinc-100">
                Em aberto
              </h2>

              <p className="mt-1 text-sm text-zinc-500">
                {openDebts.length === 1
                  ? "1 dívida ainda precisa ser quitada"
                  : `${openDebts.length} dívidas ainda precisam ser quitadas`}
              </p>
            </div>

            {openDebts.length === 0 ? (
              <FinCard>
                <FinCardContent className="px-6 py-10 text-center">
                  <CheckCircle2
                    size={26}
                    strokeWidth={1.7}
                    className="mx-auto text-zinc-500"
                  />

                  <p className="mt-3 text-sm text-zinc-500">
                    Você não possui dívidas em aberto.
                  </p>
                </FinCardContent>
              </FinCard>
            ) : (
              <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
                {openDebts.map((debt) => (
                  <DebtCard
                    key={debt.id}
                    debt={debt}
                    onEdit={openEditDebtModal}
                    onToggleStatus={toggleDebtStatus}
                    onDelete={requestDeleteDebt}
                  />
                ))}
              </div>
            )}
          </section>

          {paidDebts.length > 0 && (
            <section>
              <div className="mb-4">
                <h2 className="text-lg font-semibold tracking-tight text-zinc-100">
                  Quitadas
                </h2>

                <p className="mt-1 text-sm text-zinc-500">
                  {paidDebts.length === 1
                    ? "1 dívida foi concluída"
                    : `${paidDebts.length} dívidas foram concluídas`}
                </p>
              </div>

              <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
                {paidDebts.map((debt) => (
                  <DebtCard
                    key={debt.id}
                    debt={debt}
                    onEdit={openEditDebtModal}
                    onToggleStatus={toggleDebtStatus}
                    onDelete={requestDeleteDebt}
                  />
                ))}
              </div>
            </section>
          )}
        </div>
      )}

      <FinModal
        open={debtModalOpen}
        onClose={closeDebtModal}
        onClosed={resetDebtForm}
        size="md"
        closeOnOverlayClick={!saving}
        closeOnEscape={!saving}
      >
        <form onSubmit={saveDebt}>
          <FinModalHeader>
            <FinModalTitle>
              {editingDebtId === null
                ? "Nova dívida"
                : "Editar dívida"}
            </FinModalTitle>

            <FinModalDescription>
              {editingDebtId === null
                ? "Informe os dados do compromisso financeiro que deseja acompanhar."
                : "Altere as informações cadastradas nesta dívida."}
            </FinModalDescription>
          </FinModalHeader>

          <FinModalContent className="space-y-5">
            <FinInput
              label="Credor"
              type="text"
              placeholder="Ex.: Inter, Itaú ou MEI"
              value={creditor}
              onChange={(event) =>
                setCreditor(event.target.value)
              }
            />

            <FinInput
              label="Descrição"
              type="text"
              placeholder="Ex.: Acordo bancário"
              value={description}
              onChange={(event) =>
                setDescription(event.target.value)
              }
            />

            <FinInput
              label="Valor total"
              type="text"
              inputMode="decimal"
              placeholder="0,00"
              value={amount}
              onChange={(event) =>
                setAmount(event.target.value)
              }
              helperText="Informe o valor completo da dívida."
            />

            <FinInput
              label="Data de vencimento"
              type="date"
              value={dueDate}
              onChange={(event) =>
                setDueDate(event.target.value)
              }
              helperText="O vencimento é opcional."
            />
          </FinModalContent>

          <FinModalFooter>
            <FinButton
              variant="secondary"
              onClick={closeDebtModal}
              disabled={saving}
            >
              Cancelar
            </FinButton>

            <FinButton
              type="submit"
              loading={saving}
            >
              {editingDebtId === null
                ? "Salvar dívida"
                : "Salvar alterações"}
            </FinButton>
          </FinModalFooter>
        </form>
      </FinModal>

      <ConfirmModal
        open={deleteModalOpen}
        title="Excluir dívida"
        message={`Tem certeza de que deseja excluir a dívida "${
          debtToDelete?.description ?? ""
        }" de ${
          debtToDelete?.creditor ?? ""
        }? Esta ação não pode ser desfeita.`}
        confirmText={
          saving
            ? "Excluindo..."
            : "Excluir dívida"
        }
        cancelText="Cancelar"
        danger
        onConfirm={confirmDeleteDebt}
        onCancel={cancelDeleteDebt}
        onClosed={clearDebtToDelete}
      />

      <AlertModal
        open={alertOpen}
        title={alert?.title ?? ""}
        message={alert?.message ?? ""}
        type={alert?.type}
        onClose={closeAlert}
        onClosed={clearAlert}
      />
    </div>
  );
}

type SummaryCardProps = {
  label: string;
  value: string;
  description: string;
  valueClassName?: string;
};

function SummaryCard({
  label,
  value,
  description,
  valueClassName = "text-zinc-100",
}: SummaryCardProps) {
  return (
    <FinCard>
      <FinCardContent className="p-5">
        <p className="text-xs font-medium uppercase tracking-[0.12em] text-zinc-600">
          {label}
        </p>

        <strong
          className={`mt-2 block text-2xl font-semibold tracking-tight ${valueClassName}`}
        >
          {value}
        </strong>

        <p className="mt-2 text-sm text-zinc-500">
          {description}
        </p>
      </FinCardContent>
    </FinCard>
  );
}

type DebtCardProps = {
  debt: Debt;
  onEdit: (debt: Debt) => void;
  onToggleStatus: (debt: Debt) => void;
  onDelete: (debt: Debt) => void;
};

function DebtCard({
  debt,
  onEdit,
  onToggleStatus,
  onDelete,
}: DebtCardProps) {
  return (
    <FinCard
      variant="interactive"
      className={[
        "group flex min-h-72 flex-col",
        debt.paid
          ? "border-emerald-950/80 bg-emerald-950/10"
          : "",
      ].join(" ")}
    >
      <FinCardHeader className="flex-row items-start justify-between gap-4">
        <div className="flex min-w-0 items-center gap-3.5">
          <div
            className={[
              "flex h-11 w-11 shrink-0 items-center justify-center rounded-xl border",
              debt.paid
                ? "border-emerald-900/50 bg-emerald-950/40 text-emerald-400"
                : "border-zinc-800 bg-zinc-900 text-zinc-400",
            ].join(" ")}
          >
            {debt.paid ? (
              <CheckCircle2
                size={20}
                strokeWidth={1.8}
              />
            ) : (
              <ReceiptText
                size={20}
                strokeWidth={1.8}
              />
            )}
          </div>

          <div className="min-w-0">
            <FinCardTitle className="truncate text-base">
              {debt.creditor}
            </FinCardTitle>

            <FinCardDescription className="mt-1 truncate">
              {debt.description}
            </FinCardDescription>
          </div>
        </div>

        <div className="flex shrink-0 items-center gap-0.5 opacity-70 transition-opacity group-hover:opacity-100">
          <button
            type="button"
            title="Editar dívida"
            aria-label={`Editar dívida ${debt.description}`}
            onClick={() => onEdit(debt)}
            className="flex h-9 w-9 cursor-pointer items-center justify-center rounded-lg text-zinc-500 transition-colors hover:bg-zinc-800 hover:text-zinc-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-zinc-600"
          >
            <Pencil
              size={16}
              strokeWidth={1.8}
            />
          </button>

          <button
            type="button"
            title="Excluir dívida"
            aria-label={`Excluir dívida ${debt.description}`}
            onClick={() => onDelete(debt)}
            className="flex h-9 w-9 cursor-pointer items-center justify-center rounded-lg text-zinc-500 transition-colors hover:bg-red-950/60 hover:text-red-400 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-900"
          >
            <Trash2
              size={16}
              strokeWidth={1.8}
            />
          </button>
        </div>
      </FinCardHeader>

      <FinCardContent className="flex-1">
        <p className="text-xs font-medium uppercase tracking-[0.12em] text-zinc-600">
          Valor total
        </p>

        <strong
          className={[
            "mt-2 block text-2xl font-semibold tracking-tight",
            debt.paid
              ? "text-emerald-400"
              : "text-zinc-100",
          ].join(" ")}
        >
          {formatCurrency(debt.amount)}
        </strong>

        <div className="mt-5 flex items-center justify-between gap-4 border-t border-zinc-900 pt-4">
          <div className="flex min-w-0 items-center gap-2">
            <CalendarDays
              size={15}
              strokeWidth={1.8}
              className="shrink-0 text-zinc-600"
            />

            <div className="min-w-0">
              <p className="text-xs text-zinc-600">
                Vencimento
              </p>

              <p className="mt-0.5 truncate text-sm text-zinc-300">
                {formatDate(debt.dueDate)}
              </p>
            </div>
          </div>

          <span
            className={[
              "shrink-0 rounded-full border px-2.5 py-1 text-xs font-medium",
              debt.paid
                ? "border-emerald-900/50 bg-emerald-950/30 text-emerald-400"
                : "border-red-900/50 bg-red-950/30 text-red-400",
            ].join(" ")}
          >
            {debt.paid ? "Quitada" : "Em aberto"}
          </span>
        </div>
      </FinCardContent>

      <FinCardFooter className="border-t border-zinc-900">
        <FinButton
          type="button"
          variant={
            debt.paid
              ? "secondary"
              : "primary"
          }
          className="w-full"
          onClick={() => onToggleStatus(debt)}
        >
          <span className="flex items-center justify-center gap-2">
            {debt.paid ? (
              <>
                <RotateCcw
                  size={17}
                  strokeWidth={1.8}
                />

                <span>Reabrir dívida</span>
              </>
            ) : (
              <>
                <CheckCircle2
                  size={17}
                  strokeWidth={1.8}
                />

                <span>Marcar como quitada</span>
              </>
            )}
          </span>
        </FinButton>
      </FinCardFooter>
    </FinCard>
  );
}