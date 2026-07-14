import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
  type ReactNode,
} from "react";

import { createPortal } from "react-dom";

import {
  AlertCircle,
  CheckCircle2,
  Info,
  TriangleAlert,
  X,
} from "lucide-react";

type FinToastType =
  | "success"
  | "error"
  | "warning"
  | "info";

type FinToastInput = {
  title: string;
  description?: string;
  type?: FinToastType;
  duration?: number;
};

type FinToastItem = FinToastInput & {
  id: number;
  type: FinToastType;
  duration: number;
  closing: boolean;
};

type FinToastContextValue = {
  showToast: (toast: FinToastInput) => number;
  dismissToast: (id: number) => void;
  dismissAll: () => void;
};

type FinToastProviderProps = {
  children: ReactNode;
};

const DEFAULT_DURATION = 4000;
const EXIT_DURATION = 180;

const FinToastContext =
  createContext<FinToastContextValue | null>(null);

const toastVisuals: Record<
  FinToastType,
  {
    icon: ReactNode;
    iconClassName: string;
  }
> = {
  success: {
    icon: <CheckCircle2 />,
    iconClassName:
      "bg-emerald-950/60 text-emerald-400",
  },

  error: {
    icon: <AlertCircle />,
    iconClassName:
      "bg-red-950/60 text-red-400",
  },

  warning: {
    icon: <TriangleAlert />,
    iconClassName:
      "bg-amber-950/60 text-amber-400",
  },

  info: {
    icon: <Info />,
    iconClassName:
      "bg-zinc-800 text-zinc-300",
  },
};

export function FinToastProvider({
  children,
}: FinToastProviderProps) {
  const [toasts, setToasts] =
    useState<FinToastItem[]>([]);

  const nextIdRef = useRef(1);

  const timersRef = useRef(
    new Map<number, number>(),
  );

  const exitTimersRef = useRef(
    new Map<number, number>(),
  );

  const removeToast = useCallback(
    (id: number) => {
      setToasts((currentToasts) =>
        currentToasts.filter(
          (toast) => toast.id !== id,
        ),
      );

      exitTimersRef.current.delete(id);
    },
    [],
  );

  const dismissToast = useCallback(
    (id: number) => {
      const timer =
        timersRef.current.get(id);

      if (timer) {
        window.clearTimeout(timer);
        timersRef.current.delete(id);
      }

      setToasts((currentToasts) =>
        currentToasts.map((toast) =>
          toast.id === id
            ? {
                ...toast,
                closing: true,
              }
            : toast,
        ),
      );

      if (
        exitTimersRef.current.has(id)
      ) {
        return;
      }

      const exitTimer =
        window.setTimeout(() => {
          removeToast(id);
        }, EXIT_DURATION);

      exitTimersRef.current.set(
        id,
        exitTimer,
      );
    },
    [removeToast],
  );

  const dismissAll = useCallback(() => {
    timersRef.current.forEach((timer) => {
      window.clearTimeout(timer);
    });

    timersRef.current.clear();

    setToasts((currentToasts) =>
      currentToasts.map((toast) => ({
        ...toast,
        closing: true,
      })),
    );

    const exitTimer =
      window.setTimeout(() => {
        setToasts([]);
        exitTimersRef.current.clear();
      }, EXIT_DURATION);

    exitTimersRef.current.set(
      -1,
      exitTimer,
    );
  }, []);

  const showToast = useCallback(
    ({
      title,
      description,
      type = "info",
      duration = DEFAULT_DURATION,
    }: FinToastInput) => {
      const id = nextIdRef.current;

      nextIdRef.current += 1;

      const newToast: FinToastItem = {
        id,
        title,
        description,
        type,
        duration,
        closing: false,
      };

      setToasts((currentToasts) => [
        ...currentToasts,
        newToast,
      ]);

      if (duration > 0) {
        const timer = window.setTimeout(() => {
          dismissToast(id);
        }, duration);

        timersRef.current.set(id, timer);
      }

      return id;
    },
    [dismissToast],
  );

  useEffect(() => {
    return () => {
      timersRef.current.forEach((timer) => {
        window.clearTimeout(timer);
      });

      exitTimersRef.current.forEach(
        (timer) => {
          window.clearTimeout(timer);
        },
      );

      timersRef.current.clear();
      exitTimersRef.current.clear();
    };
  }, []);

  return (
    <FinToastContext.Provider
      value={{
        showToast,
        dismissToast,
        dismissAll,
      }}
    >
      {children}

      <FinToastViewport
        toasts={toasts}
        onDismiss={dismissToast}
      />
    </FinToastContext.Provider>
  );
}

