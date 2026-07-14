import api from './api';
import type { Task, CreateTaskRequest } from '../types/task.types';

export const taskService = {
  async getTasks(): Promise<Task[]> {
    const response = await api.get<Task[]>('/tasks');
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
  }
};
