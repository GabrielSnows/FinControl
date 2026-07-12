import { useState } from "react";
import type { FormEvent } from "react";

import { useLiveQuery } from "dexie-react-hooks";

import {
  CheckCircle2,
  CircleDollarSign,
  Pencil,
  Plus,
  RotateCcw,
  Target,
  Trash2,
} from "lucide-react";

import Modal from "../components/Modal/Modal";
import ConfirmModal from "../components/ConfirmModal/ConfirmModal";
import AlertModal from "../components/AlertModal/AlertModal";
import Button from "../components/ui/Button";
import Input from "../components/ui/Input";

import { db } from "../database/database";

import type { Goal } from "../types/Goal";
import type { AlertType } from "../components/AlertModal/AlertModal";

function formatCurrency(value: number) {
  return value.toLocaleString("pt-BR", {
    style: "currency",
    currency: "BRL",
  });
}

function parseCurrencyValue(value: string) {
  const normalizedValue = value
    .trim()
    .replace(/\./g, "")
    .replace(",", ".");

  return Number(normalizedValue);
}

function calculateProgress(goal: Goal) {
  if (goal.targetAmount <= 0) return 0;

  const percentage =
    (goal.currentAmount / goal.targetAmount) * 100;

  return Math.min(Math.max(percentage, 0), 100);
}

type AlertData = {
  title: string;
  message: string;
  type: AlertType;
};

