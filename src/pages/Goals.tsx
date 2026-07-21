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

import ConfirmModal from "../components/ConfirmModal/ConfirmModal";
import AlertModal from "../components/AlertModal/AlertModal";

import FinButton from "../finui/Button/FinButton";
import FinInput from "../finui/Input/FinInput";
import FinPageHeader from "../finui/PageHeader/FinPageHeader";

import {
  FinCard,
  FinCardContent,
  FinCardDescription,
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
    () =>
      db.goals
        .orderBy("createdAt")
        .reverse()
        .toArray(),
    [],
  );

  const [alert, setAlert] = useState<AlertData>();
  const [alertOpen, setAlertOpen] = useState(false);
  const [goalModalOpen, setGoalModalOpen] = useState(false);
  const [progressModalOpen, setProgressModalOpen] = useState(false);
  const [editingGoalId, setEditingGoalId] = useState<number | null>(null);
  const [progressGoal, setProgressGoal] = useState<Goal>();
  const [goalToDelete, setGoalToDelete] = useState<Goal>();
  const [title, setTitle] = useState("");
  const [targetAmount, setTargetAmount] = useState("");
  const [currentAmount, setCurrentAmount] = useState("");
  const [newProgressAmount, setNewProgressAmount] = useState("");
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
    setAlert({ title, message, type });
    setAlertOpen(true);
  }

  function closeAlert() {
    setAlertOpen(false);
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
  }

  function openProgressModal(goal: Goal) {
    setProgressGoal(goal);
    setNewProgressAmount(String(goal.currentAmount));
    setProgressModalOpen(true);
  }

  function closeProgressModal() {
    if (saving) return;

    setProgressModalOpen(false);
  }

  async function saveGoal(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const normalizedTitle = title.trim();

    if (!normalizedTitle) {
      showAlert("Nome não informado", "Informe o nome do objetivo.");
      return;
    }

    const numericTarget = parseCurrencyValue(targetAmount);
    const numericCurrent = parseCurrencyValue(currentAmount || "0");

    if (
      targetAmount.trim() === "" ||
      Number.isNaN(numericTarget) ||
      numericTarget <= 0
    ) {
      showAlert("Valor alvo inválido", "Digite um valor alvo maior que zero.");
      return;
    }

    if (Number.isNaN(numericCurrent) || numericCurrent < 0) {
      showAlert(
        "Valor guardado inválido",
        "O valor guardado não pode ser negativo.",
      );
      return;
    }

    try {
      setSaving(true);
      const completed = numericCurrent >= numericTarget;

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

  async function saveProgress(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!progressGoal) return;

    const numericAmount = parseCurrencyValue(newProgressAmount);

    if (
      newProgressAmount.trim() === "" ||
      Number.isNaN(numericAmount) ||
      numericAmount < 0
    ) {
      showAlert("Valor inválido", "Digite um valor guardado válido.");
      return;
    }

    try {
      setSaving(true);

      await db.goals.update(progressGoal.id, {
        currentAmount: numericAmount,
        completed: numericAmount >= progressGoal.targetAmount,
      });

      setProgressModalOpen(false);
      setProgressGoal(undefined);
      setNewProgressAmount("");
    } catch (error) {
      console.error("Erro ao atualizar progresso:", error);
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
      console.error("Erro ao alterar objetivo:", error);
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
      setSaving(true);
      await db.goals.delete(goalToDelete.id);
      setGoalToDelete(undefined);
    } catch (error) {
      console.error("Erro ao excluir objetivo:", error);
      setGoalToDelete(undefined);
      showAlert(
        "Não foi possível excluir",
        "Ocorreu um erro ao excluir o objetivo.",
        "error",
      );
    } finally {
      setSaving(false);
    }
  }

  if (goals === undefined) {
    return (
      <div className="flex min-h-64 items-center justify-center">
        <div className="text-center">
          <div className="mx-auto h-7 w-7 animate-spin rounded-full border-2 border-zinc-800 border-t-zinc-300" />
          <p className="mt-3 text-sm text-zinc-500">Carregando objetivos...</p>
        </div>
      </div>
    );
  }

  const activeGoals = goals.filter((goal) => !goal.completed);
  const completedGoals = goals.filter((goal) => goal.completed);
  const totalTarget = activeGoals.reduce(
    (total, goal) => total + goal.targetAmount,
    0,
  );
  const totalSaved = activeGoals.reduce(
    (total, goal) => total + goal.currentAmount,
    0,
  );
  const totalRemaining = Math.max(totalTarget - totalSaved, 0);

  return (
    <div>
      <FinPageHeader
        title="Objetivos"
        description="Acompanhe seus planos e conquistas."
        action={
          <FinButton leftIcon={<Plus />} onClick={openNewGoalModal}>
            Novo objetivo
          </FinButton>
        }
      />

      <div className="mb-8 grid gap-4 md:grid-cols-3">
        <SummaryCard
          label="Objetivos ativos"
          value={formatCurrency(totalTarget)}
          description="Valor total planejado"
        />

        <SummaryCard
          label="Total guardado"
          value={formatCurrency(totalSaved)}
          description="Nos objetivos em andamento"
          valueClassName="text-emerald-400"
        />

        <SummaryCard
          label="Valor restante"
          value={formatCurrency(totalRemaining)}
          description="Para concluir todos os ativos"
          valueClassName="text-amber-400"
        />
      </div>

      {goals.length === 0 ? (
        <FinCard>
          <FinCardContent className="px-6 py-16 text-center">
            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl border border-zinc-800 bg-zinc-900/70">
              <Target
                size={27}
                strokeWidth={1.7}
                className="text-zinc-400"
              />
            </div>

            <h2 className="mt-5 text-lg font-semibold tracking-tight text-zinc-100">
              Nenhum objetivo cadastrado
            </h2>

            <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-zinc-500">
              Cadastre um objetivo para acompanhar seu progresso e suas conquistas.
            </p>

            <FinButton
              className="mt-7"
              leftIcon={<Plus />}
              onClick={openNewGoalModal}
            >
              Criar primeiro objetivo
            </FinButton>
          </FinCardContent>
        </FinCard>
      ) : (
        <div className="space-y-10">
          <section>
            <div className="mb-4">
              <h2 className="text-lg font-semibold tracking-tight text-zinc-100">
                Em andamento
              </h2>
              <p className="mt-1 text-sm text-zinc-500">
                {activeGoals.length === 1
                  ? "1 objetivo ativo"
                  : `${activeGoals.length} objetivos ativos`}
              </p>
            </div>

            {activeGoals.length === 0 ? (
              <FinCard>
                <FinCardContent className="px-6 py-10 text-center">
                  <CheckCircle2
                    size={26}
                    strokeWidth={1.7}
                    className="mx-auto text-zinc-500"
                  />
                  <p className="mt-3 text-sm text-zinc-500">
                    Todos os seus objetivos foram concluídos.
                  </p>
                </FinCardContent>
              </FinCard>
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
                <h2 className="text-lg font-semibold tracking-tight text-zinc-100">
                  Concluídos
                </h2>
                <p className="mt-1 text-sm text-zinc-500">
                  {completedGoals.length === 1
                    ? "1 objetivo conquistado"
                    : `${completedGoals.length} objetivos conquistados`}
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

      <FinModal
        open={goalModalOpen}
        onClose={closeGoalModal}
        onClosed={() => {
          setProgressGoal(undefined);
          setNewProgressAmount("");
        }}
        size="md"
        closeOnOverlayClick={!saving}
        closeOnEscape={!saving}
      >
        <form onSubmit={saveGoal}>
          <FinModalHeader>
            <FinModalTitle>
              {editingGoalId === null ? "Novo objetivo" : "Editar objetivo"}
            </FinModalTitle>
            <FinModalDescription>
              {editingGoalId === null
                ? "Defina o objetivo, o valor necessário e quanto você já guardou."
                : "Altere as informações cadastradas neste objetivo."}
            </FinModalDescription>
          </FinModalHeader>

          <FinModalContent className="space-y-5">
            <FinInput
              label="Nome do objetivo"
              type="text"
              placeholder="Ex.: Som do Gol"
              value={title}
              onChange={(event) => setTitle(event.target.value)}
            />

            <FinInput
              label="Valor alvo"
              type="text"
              inputMode="decimal"
              placeholder="0,00"
              value={targetAmount}
              onChange={(event) => setTargetAmount(event.target.value)}
              helperText="Informe o valor total necessário."
            />

            <FinInput
              label="Valor já guardado"
              type="text"
              inputMode="decimal"
              placeholder="0,00"
              value={currentAmount}
              onChange={(event) => setCurrentAmount(event.target.value)}
            />
          </FinModalContent>

          <FinModalFooter>
            <FinButton
              variant="secondary"
              onClick={closeGoalModal}
              disabled={saving}
            >
              Cancelar
            </FinButton>

            <FinButton type="submit" loading={saving}>
              {editingGoalId === null ? "Salvar objetivo" : "Salvar alterações"}
            </FinButton>
          </FinModalFooter>
        </form>
      </FinModal>

      <FinModal
        open={progressModalOpen}
        onClose={closeProgressModal}
        size="sm"
        closeOnOverlayClick={!saving}
        closeOnEscape={!saving}
      >
        <form onSubmit={saveProgress}>
          <FinModalHeader>
            <FinModalTitle>Atualizar progresso</FinModalTitle>
            <FinModalDescription>
              Informe o total que está guardado atualmente neste objetivo.
            </FinModalDescription>
          </FinModalHeader>

          <FinModalContent className="space-y-5">
            {progressGoal && (
              <div className="rounded-xl border border-zinc-800 bg-zinc-900/60 p-4">
                <p className="text-xs font-medium uppercase tracking-[0.12em] text-zinc-600">
                  Objetivo
                </p>
                <strong className="mt-2 block truncate text-base font-medium text-zinc-200">
                  {progressGoal.title}
                </strong>

                <div className="mt-4 flex items-end justify-between gap-4">
                  <div>
                    <p className="text-xs text-zinc-500">Guardado</p>
                    <strong className="mt-1 block text-sm font-medium text-zinc-200">
                      {formatCurrency(progressGoal.currentAmount)}
                    </strong>
                  </div>

                  <div className="text-right">
                    <p className="text-xs text-zinc-500">Meta</p>
                    <strong className="mt-1 block text-sm font-medium text-zinc-200">
                      {formatCurrency(progressGoal.targetAmount)}
                    </strong>
                  </div>
                </div>
              </div>
            )}

            <FinInput
              label="Total guardado atualmente"
              type="text"
              inputMode="decimal"
              placeholder="0,00"
              value={newProgressAmount}
              onChange={(event) => setNewProgressAmount(event.target.value)}
              helperText="Digite o valor total, não apenas o último depósito."
            />
          </FinModalContent>

          <FinModalFooter>
            <FinButton
              variant="secondary"
              onClick={closeProgressModal}
              disabled={saving}
            >
              Cancelar
            </FinButton>
            <FinButton type="submit" loading={saving}>
              Salvar progresso
            </FinButton>
          </FinModalFooter>
        </form>
      </FinModal>

      <ConfirmModal
        open={Boolean(goalToDelete)}
        title="Excluir objetivo"
        message={`Tem certeza de que deseja excluir o objetivo "${
          goalToDelete?.title ?? ""
        }"? Esta ação não pode ser desfeita.`}
        confirmText="Excluir objetivo"
        onConfirm={confirmDeleteGoal}
        onCancel={() => {
          if (!saving) setGoalToDelete(undefined);
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
        <p className="mt-2 text-sm text-zinc-500">{description}</p>
      </FinCardContent>
    </FinCard>
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
  const remaining = Math.max(goal.targetAmount - goal.currentAmount, 0);

  return (
    <FinCard variant="interactive" className="group flex min-h-105 flex-col">
      <FinCardHeader className="flex-row items-start justify-between gap-4">
        <div className="min-w-0">
          <FinCardTitle className="truncate text-base">{goal.title}</FinCardTitle>
          <FinCardDescription className="mt-1">
            {goal.completed ? "Objetivo concluído" : `${progress.toFixed(0)}% concluído`}
          </FinCardDescription>
        </div>

        <div className="flex shrink-0 items-center gap-0.5 opacity-70 transition-opacity group-hover:opacity-100">
          <button
            type="button"
            onClick={() => onEdit(goal)}
            title="Editar objetivo"
            aria-label={`Editar ${goal.title}`}
            className="flex h-9 w-9 cursor-pointer items-center justify-center rounded-lg text-zinc-500 transition-colors hover:bg-zinc-800 hover:text-zinc-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-zinc-600"
          >
            <Pencil size={16} strokeWidth={1.8} />
          </button>

          <button
            type="button"
            onClick={() => onDelete(goal)}
            title="Excluir objetivo"
            aria-label={`Excluir ${goal.title}`}
            className="flex h-9 w-9 cursor-pointer items-center justify-center rounded-lg text-zinc-500 transition-colors hover:bg-red-950/60 hover:text-red-400 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-900"
          >
            <Trash2 size={16} strokeWidth={1.8} />
          </button>
        </div>
      </FinCardHeader>

      <FinCardContent className="flex flex-1 flex-col">
        <div>
          <div className="h-2 overflow-hidden rounded-full bg-zinc-800">
            <div
              className={`h-full rounded-full transition-all duration-300 ${
                goal.completed ? "bg-emerald-500" : "bg-zinc-300"
              }`}
              style={{ width: `${progress}%` }}
            />
          </div>

          <div className="mt-3 flex items-start justify-between gap-4 text-sm">
            <div>
              <p className="text-xs text-zinc-600">Guardado</p>
              <strong className="mt-1 block font-medium text-zinc-200">
                {formatCurrency(goal.currentAmount)}
              </strong>
            </div>

            <div className="text-right">
              <p className="text-xs text-zinc-600">Meta</p>
              <strong className="mt-1 block font-medium text-zinc-400">
                {formatCurrency(goal.targetAmount)}
              </strong>
            </div>
          </div>
        </div>

        <div className="mt-5 rounded-xl border border-zinc-800 bg-zinc-900/60 p-4">
          {goal.completed ? (
            <>
              <p className="text-xs font-medium uppercase tracking-[0.12em] text-emerald-500/70">
                Conquista
              </p>
              <strong className="mt-2 block text-base font-medium text-emerald-400">
                Objetivo alcançado
              </strong>
            </>
          ) : (
            <>
              <p className="text-xs font-medium uppercase tracking-[0.12em] text-zinc-600">
                Falta guardar
              </p>
              <strong className="mt-2 block text-lg font-semibold tracking-tight text-zinc-100">
                {formatCurrency(remaining)}
              </strong>
            </>
          )}
        </div>

        <div className="mt-auto pt-5">
          <FinButton
            className="w-full"
            variant="secondary"
            leftIcon={<CircleDollarSign />}
            onClick={() => onUpdateProgress(goal)}
          >
            Atualizar progresso
          </FinButton>

          <FinButton
            className="mt-3 w-full"
            variant={goal.completed ? "secondary" : "primary"}
            leftIcon={goal.completed ? <RotateCcw /> : <CheckCircle2 />}
            onClick={() => onToggleStatus(goal)}
          >
            {goal.completed ? "Reabrir objetivo" : "Marcar como concluído"}
          </FinButton>
        </div>
      </FinCardContent>
    </FinCard>
  );
}