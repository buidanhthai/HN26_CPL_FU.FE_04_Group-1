export interface Task {
  id: number;
  bookingId: number;
  taskCategory: string;
  taskDescription?: string;
  requiredStaffCount: number;
  taskStatus: 'Unassigned' | 'In_Progress' | 'Completed';
  createdAt: string;
}

export interface CreateTaskRequest {
  bookingId: number;
  taskCategory: string;
  taskDescription?: string;
  requiredStaffCount: number;
}