export default function Goals() {
  const goals = useLiveQuery(
    () => db.goals.orderBy("createdAt").reverse().toArray(),
    [],
  );

  const [alert, setAlert] = useState<AlertData>();
  const [goalModalOpen, setGoalModalOpen] = useState(false);
  const [progressModalOpen, setProgressModalOpen] =
    useState(false);

  const [editingGoalId, setEditingGoalId] =
    useState<number | null>(null);

  const [progressGoal, setProgressGoal] =
    useState<Goal>();

  const [goalToDelete, setGoalToDelete] =
  useState<Goal>();

  const [title, setTitle] = useState("");
  const [targetAmount, setTargetAmount] = useState("");
  const [currentAmount, setCurrentAmount] = useState("");
  const [newProgressAmount, setNewProgressAmount] =
    useState("");

  const [saving, setSaving] = useState(false);

  function resetGoalForm() {
    setEditingGoalId(null);
    setTitle("");
    setTargetAmount("");
    setCurrentAmount("");
  }

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
  }

  function openNewGoalModal() {
    resetGoalForm();
    setGoalModalOpen(true);
  }

  function openEditGoalModal(goal: Goal) {
    setEditingGoalId(goal.id);
    setTitle(goal.title);
    setTargetAmount(String(goal.targetAmount));
    setCurrentAmount(String(goal.currentAmount));
    setGoalModalOpen(true);
  }

  function closeGoalModal() {
    if (saving) return;

    setGoalModalOpen(false);
    resetGoalForm();
  }

  function openProgressModal(goal: Goal) {
    setProgressGoal(goal);
    setNewProgressAmount(String(goal.currentAmount));
    setProgressModalOpen(true);
  }

  function closeProgressModal() {
    if (saving) return;

    setProgressModalOpen(false);
    setProgressGoal(undefined);
    setNewProgressAmount("");
  }

  async function saveGoal(
    event: FormEvent<HTMLFormElement>,
  ) {
    event.preventDefault();

    const normalizedTitle = title.trim();

    if (!normalizedTitle) {
      showAlert(
        "Nome não informado",
        "Informe o nome do objetivo.",
      );
      return;
    }

    const numericTarget = parseCurrencyValue(targetAmount);
    const numericCurrent = parseCurrencyValue(
      currentAmount || "0",
    );

    if (
      targetAmount.trim() === "" ||
      Number.isNaN(numericTarget) ||
      numericTarget <= 0
    ) {
      showAlert(
        "Valor alvo inválido",
        "Digite um valor alvo maior que zero.",
      );
      return;
    }

    if (
      Number.isNaN(numericCurrent) ||
      numericCurrent < 0
    ) {
      showAlert(
        "Valor guardado inválido",
        "O valor guardado não pode ser negativo.",
      );
      return;
    }

    try {
      setSaving(true);

      const completed =
        numericCurrent >= numericTarget;

      if (editingGoalId !== null) {
        await db.goals.update(editingGoalId, {
          title: normalizedTitle,
          targetAmount: numericTarget,
          currentAmount: numericCurrent,
          completed,
        });
      } else {
        const newGoal: Goal = {
          id: Date.now(),
          title: normalizedTitle,
          targetAmount: numericTarget,
          currentAmount: numericCurrent,
          completed,
          createdAt: new Date().toISOString(),
        };

        await db.goals.add(newGoal);
      }

      setGoalModalOpen(false);
      resetGoalForm();
    } catch (error) {
      console.error("Erro ao salvar objetivo:", error);

      showAlert(
        "Não foi possível salvar",
        "Ocorreu um erro ao salvar o objetivo.",
        "error",
      );
    } finally {
      setSaving(false);
    }
  }

  async function saveProgress(
    event: FormEvent<HTMLFormElement>,
  ) {
    event.preventDefault();

    if (!progressGoal) return;

    const numericAmount = parseCurrencyValue(
      newProgressAmount,
    );

    if (
      newProgressAmount.trim() === "" ||
      Number.isNaN(numericAmount) ||
      numericAmount < 0
    ) {
      showAlert(
        "Valor inválido",
        "Digite um valor guardado válido.",
      );
      return;
    }

    try {
      setSaving(true);

      await db.goals.update(progressGoal.id, {
        currentAmount: numericAmount,
        completed:
          numericAmount >= progressGoal.targetAmount,
      });

      setProgressModalOpen(false);
      setProgressGoal(undefined);
      setNewProgressAmount("");
    } catch (error) {
      console.error(
        "Erro ao atualizar progresso:",
        error,
      );

      showAlert(
        "Não foi possível atualizar",
        "Ocorreu um erro ao atualizar o progresso.",
        "error",
      );
    } finally {
      setSaving(false);
    }
  }

  async function toggleGoalStatus(goal: Goal) {
    try {
      await db.goals.update(goal.id, {
        completed: !goal.completed,
      });
    } catch (error) {
      console.error(
        "Erro ao alterar objetivo:",
        error,
      );

      showAlert(
        "Não foi possível alterar",
        "Ocorreu um erro ao alterar o objetivo.",
        "error",
      );
    }
  }

  async function confirmDeleteGoal() {
    if (!goalToDelete) return;

    try {
      await db.goals.delete(goalToDelete.id);
      setGoalToDelete(undefined);
    } catch (error) {
      console.error(
        "Erro ao excluir objetivo:",
        error,
      );

      showAlert(
        "Não foi possível excluir",
        "Ocorreu um erro ao excluir o objetivo.",
        "error",
      );
    }
  }

  if (goals === undefined) {
    return (
      <div className="flex min-h-64 items-center justify-center text-slate-400">
        Carregando objetivos...
      </div>
    );
  }

  const activeGoals = goals.filter(
    (goal) => !goal.completed,
  );

  const completedGoals = goals.filter(
    (goal) => goal.completed,
  );

  const totalTarget = activeGoals.reduce(
    (total, goal) => total + goal.targetAmount,
    0,
  );

  const totalSaved = activeGoals.reduce(
    (total, goal) => total + goal.currentAmount,
    0,
  );

  const totalRemaining = Math.max(
    totalTarget - totalSaved,
    0,
  );

  return (
    <div>
      <div className="mb-8 flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold sm:text-4xl">
            Objetivos
          </h1>

          <p className="mt-2 text-slate-400">
            Acompanhe seus planos e conquistas.
          </p>
        </div>

        <button
          type="button"
          onClick={openNewGoalModal}
          className="flex cursor-pointer items-center gap-2 rounded-xl bg-emerald-600 px-5 py-3 font-medium text-white transition hover:bg-emerald-700"
        >
          <Plus size={19} />
          Novo Objetivo
        </button>
      </div>

      <div className="mb-8 grid gap-5 md:grid-cols-3">
        <div className="rounded-2xl border border-slate-700 bg-slate-800 p-5">
          <p className="text-sm text-slate-400">
            Valor dos objetivos ativos
          </p>

          <strong className="mt-2 block text-2xl">
            {formatCurrency(totalTarget)}
          </strong>
        </div>

        <div className="rounded-2xl border border-slate-700 bg-slate-800 p-5">
          <p className="text-sm text-slate-400">
            Total já guardado
          </p>

          <strong className="mt-2 block text-2xl text-emerald-400">
            {formatCurrency(totalSaved)}
          </strong>
        </div>

        <div className="rounded-2xl border border-slate-700 bg-slate-800 p-5">
          <p className="text-sm text-slate-400">
            Valor restante
          </p>

          <strong className="mt-2 block text-2xl text-amber-400">
            {formatCurrency(totalRemaining)}
          </strong>
        </div>
      </div>

      {goals.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-slate-700 bg-slate-800/60 px-6 py-16 text-center">
          <Target
            size={50}
            className="mx-auto text-slate-500"
          />

          <h2 className="mt-5 text-xl font-semibold">
            Nenhum objetivo cadastrado
          </h2>

          <p className="mt-2 text-slate-400">
            Cadastre um objetivo para acompanhar seu progresso.
          </p>

          <button
            type="button"
            onClick={openNewGoalModal}
            className="mt-6 cursor-pointer rounded-xl bg-emerald-600 px-5 py-3 font-medium transition hover:bg-emerald-700"
          >
            Criar primeiro objetivo
          </button>
        </div>
      ) : (
        <div className="space-y-8">
          <section>
            <div className="mb-4">
              <h2 className="text-xl font-semibold">
                Em andamento
              </h2>

              <p className="mt-1 text-sm text-slate-400">
                Objetivos que você ainda está buscando.
              </p>
            </div>

            {activeGoals.length === 0 ? (
              <div className="rounded-2xl border border-dashed border-slate-700 bg-slate-800/60 p-8 text-center text-slate-400">
                Todos os seus objetivos foram concluídos.
              </div>
            ) : (
              <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
                {activeGoals.map((goal) => (
                  <GoalCard
                    key={goal.id}
                    goal={goal}
                    onEdit={openEditGoalModal}
                    onUpdateProgress={openProgressModal}
                    onToggleStatus={toggleGoalStatus}
                    onDelete={setGoalToDelete}
                  />
                ))}
              </div>
            )}
          </section>

          {completedGoals.length > 0 && (
            <section>
              <div className="mb-4">
                <h2 className="text-xl font-semibold">
                  Concluídos
                </h2>

                <p className="mt-1 text-sm text-slate-400">
                  Objetivos que você já conseguiu alcançar.
                </p>
              </div>

              <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
                {completedGoals.map((goal) => (
                  <GoalCard
                    key={goal.id}
                    goal={goal}
                    onEdit={openEditGoalModal}
                    onUpdateProgress={openProgressModal}
                    onToggleStatus={toggleGoalStatus}
                    onDelete={setGoalToDelete}
                  />
                ))}
              </div>
            </section>
          )}
        </div>
      )}

      <Modal
        open={goalModalOpen}
        title={
          editingGoalId === null
            ? "Novo Objetivo"
            : "Editar Objetivo"
        }
        onClose={closeGoalModal}
      >
        <form
          onSubmit={saveGoal}
          className="space-y-5"
        >
          <Input
            label="Nome do objetivo"
            type="text"
            placeholder="Ex.: Som do Gol"
            value={title}
            onChange={setTitle}
          />

          <Input
            label="Valor alvo"
            type="text"
            placeholder="0,00"
            value={targetAmount}
            onChange={setTargetAmount}
          />

          <Input
            label="Valor já guardado"
            type="text"
            placeholder="0,00"
            value={currentAmount}
            onChange={setCurrentAmount}
          />

          <div className="flex justify-end gap-3 border-t border-slate-700 pt-5">
            <Button
              variant="secondary"
              onClick={closeGoalModal}
              disabled={saving}
            >
              Cancelar
            </Button>

            <Button
              type="submit"
              disabled={saving}
            >
              {saving
                ? "Salvando..."
                : editingGoalId === null
                  ? "Salvar objetivo"
                  : "Salvar alterações"}
            </Button>
          </div>
        </form>
      </Modal>

      <Modal
        open={progressModalOpen}
        title="Atualizar progresso"
        onClose={closeProgressModal}
      >
        <form
          onSubmit={saveProgress}
          className="space-y-5"
        >
          {progressGoal && (
            <div className="rounded-xl bg-slate-900 p-4">
              <p className="text-sm text-slate-400">
                Objetivo
              </p>

              <strong className="mt-1 block">
                {progressGoal.title}
              </strong>

              <p className="mt-4 text-sm text-slate-400">
                Valor alvo
              </p>

              <strong className="mt-1 block text-xl">
                {formatCurrency(
                  progressGoal.targetAmount,
                )}
              </strong>
            </div>
          )}

          <Input
            label="Total guardado atualmente"
            type="text"
            placeholder="0,00"
            value={newProgressAmount}
            onChange={setNewProgressAmount}
          />

          <div className="flex justify-end gap-3 border-t border-slate-700 pt-5">
            <Button
              variant="secondary"
              onClick={closeProgressModal}
              disabled={saving}
            >
              Cancelar
            </Button>

            <Button
              type="submit"
              disabled={saving}
            >
              {saving
                ? "Atualizando..."
                : "Salvar progresso"}
            </Button>
          </div>
        </form>
      </Modal>

      <ConfirmModal
        open={Boolean(goalToDelete)}
        title="Excluir objetivo"
        message={`Tem certeza de que deseja excluir o objetivo "${
          goalToDelete?.title ?? ""
        }"?`}
        confirmText="Excluir objetivo"
        onConfirm={confirmDeleteGoal}
        onCancel={() => setGoalToDelete(undefined)}
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

