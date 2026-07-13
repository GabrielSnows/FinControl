import {
  forwardRef,
  type ButtonHTMLAttributes,
  type ReactNode,
} from "react";

import { LoaderCircle } from "lucide-react";

type FinButtonVariant =
  | "primary"
  | "secondary"
  | "ghost"
  | "destructive";

type FinButtonSize = "sm" | "md" | "lg";

type FinButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  children: ReactNode;
  variant?: FinButtonVariant;
  size?: FinButtonSize;
  loading?: boolean;
  fullWidth?: boolean;
  leftIcon?: ReactNode;
  rightIcon?: ReactNode;
};

const variantClasses: Record<FinButtonVariant, string> = {
  primary:
    "border-zinc-200 bg-zinc-200 text-zinc-950 hover:border-zinc-300 hover:bg-zinc-300",

  secondary:
    "border-zinc-800 bg-zinc-900 text-zinc-100 hover:border-zinc-700 hover:bg-zinc-800",

  ghost:
    "border-transparent bg-transparent text-zinc-300 hover:bg-zinc-900 hover:text-zinc-50",

  destructive:
    "border-zinc-800 bg-zinc-900 text-zinc-200 hover:border-red-900/80 hover:bg-red-950/60 hover:text-red-300",
};

const sizeClasses: Record<FinButtonSize, string> = {
  sm: "h-8 gap-1.5 rounded-lg px-3 text-xs",
  md: "h-10 gap-2 rounded-[10px] px-4 text-sm",
  lg: "h-12 gap-2.5 rounded-xl px-5 text-sm",
};

const iconSizeClasses: Record<FinButtonSize, string> = {
  sm: "[&>svg]:h-3.5 [&>svg]:w-3.5",
  md: "[&>svg]:h-4 [&>svg]:w-4",
  lg: "[&>svg]:h-[18px] [&>svg]:w-[18px]",
};

const FinButton = forwardRef<HTMLButtonElement, FinButtonProps>(
  function FinButton(
    {
      children,
      variant = "primary",
      size = "md",
      loading = false,
      fullWidth = false,
      leftIcon,
      rightIcon,
      disabled,
      type = "button",
      className = "",
      ...buttonProps
    },
    ref,
  ) {
    const isDisabled = disabled || loading;

    return (
      <button
        ref={ref}
        type={type}
        disabled={isDisabled}
        aria-busy={loading}
        className={[
          "inline-flex cursor-pointer select-none items-center justify-center whitespace-nowrap",
          "border font-medium outline-none",
          "transition-[background-color,border-color,color,opacity,transform] duration-150 ease-out",
          "focus-visible:ring-2 focus-visible:ring-zinc-500 focus-visible:ring-offset-2 focus-visible:ring-offset-[#09090b]",
          "active:translate-y-px",
          "disabled:cursor-not-allowed disabled:opacity-45",
          variantClasses[variant],
          sizeClasses[size],
          iconSizeClasses[size],
          fullWidth ? "w-full" : "w-auto",
          className,
        ]
          .filter(Boolean)
          .join(" ")}
        {...buttonProps}
      >
        {loading ? (
          <LoaderCircle
            aria-hidden="true"
            className="shrink-0 animate-spin"
          />
        ) : (
          leftIcon
        )}

        <span>{children}</span>

        {!loading && rightIcon}
      </button>
    );
  },
);

export default FinButton;

export type {
  FinButtonProps,
  FinButtonSize,
  FinButtonVariant,
};