import { useState } from "react";
import { useLiveQuery } from "dexie-react-hooks";
import {
  Pencil,
  Plus,
  Trash2,
  WalletCards,
} from "lucide-react";

import BankSelect from "../components/BankSelect/BankSelect";
import Modal from "../components/Modal/Modal";
import Button from "../components/ui/Button";
import Input from "../components/ui/Input";

import { db } from "../database/database";

import type { Account } from "../types/Account";
import type { Bank } from "../data/banks";

export default function Accounts() {
  const accounts = useLiveQuery(
    () => db.accounts.orderBy("createdAt").reverse().toArray(),
    [],
  );

  const [modalOpen, setModalOpen] = useState(false);
  const [selectedBank, setSelectedBank] = useState<Bank>();
  const [balance, setBalance] = useState("");
  const [editingAccountId, setEditingAccountId] = useState<number | null>(
    null,
  );
  const [saving, setSaving] = useState(false);

  function openNewAccountModal() {
    setEditingAccountId(null);
    setSelectedBank(undefined);
    setBalance("");
    setModalOpen(true);
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
    setModalOpen(true);
  }

  function closeModal() {
    if (saving) return;

    setModalOpen(false);
    setSelectedBank(undefined);
    setBalance("");
    setEditingAccountId(null);
  }

  async function saveAccount(
    event: React.FormEvent<HTMLFormElement>,
  ) {
    event.preventDefault();

    if (!selectedBank) {
      window.alert("Selecione um banco ou carteira.");
      return;
    }

    const normalizedBalance = balance
      .trim()
      .replace(/\./g, "")
      .replace(",", ".");

    const numericBalance = Number(normalizedBalance);

    if (
      normalizedBalance === "" ||
      Number.isNaN(numericBalance)
    ) {
      window.alert("Digite um saldo válido.");
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
          balance: numericBalance,
        });
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

      setModalOpen(false);
      setSelectedBank(undefined);
      setBalance("");
      setEditingAccountId(null);
    } catch (error) {
      console.error("Erro ao salvar conta:", error);

      window.alert(
        "Não foi possível salvar a conta. Tente novamente.",
      );
    } finally {
      setSaving(false);
    }
  }

  async function deleteAccount(accountId: number) {
    const confirmed = window.confirm(
      "Tem certeza de que deseja excluir esta conta?",
    );

    if (!confirmed) return;

    try {
      await db.accounts.delete(accountId);
    } catch (error) {
      console.error("Erro ao excluir conta:", error);

      window.alert(
        "Não foi possível excluir a conta. Tente novamente.",
      );
    }
  }

  function formatCurrency(value: number) {
    return value.toLocaleString("pt-BR", {
      style: "currency",
      currency: "BRL",
    });
  }

  if (accounts === undefined) {
    return (
      <div className="flex min-h-64 items-center justify-center text-slate-400">
        Carregando contas...
      </div>
    );
  }

  return (
    <div>
      <div className="mb-8 flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-4xl font-bold">
            Contas
          </h1>

          <p className="mt-2 text-slate-400">
            Gerencie seus bancos, carteiras digitais e dinheiro.
          </p>
        </div>

        <button
          type="button"
          onClick={openNewAccountModal}
          className="flex cursor-pointer items-center gap-2 rounded-xl bg-emerald-600 px-5 py-3 font-medium text-white transition hover:bg-emerald-700"
        >
          <Plus size={19} />
          Nova Conta
        </button>
      </div>

      {accounts.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-slate-700 bg-slate-800/60 px-6 py-14 text-center">
          <WalletCards
            size={48}
            className="mx-auto text-slate-500"
          />

          <h2 className="mt-4 text-xl font-semibold">
            Nenhuma conta cadastrada
          </h2>

          <p className="mt-2 text-slate-400">
            Cadastre sua primeira conta para começar a controlar seus saldos.
          </p>

          <button
            type="button"
            onClick={openNewAccountModal}
            className="mt-6 cursor-pointer rounded-xl bg-emerald-600 px-5 py-3 font-medium transition hover:bg-emerald-700"
          >
            Criar primeira conta
          </button>
        </div>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {accounts.map((account) => (
            <article
              key={account.id}
              className="rounded-2xl border border-slate-700 bg-slate-800 p-5 shadow-lg"
            >
              <div className="flex items-start justify-between gap-4">
                <div className="flex min-w-0 items-center gap-4">
                  <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-xl bg-white p-2">
                    <img
                      src={account.image}
                      alt={account.name}
                      className="h-full w-full object-contain"
                    />
                  </div>

                  <div className="min-w-0">
                    <h2 className="truncate text-lg font-semibold">
                      {account.name}
                    </h2>

                    <p className="mt-1 text-sm text-slate-400">
                      {account.type === "bank"
                        ? "Banco"
                        : "Carteira"}
                    </p>
                  </div>
                </div>

                <div className="flex shrink-0 gap-1">
                  <button
                    type="button"
                    onClick={() =>
                      openEditAccountModal(account)
                    }
                    aria-label={`Editar ${account.name}`}
                    className="cursor-pointer rounded-lg p-2 text-slate-400 transition hover:bg-slate-700 hover:text-white"
                  >
                    <Pencil size={18} />
                  </button>

                  <button
                    type="button"
                    onClick={() =>
                      deleteAccount(account.id)
                    }
                    aria-label={`Excluir ${account.name}`}
                    className="cursor-pointer rounded-lg p-2 text-slate-400 transition hover:bg-red-950 hover:text-red-400"
                  >
                    <Trash2 size={18} />
                  </button>
                </div>
              </div>

              <div className="mt-6">
                <p className="text-sm text-slate-400">
                  Saldo atual
                </p>

                <strong
                  className={`mt-1 block text-2xl ${
                    account.balance < 0
                      ? "text-red-400"
                      : "text-white"
                  }`}
                >
                  {formatCurrency(account.balance)}
                </strong>
              </div>
            </article>
          ))}
        </div>
      )}

      <Modal
        open={modalOpen}
        title={
          editingAccountId === null
            ? "Nova Conta"
            : "Editar Conta"
        }
        onClose={closeModal}
      >
        <form
          onSubmit={saveAccount}
          className="space-y-6"
        >
          <div>
            <p className="mb-3 text-sm font-medium text-slate-300">
              Selecione o banco ou carteira
            </p>

            <BankSelect
              value={selectedBank}
              onChange={setSelectedBank}
            />
          </div>

          <Input
            label={
              editingAccountId === null
                ? "Saldo inicial"
                : "Saldo atual"
            }
            type="text"
            placeholder="0,00"
            value={balance}
            onChange={setBalance}
          />

          <div className="flex justify-end gap-3 border-t border-slate-700 pt-5">
            <Button
              variant="secondary"
              onClick={closeModal}
              disabled={saving}
            >
              Cancelar
            </Button>

            <Button
              type="submit"
              disabled={!selectedBank || saving}
            >
              {saving
                ? "Salvando..."
                : editingAccountId === null
                  ? "Salvar conta"
                  : "Salvar alterações"}
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}