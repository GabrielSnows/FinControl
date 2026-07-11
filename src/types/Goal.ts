export interface Goal {
  id: number;
  title: string;
  targetAmount: number;
  currentAmount: number;
  completed: boolean;
  createdAt: string;
}