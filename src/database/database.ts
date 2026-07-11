import Dexie, { type EntityTable } from "dexie";

import type { Account } from "../types/Account";
import type { Transaction } from "../types/Transaction";

const database = new Dexie("fincontrolDatabase") as Dexie & {
  accounts: EntityTable<Account, "id">;
  transactions: EntityTable<Transaction, "id">;
};

database.version(1).stores({
  accounts: "id, bankId, name, type, createdAt",
});

database.version(2).stores({
  accounts: "id, bankId, name, type, createdAt",
  transactions:
    "id, accountId, type, category, date, createdAt",
});

export const db = database;