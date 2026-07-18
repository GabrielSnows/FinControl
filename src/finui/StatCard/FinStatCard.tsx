import type { LucideIcon } from "lucide-react";

import {
  FinCard,
  FinCardContent,
} from "../Card/FinCard";

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
  iconBackgroundClassName = "bg-zinc-900",
  iconColorClassName = "text-zinc-400",
  valueClassName = "text-zinc-100",
}: FinStatCardProps) {
  return (
    <FinCard variant="subtle">
      <FinCardContent className="flex items-center gap-4">
        {Icon && (
          <div
            className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-xl ${iconBackgroundClassName}`}
          >
            <Icon
              size={21}
              strokeWidth={1.8}
              className={iconColorClassName}
            />
          </div>
        )}

        <div className="min-w-0">
          <p className="text-sm font-medium text-zinc-500">
            {title}
          </p>

          <strong
            className={`mt-1 block truncate text-xl font-semibold tracking-tight ${valueClassName}`}
          >
            {value}
          </strong>
        </div>
      </FinCardContent>
    </FinCard>
  );
}