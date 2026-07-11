import { useState } from "react";
import type { FormEvent } from "react";

import { useLiveQuery } from "dexie-react-hooks";

import {
  CheckCircle2,
  CircleDollarSign,
  Pencil,
  Plus,
  RotateCcw,
  Trash2,
} from "lucide-react";

import Modal from "../components/Modal/Modal";
import ConfirmModal from "../components/ConfirmModal/ConfirmModal";
import Button from "../components/ui/Button";
import Input from "../components/ui/Input";

import { db } from "../database/database";

import type { Debt } from "../types/Debt";

function formatCurrency(value: number) {
  return value.toLocaleString("pt-BR", {
    style: "currency",
    currency: "BRL",
  });
}

function formatDate(value: string) {
  if (!value) return "Sem vencimento";

  const [year, month, day] = value.split("-");

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
    () => db.debts.orderBy("createdAt").reverse().toArray(),
    [],
  );

  const [modalOpen, setModalOpen] = useState(false);
  const [editingDebtId, setEditingDebtId] =
    useState<number | null>(null);

  const [debtToDelete, setDebtToDelete] =
    useState<Debt>();

  const [creditor, setCreditor] = useState("");
  const [description, setDescription] = useState("");
  const [amount, setAmount] = useState("");
  const [dueDate, setDueDate] = useState("");

  const [saving, setSaving] = useState(false);

  function openNewDebtModal() {
    setEditingDebtId(null);
    setCreditor("");
    setDescription("");
    setAmount("");
    setDueDate("");
    setModalOpen(true);
  }

  function openEditDebtModal(debt: Debt) {
    setEditingDebtId(debt.id);
    setCreditor(debt.creditor);
    setDescription(debt.description);
    setAmount(String(debt.amount));
    setDueDate(debt.dueDate);
    setModalOpen(true);
  }

  function closeModal() {
    if (saving) return;

    setModalOpen(false);
    setEditingDebtId(null);
    setCreditor("");
    setDescription("");
    setAmount("");
    setDueDate("");
  }

  async function saveDebt(
    event: FormEvent<HTMLFormElement>,
  ) {
    event.preventDefault();

    if (!creditor.trim()) {
      window.alert("Informe para quem você deve.");
      return;
    }

    if (!description.trim()) {
      window.alert("Informe uma descrição para a dívida.");
      return;
    }

    const numericAmount = parseCurrencyValue(amount);

    if (
      amount.trim() === "" ||
      Number.isNaN(numericAmount) ||
      numericAmount <= 0
    ) {
      window.alert("Digite um valor maior que zero.");
      return;
    }

    try {
      setSaving(true);

      if (editingDebtId !== null) {
        await db.debts.update(editingDebtId, {
          creditor: creditor.trim(),
          description: description.trim(),
          amount: numericAmount,
          dueDate,
        });
      } else {
        const newDebt: Debt = {
          id: Date.now(),
          creditor: creditor.trim(),
          description: description.trim(),
          amount: numericAmount,
          dueDate,
          paid: false,
          createdAt: new Date().toISOString(),
        };

        await db.debts.add(newDebt);
      }

      closeModal();
    } catch (error) {
      console.error("Erro ao salvar dívida:", error);
      window.alert("Não foi possível salvar a dívida.");
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

      window.alert(
        "Não foi possível alterar o status da dívida.",
      );
    }
  }

  async function confirmDeleteDebt() {
    if (!debtToDelete) return;

    try {
      await db.debts.delete(debtToDelete.id);
      setDebtToDelete(undefined);
    } catch (error) {
      console.error("Erro ao excluir dívida:", error);
      window.alert("Não foi possível excluir a dívida.");
    }
  }

  if (debts === undefined) {
    return (
      <div className="flex min-h-64 items-center justify-center text-slate-400">
        Carregando dívidas...
      </div>
    );
  }

  const openDebts = debts.filter((debt) => !debt.paid);
  const paidDebts = debts.filter((debt) => debt.paid);

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
      <div className="mb-8 flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-4xl font-bold">
            Dívidas
          </h1>

          <p className="mt-2 text-slate-400">
            Acompanhe suas dívidas em aberto e quitadas.
          </p>
        </div>

        <button
          type="button"
          onClick={openNewDebtModal}
          className="flex cursor-pointer items-center gap-2 rounded-xl bg-emerald-600 px-5 py-3 font-medium text-white transition hover:bg-emerald-700"
        >
          <Plus size={19} />
          Nova Dívida
        </button>
      </div>

      <div className="mb-8 grid gap-5 md:grid-cols-3">
        <div className="rounded-2xl border border-slate-700 bg-slate-800 p-5">
          <p className="text-sm text-slate-400">
            Total em aberto
          </p>

          <strong className="mt-2 block text-2xl text-red-400">
            {formatCurrency(totalOpen)}
          </strong>
        </div>

        <div className="rounded-2xl border border-slate-700 bg-slate-800 p-5">
          <p className="text-sm text-slate-400">
            Dívidas em aberto
          </p>

          <strong className="mt-2 block text-2xl">
            {openDebts.length}
          </strong>
        </div>

        <div className="rounded-2xl border border-slate-700 bg-slate-800 p-5">
          <p className="text-sm text-slate-400">
            Total já quitado
          </p>

          <strong className="mt-2 block text-2xl text-emerald-400">
            {formatCurrency(totalPaid)}
          </strong>
        </div>
      </div>

      {debts.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-slate-700 bg-slate-800/60 px-6 py-16 text-center">
          <CircleDollarSign
            size={50}
            className="mx-auto text-slate-500"
          />

          <h2 className="mt-5 text-xl font-semibold">
            Nenhuma dívida cadastrada
          </h2>

          <p className="mt-2 text-slate-400">
            Cadastre suas dívidas para acompanhar o que ainda precisa quitar.
          </p>
        </div>
      ) : (
        <div className="space-y-8">
          <section>
            <h2 className="mb-4 text-xl font-semibold">
              Em aberto
            </h2>

            {openDebts.length === 0 ? (
              <div className="rounded-2xl border border-dashed border-slate-700 bg-slate-800/60 p-8 text-center text-slate-400">
                Você não possui dívidas em aberto.
              </div>
            ) : (
              <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
                {openDebts.map((debt) => (
                  <DebtCard
                    key={debt.id}
                    debt={debt}
                    onEdit={openEditDebtModal}
                    onToggleStatus={toggleDebtStatus}
                    onDelete={setDebtToDelete}
                  />
                ))}
              </div>
            )}
          </section>

          {paidDebts.length > 0 && (
            <section>
              <h2 className="mb-4 text-xl font-semibold">
                Quitadas
              </h2>

              <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
                {paidDebts.map((debt) => (
                  <DebtCard
                    key={debt.id}
                    debt={debt}
                    onEdit={openEditDebtModal}
                    onToggleStatus={toggleDebtStatus}
                    onDelete={setDebtToDelete}
                  />
                ))}
              </div>
            </section>
          )}
        </div>
      )}

      <Modal
        open={modalOpen}
        title={
          editingDebtId === null
            ? "Nova Dívida"
            : "Editar Dívida"
        }
        onClose={closeModal}
      >
        <form onSubmit={saveDebt} className="space-y-5">
          <Input
            label="Credor"
            type="text"
            placeholder="Ex.: Inter, Itaú ou MEI"
            value={creditor}
            onChange={setCreditor}
          />

          <Input
            label="Descrição"
            type="text"
            placeholder="Ex.: Fatura do cartão"
            value={description}
            onChange={setDescription}
          />

          <Input
            label="Valor total"
            type="text"
            placeholder="0,00"
            value={amount}
            onChange={setAmount}
          />

          <Input
            label="Data de vencimento"
            type="date"
            value={dueDate}
            onChange={setDueDate}
          />

          <div className="flex justify-end gap-3 border-t border-slate-700 pt-5">
            <Button
              variant="secondary"
              onClick={closeModal}
              disabled={saving}
            >
              Cancelar
            </Button>

            <Button type="submit" disabled={saving}>
              {saving
                ? "Salvando..."
                : editingDebtId === null
                  ? "Salvar dívida"
                  : "Salvar alterações"}
            </Button>
          </div>
        </form>
      </Modal>

      <ConfirmModal
        open={Boolean(debtToDelete)}
        title="Excluir dívida"
        message={`Tem certeza de que deseja excluir a dívida "${
          debtToDelete?.description ?? ""
        }" de ${debtToDelete?.creditor ?? ""}?`}
        confirmText="Excluir dívida"
        onConfirm={confirmDeleteDebt}
        onCancel={() => setDebtToDelete(undefined)}
      />
    </div>
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
    <article
      className={`rounded-2xl border p-5 ${
        debt.paid
          ? "border-emerald-900 bg-emerald-950/30"
          : "border-slate-700 bg-slate-800"
      }`}
    >
      <div className="flex items-start justify-between gap-4">
        <div className="min-w-0">
          <h3 className="truncate text-lg font-semibold">
            {debt.creditor}
          </h3>

          <p className="mt-1 truncate text-sm text-slate-400">
            {debt.description}
          </p>
        </div>

        <div className="flex shrink-0 gap-1">
          <button
            type="button"
            onClick={() => onEdit(debt)}
            className="cursor-pointer rounded-lg p-2 text-slate-400 transition hover:bg-slate-700 hover:text-white"
          >
            <Pencil size={18} />
          </button>

          <button
            type="button"
            onClick={() => onDelete(debt)}
            className="cursor-pointer rounded-lg p-2 text-slate-400 transition hover:bg-red-950 hover:text-red-400"
          >
            <Trash2 size={18} />
          </button>
        </div>
      </div>

      <div className="mt-6">
        <p className="text-sm text-slate-400">
          Valor
        </p>

        <strong
          className={`mt-1 block text-2xl ${
            debt.paid
              ? "text-emerald-400"
              : "text-red-400"
          }`}
        >
          {formatCurrency(debt.amount)}
        </strong>
      </div>

      <div className="mt-4 flex items-center justify-between gap-3">
        <p className="text-sm">
          {formatDate(debt.dueDate)}
        </p>

        <span
          className={`rounded-full px-3 py-1 text-xs font-medium ${
            debt.paid
              ? "bg-emerald-950 text-emerald-400"
              : "bg-red-950 text-red-400"
          }`}
        >
          {debt.paid ? "Quitada" : "Em aberto"}
        </span>
      </div>

      <button
        type="button"
        onClick={() => onToggleStatus(debt)}
        className={`mt-5 flex w-full cursor-pointer items-center justify-center gap-2 rounded-xl px-4 py-3 font-medium transition ${
          debt.paid
            ? "bg-slate-700 hover:bg-slate-600"
            : "bg-emerald-600 hover:bg-emerald-700"
        }`}
      >
        {debt.paid ? (
          <>
            <RotateCcw size={18} />
            Reabrir dívida
          </>
        ) : (
          <>
            <CheckCircle2 size={18} />
            Marcar como quitada
          </>
        )}
      </button>
    </article>
  );
}