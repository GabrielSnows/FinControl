import {
  createContext,
  forwardRef,
  useCallback,
  useContext,
  useEffect,
  useId,
  useRef,
  useState,
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

const EXIT_DURATION = 180;

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

  const exitTimerRef =
    useRef<number | null>(null);

  const openerRef =
    useRef<HTMLElement | null>(null);

  const [rendered, setRendered] =
    useState(open);

  const [closing, setClosing] =
    useState(false);

  const requestClose = useCallback(() => {
    if (closing) return;

    const activeElement =
      document.activeElement;

    if (
      activeElement instanceof HTMLElement &&
      modalRef.current?.contains(activeElement)
    ) {
      activeElement.blur();
    }

    onClose();
  }, [closing, onClose]);

  useEffect(() => {
    if (open) {
      if (exitTimerRef.current !== null) {
        window.clearTimeout(
          exitTimerRef.current,
        );

        exitTimerRef.current = null;
      }

      setRendered(true);
      setClosing(false);

      return;
    }

    if (!rendered) return;

    const activeElement =
      document.activeElement;

    if (
      activeElement instanceof HTMLElement &&
      modalRef.current?.contains(activeElement)
    ) {
      activeElement.blur();
    }

    setClosing(true);

    exitTimerRef.current =
      window.setTimeout(() => {
        setRendered(false);
        setClosing(false);

        exitTimerRef.current = null;

        openerRef.current?.focus({
          preventScroll: true,
        });
      }, EXIT_DURATION);
  }, [open, rendered]);

  useEffect(() => {
    if (!open) return;

    const activeElement =
      document.activeElement;

    openerRef.current =
      activeElement instanceof HTMLElement
        ? activeElement
        : null;

    const focusTimer =
      window.setTimeout(() => {
        const modal = modalRef.current;

        if (!modal) return;

        const hasPrecisePointer =
          window.matchMedia(
            "(pointer: fine)",
          ).matches;

        if (!hasPrecisePointer) {
          modal.focus({
            preventScroll: true,
          });

          return;
        }

        const firstFocusable =
          modal.querySelector<HTMLElement>(
            [
              "[data-autofocus]",
              "input:not([disabled])",
              "textarea:not([disabled])",
              "select:not([disabled])",
              "button:not([disabled])",
              '[tabindex]:not([tabindex="-1"])',
            ].join(","),
          );

        if (firstFocusable) {
          firstFocusable.focus({
            preventScroll: true,
          });
        } else {
          modal.focus({
            preventScroll: true,
          });
        }
      }, 0);

    return () => {
      window.clearTimeout(focusTimer);
    };
  }, [open]);

  useEffect(() => {
    if (!rendered) return;

    const previousOverflow =
      document.body.style.overflow;

    const previousPaddingRight =
      document.body.style.paddingRight;

    const scrollbarWidth =
      window.innerWidth -
      document.documentElement.clientWidth;

    const currentPaddingRight =
      Number.parseFloat(
        window.getComputedStyle(
          document.body,
        ).paddingRight,
      ) || 0;

    document.body.style.overflow = "hidden";

    if (scrollbarWidth > 0) {
      document.body.style.paddingRight =
        `${
          currentPaddingRight +
          scrollbarWidth
        }px`;
    }

    return () => {
      document.body.style.overflow =
        previousOverflow;

      document.body.style.paddingRight =
        previousPaddingRight;
    };
  }, [rendered]);

  useEffect(() => {
    if (!rendered) return;

    function handleKeyDown(
      event: KeyboardEvent,
    ) {
      if (
        event.key === "Escape" &&
        closeOnEscape &&
        !closing
      ) {
        requestClose();
      }
    }

    document.addEventListener(
      "keydown",
      handleKeyDown,
    );

    return () => {
      document.removeEventListener(
        "keydown",
        handleKeyDown,
      );
    };
  }, [
    rendered,
    closing,
    closeOnEscape,
    requestClose,
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

  if (!rendered) return null;

  function handleOverlayClick(
    event: MouseEvent<HTMLDivElement>,
  ) {
    if (
      closeOnOverlayClick &&
      event.target === event.currentTarget &&
      !closing
    ) {
      requestClose();
    }
  }

  return createPortal(
    <div
      role="presentation"
      onMouseDown={handleOverlayClick}
      className={[
        "fixed inset-0 z-100 flex items-end justify-center overflow-y-auto bg-black/70 p-0 backdrop-blur-sm",
        "sm:items-center sm:p-6",
        closing
          ? "animate-[fin-overlay-exit_180ms_ease-in_forwards]"
          : "animate-[fin-overlay-enter_180ms_ease-out]",
      ].join(" ")}
    >
      <FinModalContext.Provider
        value={{
          titleId,
          descriptionId,
        }}
      >
        <div
          ref={modalRef}
          tabIndex={-1}
          role="dialog"
          aria-modal="true"
          aria-labelledby={titleId}
          aria-describedby={descriptionId}
          className={[
            "relative w-full border border-zinc-800 bg-[#111113] outline-none",
            "rounded-t-3xl shadow-2xl shadow-black/50",
            "sm:rounded-2xl",
            closing
              ? "animate-[fin-modal-mobile-exit_180ms_ease-in_forwards] sm:animate-[fin-modal-desktop-exit_180ms_ease-in_forwards]"
              : "animate-[fin-modal-mobile-enter_180ms_ease-out] sm:animate-[fin-modal-desktop-enter_180ms_ease-out]",
            sizeClasses[size],
          ].join(" ")}
        >
          {showCloseButton && (
            <button
              type="button"
              onClick={requestClose}
              disabled={closing}
              aria-label="Fechar modal"
              className="absolute right-4 top-4 z-10 flex h-8 w-8 cursor-pointer items-center justify-center rounded-lg text-zinc-500 transition duration-150 hover:bg-zinc-800 hover:text-zinc-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-zinc-600 disabled:cursor-not-allowed disabled:opacity-50"
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
          @keyframes fin-overlay-enter {
            from {
              opacity: 0;
            }

            to {
              opacity: 1;
            }
          }

          @keyframes fin-overlay-exit {
            from {
              opacity: 1;
            }

            to {
              opacity: 0;
            }
          }

          @keyframes fin-modal-desktop-enter {
            from {
              opacity: 0;
              transform: translateY(8px) scale(0.985);
            }

            to {
              opacity: 1;
              transform: translateY(0) scale(1);
            }
          }

          @keyframes fin-modal-desktop-exit {
            from {
              opacity: 1;
              transform: translateY(0) scale(1);
            }

            to {
              opacity: 0;
              transform: translateY(8px) scale(0.985);
            }
          }

          @keyframes fin-modal-mobile-enter {
            from {
              opacity: 0;
              transform: translateY(24px);
            }

            to {
              opacity: 1;
              transform: translateY(0);
            }
          }

          @keyframes fin-modal-mobile-exit {
            from {
              opacity: 1;
              transform: translateY(0);
            }

            to {
              opacity: 0;
              transform: translateY(24px);
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
        "flex flex-col-reverse gap-3 border-t border-zinc-800 px-5 py-4",
        "sm:flex-row sm:justify-end sm:px-6",
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