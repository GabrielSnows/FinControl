import {
  forwardRef,
  useEffect,
  useId,
  useRef,
  useState,
  type ButtonHTMLAttributes,
} from "react";

import {
  CalendarDays,
  ChevronDown,
} from "lucide-react";

import {
  DayPicker,
  getDefaultClassNames,
} from "@daypicker/react";

import { ptBR } from "@daypicker/react/locale";

import "@daypicker/react/style.css";
import "./FinDatePicker.css";

type FinDatePickerProps = Omit<
  ButtonHTMLAttributes<HTMLButtonElement>,
  "value" | "onChange"
> & {
  label?: string;
  value?: string;
  onChange: (value: string) => void;
  placeholder?: string;
  helperText?: string;
  error?: string;
  fullWidth?: boolean;
};

function parseDateValue(value?: string) {
  if (!value) return undefined;

  const [year, month, day] = value
    .split("-")
    .map(Number);

  if (!year || !month || !day) {
    return undefined;
  }

  const date = new Date(year, month - 1, day);

  if (Number.isNaN(date.getTime())) {
    return undefined;
  }

  return date;
}

function dateToValue(date: Date) {
  const year = date.getFullYear();

  const month = String(
    date.getMonth() + 1,
  ).padStart(2, "0");

  const day = String(
    date.getDate(),
  ).padStart(2, "0");

  return `${year}-${month}-${day}`;
}

function formatDisplayDate(value?: string) {
  const date = parseDateValue(value);

  if (!date) return "";

  return new Intl.DateTimeFormat("pt-BR", {
    day: "2-digit",
    month: "long",
    year: "numeric",
  }).format(date);
}

const FinDatePicker = forwardRef<
  HTMLButtonElement,
  FinDatePickerProps
>(function FinDatePicker(
  {
    label,
    value,
    onChange,
    placeholder = "Selecione uma data",
    helperText,
    error,
    fullWidth = true,
    disabled,
    id,
    className = "",
    ...buttonProps
  },
  forwardedRef,
) {
  const generatedId = useId();

  const buttonId = id ?? generatedId;
  const helperId = `${buttonId}-helper`;
  const errorId = `${buttonId}-error`;

  const containerRef =
    useRef<HTMLDivElement>(null);

  const [open, setOpen] = useState(false);

  const selectedDate =
    parseDateValue(value);

  const defaultClassNames =
    getDefaultClassNames();

  useEffect(() => {
    if (!open) return;

    function handleMouseDown(
      event: MouseEvent,
    ) {
      const target = event.target;

      if (!(target instanceof Node)) {
        return;
      }

      if (
        !containerRef.current?.contains(target)
      ) {
        setOpen(false);
      }
    }

    function handleKeyDown(
      event: KeyboardEvent,
    ) {
      if (event.key === "Escape") {
        setOpen(false);
      }
    }

    document.addEventListener(
      "mousedown",
      handleMouseDown,
    );

    document.addEventListener(
      "keydown",
      handleKeyDown,
    );

    return () => {
      document.removeEventListener(
        "mousedown",
        handleMouseDown,
      );

      document.removeEventListener(
        "keydown",
        handleKeyDown,
      );
    };
  }, [open]);

  function handleSelect(date?: Date) {
    if (!date) return;

    onChange(dateToValue(date));
    setOpen(false);
  }

  const describedBy = error
    ? errorId
    : helperText
      ? helperId
      : undefined;

  return (
    <div
      ref={containerRef}
      className={[
        "relative",
        fullWidth ? "w-full" : "w-auto",
      ]
        .filter(Boolean)
        .join(" ")}
    >
      {label && (
        <label
          htmlFor={buttonId}
          className="mb-2 block text-sm font-medium text-zinc-300"
        >
          {label}
        </label>
      )}

      <button
        {...buttonProps}
        ref={forwardedRef}
        id={buttonId}
        type="button"
        disabled={disabled}
        aria-haspopup="dialog"
        aria-expanded={open}
        aria-invalid={Boolean(error)}
        aria-describedby={describedBy}
        onClick={() =>
          setOpen((current) => !current)
        }
        className={[
          "flex h-10 min-w-0 cursor-pointer items-center rounded-[10px] border bg-[#111113] px-3.5 text-left text-base",
          "outline-none transition-[background-color,border-color,box-shadow,color,opacity] duration-150 ease-out",
          "hover:border-zinc-700",
          "focus-visible:border-zinc-500 focus-visible:bg-[#141416]",
          "focus-visible:ring-2 focus-visible:ring-zinc-700/40",
          "disabled:cursor-not-allowed disabled:border-zinc-800 disabled:bg-zinc-950 disabled:text-zinc-600 disabled:opacity-60",
          error
            ? "border-red-900/80 focus-visible:border-red-800 focus-visible:ring-red-950/60"
            : "border-zinc-800",
          fullWidth ? "w-full" : "w-auto",
          className,
        ]
          .filter(Boolean)
          .join(" ")}
      >
        <CalendarDays
          aria-hidden="true"
          className="mr-3 h-4 w-4 shrink-0 text-zinc-500"
        />

        <span
          className={[
            "min-w-0 flex-1 truncate",
            value
              ? "text-zinc-100"
              : "text-zinc-600",
          ].join(" ")}
        >
          {value
            ? formatDisplayDate(value)
            : placeholder}
        </span>

        <ChevronDown
          aria-hidden="true"
          className={[
            "ml-3 h-4 w-4 shrink-0 text-zinc-500 transition-transform duration-150",
            open ? "rotate-180" : "",
          ]
            .filter(Boolean)
            .join(" ")}
        />
      </button>

      {open && !disabled && (
        <div
          role="dialog"
          aria-label="Selecionar data"
          className="absolute left-0 top-full z-50 mt-2 w-max max-w-[calc(100vw-2rem)] origin-top-left animate-[fin-date-open_160ms_ease-out] rounded-2xl border border-zinc-800 bg-[#111113] p-3 shadow-2xl shadow-black/40"
        >
          <DayPicker
            animate
            mode="single"
            locale={ptBR}
            weekStartsOn={0}
            selected={selectedDate}
            defaultMonth={
              selectedDate ?? new Date()
            }
            onSelect={handleSelect}
            className="fin-date-calendar"
            classNames={{
              root: `${defaultClassNames.root} fin-date-calendar-root`,

              selected: `${defaultClassNames.selected} fin-date-selected`,

              today: `${defaultClassNames.today} fin-date-today`,

              outside: `${defaultClassNames.outside} fin-date-outside`,

              disabled: `${defaultClassNames.disabled} fin-date-disabled`,

              chevron: `${defaultClassNames.chevron} fin-date-chevron`,
            }}
          />
        </div>
      )}

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
});

export default FinDatePicker;

export type { FinDatePickerProps };