import { Pencil, Trash2 } from "lucide-react";

import {
  FinCard,
  FinCardContent,
  FinCardDescription,
  FinCardHeader,
  FinCardTitle,
} from "../../finui/Card/FinCard";
import type { Account } from "../../types/Account";

type AccountCardProps = {
  account: Account;
  onEdit: (account: Account) => void;
  onDelete: (account: Account) => void;
};

function formatCurrency(value: number) {
  return value.toLocaleString("pt-BR", {
    style: "currency",
    currency: "BRL",
  });
}

export default function AccountCard({
  account,
  onEdit,
  onDelete,
}: AccountCardProps) {
  const isNegative = account.balance < 0;

  return (
    <FinCard
      variant="interactive"
      className="group flex min-h-44 flex-col sm:min-h-56"
    >
      <FinCardHeader className="flex-row items-start justify-between gap-3 sm:gap-4">
        <div className="flex min-w-0 items-center gap-3 sm:gap-3.5">
          <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl border border-zinc-800 bg-white p-2 sm:h-13 sm:w-13 sm:rounded-2xl">
            <img
              src={account.image}
              alt=""
              className="h-full w-full object-contain"
            />
          </div>

          <div className="min-w-0">
            <FinCardTitle className="truncate text-base">
              {account.name}
            </FinCardTitle>

            <FinCardDescription className="mt-1">
              {account.type === "bank"
                ? "Conta bancária"
                : "Carteira"}
            </FinCardDescription>
          </div>
        </div>

        <div className="flex shrink-0 items-center gap-0.5 opacity-80 transition-opacity group-hover:opacity-100">
          <button
            type="button"
            title="Editar conta"
            aria-label={`Editar ${account.name}`}
            onClick={() => onEdit(account)}
            className="flex h-8 w-8 cursor-pointer items-center justify-center rounded-lg text-zinc-500 transition-colors hover:bg-zinc-800 hover:text-zinc-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-zinc-600 sm:h-9 sm:w-9"
          >
            <Pencil size={16} strokeWidth={1.8} />
          </button>

          <button
            type="button"
            title="Excluir conta"
            aria-label={`Excluir ${account.name}`}
            onClick={() => onDelete(account)}
            className="flex h-8 w-8 cursor-pointer items-center justify-center rounded-lg text-zinc-500 transition-colors hover:bg-red-950/60 hover:text-red-400 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-900 sm:h-9 sm:w-9"
          >
            <Trash2 size={16} strokeWidth={1.8} />
          </button>
        </div>
      </FinCardHeader>

      <FinCardContent className="mt-auto">
        <p className="text-xs font-medium uppercase tracking-[0.12em] text-zinc-600">
          Saldo disponível
        </p>

        <strong
          className={`mt-2 block text-2xl font-semibold tracking-tight sm:text-3xl ${
            isNegative ? "text-red-400" : "text-zinc-100"
          }`}
        >
          {formatCurrency(account.balance)}
        </strong>
      </FinCardContent>
    </FinCard>
  );
}
