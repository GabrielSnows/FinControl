import { useEffect, useState } from "react";
import type { FormEvent } from "react";

import Modal from "../Modal/Modal";
import Button from "../ui/Button";
import Input from "../ui/Input";

import type { Account } from "../../types/Account";
import type {
  Transaction,
  TransactionType,
} from "../../types/Transaction";

type TransactionFormData = {
  accountId: number;
  type: TransactionType;
  category: string;
  description: string;
  amount: number;
  date: string;
};

type TransactionModalProps = {
  open: boolean;
  type: TransactionType;
  accounts: Account[];
  transaction?: Transaction;
  saving: boolean;
  onClose: () => void;
  onSave: (data: TransactionFormData) => Promise<void>;
};

const incomeCategories = [
  "Salário",
  "Freelance",
  "Vendas",
  "Shopee",
  "Pix recebido",
  "Presente",
  "Outros",
];

const expenseCategories = [
  "Alimentação",
  "Mercado",
  "Combustível",
  "Carro",
  "Casa",
  "Saúde",
  "Academia",
  "Lazer",
  "Roupas",
  "Estudos",
  "Assinaturas",
  "Outros",
];

function getToday() {
  return new Date().toISOString().split("T")[0];
}

export default function TransactionModal({
  open,
  type,
  accounts,
  transaction,
  saving,
  onClose,
  onSave,
}: TransactionModalProps) {
  const [accountId, setAccountId] = useState("");
  const [category, setCategory] = useState("");
  const [description, setDescription] = useState("");
  const [amount, setAmount] = useState("");
  const [date, setDate] = useState(getToday());

  const categories =
    type === "income"
      ? incomeCategories
      : expenseCategories;

  useEffect(() => {
    if (!open) return;

    if (transaction) {
      setAccountId(String(transaction.accountId));
      setCategory(transaction.category);
      setDescription(transaction.description);
      setAmount(String(transaction.amount));
      setDate(transaction.date);
      return;
    }

    setAccountId(
      accounts.length > 0
        ? String(accounts[0].id)
        : "",
    );

    setCategory("");
    setDescription("");
    setAmount("");
    setDate(getToday());
  }, [open, transaction, accounts]);

  useEffect(() => {
    if (!categories.includes(category)) {
      setCategory("");
    }
  }, [type, category, categories]);

  async function handleSubmit(
    event: FormEvent<HTMLFormElement>,
  ) {
    event.preventDefault();

    const selectedAccountId = Number(accountId);

    const normalizedAmount = amount
      .trim()
      .replace(/\./g, "")
      .replace(",", ".");

    const numericAmount = Number(normalizedAmount);

    if (!selectedAccountId) {
      window.alert("Selecione uma conta.");
      return;
    }

    if (!category) {
      window.alert("Selecione uma categoria.");
      return;
    }

    if (
      normalizedAmount === "" ||
      Number.isNaN(numericAmount) ||
      numericAmount <= 0
    ) {
      window.alert("Digite um valor maior que zero.");
      return;
    }

    if (!date) {
      window.alert("Selecione uma data.");
      return;
    }

    await onSave({
      accountId: selectedAccountId,
      type,
      category,
      description: description.trim(),
      amount: numericAmount,
      date,
    });
  }

  return (
    <Modal
      open={open}
      title={
        transaction
          ? "Editar movimentação"
          : type === "income"
            ? "Nova receita"
            : "Nova despesa"
      }
      onClose={onClose}
    >
      {accounts.length === 0 ? (
        <div>
          <p className="text-slate-300">
            Você precisa cadastrar uma conta antes de
            registrar movimentações.
          </p>

          <div className="mt-6 flex justify-end">
            <Button
              variant="secondary"
              onClick={onClose}
            >
              Fechar
            </Button>
          </div>
        </div>
      ) : (
        <form
          onSubmit={handleSubmit}
          className="space-y-5"
        >
          <div className="space-y-2">
            <label className="block text-sm font-medium text-slate-300">
              Conta
            </label>

            <select
              value={accountId}
              onChange={(event) =>
                setAccountId(event.target.value)
              }
              className="w-full rounded-xl border border-slate-600 bg-slate-900 px-4 py-3 text-white outline-none transition focus:border-emerald-500"
            >
              <option value="">
                Selecione uma conta
              </option>

              {accounts.map((account) => (
                <option
                  key={account.id}
                  value={account.id}
                >
                  {account.name}
                </option>
              ))}
            </select>
          </div>

          <div className="space-y-2">
            <label className="block text-sm font-medium text-slate-300">
              Categoria
            </label>

            <select
              value={category}
              onChange={(event) =>
                setCategory(event.target.value)
              }
              className="w-full rounded-xl border border-slate-600 bg-slate-900 px-4 py-3 text-white outline-none transition focus:border-emerald-500"
            >
              <option value="">
                Selecione uma categoria
              </option>

              {categories.map((categoryName) => (
                <option
                  key={categoryName}
                  value={categoryName}
                >
                  {categoryName}
                </option>
              ))}
            </select>
          </div>

          <Input
            label="Valor"
            type="text"
            placeholder="0,00"
            value={amount}
            onChange={setAmount}
          />

          <Input
            label="Descrição"
            type="text"
            placeholder="Ex.: Compra no mercado"
            value={description}
            onChange={setDescription}
          />

          <Input
            label="Data"
            type="date"
            value={date}
            onChange={setDate}
          />

          <div className="flex justify-end gap-3 border-t border-slate-700 pt-5">
            <Button
              variant="secondary"
              onClick={onClose}
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
                : transaction
                  ? "Salvar alterações"
                  : type === "income"
                    ? "Salvar receita"
                    : "Salvar despesa"}
            </Button>
          </div>
        </form>
      )}
    </Modal>
  );
}

export type { TransactionFormData };