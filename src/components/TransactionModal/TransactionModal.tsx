import { useEffect, useMemo, useState } from "react";
import type { FormEvent } from "react";
import {
  ArrowDownLeft,
  ArrowUpRight,
  CalendarDays,
  CircleDollarSign,
  FileText,
  WalletCards,
} from "lucide-react";

import AlertModal from "../AlertModal/AlertModal";

import FinButton from "../../finui/Button/FinButton";
import FinInput from "../../finui/Input/FinInput";
import FinModal, {
  FinModalContent,
  FinModalDescription,
  FinModalFooter,
  FinModalHeader,
  FinModalTitle,
} from "../../finui/Modal/FinModal";
import FinSelect from "../../finui/Select/FinSelect";

import type { Account } from "../../types/Account";
import type {
  Transaction,
  TransactionType,
} from "../../types/Transaction";
import type { AlertType } from "../AlertModal/AlertModal";

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

type AlertData = {
  title: string;
  message: string;
  type: AlertType;
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
  const today = new Date();
  const year = today.getFullYear();
  const month = String(today.getMonth() + 1).padStart(2, "0");
  const day = String(today.getDate()).padStart(2, "0");

  return `${year}-${month}-${day}`;
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
  const [alert, setAlert] = useState<AlertData>();
  const [alertOpen, setAlertOpen] = useState(false);

  const isIncome = type === "income";

  const categories = useMemo(
    () => (isIncome ? incomeCategories : expenseCategories),
    [isIncome],
  );

  const accountOptions = useMemo(
    () =>
      accounts.map((account) => ({
        value: String(account.id),
        label: account.name,
      })),
    [accounts],
  );

  const categoryOptions = useMemo(
    () =>
      categories.map((categoryName) => ({
        value: categoryName,
        label: categoryName,
      })),
    [categories],
  );

  const modalTitle = transaction
    ? "Editar movimentação"
    : isIncome
      ? "Nova receita"
      : "Nova despesa";

  const modalDescription = transaction
    ? "Atualize os dados desta movimentação."
    : isIncome
      ? "Registre uma nova entrada em uma das suas contas."
      : "Registre uma nova saída em uma das suas contas.";

  const submitText = transaction
    ? "Salvar alterações"
    : isIncome
      ? "Salvar receita"
      : "Salvar despesa";

  function showAlert(
    title: string,
    message: string,
    alertType: AlertType = "warning",
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
  }, [category, categories]);

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
      showAlert(
        "Conta não selecionada",
        "Selecione a conta que será afetada por esta movimentação.",
      );
      return;
    }

    if (!category) {
      showAlert(
        "Categoria não selecionada",
        "Selecione uma categoria para a movimentação.",
      );
      return;
    }

    if (
      normalizedAmount === ""
      || Number.isNaN(numericAmount)
      || numericAmount <= 0
    ) {
      showAlert(
        "Valor inválido",
        "Digite um valor maior que zero.",
      );
      return;
    }

    if (!date) {
      showAlert(
        "Data não informada",
        "Selecione a data da movimentação.",
      );
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
    <>
      <FinModal
        open={open}
        onClose={onClose}
        size="md"
        closeOnOverlayClick={!saving}
        closeOnEscape={!saving}
      >
        <FinModalHeader>
          <div className="flex items-start gap-3.5">
            <div
              className={[
                "flex h-11 w-11 shrink-0 items-center justify-center rounded-xl border",
                isIncome
                  ? "border-emerald-950 bg-emerald-950/30 text-emerald-400"
                  : "border-red-950 bg-red-950/30 text-red-400",
              ].join(" ")}
            >
              {isIncome ? (
                <ArrowDownLeft className="h-5 w-5" />
              ) : (
                <ArrowUpRight className="h-5 w-5" />
              )}
            </div>

            <div className="min-w-0 flex-1">
              <FinModalTitle>{modalTitle}</FinModalTitle>

              <FinModalDescription className="mt-1.5">
                {modalDescription}
              </FinModalDescription>
            </div>
          </div>
        </FinModalHeader>

        {accounts.length === 0 ? (
          <>
            <FinModalContent>
              <div className="rounded-xl border border-zinc-800 bg-zinc-950/50 p-5">
                <div className="flex items-start gap-3.5">
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-zinc-800 bg-zinc-900 text-zinc-400">
                    <WalletCards className="h-5 w-5" />
                  </div>

                  <div>
                    <p className="text-sm font-medium text-zinc-200">
                      Nenhuma conta cadastrada
                    </p>

                    <p className="mt-1 text-sm leading-6 text-zinc-500">
                      Você precisa cadastrar uma conta antes de registrar
                      receitas ou despesas.
                    </p>
                  </div>
                </div>
              </div>
            </FinModalContent>

            <FinModalFooter>
              <FinButton
                type="button"
                variant="secondary"
                onClick={onClose}
              >
                Fechar
              </FinButton>
            </FinModalFooter>
          </>
        ) : (
          <form onSubmit={handleSubmit}>
            <FinModalContent>
              <div className="space-y-5">
                <div className="grid gap-5 sm:grid-cols-2">
                  <FinSelect
                    label="Conta"
                    value={accountId}
                    options={accountOptions}
                    onChange={(value) => setAccountId(value)}
                    placeholder="Selecione uma conta"
                    searchPlaceholder="Pesquisar conta..."
                    emptyMessage="Nenhuma conta encontrada."
                    searchable={accounts.length > 6}
                  />

                  <FinSelect
                    label="Categoria"
                    value={category}
                    options={categoryOptions}
                    onChange={(value) => setCategory(value)}
                    placeholder="Selecione uma categoria"
                    searchPlaceholder="Pesquisar categoria..."
                    emptyMessage="Nenhuma categoria encontrada."
                    searchable={categories.length > 8}
                  />
                </div>

                <FinInput
                  label="Valor"
                  type="text"
                  inputMode="decimal"
                  placeholder="0,00"
                  value={amount}
                  onChange={(event) => setAmount(event.target.value)}
                  leftIcon={<CircleDollarSign />}
                  autoComplete="off"
                />

                <FinInput
                  label="Descrição"
                  type="text"
                  placeholder={
                    isIncome
                      ? "Ex.: Pagamento de freelance"
                      : "Ex.: Compra no mercado"
                  }
                  value={description}
                  onChange={(event) =>
                    setDescription(event.target.value)
                  }
                  leftIcon={<FileText />}
                  maxLength={120}
                  autoComplete="off"
                />

                <FinInput
                  label="Data"
                  type="date"
                  value={date}
                  onChange={(event) => setDate(event.target.value)}
                  leftIcon={<CalendarDays />}
                />
              </div>
            </FinModalContent>

            <FinModalFooter className="grid grid-cols-2 gap-3">
              <FinButton
                type="button"
                variant="secondary"
                fullWidth
                onClick={onClose}
                disabled={saving}
              >
                Cancelar
              </FinButton>

              <FinButton
                type="submit"
                fullWidth
                loading={saving}
                disabled={saving}
              >
                {submitText}
              </FinButton>
            </FinModalFooter>
          </form>
        )}
      </FinModal>

      <AlertModal
        open={alertOpen}
        title={alert?.title ?? ""}
        message={alert?.message ?? ""}
        type={alert?.type}
        onClose={handleCloseAlert}
      />    
    </>
  );
}

export type { TransactionFormData };