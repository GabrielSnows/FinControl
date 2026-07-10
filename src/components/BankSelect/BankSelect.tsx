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
    <div className="grid grid-cols-3 gap-3">

      {banks.map((bank) => {

        const selected = value?.id === bank.id;

        return (

          <button
            key={bank.id}
            type="button"
            onClick={() => onChange(bank)}
            className={`rounded-xl border p-3 transition

            ${
              selected
                ? "border-emerald-500 bg-emerald-900/40"
                : "border-slate-700 hover:border-emerald-500 hover:bg-slate-800"
            }
            `}
          >

            <div className="flex flex-col items-center">

              <img
                src={bank.image}
                alt={bank.name}
                className="h-10 w-10 object-contain"
              />

              <span className="mt-2 text-sm">

                {bank.name}

              </span>

            </div>

          </button>

        );

      })}

    </div>
  );
}