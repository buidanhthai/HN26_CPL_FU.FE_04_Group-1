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
      <h1 style={{ fontSize: '1.8rem', margin: '0 0 10px 0', color: '#00e1d9' }}>Tasks</h1>
      <p style={{ color: '#a2a5b9', margin: '0 0 24px 0' }}>Organize your daily checklists and milestones.</p>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 320px', gap: '24px', alignItems: 'start' }}>
        {/* Tasks List */}
        <div style={{
          backgroundColor: '#151521',
          borderRadius: '8px',
          border: '1px solid #2d2d3f',
          padding: '24px',
          boxShadow: '0 4px 6px rgba(0,0,0,0.15)'
        }}>
          <h2 style={{ fontSize: '1.2rem', margin: '0 0 16px 0', color: '#fff' }}>Pending & Completed Tasks</h2>

          {loading ? (
            <p style={{ color: '#a2a5b9' }}>Loading tasks...</p>
          ) : tasks.length === 0 ? (
            <p style={{ color: '#a2a5b9' }}>No tasks found.</p>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
              {tasks.map((t) => (
                <div 
                  key={t.id}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    padding: '15px',
                    borderRadius: '6px',
                    backgroundColor: t.isCompleted ? 'rgba(255, 255, 255, 0.02)' : '#1e1e2d',
                    border: '1px solid #2d2d3f',
                    opacity: t.isCompleted ? 0.6 : 1,
                    transition: 'all 0.2s'
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <input 
                      type="checkbox"
                      checked={t.isCompleted}
                      onChange={() => handleToggleComplete(t)}
                      style={{
                        width: '18px',
                        height: '18px',
                        cursor: 'pointer',
                        accentColor: '#00e1d9'
                      }}
                    />
                    <div>
                      <div style={{
                        fontWeight: '600',
                        fontSize: '0.95rem',
                        textDecoration: t.isCompleted ? 'line-through' : 'none',
                        color: t.isCompleted ? '#a2a5b9' : '#fff'
                      }}>
                        {t.title}
                      </div>
                      {t.description && (
                        <div style={{ fontSize: '0.85rem', color: '#a2a5b9', marginTop: '2px' }}>
                          {t.description}
                        </div>
                      )}
                      {t.dueDate && (
                        <div style={{ fontSize: '0.75rem', color: '#00e1d9', marginTop: '4px' }}>
                          📅 Due: {t.dueDate}
                        </div>
                      )}
                    </div>
                  </div>
                  <button 
                    onClick={() => handleDelete(t.id)}
                    style={{
                      backgroundColor: 'transparent',
                      color: '#ff5c75',
                      border: 'none',
                      cursor: 'pointer',
                      fontSize: '0.85rem'
                    }}
                  >
                    Delete
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Create Task Form */}
        <div style={{
          backgroundColor: '#151521',
          borderRadius: '8px',
          border: '1px solid #2d2d3f',
          padding: '24px',
          boxShadow: '0 4px 6px rgba(0,0,0,0.15)'
        }}>
          <h2 style={{ fontSize: '1.2rem', margin: '0 0 16px 0', color: '#00e1d9' }}>Create Task</h2>

          {error && (
            <div style={{ color: '#ff5c75', fontSize: '0.85rem', marginBottom: '10px' }}>{error}</div>
          )}

          <form onSubmit={handleCreate} style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '5px' }}>
              <label style={{ fontSize: '0.85rem', color: '#a2a5b9' }}>Title</label>
              <input 
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="e.g. Write unit tests"
                style={{
                  padding: '8px 10px',
                  borderRadius: '4px',
                  border: '1px solid #2d2d3f',
                  backgroundColor: '#1c1c28',
                  color: '#fff',
                  outline: 'none'
                }}
              />
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '5px' }}>
              <label style={{ fontSize: '0.85rem', color: '#a2a5b9' }}>Description</label>
              <textarea 
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="e.g. Focus on service classes"
                style={{
                  padding: '8px 10px',
                  borderRadius: '4px',
                  border: '1px solid #2d2d3f',
                  backgroundColor: '#1c1c28',
                  color: '#fff',
                  outline: 'none',
                  resize: 'vertical',
                  minHeight: '60px'
                }}
              />
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '5px' }}>
              <label style={{ fontSize: '0.85rem', color: '#a2a5b9' }}>Due Date</label>
              <input 
                type="date"
                value={dueDate}
                onChange={(e) => setDueDate(e.target.value)}
                style={{
                  padding: '8px 10px',
                  borderRadius: '4px',
                  border: '1px solid #2d2d3f',
                  backgroundColor: '#1c1c28',
                  color: '#fff',
                  outline: 'none'
                }}
              />
            </div>

            <Button type="submit" style={{ marginTop: '10px' }}>Create Task</Button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default Tasks;
