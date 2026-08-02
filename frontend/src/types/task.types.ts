export interface Task {
  id: number;
  bookingId: number;
  spaceAssetId?: number;
  roomNumber?: string;
  taskCategory: string;
  taskDescription?: string;
  requiredStaffCount: number;
  taskStatus: 'Unassigned' | 'In_Progress' | 'Completed';
  priority: 'URGENT' | 'HIGH' | 'MEDIUM' | 'LOW';
  deadline?: string;
  createdAt: string;
  assignedStaff?: {
    id: number;
    fullName: string;
    avatarUrl?: string;
  };
  taskLogs?: TaskLog[];
}

export interface TaskLog {
  id: number;
  userFullName: string;
  actionDescription: string;
  timestamp: string;
}

export interface CreateTaskRequest {
  bookingId: number;
  spaceAssetId?: number;
  taskCategory: string;
  taskDescription?: string;
  requiredStaffCount: number;
  priority?: 'URGENT' | 'HIGH' | 'MEDIUM' | 'LOW';
  deadline?: string;
}

export interface CompleteTaskRequest {
  completionNote?: string;
  evidenceImageUrl?: string;
}
