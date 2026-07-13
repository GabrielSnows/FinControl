import {
  forwardRef,
  useId,
  type InputHTMLAttributes,
  type ReactNode,
} from "react";

type FinInputProps = Omit<
  InputHTMLAttributes<HTMLInputElement>,
  "size"
> & {
  label?: string;
  helperText?: string;
  error?: string;
  leftIcon?: ReactNode;
  rightIcon?: ReactNode;
  fullWidth?: boolean;
};

const FinInput = forwardRef<HTMLInputElement, FinInputProps>(
  function FinInput(
    {
      label,
      helperText,
      error,
      leftIcon,
      rightIcon,
      fullWidth = true,
      disabled,
      id,
      className = "",
      "aria-describedby": ariaDescribedBy,
      ...inputProps
    },
    ref,
  ) {
    const generatedId = useId();

    const inputId = id ?? generatedId;
    const helperId = `${inputId}-helper`;
    const errorId = `${inputId}-error`;

    const describedBy = [
      ariaDescribedBy,
      error ? errorId : undefined,
      !error && helperText ? helperId : undefined,
    ]
      .filter(Boolean)
      .join(" ");

    return (
      <div
        className={
          fullWidth
            ? "w-full"
            : "w-auto"
        }
      >
        {label && (
          <label
            htmlFor={inputId}
            className="mb-2 block text-sm font-medium text-zinc-300"
          >
            {label}
          </label>
        )}

        <div className="relative">
          {leftIcon && (
            <div
              aria-hidden="true"
              className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3.5 text-zinc-500 [&>svg]:h-4 [&>svg]:w-4"
            >
              {leftIcon}
            </div>
          )}

          <input
            {...inputProps}
            ref={ref}
            id={inputId}
            disabled={disabled}
            aria-invalid={Boolean(error)}
            aria-describedby={
              describedBy || undefined
            }
            className={[
              "h-10 min-w-0 rounded-[10px] border bg-[#111113] px-3.5 text-base text-zinc-100",
              "outline-none transition-[background-color,border-color,box-shadow,color,opacity] duration-150 ease-out",
              "placeholder:text-zinc-600",
              "hover:border-zinc-700",
              "focus:border-zinc-500 focus:bg-[#141416]",
              "focus:ring-2 focus:ring-zinc-700/40",
              "disabled:cursor-not-allowed disabled:border-zinc-800 disabled:bg-zinc-950 disabled:text-zinc-600 disabled:opacity-60",
              error
                ? "border-red-900/80 focus:border-red-800 focus:ring-red-950/60"
                : "border-zinc-800",
              leftIcon ? "pl-10" : "",
              rightIcon ? "pr-10" : "",
              fullWidth ? "w-full" : "w-auto",
              className,
            ]
              .filter(Boolean)
              .join(" ")}
          />

          {rightIcon && (
            <div
              aria-hidden="true"
              className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-3.5 text-zinc-500 [&>svg]:h-4 [&>svg]:w-4"
            >
              {rightIcon}
            </div>
          )}
        </div>

        {error ? (
          <p
            id={errorId}
            className="mt-2 text-xs leading-5 text-red-400"
          >
            {error}
          </p>
        ) : helperText ? (
          <p
            id={helperId}
            className="mt-2 text-xs leading-5 text-zinc-500"
          >
            {helperText}
          </p>
        ) : null}
      </div>
    );
  },
);

export default FinInput;

export type { FinInputProps };