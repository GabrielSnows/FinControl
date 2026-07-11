export interface Account {
  id: number;
  bankId: number;
  name: string;
  balance: number;
  image: string;
  type: "bank" | "wallet";
  createdAt: string;
}