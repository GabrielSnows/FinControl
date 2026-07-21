import { Pencil, Trash2 } from "lucide-react";

import {
  FinCard,
  FinCardContent,
  FinCardDescription,
  FinCardHeader,
  FinCardTitle,
} from "../../finui/Card/FinCard";
import type { CreditCard } from "../../types/CreditCard";

type CreditCardCardProps = {
  creditCard: CreditCard;
  onEdit: (creditCard: CreditCard) => void;
  onDelete: (creditCard: CreditCard) => void;
};

function formatCurrency(value: number) {
  return value.toLocaleString("pt-BR", {
    style: "currency",
    currency: "BRL",
  });
}

export default function CreditCardCard({
  creditCard,
  onEdit,
  onDelete,
}: CreditCardCardProps) {
  return (
    <FinCard
      variant="interactive"
      className="group flex min-h-52 flex-col"
    >
      <FinCardHeader className="flex-row items-start justify-between gap-3 sm:gap-4">
        <div className="flex min-w-0 items-center gap-3 sm:gap-3.5">
          <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl border border-zinc-800 bg-white p-2 sm:h-13 sm:w-13 sm:rounded-2xl">
            <img
              src={creditCard.image}
              alt=""
              className="h-full w-full object-contain"
            />
          </div>

          <div className="min-w-0">
            <FinCardTitle className="truncate text-base">
              {creditCard.name}
            </FinCardTitle>

            <FinCardDescription className="mt-1">
              {creditCard.brand}
            </FinCardDescription>
          </div>
        </div>

        <div className="flex shrink-0 items-center gap-0.5 opacity-80 transition-opacity group-hover:opacity-100">
          <button
            type="button"
            title="Editar cartão"
            aria-label={`Editar ${creditCard.name}`}
            onClick={() => onEdit(creditCard)}
            className="flex h-8 w-8 cursor-pointer items-center justify-center rounded-lg text-zinc-500 transition-colors hover:bg-zinc-800 hover:text-zinc-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-zinc-600 sm:h-9 sm:w-9"
          >
            <Pencil size={16} strokeWidth={1.8} />
          </button>

          <button
            type="button"
            title="Excluir cartão"
            aria-label={`Excluir ${creditCard.name}`}
            onClick={() => onDelete(creditCard)}
            className="flex h-8 w-8 cursor-pointer items-center justify-center rounded-lg text-zinc-500 transition-colors hover:bg-red-950/60 hover:text-red-400 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-900 sm:h-9 sm:w-9"
          >
            <Trash2 size={16} strokeWidth={1.8} />
          </button>
        </div>
      </FinCardHeader>

      <FinCardContent className="mt-auto">
        <p className="text-xs font-medium uppercase tracking-[0.12em] text-zinc-600">
          Limite total
        </p>

        <strong className="mt-2 block text-2xl font-semibold tracking-tight text-zinc-100 sm:text-3xl">
          {formatCurrency(creditCard.limit)}
        </strong>

        <div className="mt-4 border-t border-zinc-900 pt-4">
          <p className="text-xs text-zinc-600">Vencimento</p>
          <p className="mt-1 text-sm font-medium text-zinc-300">
            Dia {creditCard.dueDay}
          </p>
        </div>
      </FinCardContent>
    </FinCard>
  );
}
