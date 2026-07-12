import { db } from "../database/database";

import type { Account } from "../types/Account";
import type { Transaction } from "../types/Transaction";
import type { Debt } from "../types/Debt";
import type { Goal } from "../types/Goal";

const BACKUP_VERSION = "1.0";

export type FinControlBackup = {
  version: string;
  createdAt: string;
  accounts: Account[];
  transactions: Transaction[];
  debts: Debt[];
  goals: Goal[];
};

function formatFileDate() {
  const now = new Date();

  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, "0");
  const day = String(now.getDate()).padStart(2, "0");
  const hour = String(now.getHours()).padStart(2, "0");
  const minute = String(now.getMinutes()).padStart(2, "0");

  return `${year}-${month}-${day}_${hour}-${minute}`;
}

export async function createBackup(): Promise<FinControlBackup> {
  const [accounts, transactions, debts, goals] =
    await Promise.all([
      db.accounts.toArray(),
      db.transactions.toArray(),
      db.debts.toArray(),
      db.goals.toArray(),
    ]);

  return {
    version: BACKUP_VERSION,
    createdAt: new Date().toISOString(),
    accounts,
    transactions,
    debts,
    goals,
  };
}

export async function downloadBackup() {
  const backup = await createBackup();

  const json = JSON.stringify(backup, null, 2);

  const blob = new Blob([json], {
    type: "application/json",
  });

  const downloadUrl = URL.createObjectURL(blob);

  const link = document.createElement("a");

  link.href = downloadUrl;
  link.download = `fincontrol-backup-${formatFileDate()}.json`;

  document.body.appendChild(link);

  link.click();
  link.remove();

  URL.revokeObjectURL(downloadUrl);
}

function isValidBackup(value: unknown): value is FinControlBackup {
  if (
    typeof value !== "object" ||
    value === null
  ) {
    return false;
  }

  const backup = value as Partial<FinControlBackup>;

  return (
    typeof backup.version === "string" &&
    typeof backup.createdAt === "string" &&
    Array.isArray(backup.accounts) &&
    Array.isArray(backup.transactions) &&
    Array.isArray(backup.debts) &&
    Array.isArray(backup.goals)
  );
}

export async function readBackupFile(
  file: File,
): Promise<FinControlBackup> {
  const text = await file.text();

  let parsedBackup: unknown;

  try {
    parsedBackup = JSON.parse(text);
  } catch {
    throw new Error(
      "O arquivo selecionado não contém um JSON válido.",
    );
  }

  if (!isValidBackup(parsedBackup)) {
    throw new Error(
      "O arquivo selecionado não é um backup válido do FinControl.",
    );
  }

  if (parsedBackup.version !== BACKUP_VERSION) {
    throw new Error(
      `Este backup pertence à versão ${parsedBackup.version}. O FinControl atual aceita backups da versão ${BACKUP_VERSION}.`,
    );
  }

  return parsedBackup;
}

export async function restoreBackup(
  backup: FinControlBackup,
) {
  await db.transaction(
    "rw",
    db.accounts,
    db.transactions,
    db.debts,
    db.goals,
    async () => {
      await Promise.all([
        db.transactions.clear(),
        db.debts.clear(),
        db.goals.clear(),
        db.accounts.clear(),
      ]);

      if (backup.accounts.length > 0) {
        await db.accounts.bulkAdd(backup.accounts);
      }

      if (backup.transactions.length > 0) {
        await db.transactions.bulkAdd(
          backup.transactions,
        );
      }

      if (backup.debts.length > 0) {
        await db.debts.bulkAdd(backup.debts);
      }

      if (backup.goals.length > 0) {
        await db.goals.bulkAdd(backup.goals);
      }
    },
  );
}