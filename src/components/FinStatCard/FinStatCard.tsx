import type { LucideIcon } from "lucide-react";

interface FinStatCardProps {
  title: string;
  value: string | number;
  icon?: LucideIcon;
  iconBackgroundClassName?: string;
  iconColorClassName?: string;
  valueClassName?: string;
}

export default function FinStatCard({
  title,
  value,
  icon: Icon,
  iconBackgroundClassName = "bg-slate-700",
  iconColorClassName = "text-white",
  valueClassName = "text-white",
}: FinStatCardProps) {
  return (
    <div className="rounded-2xl border border-slate-700 bg-slate-800 p-5 transition-colors duration-200 hover:border-slate-600">
      <div className="flex items-center gap-4">
        {Icon && (
          <div
            className={`flex h-12 w-12 items-center justify-center rounded-xl ${iconBackgroundClassName}`}
          >
            <Icon
              size={24}
              className={iconColorClassName}
            />
          </div>
        )}

        <div className="min-w-0">
          <p className="text-sm text-slate-400">
            {title}
          </p>

          <strong
            className={`mt-1 block text-xl font-semibold ${valueClassName}`}
          >
            {value}
          </strong>
        </div>
      </div>
    </div>
  );
}