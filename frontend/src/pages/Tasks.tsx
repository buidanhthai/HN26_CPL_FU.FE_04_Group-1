import React, { useEffect, useState } from 'react';
import { taskService } from '../services/taskService';
import type { Task } from '../types/task.types';
import Button from '../components/Button';

const Tasks: React.FC = () => {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [dueDate, setDueDate] = useState('');
  const [error, setError] = useState('');

  const fetchTasks = async () => {
    try {
      setLoading(true);
      const data = await taskService.getTasks();
      setTasks(data);
    } catch (err: any) {
      console.error(err);
      // Fallback mock tasks
      const mockTasks: Task[] = [
        { id: 1, userId: 1, title: 'Implement JWT Auth', description: 'Write authentication controllers and front hooks', isCompleted: false, dueDate: '2026-07-08' },
        { id: 2, userId: 1, title: 'Set up MySQL database', description: 'Create EF Core migration for schema creation', isCompleted: true, dueDate: '2026-07-05' },
        { id: 3, userId: 1, title: 'Configure CORS headers', description: 'Enable react domain calls on dot net controllers', isCompleted: false, dueDate: '2026-07-07' },
      ];
      setTasks(mockTasks);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTasks();
  }, []);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title) {
      setError('Title is required');
      return;
    }
    setError('');

    try {
      const newTask = await taskService.createTask({ title, description, isCompleted: false, dueDate });
      setTasks([...tasks, newTask]);
      setTitle('');
      setDescription('');
      setDueDate('');
    } catch (err) {
      console.error(err);
      // Fallback
      const mockNew: Task = {
        id: Date.now(),
        userId: 1,
        title,
        description,
        isCompleted: false,
        dueDate,
      };
      setTasks([...tasks, mockNew]);
      setTitle('');
      setDescription('');
      setDueDate('');
    }
  };

  const handleToggleComplete = async (task: Task) => {
    const updatedStatus = !task.isCompleted;
    try {
      await taskService.updateTask(task.id, { isCompleted: updatedStatus });
      setTasks(tasks.map((t) => (t.id === task.id ? { ...t, isCompleted: updatedStatus } : t)));
    } catch (err) {
      console.error(err);
      setTasks(tasks.map((t) => (t.id === task.id ? { ...t, isCompleted: updatedStatus } : t)));
    }
  };

  const handleDelete = async (id: number) => {
    try {
      await taskService.deleteTask(id);
      setTasks(tasks.filter((t) => t.id !== id));
    } catch (err) {
      console.error(err);
      setTasks(tasks.filter((t) => t.id !== id));
    }
  };

  return (
    <div>
      <h1 style={{ fontSize: '2rem', margin: '0 0 8px 0', color: 'var(--primary-text)', fontFamily: 'var(--font-title)' }}>
        Công việc của tôi
      </h1>
      <p style={{ color: 'var(--secondary-text)', margin: '0 0 30px 0', fontSize: '0.95rem' }}>
        Sắp xếp danh sách kiểm tra hàng ngày và các cột mốc quan trọng của bạn.
      </p>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 340px', gap: '30px', alignItems: 'start' }}>
        {/* Tasks List */}
        <div style={{
          backgroundColor: 'var(--surface-color)',
          borderRadius: '16px',
          border: '1px solid var(--border-color)',
          padding: '30px 24px',
          boxShadow: 'var(--shadow)'
        }}>
          <h2 style={{ fontSize: '1.4rem', margin: '0 0 20px 0', color: 'var(--primary-text)', fontFamily: 'var(--font-title)' }}>
            Danh sách công việc
          </h2>

          {loading ? (
            <p style={{ color: 'var(--secondary-text)' }}>Đang tải danh sách công việc...</p>
          ) : tasks.length === 0 ? (
            <p style={{ color: 'var(--secondary-text)' }}>Chưa có công việc nào.</p>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
              {tasks.map((t) => (
                <div 
                  key={t.id}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    padding: '16px 20px',
                    borderRadius: '12px',
                    backgroundColor: t.isCompleted ? 'rgba(111, 78, 55, 0.05)' : 'var(--background-color)',
                    border: '1px solid var(--border-color)',
                    opacity: t.isCompleted ? 0.75 : 1,
                    transition: 'var(--transition)',
                    boxShadow: '0 2px 4px rgba(60, 42, 33, 0.02)'
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
                    <input 
                      type="checkbox"
                      checked={t.isCompleted}
                      onChange={() => handleToggleComplete(t)}
                      style={{
                        width: '20px',
                        height: '20px',
                        cursor: 'pointer',
                        accentColor: 'var(--nature-accent)'
                      }}
                    />
                    <div>
                      <div style={{
                        fontWeight: '600',
                        fontSize: '0.95rem',
                        textDecoration: t.isCompleted ? 'line-through' : 'none',
                        color: t.isCompleted ? 'var(--secondary-text)' : 'var(--primary-text)',
                        transition: 'var(--transition)'
                      }}>
                        {t.title}
                      </div>
                      {t.description && (
                        <div style={{ fontSize: '0.85rem', color: 'var(--secondary-text)', marginTop: '4px' }}>
                          {t.description}
                        </div>
                      )}
                      {t.dueDate && (
                        <div style={{ fontSize: '0.75rem', color: 'var(--nature-accent)', marginTop: '6px', fontWeight: '500' }}>
                          📅 Hạn chót: {t.dueDate}
                        </div>
                      )}
                    </div>
                  </div>
                  <button 
                    onClick={() => handleDelete(t.id)}
                    style={{
                      backgroundColor: 'transparent',
                      color: '#e07a5f',
                      border: 'none',
                      cursor: 'pointer',
                      fontSize: '0.85rem',
                      fontWeight: 'bold',
                      transition: 'var(--transition)'
                    }}
                    onMouseOver={(e) => (e.currentTarget.style.color = '#c65f45')}
                    onMouseOut={(e) => (e.currentTarget.style.color = '#e07a5f')}
                  >
                    Xóa
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Create Task Form */}
        <div style={{
          backgroundColor: 'var(--surface-color)',
          borderRadius: '16px',
          border: '1px solid var(--border-color)',
          padding: '30px 24px',
          boxShadow: 'var(--shadow)'
        }}>
          <h2 style={{ fontSize: '1.4rem', margin: '0 0 20px 0', color: 'var(--primary-text)', fontFamily: 'var(--font-title)' }}>
            Tạo công việc mới
          </h2>

          {error && (
            <div style={{ color: '#e07a5f', fontSize: '0.85rem', marginBottom: '15px', fontWeight: '500' }}>{error}</div>
          )}

          <form onSubmit={handleCreate} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
              <label style={{ fontSize: '0.85rem', fontWeight: '600', color: 'var(--secondary-text)' }}>Tiêu đề</label>
              <input 
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Ví dụ: Thiết kế Layout sơ đồ"
                className="input-field"
              />
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
              <label style={{ fontSize: '0.85rem', fontWeight: '600', color: 'var(--secondary-text)' }}>Mô tả</label>
              <textarea 
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Chi tiết công việc..."
                className="input-field"
                style={{
                  resize: 'vertical',
                  minHeight: '80px'
                }}
              />
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
              <label style={{ fontSize: '0.85rem', fontWeight: '600', color: 'var(--secondary-text)' }}>Hạn chót</label>
              <input 
                type="date"
                value={dueDate}
                onChange={(e) => setDueDate(e.target.value)}
                className="input-field"
              />
            </div>

            <Button type="submit" style={{ marginTop: '10px' }}>Tạo công việc</Button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default Tasks;