type GoalCardProps = {
  goal: Goal;
  onEdit: (goal: Goal) => void;
  onUpdateProgress: (goal: Goal) => void;
  onToggleStatus: (goal: Goal) => void;
  onDelete: (goal: Goal) => void;
};

function GoalCard({
  goal,
  onEdit,
  onUpdateProgress,
  onToggleStatus,
  onDelete,
}: GoalCardProps) {
  const progress = calculateProgress(goal);

  const remaining = Math.max(
    goal.targetAmount - goal.currentAmount,
    0,
  );

  return (
    <article
      className={`rounded-2xl border p-5 ${
        goal.completed
          ? "border-emerald-900 bg-emerald-950/30"
          : "border-slate-700 bg-slate-800"
      }`}
    >
      <div className="flex items-start justify-between gap-4">
        <div className="min-w-0">
          <h3 className="truncate text-lg font-semibold">
            {goal.title}
          </h3>

          <p className="mt-1 text-sm text-slate-400">
            {goal.completed
              ? "Objetivo concluído"
              : `${progress.toFixed(0)}% concluído`}
          </p>
        </div>

        <div className="flex shrink-0 gap-1">
          <button
            type="button"
            onClick={() => onEdit(goal)}
            title="Editar objetivo"
            aria-label={`Editar ${goal.title}`}
            className="cursor-pointer rounded-lg p-2 text-slate-400 transition hover:bg-slate-700 hover:text-white"
          >
            <Pencil size={18} />
          </button>

          <button
            type="button"
            onClick={() => onDelete(goal)}
            title="Excluir objetivo"
            aria-label={`Excluir ${goal.title}`}
            className="cursor-pointer rounded-lg p-2 text-slate-400 transition hover:bg-red-950 hover:text-red-400"
          >
            <Trash2 size={18} />
          </button>
        </div>
      </div>

      <div className="mt-6">
        <div className="h-3 overflow-hidden rounded-full bg-slate-700">
          <div
            className="h-full rounded-full bg-emerald-500 transition-all"
            style={{
              width: `${progress}%`,
            }}
          />
        </div>

        <div className="mt-3 flex justify-between gap-3 text-sm">
          <span className="text-emerald-400">
            {formatCurrency(goal.currentAmount)}
          </span>

          <span className="text-slate-400">
            {formatCurrency(goal.targetAmount)}
          </span>
        </div>
      </div>

      {!goal.completed && (
        <div className="mt-5 rounded-xl bg-slate-900 p-3">
          <p className="text-xs text-slate-500">
            Falta guardar
          </p>

          <strong className="mt-1 block text-amber-400">
            {formatCurrency(remaining)}
          </strong>
        </div>
      )}

      <button
        type="button"
        onClick={() => onUpdateProgress(goal)}
        className="mt-5 flex w-full cursor-pointer items-center justify-center gap-2 rounded-xl bg-slate-700 px-4 py-3 font-medium transition hover:bg-slate-600"
      >
        <CircleDollarSign size={18} />
        Atualizar progresso
      </button>

      <button
        type="button"
        onClick={() => onToggleStatus(goal)}
        className={`mt-3 flex w-full cursor-pointer items-center justify-center gap-2 rounded-xl px-4 py-3 font-medium transition ${
          goal.completed
            ? "bg-slate-700 hover:bg-slate-600"
            : "bg-emerald-600 hover:bg-emerald-700"
        }`}
      >
        {goal.completed ? (
          <>
            <RotateCcw size={18} />
            Reabrir objetivo
          </>
        ) : (
          <>
            <CheckCircle2 size={18} />
            Marcar como concluído
          </>
        )}
      </button>
    </article>
  );
}