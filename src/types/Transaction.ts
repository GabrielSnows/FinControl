export type TransactionType = "income" | "expense";

export interface Transaction {
  id: number;
  accountId: number;
  type: TransactionType;
  category: string;
  description: string;
  amount: number;
  date: string;
  createdAt: string;
}