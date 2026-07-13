import {
  forwardRef,
  type HTMLAttributes,
} from "react";

type FinCardVariant =
  | "default"
  | "subtle"
  | "interactive";

type FinCardProps =
  HTMLAttributes<HTMLDivElement> & {
    variant?: FinCardVariant;
  };

const variantClasses: Record<
  FinCardVariant,
  string
> = {
  default:
    "border-zinc-800 bg-[#111113]",

  subtle:
    "border-zinc-900 bg-[#0d0d0f]",

  interactive:
    "cursor-pointer border-zinc-800 bg-[#111113] hover:-translate-y-0.5 hover:border-zinc-700 hover:bg-[#141416]",
};

const FinCard = forwardRef<
  HTMLDivElement,
  FinCardProps
>(function FinCard(
  {
    variant = "default",
    className = "",
    children,
    ...cardProps
  },
  ref,
) {
  return (
    <div
      ref={ref}
      className={[
        "rounded-2xl border",
        "transition-[background-color,border-color,transform] duration-150 ease-out",
        variantClasses[variant],
        className,
      ]
        .filter(Boolean)
        .join(" ")}
      {...cardProps}
    >
      {children}
    </div>
  );
});

type FinCardSectionProps =
  HTMLAttributes<HTMLDivElement>;

const FinCardHeader = forwardRef<
  HTMLDivElement,
  FinCardSectionProps
>(function FinCardHeader(
  {
    className = "",
    children,
    ...headerProps
  },
  ref,
) {
  return (
    <div
      ref={ref}
      className={[
        "flex flex-col gap-1.5 p-5 pb-0 sm:p-6 sm:pb-0",
        className,
      ]
        .filter(Boolean)
        .join(" ")}
      {...headerProps}
    >
      {children}
    </div>
  );
});

const FinCardTitle = forwardRef<
  HTMLHeadingElement,
  HTMLAttributes<HTMLHeadingElement>
>(function FinCardTitle(
  {
    className = "",
    children,
    ...titleProps
  },
  ref,
) {
  return (
    <h3
      ref={ref}
      className={[
        "text-base font-semibold tracking-tight text-zinc-100",
        className,
      ]
        .filter(Boolean)
        .join(" ")}
      {...titleProps}
    >
      {children}
    </h3>
  );
});

const FinCardDescription = forwardRef<
  HTMLParagraphElement,
  HTMLAttributes<HTMLParagraphElement>
>(function FinCardDescription(
  {
    className = "",
    children,
    ...descriptionProps
  },
  ref,
) {
  return (
    <p
      ref={ref}
      className={[
        "text-sm leading-6 text-zinc-500",
        className,
      ]
        .filter(Boolean)
        .join(" ")}
      {...descriptionProps}
    >
      {children}
    </p>
  );
});

const FinCardContent = forwardRef<
  HTMLDivElement,
  FinCardSectionProps
>(function FinCardContent(
  {
    className = "",
    children,
    ...contentProps
  },
  ref,
) {
  return (
    <div
      ref={ref}
      className={[
        "p-5 sm:p-6",
        className,
      ]
        .filter(Boolean)
        .join(" ")}
      {...contentProps}
    >
      {children}
    </div>
  );
});

const FinCardFooter = forwardRef<
  HTMLDivElement,
  FinCardSectionProps
>(function FinCardFooter(
  {
    className = "",
    children,
    ...footerProps
  },
  ref,
) {
  return (
    <div
      ref={ref}
      className={[
        "flex items-center gap-3 border-t border-zinc-800 p-5 sm:p-6",
        className,
      ]
        .filter(Boolean)
        .join(" ")}
      {...footerProps}
    >
      {children}
    </div>
  );
});

export {
  FinCard,
  FinCardContent,
  FinCardDescription,
  FinCardFooter,
  FinCardHeader,
  FinCardTitle,
};

export type {
  FinCardProps,
  FinCardVariant,
};