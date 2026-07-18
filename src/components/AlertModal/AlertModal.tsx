import type { ReactNode } from "react";
import {
  AlertCircle,
  CheckCircle2,
  Info,
  TriangleAlert,
} from "lucide-react";

import FinButton from "../../finui/Button/FinButton";
import FinModal, {
  FinModalContent,
  FinModalFooter,
  FinModalHeader,
  FinModalTitle,
} from "../../finui/Modal/FinModal";

type AlertType = "info" | "warning" | "error" | "success";

type AlertModalProps = {
  open: boolean;
  title: string;
  message: string;
  type?: AlertType;
  buttonText?: string;
  onClose: () => void;
};

type AlertStyle = {
  icon: ReactNode;
  iconClassName: string;
  label: string;
};

const alertStyles: Record<AlertType, AlertStyle> = {
  info: {
    icon: <Info className="h-5 w-5" />,
    iconClassName:
      "border-blue-900/60 bg-blue-950/40 text-blue-400",
    label: "Informação",
  },
  warning: {
    icon: <TriangleAlert className="h-5 w-5" />,
    iconClassName:
      "border-amber-900/60 bg-amber-950/40 text-amber-400",
    label: "Atenção",
  },
  error: {
    icon: <AlertCircle className="h-5 w-5" />,
    iconClassName:
      "border-red-900/60 bg-red-950/40 text-red-400",
    label: "Erro",
  },
  success: {
    icon: <CheckCircle2 className="h-5 w-5" />,
    iconClassName:
      "border-emerald-900/60 bg-emerald-950/40 text-emerald-400",
    label: "Concluído",
  },
};

export default function AlertModal({
  open,
  title,
  message,
  type = "info",
  buttonText = "Entendi",
  onClose,
}: AlertModalProps) {
  const style = alertStyles[type];

  return (
      <FinModal
        open={open}
        onClose={onClose}
        size="sm"
        showCloseButton={false}
        zIndex={200}
      >
        <FinModalHeader>
          <div className="flex items-start gap-4">
            <div
              className={[
                "flex h-11 w-11 shrink-0 items-center justify-center rounded-xl border",
                style.iconClassName,
              ].join(" ")}
            >
              {style.icon}
            </div>

            <div className="min-w-0 flex-1 pt-0.5">
              <span className="text-xs font-medium uppercase tracking-wider text-zinc-500">
                {style.label}
              </span>

              <FinModalTitle className="mt-1">
                {title}
              </FinModalTitle>
            </div>
          </div>
        </FinModalHeader>

        <FinModalContent>
          <div className="rounded-xl border border-zinc-800/80 bg-zinc-950/60 px-4 py-3.5">
            <p className="wrap-break-word text-sm leading-6 text-zinc-300">
              {message}
            </p>
          </div>
        </FinModalContent>

        <FinModalFooter>
          <FinButton
            type="button"
            fullWidth
            onClick={onClose}
            data-autofocus
          >
            {buttonText}
          </FinButton>
        </FinModalFooter>
      </FinModal>
  );
}

export type { AlertType };