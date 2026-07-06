export interface Task {
  id: number;
  userId: number;
  title: string;
  description: string;
  isCompleted: boolean;
  dueDate: string;
}
