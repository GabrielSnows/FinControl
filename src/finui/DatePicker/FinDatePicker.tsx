import {
  forwardRef,
  useEffect,
  useId,
  useRef,
  useState,
  type ButtonHTMLAttributes,
  type CSSProperties,
} from "react";

import { createPortal } from "react-dom";

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

type CalendarPosition = {
  left: number;
  top?: number;
  bottom?: number;
  width: number;
  maxHeight: number;
  openAbove: boolean;
};

const EXIT_DURATION = 160;

function parseDateValue(value?: string) {
  if (!value) return undefined;

  const [year, month, day] = value
    .split("-")
    .map(Number);

  if (!year || !month || !day) {
    return undefined;
  }

  const date = new Date(
    year,
    month - 1,
    day,
  );

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

  const buttonRef =
    useRef<HTMLButtonElement | null>(null);

  const calendarRef =
    useRef<HTMLDivElement>(null);

  const exitTimerRef =
    useRef<number | null>(null);

  const [calendarRendered, setCalendarRendered] =
    useState(false);

  const [calendarVisible, setCalendarVisible] =
    useState(false);

  const [calendarPosition, setCalendarPosition] =
    useState<CalendarPosition>();

  const selectedDate =
    parseDateValue(value);

  const defaultClassNames =
    getDefaultClassNames();

  function assignButtonRef(
    element: HTMLButtonElement | null,
  ) {
    buttonRef.current = element;

    if (typeof forwardedRef === "function") {
      forwardedRef(element);
      return;
    }

    if (forwardedRef) {
      forwardedRef.current = element;
    }
  }

  function calculateCalendarPosition() {
    const button = buttonRef.current;

    if (!button) return;

    const rect =
      button.getBoundingClientRect();

    const viewportPadding = 12;
    const calendarGap = 8;

    const preferredWidth = 328;
    const preferredHeight = 360;

    const availableWidth =
      window.innerWidth -
      viewportPadding * 2;

    const width = Math.min(
      preferredWidth,
      availableWidth,
    );

    const maximumLeft =
      window.innerWidth -
      width -
      viewportPadding;

    const left = Math.min(
      Math.max(
        rect.left,
        viewportPadding,
      ),
      maximumLeft,
    );

    const spaceBelow =
      window.innerHeight -
      rect.bottom -
      calendarGap -
      viewportPadding;

    const spaceAbove =
      rect.top -
      calendarGap -
      viewportPadding;

    const openAbove =
      spaceBelow < preferredHeight &&
      spaceAbove > spaceBelow;

    const availableHeight = openAbove
      ? spaceAbove
      : spaceBelow;

    const maxHeight = Math.max(
      260,
      Math.min(
        preferredHeight,
        availableHeight,
      ),
    );

    setCalendarPosition({
      left,
      width,
      maxHeight,
      openAbove,

      ...(openAbove
        ? {
            bottom:
              window.innerHeight -
              rect.top +
              calendarGap,
          }
        : {
            top:
              rect.bottom +
              calendarGap,
          }),
    });
  }

  function openCalendar() {
    if (disabled) return;

    if (exitTimerRef.current !== null) {
      window.clearTimeout(
        exitTimerRef.current,
      );

      exitTimerRef.current = null;
    }

    calculateCalendarPosition();
    setCalendarRendered(true);
    setCalendarVisible(true);
  }

  function closeCalendar(
    returnFocus = false,
  ) {
    if (
      !calendarRendered ||
      !calendarVisible ||
      exitTimerRef.current !== null
    ) {
      return;
    }

    setCalendarVisible(false);

    exitTimerRef.current =
      window.setTimeout(() => {
        setCalendarRendered(false);
        setCalendarPosition(undefined);

        exitTimerRef.current = null;

        if (returnFocus) {
          buttonRef.current?.focus({
            preventScroll: true,
          });
        }
      }, EXIT_DURATION);
  }

  function toggleCalendar() {
    if (
      calendarRendered &&
      calendarVisible
    ) {
      closeCalendar();
      return;
    }

    openCalendar();
  }

  function handleSelect(date?: Date) {
    if (!date) return;

    onChange(dateToValue(date));
    closeCalendar(true);
  }

  useEffect(() => {
    if (!calendarRendered) return;

    function handlePointerDown(
      event: MouseEvent | TouchEvent,
    ) {
      const target = event.target;

      if (!(target instanceof Node)) {
        return;
      }

      const clickedTrigger =
        containerRef.current?.contains(target);

      const clickedCalendar =
        calendarRef.current?.contains(target);

      if (
        !clickedTrigger &&
        !clickedCalendar
      ) {
        closeCalendar();
      }
    }

    function handleKeyDown(
      event: KeyboardEvent,
    ) {
      if (event.key === "Escape") {
        event.preventDefault();
        closeCalendar(true);
      }
    }

    function updatePosition() {
      calculateCalendarPosition();
    }

    document.addEventListener(
      "mousedown",
      handlePointerDown,
    );

    document.addEventListener(
      "touchstart",
      handlePointerDown,
    );

    document.addEventListener(
      "keydown",
      handleKeyDown,
    );

    window.addEventListener(
      "resize",
      updatePosition,
    );

    window.addEventListener(
      "scroll",
      updatePosition,
      true,
    );

    return () => {
      document.removeEventListener(
        "mousedown",
        handlePointerDown,
      );

      document.removeEventListener(
        "touchstart",
        handlePointerDown,
      );

      document.removeEventListener(
        "keydown",
        handleKeyDown,
      );

      window.removeEventListener(
        "resize",
        updatePosition,
      );

      window.removeEventListener(
        "scroll",
        updatePosition,
        true,
      );
    };
  }, [
    calendarRendered,
    calendarVisible,
  ]);

  useEffect(() => {
    if (
      disabled &&
      calendarRendered &&
      calendarVisible
    ) {
      closeCalendar();
    }
  }, [
    disabled,
    calendarRendered,
    calendarVisible,
  ]);

  useEffect(() => {
    return () => {
      if (exitTimerRef.current !== null) {
        window.clearTimeout(
          exitTimerRef.current,
        );
      }
    };
  }, []);

  const describedBy = error
    ? errorId
    : helperText
      ? helperId
      : undefined;

  const calendarStyle:
    | CSSProperties
    | undefined =
    calendarPosition
      ? {
          left: calendarPosition.left,
          top: calendarPosition.top,
          bottom: calendarPosition.bottom,
          width: calendarPosition.width,
          maxHeight:
            calendarPosition.maxHeight,
        }
      : undefined;

  return (
    <div
      ref={containerRef}
      className={[
        "relative",
        fullWidth
          ? "w-full"
          : "w-auto",
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
        ref={assignButtonRef}
        id={buttonId}
        type="button"
        disabled={disabled}
        aria-haspopup="dialog"
        aria-expanded={calendarVisible}
        aria-invalid={Boolean(error)}
        aria-describedby={describedBy}
        onClick={toggleCalendar}
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
          fullWidth
            ? "w-full"
            : "w-auto",
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
            calendarVisible
              ? "rotate-180"
              : "",
          ]
            .filter(Boolean)
            .join(" ")}
        />
      </button>

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

      {calendarRendered &&
        !disabled &&
        calendarPosition &&
        createPortal(
          <div
            ref={calendarRef}
            role="dialog"
            aria-label="Selecionar data"
            style={calendarStyle}
            className={[
              "fixed z-100 overflow-y-auto rounded-2xl border border-zinc-800 bg-[#111113] p-3 shadow-2xl shadow-black/50",
              calendarPosition.openAbove
                ? "origin-bottom"
                : "origin-top",
              calendarVisible
                ? calendarPosition.openAbove
                  ? "animate-[fin-date-open-up_160ms_ease-out]"
                  : "animate-[fin-date-open-down_160ms_ease-out]"
                : calendarPosition.openAbove
                  ? "pointer-events-none animate-[fin-date-close-up_160ms_ease-in_forwards]"
                  : "pointer-events-none animate-[fin-date-close-down_160ms_ease-in_forwards]",
            ].join(" ")}
          >
            <DayPicker
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
          </div>,
          document.body,
        )}
    </div>
  );
});

export default FinDatePicker;

export type { FinDatePickerProps };