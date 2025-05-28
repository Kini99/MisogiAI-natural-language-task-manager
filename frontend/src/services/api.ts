import axios from 'axios';
import { Task, CreateTaskInput, UpdateTaskInput } from '@/types/task';

const api = axios.create({
  baseURL: '/api',
});

export const taskApi = {
  createTask: async (input: CreateTaskInput): Promise<Task> => {
    const { data } = await api.post<Task>('/tasks', input);
    return data;
  },

  getTasks: async (): Promise<Task[]> => {
    const { data } = await api.get<Task[]>('/tasks');
    return data;
  },

  updateTask: async (id: string, input: UpdateTaskInput): Promise<Task> => {
    const { data } = await api.put<Task>(`/tasks/${id}`, input);
    return data;
  },

  deleteTask: async (id: string): Promise<void> => {
    await api.delete(`/tasks/${id}`);
  },
}; 