import React, { useEffect, useState, useContext } from 'react';
import { taskService } from '../services/taskService';
import type { Task, CreateTaskRequest } from '../types/task.types';
import Button from '../components/Button';
import { AuthContext } from '../context/AuthContext';

const Tasks: React.FC = () => {
  const { user } = useContext(AuthContext) || {};
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  
  const [bookingId, setBookingId] = useState<number>(1);
  const [taskCategory, setTaskCategory] = useState('LOGISTICS');
  const [taskDescription, setTaskDescription] = useState('');
  const [requiredStaffCount, setRequiredStaffCount] = useState(1);
  
  const [error, setError] = useState('');

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

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!taskDescription) {
      setError('Mô tả công việc là bắt buộc');
      return;
    }
    setError('');

    try {
      const newTask = await taskService.createTask({
        bookingId,
        taskCategory,
        taskDescription,
        requiredStaffCount
      });
      setTasks([...tasks, newTask]);
      setTaskDescription('');
    } catch (err) {
      console.error(err);
    }
  };

  const handleUpdateStatus = async (task: Task, newStatus: string) => {
    try {
      await taskService.updateTask(task.id, { taskStatus: newStatus });
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
      <h1 style={{ fontSize: '2rem', margin: '0 0 8px 0', color: 'var(--primary-text)', fontFamily: 'var(--font-title)' }}>
        Điều phối Hậu cần & Nhiệm vụ
      </h1>
      <p style={{ color: 'var(--secondary-text)', margin: '0 0 30px 0', fontSize: '0.95rem' }}>
        Quản lý và thực thi các công việc chuẩn bị cho phòng họp / chỗ ngồi.
      </p>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 360px', gap: '30px', alignItems: 'start' }}>
        {/* Tasks List */}
        <div style={{
          backgroundColor: 'var(--surface-color)',
          borderRadius: '16px',
          border: '1px solid var(--border-color)',
          padding: '30px 24px',
          boxShadow: 'var(--shadow)'
        }}>
          <h2 style={{ fontSize: '1.4rem', margin: '0 0 20px 0', color: 'var(--primary-text)', fontFamily: 'var(--font-title)' }}>
            Task Pool (Hàng đợi tự nhận việc)
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
                    backgroundColor: t.taskStatus === 'Completed' ? 'rgba(111, 78, 55, 0.05)' : 'var(--background-color)',
                    border: '1px solid var(--border-color)',
                    opacity: t.taskStatus === 'Completed' ? 0.75 : 1,
                    transition: 'var(--transition)',
                    boxShadow: '0 2px 4px rgba(60, 42, 33, 0.02)'
                  }}
                >
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                      <span style={{
                        padding: '4px 8px',
                        backgroundColor: 'var(--surface-color)',
                        border: '1px solid var(--border-color)',
                        borderRadius: '4px',
                        fontSize: '0.75rem',
                        fontWeight: 'bold',
                        color: 'var(--secondary-text)'
                      }}>
                        {t.taskCategory}
                      </span>
                      <span style={{
                        fontSize: '0.8rem',
                        fontWeight: '600',
                        color: 
                          t.taskStatus === 'Unassigned' ? '#e07a5f' :
                          t.taskStatus === 'In_Progress' ? 'var(--accent-color)' : 'var(--nature-accent)'
                      }}>
                        {t.taskStatus}
                      </span>
                    </div>
                    <div style={{
                      fontWeight: '600',
                      fontSize: '0.95rem',
                      textDecoration: t.taskStatus === 'Completed' ? 'line-through' : 'none',
                      color: t.taskStatus === 'Completed' ? 'var(--secondary-text)' : 'var(--primary-text)'
                    }}>
                      {t.taskDescription}
                    </div>
                    <div style={{ fontSize: '0.8rem', color: 'var(--secondary-text)' }}>
                      Mã đặt chỗ: #{t.bookingId} | Số nhân viên yêu cầu: {t.requiredStaffCount}
                    </div>
                  </div>
                  
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', alignItems: 'flex-end' }}>
                    {t.taskStatus === 'Unassigned' && user?.role === 'STAFF' && (
                      <button 
                        onClick={() => handleUpdateStatus(t, 'In_Progress')}
                        style={{
                          backgroundColor: 'var(--accent-color)',
                          color: '#fff',
                          border: 'none',
                          padding: '6px 12px',
                          borderRadius: '6px',
                          cursor: 'pointer',
                          fontSize: '0.8rem',
                          fontWeight: 'bold'
                        }}
                      >
                        Nhận việc
                      </button>
                    )}
                    {t.taskStatus === 'In_Progress' && user?.role === 'STAFF' && (
                      <button 
                        onClick={() => handleUpdateStatus(t, 'Completed')}
                        style={{
                          backgroundColor: 'var(--nature-accent)',
                          color: '#fff',
                          border: 'none',
                          padding: '6px 12px',
                          borderRadius: '6px',
                          cursor: 'pointer',
                          fontSize: '0.8rem',
                          fontWeight: 'bold'
                        }}
                      >
                        Hoàn thành
                      </button>
                    )}
                    {(user?.role === 'ADMIN' || user?.role === 'STAFF') && (
                      <button 
                        onClick={() => handleDelete(t.id)}
                        style={{
                          backgroundColor: 'transparent',
                          color: '#e07a5f',
                          border: 'none',
                          cursor: 'pointer',
                          fontSize: '0.8rem',
                          fontWeight: 'bold'
                        }}
                      >
                        Xóa
                      </button>
                    )}
                  </div>
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
            Tạo Task thủ công
          </h2>

          {error && (
            <div style={{ color: '#e07a5f', fontSize: '0.85rem', marginBottom: '15px', fontWeight: '500' }}>{error}</div>
          )}

          <form onSubmit={handleCreate} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
            
            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
              <label style={{ fontSize: '0.85rem', fontWeight: '600', color: 'var(--secondary-text)' }}>Phân loại nhiệm vụ</label>
              <select 
                value={taskCategory} 
                onChange={(e) => setTaskCategory(e.target.value)}
                className="input-field"
                style={{ padding: '12px', borderRadius: '8px', border: '1px solid var(--border-color)' }}
              >
                <option value="FRONT DESK">FRONT DESK (Lễ tân)</option>
                <option value="TECHNICAL">TECHNICAL (Kỹ thuật)</option>
                <option value="F&B">F&B (Phục vụ nước/trà)</option>
                <option value="LOGISTICS">LOGISTICS (Hậu cần/Bàn ghế)</option>
              </select>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
              <label style={{ fontSize: '0.85rem', fontWeight: '600', color: 'var(--secondary-text)' }}>Mô tả chi tiết</label>
              <textarea 
                value={taskDescription}
                onChange={(e) => setTaskDescription(e.target.value)}
                placeholder="Ví dụ: Chuẩn bị trà, set up máy chiếu..."
                className="input-field"
                style={{
                  resize: 'vertical',
                  minHeight: '80px'
                }}
              />
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                <label style={{ fontSize: '0.85rem', fontWeight: '600', color: 'var(--secondary-text)' }}>Mã Booking ID</label>
                <input 
                  type="number"
                  value={bookingId}
                  onChange={(e) => setBookingId(Number(e.target.value))}
                  className="input-field"
                />
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                <label style={{ fontSize: '0.85rem', fontWeight: '600', color: 'var(--secondary-text)' }}>Số NV cần thiết</label>
                <input 
                  type="number"
                  value={requiredStaffCount}
                  onChange={(e) => setRequiredStaffCount(Number(e.target.value))}
                  className="input-field"
                />
              </div>
            </div>

            <Button type="submit" style={{ marginTop: '10px' }}>Tạo công việc</Button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default Tasks;
