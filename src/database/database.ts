import Dexie, { type EntityTable } from "dexie";

import type { Account } from "../types/Account";

const database = new Dexie("fincontrolDatabase") as Dexie & {
  accounts: EntityTable<Account, "id">;
};

database.version(1).stores({
  accounts: "id, bankId, name, type, createdAt",
});

export const db = database;