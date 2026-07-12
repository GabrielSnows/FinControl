import { useRef, useState } from "react";

import {
  Download,
  FileJson,
  HardDriveDownload,
  RotateCcw,
  ShieldCheck,
} from "lucide-react";

import AlertModal from "../components/AlertModal/AlertModal";
import ConfirmModal from "../components/ConfirmModal/ConfirmModal";

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
  const fileInputRef =
    useRef<HTMLInputElement>(null);

  const [selectedBackup, setSelectedBackup] =
    useState<FinControlBackup>();

  const [selectedFileName, setSelectedFileName] =
    useState("");

  const [confirmRestoreOpen, setConfirmRestoreOpen] =
    useState(false);

  const [alert, setAlert] =
    useState<AlertData>();

  const [exporting, setExporting] =
    useState(false);

  const [restoring, setRestoring] =
    useState(false);

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
    fileInputRef.current?.click();
  }

  async function handleFileSelected(
    event: React.ChangeEvent<HTMLInputElement>,
  ) {
    const file = event.target.files?.[0];

    event.target.value = "";

    if (!file) return;

    if (
      !file.name.toLowerCase().endsWith(".json")
    ) {
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
    setSelectedBackup(undefined);
    setSelectedFileName("");
  }

  async function confirmRestore() {
    if (!selectedBackup) return;

    try {
      setRestoring(true);

      await restoreBackup(selectedBackup);

      setConfirmRestoreOpen(false);
      setSelectedBackup(undefined);
      setSelectedFileName("");

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
    <div>
      <div className="mb-8">
        <h1 className="text-3xl font-bold sm:text-4xl">
          Configurações
        </h1>

        <p className="mt-2 text-slate-400">
          Gerencie a segurança e o armazenamento dos seus dados.
        </p>
      </div>

      <section className="rounded-2xl border border-slate-700 bg-slate-800 p-6">
        <div className="flex items-start gap-4">
          <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-emerald-950 text-emerald-400">
            <ShieldCheck size={26} />
          </div>

          <div>
            <h2 className="text-xl font-semibold">
              Backup dos dados
            </h2>

            <p className="mt-2 max-w-2xl text-slate-400">
              Exporte uma cópia de todas as contas,
              movimentações, dívidas e objetivos do
              FinControl.
            </p>
          </div>
        </div>

        <div className="mt-6 grid gap-4 md:grid-cols-2">
          <div className="rounded-2xl border border-slate-700 bg-slate-900 p-5">
            <div className="flex items-center gap-3">
              <Download
                size={24}
                className="text-emerald-400"
              />

              <h3 className="font-semibold">
                Exportar backup
              </h3>
            </div>

            <p className="mt-3 text-sm leading-6 text-slate-400">
              Baixe um arquivo JSON contendo todos os
              dados atualmente armazenados neste
              dispositivo.
            </p>

            <button
              type="button"
              onClick={handleExportBackup}
              disabled={exporting}
              className="mt-5 flex w-full cursor-pointer items-center justify-center gap-2 rounded-xl bg-emerald-600 px-5 py-3 font-medium text-white transition hover:bg-emerald-700 disabled:cursor-not-allowed disabled:opacity-50"
            >
              <HardDriveDownload size={19} />

              {exporting
                ? "Gerando backup..."
                : "Exportar backup"}
            </button>
          </div>

          <div className="rounded-2xl border border-slate-700 bg-slate-900 p-5">
            <div className="flex items-center gap-3">
              <RotateCcw
                size={24}
                className="text-amber-400"
              />

              <h3 className="font-semibold">
                Restaurar backup
              </h3>
            </div>

            <p className="mt-3 text-sm leading-6 text-slate-400">
              Importe um backup anterior. Os dados
              atuais serão substituídos pelos dados do
              arquivo selecionado.
            </p>

            <input
              ref={fileInputRef}
              type="file"
              accept=".json,application/json"
              onChange={handleFileSelected}
              className="hidden"
            />

            <button
              type="button"
              onClick={openFilePicker}
              disabled={restoring}
              className="mt-5 flex w-full cursor-pointer items-center justify-center gap-2 rounded-xl bg-slate-700 px-5 py-3 font-medium text-white transition hover:bg-slate-600 disabled:cursor-not-allowed disabled:opacity-50"
            >
              <FileJson size={19} />

              Selecionar backup
            </button>
          </div>
        </div>

        <div className="mt-6 rounded-xl border border-amber-900/60 bg-amber-950/30 p-4">
          <p className="text-sm leading-6 text-amber-200">
            O FinControl salva os dados localmente no
            navegador. Mantenha uma cópia recente do
            backup no Google Drive, OneDrive ou outro
            local seguro.
          </p>
        </div>
      </section>

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
      />

      <AlertModal
        open={Boolean(alert)}
        title={alert?.title ?? ""}
        message={alert?.message ?? ""}
        type={alert?.type}
        onClose={() => setAlert(undefined)}
      />
    </div>
  );
}