import React, { useEffect, useState, useContext, useCallback } from 'react';
import { taskService } from '../services/taskService';
import type { Task } from '../types/task.types';
import { AuthContext } from '../context/AuthContext';
import { TaskPool } from './Tasks/components/TaskPool';
import { CreateTaskForm } from './Tasks/components/CreateTaskForm';
import { TaskToolbar } from './Tasks/components/TaskToolbar';

const Tasks: React.FC = () => {
  const { user } = useContext(AuthContext) || {};
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);

  // Filter States
  const [search, setSearch] = useState('');
  const [status, setStatus] = useState('');
  const [priority, setPriority] = useState('');
  const [category, setCategory] = useState('');
  const [assignedToMe, setAssignedToMe] = useState(false);
  const [sortBy, setSortBy] = useState('createdAt');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');

  const fetchTasks = useCallback(async () => {
    try {
      setLoading(true);
      const data = await taskService.getTasks({
        search: search.trim() || undefined,
        status: status || undefined,
        priority: priority || undefined,
        category: category || undefined,
        assignedToMe: assignedToMe || undefined,
        sortBy,
        sortOrder,
      });
      setTasks(data);
    } catch (err: any) {
      console.error(err);
      setTasks([]);
    } finally {
      setLoading(false);
    }
  }, [search, status, priority, category, assignedToMe, sortBy, sortOrder]);

  // Debounce search input
  useEffect(() => {
    const handler = setTimeout(() => {
      fetchTasks();
    }, 300);
    return () => clearTimeout(handler);
  }, [search, status, priority, category, assignedToMe, sortBy, sortOrder, fetchTasks]);

  const handleCreate = async (taskData: any) => {
    const newTask = await taskService.createTask(taskData);
    setTasks([newTask, ...tasks]);
  };

  const handleClaim = async (id: number) => {
    try {
      await taskService.claimTask(id);
      await fetchTasks(); // Refresh list to show assigned staff & status
    } catch (err: any) {
      alert(err?.response?.data?.message || 'Có lỗi xảy ra khi nhận việc.');
      await fetchTasks();
    }
  };

  const handleComplete = async (id: number, completionNote?: string, evidenceImageUrl?: string) => {
    try {
      await taskService.completeTask(id, { completionNote, evidenceImageUrl });
      await fetchTasks();
    } catch (err: any) {
      alert(err?.response?.data?.message || 'Có lỗi xảy ra khi hoàn thành việc.');
    }
  };

  const handleUnassign = async (id: number) => {
    try {
      await taskService.unassignTask(id);
      await fetchTasks();
    } catch (err: any) {
      alert(err?.response?.data?.message || 'Có lỗi xảy ra khi trả việc.');
    }
  };

  const handleDelete = async (id: number) => {
    if (!window.confirm('Xác nhận xóa nhiệm vụ này?')) return;
    try {
      await taskService.deleteTask(id);
      setTasks(tasks.filter((t) => t.id !== id));
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="pb-10">
      <h1 className="page-title">Điều phối Hậu cần & Nhiệm vụ</h1>
      <p className="page-desc">
        Quản lý và thực thi các công việc chuẩn bị cho phòng họp / chỗ ngồi ca trực.
      </p>

      {/* Filter Toolbar */}
      <TaskToolbar
        search={search}
        setSearch={setSearch}
        status={status}
        setStatus={setStatus}
        priority={priority}
        setPriority={setPriority}
        category={category}
        setCategory={setCategory}
        assignedToMe={assignedToMe}
        setAssignedToMe={setAssignedToMe}
        sortBy={sortBy}
        setSortBy={setSortBy}
        sortOrder={sortOrder}
        setSortOrder={setSortOrder}
        onRefresh={fetchTasks}
      />

      <div className="layout-grid-sidebar">
        {/* Tasks List */}
        <TaskPool
          tasks={tasks}
          loading={loading}
          userRole={user?.role}
          userId={user?.id}
          onClaim={handleClaim}
          onComplete={handleComplete}
          onUnassign={handleUnassign}
          onDelete={handleDelete}
        />

        {/* Create Task Form */}
        <CreateTaskForm onCreate={handleCreate} />
      </div>
    </div>
  );
};

export default Tasks;
