import React, { useEffect, useState, useContext } from 'react';
import { taskService } from '../services/taskService';
import type { Task } from '../types/task.types';
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
      <h1 className="page-title">
        Điều phối Hậu cần & Nhiệm vụ
      </h1>
      <p className="page-desc">
        Quản lý và thực thi các công việc chuẩn bị cho phòng họp / chỗ ngồi.
      </p>

      <div className="layout-grid-sidebar">
        {/* Tasks List */}
        <div className="panel-card">
          <h2 className="panel-title">
            Task Pool (Hàng đợi tự nhận việc)
          </h2>

          {loading ? (
            <p className="page-desc">Đang tải danh sách công việc...</p>
          ) : tasks.length === 0 ? (
            <p className="page-desc">Chưa có công việc nào.</p>
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
                      <span className={`badge ${
                        t.taskStatus === 'Unassigned' ? 'badge-unassigned' :
                        t.taskStatus === 'In_Progress' ? 'badge-inprogress' : 'badge-completed'
                      }`}>
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
                        className="btn btn-primary"
                        style={{
                          padding: '6px 12px',
                          borderRadius: '6px',
                          fontSize: '0.8rem'
                        }}
                      >
                        Nhận việc
                      </button>
                    )}
                    {t.taskStatus === 'In_Progress' && user?.role === 'STAFF' && (
                      <button 
                        onClick={() => handleUpdateStatus(t, 'Completed')}
                        className="btn btn-secondary"
                        style={{
                          padding: '6px 12px',
                          borderRadius: '6px',
                          fontSize: '0.8rem'
                        }}
                      >
                        Hoàn thành
                      </button>
                    )}
                    {(user?.role === 'ADMIN' || user?.role === 'STAFF') && (
                      <button 
                        onClick={() => handleDelete(t.id)}
                        className="btn-link-danger"
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
        <div className="panel-card">
          <h2 className="panel-title">
            Tạo Task thủ công
          </h2>

          {error && (
            <div style={{ color: '#e07a5f', fontSize: '0.85rem', marginBottom: '15px', fontWeight: '500' }}>{error}</div>
          )}

          <form onSubmit={handleCreate} className="form-container">
            
            <div className="form-group">
              <label className="form-label">Phân loại nhiệm vụ</label>
              <select 
                value={taskCategory} 
                onChange={(e) => setTaskCategory(e.target.value)}
                className="form-select"
              >
                <option value="FRONT DESK">FRONT DESK (Lễ tân)</option>
                <option value="TECHNICAL">TECHNICAL (Kỹ thuật)</option>
                <option value="F&B">F&B (Phục vụ nước/trà)</option>
                <option value="LOGISTICS">LOGISTICS (Hậu cần/Bàn ghế)</option>
              </select>
            </div>

            <div className="form-group">
              <label className="form-label">Mô tả chi tiết</label>
              <textarea 
                value={taskDescription}
                onChange={(e) => setTaskDescription(e.target.value)}
                placeholder="Ví dụ: Chuẩn bị trà, set up máy chiếu..."
                className="form-textarea"
              />
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
              <div className="form-group">
                <label className="form-label">Mã Booking ID</label>
                <input 
                  type="number"
                  value={bookingId}
                  onChange={(e) => setBookingId(Number(e.target.value))}
                  className="form-input"
                />
              </div>
              <div className="form-group">
                <label className="form-label">Số NV cần thiết</label>
                <input 
                  type="number"
                  value={requiredStaffCount}
                  onChange={(e) => setRequiredStaffCount(Number(e.target.value))}
                  className="form-input"
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
