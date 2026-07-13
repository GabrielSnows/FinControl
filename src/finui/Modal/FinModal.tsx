import {
  createContext,
  forwardRef,
  useContext,
  useEffect,
  useId,
  useRef,
  type HTMLAttributes,
  type MouseEvent,
  type ReactNode,
} from "react";

import { createPortal } from "react-dom";
import { X } from "lucide-react";

type FinModalSize = "sm" | "md" | "lg";

type FinModalProps = {
  open: boolean;
  onClose: () => void;
  children: ReactNode;
  size?: FinModalSize;
  closeOnOverlayClick?: boolean;
  closeOnEscape?: boolean;
  showCloseButton?: boolean;
};

type FinModalContextValue = {
  titleId: string;
  descriptionId: string;
};

const FinModalContext =
  createContext<FinModalContextValue | null>(null);

const sizeClasses: Record<FinModalSize, string> = {
  sm: "max-w-sm",
  md: "max-w-lg",
  lg: "max-w-2xl",
};

export default function FinModal({
  open,
  onClose,
  children,
  size = "md",
  closeOnOverlayClick = true,
  closeOnEscape = true,
  showCloseButton = true,
}: FinModalProps) {
  const generatedId = useId();

  const titleId = `${generatedId}-title`;
  const descriptionId = `${generatedId}-description`;

  const modalRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;

    const previousOverflow =
      document.body.style.overflow;

    document.body.style.overflow = "hidden";

    const focusTimer = window.setTimeout(() => {
      const firstFocusable =
        modalRef.current?.querySelector<HTMLElement>(
          [
            "button:not([disabled])",
            "input:not([disabled])",
            "select:not([disabled])",
            "textarea:not([disabled])",
            '[tabindex]:not([tabindex="-1"])',
          ].join(","),
        );

      firstFocusable?.focus();
    }, 0);

    function handleKeyDown(
      event: KeyboardEvent,
    ) {
      if (
        event.key === "Escape" &&
        closeOnEscape
      ) {
        onClose();
      }
    }

    document.addEventListener(
      "keydown",
      handleKeyDown,
    );

    return () => {
      window.clearTimeout(focusTimer);

      document.body.style.overflow =
        previousOverflow;

      document.removeEventListener(
        "keydown",
        handleKeyDown,
      );
    };
  }, [
    open,
    closeOnEscape,
    onClose,
  ]);

  if (!open) return null;

  function handleOverlayClick(
    event: MouseEvent<HTMLDivElement>,
  ) {
    if (
      closeOnOverlayClick &&
      event.target === event.currentTarget
    ) {
      onClose();
    }
  }

  return createPortal(
    <div
      role="presentation"
      onMouseDown={handleOverlayClick}
      className="fixed inset-0 z-100 flex items-end justify-center overflow-y-auto bg-black/70 p-0 backdrop-blur-sm sm:items-center sm:p-6"
    >
      <FinModalContext.Provider
        value={{
          titleId,
          descriptionId,
        }}
      >
        <div
          ref={modalRef}
          role="dialog"
          aria-modal="true"
          aria-labelledby={titleId}
          aria-describedby={descriptionId}
          className={[
            "relative w-full border border-zinc-800 bg-[#111113]",
            "animate-[fin-modal-mobile_180ms_ease-out]",
            "rounded-t-3xl shadow-2xl shadow-black/50",
            "sm:animate-[fin-modal-desktop_180ms_ease-out]",
            "sm:rounded-2xl",
            sizeClasses[size],
          ].join(" ")}
        >
          {showCloseButton && (
            <button
              type="button"
              onClick={onClose}
              aria-label="Fechar modal"
              className="absolute right-4 top-4 z-10 flex h-8 w-8 cursor-pointer items-center justify-center rounded-lg text-zinc-500 transition hover:bg-zinc-800 hover:text-zinc-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-zinc-600"
            >
              <X
                aria-hidden="true"
                className="h-4 w-4"
              />
            </button>
          )}

          {children}
        </div>
      </FinModalContext.Provider>

      <style>
        {`
          @keyframes fin-modal-desktop {
            from {
              opacity: 0;
              transform: translateY(8px) scale(0.985);
            }

            to {
              opacity: 1;
              transform: translateY(0) scale(1);
            }
          }

          @keyframes fin-modal-mobile {
            from {
              opacity: 0;
              transform: translateY(24px);
            }

            to {
              opacity: 1;
              transform: translateY(0);
            }
          }
        `}
      </style>
    </div>,
    document.body,
  );
}

type FinModalSectionProps =
  HTMLAttributes<HTMLDivElement>;

const FinModalHeader = forwardRef<
  HTMLDivElement,
  FinModalSectionProps
>(function FinModalHeader(
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
        "border-b border-zinc-800 px-5 py-5 pr-14 sm:px-6",
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

const FinModalTitle = forwardRef<
  HTMLHeadingElement,
  HTMLAttributes<HTMLHeadingElement>
>(function FinModalTitle(
  {
    className = "",
    children,
    ...titleProps
  },
  ref,
) {
  const context = useFinModalContext();

  return (
    <h2
      ref={ref}
      id={context.titleId}
      className={[
        "text-lg font-semibold tracking-tight text-zinc-50",
        className,
      ]
        .filter(Boolean)
        .join(" ")}
      {...titleProps}
    >
      {children}
    </h2>
  );
});

const FinModalDescription = forwardRef<
  HTMLParagraphElement,
  HTMLAttributes<HTMLParagraphElement>
>(function FinModalDescription(
  {
    className = "",
    children,
    ...descriptionProps
  },
  ref,
) {
  const context = useFinModalContext();

  return (
    <p
      ref={ref}
      id={context.descriptionId}
      className={[
        "mt-1.5 text-sm leading-6 text-zinc-500",
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

const FinModalContent = forwardRef<
  HTMLDivElement,
  FinModalSectionProps
>(function FinModalContent(
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
        "max-h-[70vh] overflow-y-auto px-5 py-5 sm:px-6",
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

const FinModalFooter = forwardRef<
  HTMLDivElement,
  FinModalSectionProps
>(function FinModalFooter(
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
        "flex flex-col-reverse gap-3 border-t border-zinc-800 px-5 py-4 sm:flex-row sm:justify-end sm:px-6",
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

function useFinModalContext() {
  const context = useContext(
    FinModalContext,
  );

  if (!context) {
    throw new Error(
      "Os componentes do FinModal devem ser usados dentro de <FinModal>.",
    );
  }

  return context;
}

export {
  FinModalContent,
  FinModalDescription,
  FinModalFooter,
  FinModalHeader,
  FinModalTitle,
};

export type {
  FinModalProps,
  FinModalSize,
};