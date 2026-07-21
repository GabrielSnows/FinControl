import Dexie, { type EntityTable } from "dexie";

import type { Account } from "../types/Account";
import type { CreditCard } from "../types/CreditCard";
import type { Debt } from "../types/Debt";
import type { Goal } from "../types/Goal";
import type { Transaction } from "../types/Transaction";

const database = new Dexie("fincontrolDatabase") as Dexie & {
  accounts: EntityTable<Account, "id">;
  creditCards: EntityTable<CreditCard, "id">;
  transactions: EntityTable<Transaction, "id">;
  debts: EntityTable<Debt, "id">;
  goals: EntityTable<Goal, "id">;
};

database.version(1).stores({
  accounts: "id, bankId, name, type, createdAt",
});

database.version(2).stores({
  accounts: "id, bankId, name, type, createdAt",
  transactions:
    "id, accountId, type, category, date, createdAt",
});

database.version(3).stores({
  accounts: "id, bankId, name, type, createdAt",
  transactions:
    "id, accountId, type, category, date, createdAt",
  debts: "id, creditor, dueDate, paid, createdAt",
});

database.version(4).stores({
  accounts: "id, bankId, name, type, createdAt",
  transactions:
    "id, accountId, type, category, date, createdAt",
  debts: "id, creditor, dueDate, paid, createdAt",
  goals: "id, title, completed, createdAt",
});

database.version(5).stores({
  accounts: "id, bankId, name, type, createdAt",
  creditCards: "id, bankId, name, brand, dueDay, createdAt",
  transactions:
    "id, accountId, type, category, date, createdAt",
  debts: "id, creditor, dueDate, paid, createdAt",
  goals: "id, title, completed, createdAt",
});

export const db = database;