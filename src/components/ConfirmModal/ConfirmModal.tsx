import { AlertTriangle } from "lucide-react";

import FinButton from "../../finui/Button/FinButton";
import FinModal, {
  FinModalContent,
  FinModalFooter,
  FinModalHeader,
  FinModalTitle,
} from "../../finui/Modal/FinModal";

type ConfirmModalProps = {
  open: boolean;
  title: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
  danger?: boolean;
  onConfirm: () => void;
  onCancel: () => void;
  onClosed?: () => void;
};

export default function ConfirmModal({
  open,
  title,
  message,
  confirmText = "Confirmar",
  cancelText = "Cancelar",
  danger = true,
  onConfirm,
  onCancel,
  onClosed,
}: ConfirmModalProps) {
  return (
    <FinModal
      open={open}
      onClose={onCancel}
      onClosed={onClosed}
      size="sm"
      showCloseButton={false}
    >
      <FinModalHeader className="flex-row items-start gap-4">
        <div
          className={[
            "flex h-11 w-11 shrink-0 items-center justify-center rounded-xl border",
            danger
              ? "border-red-900/60 bg-red-950/40 text-red-400"
              : "border-zinc-800 bg-zinc-900 text-zinc-300",
          ].join(" ")}
        >
          <AlertTriangle className="h-5 w-5" />
        </div>

        <div className="min-w-0 flex-1 pt-0.5">
          <FinModalTitle>{title}</FinModalTitle>

          <p className="mt-1.5 text-sm leading-6 text-zinc-500">
            Esta ação precisa da sua confirmação.
          </p>
        </div>
      </FinModalHeader>

      <FinModalContent>
        <div className="rounded-xl border border-zinc-800/80 bg-zinc-950/60 px-4 py-3.5">
          <p className="wrap-break-word text-sm leading-6 text-zinc-300">
            {message}
          </p>
        </div>
      </FinModalContent>

      <FinModalFooter className="grid grid-cols-2 gap-3">
        <FinButton
          type="button"
          variant="secondary"
          fullWidth
          onClick={onCancel}
          data-autofocus
        >
          {cancelText}
        </FinButton>

        <FinButton
          type="button"
          variant={danger ? "destructive" : "primary"}
          fullWidth
          onClick={onConfirm}
        >
          {confirmText}
        </FinButton>
      </FinModalFooter>
    </FinModal>
  );
}