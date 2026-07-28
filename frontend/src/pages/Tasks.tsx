import React, { useEffect, useState, useContext } from 'react';
import { taskService } from '../services/taskService';
import type { Task } from '../types/task.types';
import { AuthContext } from '../context/AuthContext';
import { TaskPool } from './Tasks/components/TaskPool';
import { CreateTaskForm } from './Tasks/components/CreateTaskForm';

const Tasks: React.FC = () => {
  const { user } = useContext(AuthContext) || {};
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchTasks = async () => {
    try {
      setLoading(true);
      const data = await taskService.getTasks();
      setTasks(data);
    } catch (err: any) {
      console.error(err);
      setTasks([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTasks();
  }, []);

  const handleCreate = async (taskData: {
    bookingId: number;
    taskCategory: string;
    taskDescription: string;
    requiredStaffCount: number;
  }) => {
    const newTask = await taskService.createTask(taskData);
    setTasks([...tasks, newTask]);
  };

  const handleUpdateStatus = async (task: Task, newStatus: string) => {
    try {
      await taskService.updateTask(task.id, { taskStatus: newStatus as any });
      setTasks(tasks.map((t) => (t.id === task.id ? { ...t, taskStatus: newStatus as any } : t)));
    } catch (err) {
      console.error(err);
    }
  };

  const handleDelete = async (id: number) => {
    try {
      await taskService.deleteTask(id);
      setTasks(tasks.filter((t) => t.id !== id));
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div>
      <h1 className="page-title">Điều phối Hậu cần & Nhiệm vụ</h1>
      <p className="page-desc">
        Quản lý và thực thi các công việc chuẩn bị cho phòng họp / chỗ ngồi.
      </p>

      <div className="layout-grid-sidebar">
        {/* Tasks List */}
        <TaskPool
          tasks={tasks}
          loading={loading}
          userRole={user?.role}
          onUpdateStatus={handleUpdateStatus}
          onDelete={handleDelete}
        />

        {/* Create Task Form */}
        <CreateTaskForm onCreate={handleCreate} />
      </div>
    </div>
  );
};

export default Tasks;
