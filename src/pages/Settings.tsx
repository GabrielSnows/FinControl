import { useRef, useState } from "react";

import {
  Download,
  FileJson,
  HardDriveDownload,
  Info,
  RotateCcw,
  ShieldCheck,
} from "lucide-react";

import AlertModal from "../components/AlertModal/AlertModal";
import ConfirmModal from "../components/ConfirmModal/ConfirmModal";

import FinButton from "../finui/Button/FinButton";
import {
  FinCard,
  FinCardContent,
  FinCardDescription,
  FinCardHeader,
  FinCardTitle,
} from "../finui/Card/FinCard";
import FinPageHeader from "../finui/PageHeader/FinPageHeader";

import {
  downloadBackup,
  readBackupFile,
  restoreBackup,
} from "../backup/backup";

import type { FinControlBackup } from "../backup/backup";
import type { AlertType } from "../components/AlertModal/AlertModal";

type AlertData = {
  title: string;
  message: string;
  type: AlertType;
};

export default function Settings() {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [selectedBackup, setSelectedBackup] =
    useState<FinControlBackup>();

  const [selectedFileName, setSelectedFileName] =
    useState("");

  const [confirmRestoreOpen, setConfirmRestoreOpen] =
    useState(false);

  const [alert, setAlert] = useState<AlertData>();
  const [alertOpen, setAlertOpen] = useState(false);

  const [exporting, setExporting] = useState(false);
  const [restoring, setRestoring] = useState(false);

  function showAlert(
    title: string,
    message: string,
    type: AlertType = "info",
  ) {
    setAlert({
      title,
      message,
      type,
    });

    setAlertOpen(true);
  }

  function closeAlert() {
    setAlertOpen(false);
  }

  function clearAlert() {
    setAlert(undefined);
  }

  async function handleExportBackup() {
    try {
      setExporting(true);

      await downloadBackup();

      showAlert(
        "Backup exportado",
        "O arquivo de backup foi baixado com sucesso. Guarde-o em um local seguro.",
        "success",
      );
    } catch (error) {
      console.error(
        "Erro ao exportar backup:",
        error,
      );

      showAlert(
        "Não foi possível exportar",
        "Ocorreu um erro ao gerar o arquivo de backup.",
        "error",
      );
    } finally {
      setExporting(false);
    }
  }

  function openFilePicker() {
    if (restoring) return;

    fileInputRef.current?.click();
  }

  async function handleFileSelected(
    event: React.ChangeEvent<HTMLInputElement>,
  ) {
    const file = event.target.files?.[0];

    event.target.value = "";

    if (!file) return;

    if (!file.name.toLowerCase().endsWith(".json")) {
      showAlert(
        "Arquivo inválido",
        "Selecione um arquivo de backup no formato JSON.",
        "warning",
      );

      return;
    }

    try {
      const backup = await readBackupFile(file);

      setSelectedBackup(backup);
      setSelectedFileName(file.name);
      setConfirmRestoreOpen(true);
    } catch (error) {
      console.error(
        "Erro ao ler backup:",
        error,
      );

      showAlert(
        "Backup inválido",
        error instanceof Error
          ? error.message
          : "Não foi possível ler o arquivo selecionado.",
        "error",
      );
    }
  }

  function cancelRestore() {
    if (restoring) return;

    setConfirmRestoreOpen(false);
  }

  function clearSelectedBackup() {
    setSelectedBackup(undefined);
    setSelectedFileName("");
  }

  async function confirmRestore() {
    if (!selectedBackup || restoring) return;

    try {
      setRestoring(true);

      await restoreBackup(selectedBackup);

      setConfirmRestoreOpen(false);

      showAlert(
        "Backup restaurado",
        "Todos os dados do FinControl foram restaurados com sucesso.",
        "success",
      );
    } catch (error) {
      console.error(
        "Erro ao restaurar backup:",
        error,
      );

      setConfirmRestoreOpen(false);

      showAlert(
        "Não foi possível restaurar",
        "Ocorreu um erro durante a restauração. Os dados não puderam ser importados.",
        "error",
      );
    } finally {
      setRestoring(false);
    }
  }

  return (
    <div className="space-y-6">
      <FinPageHeader
        title="Configurações"
        description="Gerencie a segurança e o armazenamento dos seus dados."
      />

      <FinCard>
        <FinCardHeader>
          <div className="flex items-start gap-4">
            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl border border-zinc-800 bg-zinc-900 text-zinc-300">
              <ShieldCheck size={24} />
            </div>

            <div>
              <FinCardTitle>
                Backup dos dados
              </FinCardTitle>

              <FinCardDescription>
                Exporte ou restaure uma cópia das
                contas, movimentações, dívidas e
                objetivos armazenados neste
                dispositivo.
              </FinCardDescription>
            </div>
          </div>
        </FinCardHeader>

        <FinCardContent>
          <div className="grid gap-5 md:grid-cols-2">
            <div className="flex flex-col rounded-2xl border border-zinc-800 bg-zinc-950/50 p-6 transition-colors hover:border-zinc-700">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-zinc-900 text-zinc-300">
                  <Download size={20} />
                </div>

                <div>
                  <h3 className="font-semibold text-zinc-100">
                    Exportar backup
                  </h3>

                  <p className="mt-1 text-xs text-zinc-500">
                    Salve uma cópia dos seus dados
                  </p>
                </div>
              </div>

              <p className="mt-5 text-sm leading-6 text-zinc-400">
                Baixe um arquivo JSON contendo todos os
                dados atualmente armazenados no
                FinControl.
              </p>

              <FinButton
                type="button"
                onClick={handleExportBackup}
                disabled={exporting}
                className="mt-6 w-full"
              >
                <span className="flex items-center justify-center gap-2">
                  <HardDriveDownload
                    size={18}
                    className="shrink-0"
                  />

                  <span>
                    {exporting
                      ? "Gerando backup..."
                      : "Exportar backup"}
                  </span>
                </span>
              </FinButton>
            </div>

            <div className="flex flex-col rounded-2xl border border-zinc-800 bg-zinc-950/50 p-6 transition-colors hover:border-zinc-700">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-zinc-900 text-zinc-300">
                  <RotateCcw size={20} />
                </div>

                <div>
                  <h3 className="font-semibold text-zinc-100">
                    Restaurar backup
                  </h3>

                  <p className="mt-1 text-xs text-zinc-500">
                    Recupere uma cópia anterior
                  </p>
                </div>
              </div>

              <p className="mt-5 text-sm leading-6 text-zinc-400">
                Importe um backup anterior. Os dados
                atuais serão substituídos pelos dados
                do arquivo selecionado.
              </p>

              <input
                ref={fileInputRef}
                type="file"
                accept=".json,application/json"
                onChange={handleFileSelected}
                className="hidden"
              />

              <FinButton
                type="button"
                onClick={openFilePicker}
                disabled={restoring}
                variant="secondary"
                className="mt-6 w-full"
              >
                <span className="flex items-center justify-center gap-2">
                  <FileJson
                    size={18}
                    className="shrink-0"
                  />

                  <span>
                    {restoring
                      ? "Restaurando..."
                      : "Selecionar backup"}
                  </span>
                </span>
              </FinButton>
            </div>
          </div>

          <div className="mt-5 flex items-start gap-3 rounded-xl border border-amber-900/40 bg-amber-950/10 p-4">
            <Info
              size={19}
              className="mt-0.5 shrink-0 text-amber-500"
            />

            <div>
              <p className="text-sm font-medium text-amber-200">
                Mantenha uma cópia recente
              </p>

              <p className="mt-1 text-sm leading-6 text-zinc-400">
                O FinControl salva os dados localmente
                no navegador. Guarde o arquivo de
                backup no Google Drive, OneDrive ou em
                outro local seguro.
              </p>
            </div>
          </div>
        </FinCardContent>
      </FinCard>

      <ConfirmModal
        open={confirmRestoreOpen}
        title="Restaurar backup"
        message={`Deseja restaurar o arquivo "${selectedFileName}"? Todos os dados atuais serão substituídos e essa ação não poderá ser desfeita.`}
        confirmText={
          restoring
            ? "Restaurando..."
            : "Restaurar backup"
        }
        cancelText="Cancelar"
        danger
        onConfirm={confirmRestore}
        onCancel={cancelRestore}
        onClosed={clearSelectedBackup}
      />

      <AlertModal
        open={alertOpen}
        title={alert?.title ?? ""}
        message={alert?.message ?? ""}
        type={alert?.type}
        onClose={closeAlert}
        onClosed={clearAlert}
      />
    </div>
  );
}