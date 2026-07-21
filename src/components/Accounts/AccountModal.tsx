import { useEffect, useState, type FormEvent } from "react";

import BankSelect from "../BankSelect/BankSelect";
import { db } from "../../database/database";
import type { Bank } from "../../data/banks";
import FinButton from "../../finui/Button/FinButton";
import FinInput from "../../finui/Input/FinInput";
import FinModal, {
  FinModalContent,
  FinModalDescription,
  FinModalFooter,
  FinModalHeader,
  FinModalTitle,
} from "../../finui/Modal/FinModal";
import type { Account } from "../../types/Account";
import type { Transaction } from "../../types/Transaction";

type AccountModalProps = {
  open: boolean;
  account?: Account;
  onClose: () => void;
  onSaved: () => void;
  onError: (title: string, message: string) => void;
};

function getLocalDate() {
  const today = new Date();
  const year = today.getFullYear();
  const month = String(today.getMonth() + 1).padStart(2, "0");
  const day = String(today.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

function parseCurrencyValue(value: string) {
  return Number(value.trim().replace(/\./g, "").replace(",", "."));
}

function formatCurrency(value: number) {
  return value.toLocaleString("pt-BR", {
    style: "currency",
    currency: "BRL",
  });
}

export default function AccountModal({
  open,
  account,
  onClose,
  onSaved,
  onError,
}: AccountModalProps) {
  const [selectedBank, setSelectedBank] = useState<Bank>();
  const [balance, setBalance] = useState("");
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!open) return;

    if (account) {
      setSelectedBank({
        id: account.bankId,
        name: account.name,
        image: account.image,
        type: account.type,
      });
      setBalance(String(account.balance));
      return;
    }

    setSelectedBank(undefined);
    setBalance("");
  }, [open, account]);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!selectedBank) {
      onError(
        "Banco não selecionado",
        "Selecione um banco ou carteira antes de salvar a conta.",
      );
      return;
    }

    const numericBalance = parseCurrencyValue(balance);

    if (balance.trim() === "" || Number.isNaN(numericBalance)) {
      onError(
        "Saldo inválido",
        account
          ? "Digite um saldo válido para atualizar a conta."
          : "Digite um saldo inicial válido para criar a conta.",
      );
      return;
    }

    try {
      setSaving(true);

      if (account) {
        const difference = numericBalance - account.balance;

        await db.transaction(
          "rw",
          db.accounts,
          db.transactions,
          async () => {
            await db.accounts.update(account.id, {
              bankId: selectedBank.id,
              name: selectedBank.name,
              image: selectedBank.image,
              type: selectedBank.type,
              balance: numericBalance,
            });

            if (difference !== 0) {
              const adjustmentTransaction: Transaction = {
                id: Date.now(),
                accountId: account.id,
                type: difference > 0 ? "income" : "expense",
                category: "Ajuste de saldo",
                description: `Saldo corrigido de ${formatCurrency(
                  account.balance,
                )} para ${formatCurrency(numericBalance)}`,
                amount: Math.abs(difference),
                date: getLocalDate(),
                createdAt: new Date().toISOString(),
                isAdjustment: true,
              };

              await db.transactions.add(adjustmentTransaction);
            }
          },
        );
      } else {
        await db.accounts.add({
          id: Date.now(),
          bankId: selectedBank.id,
          name: selectedBank.name,
          image: selectedBank.image,
          type: selectedBank.type,
          balance: numericBalance,
          createdAt: new Date().toISOString(),
        });
      }

      onSaved();
    } catch (error) {
      console.error("Erro ao salvar conta:", error);
      onError(
        "Não foi possível salvar",
        "Ocorreu um erro ao salvar a conta. Tente novamente.",
      );
    } finally {
      setSaving(false);
    }
  }

  return (
    <FinModal
      open={open}
      onClose={onClose}
      size="md"
      closeOnOverlayClick={!saving}
      closeOnEscape={!saving}
    >
      <form onSubmit={handleSubmit}>
        <FinModalHeader>
          <FinModalTitle>
            {account ? "Editar conta" : "Nova conta"}
          </FinModalTitle>
          <FinModalDescription>
            {account
              ? "Altere os dados exibidos nesta conta."
              : "Selecione o banco ou carteira e informe o saldo inicial."}
          </FinModalDescription>
        </FinModalHeader>

        <FinModalContent className="space-y-5">
          <div>
            <p className="mb-2.5 text-sm font-medium text-zinc-300">
              Banco ou carteira
            </p>
            <BankSelect value={selectedBank} onChange={setSelectedBank} />
          </div>

          <FinInput
            label={account ? "Saldo atual" : "Saldo inicial"}
            type="text"
            inputMode="decimal"
            placeholder="0,00"
            value={balance}
            onChange={(event) => setBalance(event.target.value)}
            helperText={
              account
                ? "Caso o saldo seja alterado, o FinControl registrará automaticamente um ajuste no histórico."
                : "Use vírgula para informar os centavos."
            }
          />
        </FinModalContent>

        <FinModalFooter>
          <FinButton
            type="button"
            variant="secondary"
            onClick={onClose}
            disabled={saving}
          >
            Cancelar
          </FinButton>
          <FinButton
            type="submit"
            disabled={!selectedBank}
            loading={saving}
          >
            {account ? "Salvar alterações" : "Salvar conta"}
          </FinButton>
        </FinModalFooter>
      </form>
    </FinModal>
  );
}
