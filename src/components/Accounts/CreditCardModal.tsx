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
import type {
  CreditCard,
  CreditCardBrand,
} from "../../types/CreditCard";

type CreditCardModalProps = {
  open: boolean;
  creditCard?: CreditCard;
  onClose: () => void;
  onSaved: () => void;
  onError: (title: string, message: string) => void;
};

const creditCardBrands: CreditCardBrand[] = [
  "Visa",
  "Mastercard",
  "Elo",
  "American-Express",
  "Hipercard",
  "Other",
];

function parseCurrencyValue(value: string) {
  return Number(value.trim().replace(/\./g, "").replace(",", "."));
}

export default function CreditCardModal({
  open,
  creditCard,
  onClose,
  onSaved,
  onError,
}: CreditCardModalProps) {
  const [selectedBank, setSelectedBank] = useState<Bank>();
  const [name, setName] = useState("");
  const [brand, setBrand] = useState<CreditCardBrand>("Visa");
  const [limit, setLimit] = useState("");
  const [dueDay, setDueDay] = useState("");
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!open) return;

    if (creditCard) {
      setSelectedBank({
        id: creditCard.bankId,
        name: creditCard.name,
        image: creditCard.image,
        type: "bank",
      });
      setName(creditCard.name);
      setBrand(creditCard.brand);
      setLimit(String(creditCard.limit));
      setDueDay(String(creditCard.dueDay));
      return;
    }

    setSelectedBank(undefined);
    setName("");
    setBrand("Visa");
    setLimit("");
    setDueDay("");
  }, [open, creditCard]);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!selectedBank) {
      onError(
        "Banco não selecionado",
        "Selecione o banco emissor do cartão.",
      );
      return;
    }

    const normalizedName = name.trim();
    const numericLimit = parseCurrencyValue(limit);
    const numericDueDay = Number(dueDay);

    if (!normalizedName) {
      onError(
        "Nome não informado",
        "Digite um nome para identificar o cartão.",
      );
      return;
    }

    if (
      limit.trim() === "" ||
      Number.isNaN(numericLimit) ||
      numericLimit < 0
    ) {
      onError(
        "Limite inválido",
        "Digite um limite válido para o cartão.",
      );
      return;
    }

    if (
      !Number.isInteger(numericDueDay) ||
      numericDueDay < 1 ||
      numericDueDay > 31
    ) {
      onError(
        "Vencimento inválido",
        "Informe um dia de vencimento entre 1 e 31.",
      );
      return;
    }

    try {
      setSaving(true);

      if (creditCard) {
        await db.creditCards.update(creditCard.id, {
          bankId: selectedBank.id,
          name: normalizedName,
          image: selectedBank.image,
          brand,
          limit: numericLimit,
          dueDay: numericDueDay,
        });
      } else {
        await db.creditCards.add({
          id: Date.now(),
          bankId: selectedBank.id,
          name: normalizedName,
          image: selectedBank.image,
          brand,
          limit: numericLimit,
          dueDay: numericDueDay,
          createdAt: new Date().toISOString(),
        });
      }

      onSaved();
    } catch (error) {
      console.error("Erro ao salvar cartão:", error);
      onError(
        "Não foi possível salvar",
        "Ocorreu um erro ao salvar o cartão. Tente novamente.",
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
            {creditCard ? "Editar cartão" : "Novo cartão"}
          </FinModalTitle>
          <FinModalDescription>
            Informe os dados principais do cartão de crédito.
          </FinModalDescription>
        </FinModalHeader>

        <FinModalContent className="space-y-5">
          <div>
            <p className="mb-2.5 text-sm font-medium text-zinc-300">
              Banco emissor
            </p>
            <BankSelect value={selectedBank} onChange={setSelectedBank} />
          </div>

          <FinInput
            label="Nome do cartão"
            type="text"
            placeholder="Ex.: Inter Platinum"
            value={name}
            onChange={(event) => setName(event.target.value)}
            helperText="Use um nome que facilite identificar este cartão."
          />

          <div>
            <label
              htmlFor="credit-card-brand"
              className="mb-2.5 block text-sm font-medium text-zinc-300"
            >
              Bandeira
            </label>

            <select
              id="credit-card-brand"
              value={brand}
              onChange={(event) =>
                setBrand(event.target.value as CreditCardBrand)
              }
              className="h-11 w-full cursor-pointer rounded-xl border border-zinc-800 bg-zinc-950 px-3.5 text-sm text-zinc-100 outline-none transition-colors hover:border-zinc-700 focus:border-zinc-600 focus:ring-2 focus:ring-zinc-800"
            >
              {creditCardBrands.map((option) => (
                <option key={option} value={option}>
                  {option}
                </option>
              ))}
            </select>
          </div>

          <FinInput
            label="Limite total"
            type="text"
            inputMode="decimal"
            placeholder="0,00"
            value={limit}
            onChange={(event) => setLimit(event.target.value)}
            helperText="Informe o limite total concedido pelo banco."
          />

          <FinInput
            label="Dia do vencimento"
            type="number"
            inputMode="numeric"
            min="1"
            max="31"
            placeholder="10"
            value={dueDay}
            onChange={(event) => setDueDay(event.target.value)}
            helperText="Informe apenas o dia, entre 1 e 31."
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
            {creditCard ? "Salvar alterações" : "Salvar cartão"}
          </FinButton>
        </FinModalFooter>
      </form>
    </FinModal>
  );
}
