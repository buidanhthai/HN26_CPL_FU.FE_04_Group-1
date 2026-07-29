import React, { useState } from 'react';
import Button from '../../../components/Button';

interface CreateTaskFormProps {
  onCreate: (task: {
    bookingId: number;
    taskCategory: string;
    taskDescription: string;
    requiredStaffCount: number;
    priority: string;
    deadline?: string;
  }) => Promise<void>;
}

export const CreateTaskForm: React.FC<CreateTaskFormProps> = ({ onCreate }) => {
  const [bookingId, setBookingId] = useState<number>(1);
  const [taskCategory, setTaskCategory] = useState('LOGISTICS');
  const [taskDescription, setTaskDescription] = useState('');
  const [requiredStaffCount, setRequiredStaffCount] = useState(1);
  const [priority, setPriority] = useState('MEDIUM');
  const [deadline, setDeadline] = useState('');
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!taskDescription.trim()) {
      setError('Mô tả công việc là bắt buộc.');
      return;
    }
    setError('');
    setSubmitting(true);

    try {
      await onCreate({
        bookingId,
        taskCategory,
        taskDescription: taskDescription.trim(),
        requiredStaffCount,
        priority,
        deadline: deadline ? new Date(deadline).toISOString() : undefined,
      });
      setTaskDescription('');
      setDeadline('');
    } catch (err) {
      console.error(err);
      setError('Lỗi khi tạo công việc.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="panel-card" style={{ height: 'fit-content' }}>
      <h2 className="panel-title" style={{ fontFamily: 'var(--font-title)', color: 'var(--primary-text)' }}>
        Tạo Task thủ công
      </h2>

      {error && (
        <div className="alert-box alert-error">
          ⚠️ {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="form-container" style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
        {/* Category selection */}
        <div className="form-group">
          <label className="form-label">Phân loại nhiệm vụ</label>
          <select 
            value={taskCategory} 
            onChange={(e) => setTaskCategory(e.target.value)}
            className="form-select"
            style={{ width: '100%', boxSizing: 'border-box' }}
          >
            <option value="FRONT DESK">FRONT DESK (Lễ tân)</option>
            <option value="TECHNICAL">TECHNICAL (Kỹ thuật)</option>
            <option value="F&B">F&B (Phục vụ nước/trà)</option>
            <option value="LOGISTICS">LOGISTICS (Hậu cần/Bàn ghế)</option>
          </select>
        </div>

        {/* Priority selection */}
        <div className="form-group">
          <label className="form-label">Độ ưu tiên</label>
          <select 
            value={priority} 
            onChange={(e) => setPriority(e.target.value)}
            className="form-select"
            style={{ width: '100%', boxSizing: 'border-box' }}
          >
            <option value="URGENT">🚨 URGENT (Khẩn cấp)</option>
            <option value="HIGH">HIGH (Cao)</option>
            <option value="MEDIUM">MEDIUM (Thường)</option>
            <option value="LOW">LOW (Thấp)</option>
          </select>
        </div>

        {/* Task description */}
        <div className="form-group">
          <label className="form-label">Mô tả chi tiết</label>
          <textarea 
            value={taskDescription}
            onChange={(e) => setTaskDescription(e.target.value)}
            placeholder="Ví dụ: Chuẩn bị trà, set up máy chiếu..."
            className="form-textarea"
            rows={4}
            required
            style={{ width: '100%', boxSizing: 'border-box', resize: 'vertical' }}
          />
        </div>

        {/* Deadline */}
        <div className="form-group">
          <label className="form-label">Hạn chót hoàn thành (Deadline)</label>
          <input 
            type="datetime-local"
            value={deadline}
            onChange={(e) => setDeadline(e.target.value)}
            className="form-input"
            style={{ width: '100%', boxSizing: 'border-box' }}
          />
        </div>

        {/* Booking ID */}
        <div className="form-group">
          <label className="form-label">Mã Booking ID</label>
          <input 
            type="number"
            value={bookingId}
            onChange={(e) => setBookingId(Number(e.target.value))}
            className="form-input"
            required
            style={{ width: '100%', boxSizing: 'border-box' }}
          />
        </div>

        {/* Required staff count */}
        <div className="form-group">
          <label className="form-label">Số NV cần thiết</label>
          <input 
            type="number"
            min={1}
            value={requiredStaffCount}
            onChange={(e) => setRequiredStaffCount(Number(e.target.value))}
            className="form-input"
            required
            style={{ width: '100%', boxSizing: 'border-box' }}
          />
        </div>

        <Button type="submit" className="mt-2 w-full" disabled={submitting}>
          {submitting ? 'Đang tạo...' : 'Tạo công việc'}
        </Button>
      </form>
    </div>
  );
};

export default CreateTaskForm;
