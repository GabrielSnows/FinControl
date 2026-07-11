export interface Debt {
  id: number;
  creditor: string;
  description: string;
  amount: number;
  dueDate: string;
  paid: boolean;
  createdAt: string;
}