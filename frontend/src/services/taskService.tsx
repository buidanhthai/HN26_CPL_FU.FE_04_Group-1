import api from './api';
import type { Task, CreateTaskRequest, CompleteTaskRequest } from '../types/task.types';

export const taskService = {
  async getTasks(params?: {
    search?: string;
    status?: string;
    priority?: string;
    category?: string;
    assignedToMe?: boolean;
    sortBy?: string;
    sortOrder?: 'asc' | 'desc';
  }): Promise<Task[]> {
    const response = await api.get<Task[]>('/tasks', { params });
    return response.data;
  },

  async createTask(task: CreateTaskRequest): Promise<Task> {
    const response = await api.post<Task>('/tasks', task);
    return response.data;
  },

  async updateTask(id: number, task: Partial<Task>): Promise<Task> {
    const response = await api.put<Task>(`/tasks/${id}`, task);
    return response.data;
  },

  async deleteTask(id: number): Promise<void> {
    await api.delete(`/tasks/${id}`);
  },

  async claimTask(id: number): Promise<any> {
    const response = await api.post(`/tasks/${id}/claim`);
    return response.data;
  },

  async completeTask(id: number, request: CompleteTaskRequest): Promise<any> {
    const response = await api.post(`/tasks/${id}/complete`, request);
    return response.data;
  },

  async assignTask(id: number, staffId: number): Promise<any> {
    const response = await api.post(`/tasks/${id}/assign`, staffId, {
      headers: { 'Content-Type': 'application/json' }
    });
    return response.data;
  },

  async unassignTask(id: number): Promise<any> {
    const response = await api.post(`/tasks/${id}/unassign`);
    return response.data;
  }
};
