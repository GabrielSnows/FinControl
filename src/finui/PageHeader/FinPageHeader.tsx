import type { ReactNode } from "react";

type FinPageHeaderProps = {
  title: string;
  description?: string;
  action?: ReactNode;
};

export default function FinPageHeader({
  title,
  description,
  action,
}: FinPageHeaderProps) {
  return (
    <header className="mb-8 flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
      <div className="min-w-0">
        <h1 className="text-3xl font-bold tracking-tight text-white sm:text-4xl">
          {title}
        </h1>

        {description && (
          <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-400 sm:text-base">
            {description}
          </p>
        )}
      </div>

      {action && (
        <div className="w-full shrink-0 lg:w-auto">
          {action}
        </div>
      )}
    </header>
  );
}