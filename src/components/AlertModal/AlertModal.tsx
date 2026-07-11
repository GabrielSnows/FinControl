import {
  AlertCircle,
  CheckCircle2,
  Info,
  TriangleAlert,
} from "lucide-react";

import Modal from "../Modal/Modal";
import Button from "../ui/Button";

type AlertType = "info" | "warning" | "error" | "success";

type AlertModalProps = {
  open: boolean;
  title: string;
  message: string;
  type?: AlertType;
  buttonText?: string;
  onClose: () => void;
};

const alertStyles: Record<
  AlertType,
  {
    icon: React.ReactNode;
    iconClassName: string;
  }
> = {
  info: {
    icon: <Info size={26} />,
    iconClassName: "bg-blue-950 text-blue-400",
  },

  warning: {
    icon: <TriangleAlert size={26} />,
    iconClassName: "bg-amber-950 text-amber-400",
  },

  error: {
    icon: <AlertCircle size={26} />,
    iconClassName: "bg-red-950 text-red-400",
  },

  success: {
    icon: <CheckCircle2 size={26} />,
    iconClassName: "bg-emerald-950 text-emerald-400",
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
    <Modal
      open={open}
      title={title}
      onClose={onClose}
    >
      <div>
        <div className="flex items-start gap-4">
          <div
            className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-xl ${style.iconClassName}`}
          >
            {style.icon}
          </div>

          <p className="pt-1 text-slate-300">
            {message}
          </p>
        </div>

        <div className="mt-6 flex justify-end border-t border-slate-700 pt-5">
          <Button onClick={onClose}>
            {buttonText}
          </Button>
        </div>
      </div>
    </Modal>
  );
}

export type { AlertType };