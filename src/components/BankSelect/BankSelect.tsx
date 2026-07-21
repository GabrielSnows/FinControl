import { banks } from "../../data/banks";
import type { Bank } from "../../data/banks";

type BankSelectProps = {
  value?: Bank;
  onChange: (bank: Bank) => void;
};

export default function BankSelect({
  value,
  onChange,
}: BankSelectProps) {
  return (
    <div className="fin-scrollbar grid max-h-80 grid-cols-3 gap-3 overflow-y-auto pr-2 sm:grid-cols-4">
      {banks.map((bank) => {
        const selected = value?.id === bank.id;

        return (
          <button
            key={bank.id}
            type="button"
            onClick={() => onChange(bank)}
            className={`group cursor-pointer rounded-2xl border p-4 transition-all duration-200 ${
              selected
                ? "border-zinc-500 bg-zinc-800 shadow-[0_0_0_1px_rgba(255,255,255,0.05)]"
                : "border-zinc-800 bg-zinc-900/60 hover:-translate-y-0.5 hover:border-zinc-700 hover:bg-zinc-800/80"
            }`}
          >
            <div className="flex flex-col items-center">
              <div
                className={`flex h-14 w-14 items-center justify-center rounded-xl border transition-colors ${
                  selected
                    ? "border-zinc-600 bg-white"
                    : "border-zinc-800 bg-white group-hover:border-zinc-700"
                }`}
              >
                <img
                  src={bank.image}
                  alt={bank.name}
                  className="h-10 w-10 object-contain"
                />
              </div>

              <span
                className={`mt-3 text-center text-sm font-medium transition-colors ${
                  selected
                    ? "text-zinc-100"
                    : "text-zinc-400 group-hover:text-zinc-200"
                }`}
              >
                {bank.name}
              </span>
            </div>
          </button>
        );
      })}
    </div>
  );
}