type FinToastViewportProps = {
  toasts: FinToastItem[];
  onDismiss: (id: number) => void;
};

function FinToastViewport({
  toasts,
  onDismiss,
}: FinToastViewportProps) {
  if (toasts.length === 0) {
    return null;
  }

  return createPortal(
    <div
      aria-live="polite"
      aria-relevant="additions removals"
      className="pointer-events-none fixed inset-x-0 bottom-24 z-100 flex flex-col items-center gap-3 px-4 sm:inset-x-auto sm:bottom-6 sm:right-6 sm:w-96 sm:items-stretch sm:px-0"
    >
      {toasts.map((toast) => (
        <FinToastCard
          key={toast.id}
          toast={toast}
          onDismiss={() =>
            onDismiss(toast.id)
          }
        />
      ))}
    </div>,
    document.body,
  );
}

type FinToastCardProps = {
  toast: FinToastItem;
  onDismiss: () => void;
};

function FinToastCard({
  toast,
  onDismiss,
}: FinToastCardProps) {
  const visual =
    toastVisuals[toast.type];

  return (
    <article
      role={
        toast.type === "error"
          ? "alert"
          : "status"
      }
      className={[
        "pointer-events-auto flex w-full max-w-md items-start gap-3 rounded-2xl border border-zinc-800 bg-[#111113]/95 p-4 shadow-2xl shadow-black/50 backdrop-blur-xl",
        toast.closing
          ? "animate-[fin-toast-exit_180ms_ease-in_forwards]"
          : "animate-[fin-toast-enter_180ms_ease-out]",
      ].join(" ")}
    >
      <div
        aria-hidden="true"
        className={[
          "flex h-9 w-9 shrink-0 items-center justify-center rounded-xl",
          "[&>svg]:h-4.5 [&>svg]:w-4.5",
          visual.iconClassName,
        ].join(" ")}
      >
        {visual.icon}
      </div>

      <div className="min-w-0 flex-1 pt-0.5">
        <p className="text-sm font-medium text-zinc-100">
          {toast.title}
        </p>

        {toast.description && (
          <p className="mt-1 text-sm leading-5 text-zinc-500">
            {toast.description}
          </p>
        )}
      </div>

      <button
        type="button"
        onClick={onDismiss}
        aria-label="Fechar notificação"
        className="flex h-8 w-8 shrink-0 cursor-pointer items-center justify-center rounded-lg text-zinc-600 transition duration-150 hover:bg-zinc-800 hover:text-zinc-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-zinc-600"
      >
        <X
          aria-hidden="true"
          className="h-4 w-4"
        />
      </button>

      <style>
        {`
          @keyframes fin-toast-enter {
            from {
              opacity: 0;
              transform: translateY(10px) scale(0.985);
            }

            to {
              opacity: 1;
              transform: translateY(0) scale(1);
            }
          }

          @keyframes fin-toast-exit {
            from {
              opacity: 1;
              transform: translateY(0) scale(1);
            }

            to {
              opacity: 0;
              transform: translateY(8px) scale(0.985);
            }
          }
        `}
      </style>
    </article>
  );
}

export function useFinToast() {
  const context =
    useContext(FinToastContext);

  if (!context) {
    throw new Error(
      "useFinToast deve ser usado dentro de <FinToastProvider>.",
    );
  }

  return context;
}

export type {
  FinToastInput,
  FinToastProviderProps,
  FinToastType,
};