import React, { useState } from 'react';
import Button from '../../../components/Button';

interface CreateTaskFormProps {
  onCreate: (task: {
    bookingId: number;
    taskCategory: string;
    taskDescription: string;
    requiredStaffCount: number;
  }) => Promise<void>;
}

export const CreateTaskForm: React.FC<CreateTaskFormProps> = ({ onCreate }) => {
  const [bookingId, setBookingId] = useState<number>(1);
  const [taskCategory, setTaskCategory] = useState('LOGISTICS');
  const [taskDescription, setTaskDescription] = useState('');
  const [requiredStaffCount, setRequiredStaffCount] = useState(1);
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
      });
      setTaskDescription('');
    } catch (err) {
      console.error(err);
      setError('Lỗi khi tạo công việc.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="panel-card">
      <h2 className="panel-title">Tạo Task thủ công</h2>

      {error && (
        <div style={{ color: '#e07a5f', fontSize: '0.85rem', marginBottom: '15px', fontWeight: '500' }}>
          ⚠️ {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="form-container">
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
            required
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
              required
            />
          </div>
          <div className="form-group">
            <label className="form-label">Số NV cần thiết</label>
            <input 
              type="number"
              min={1}
              value={requiredStaffCount}
              onChange={(e) => setRequiredStaffCount(Number(e.target.value))}
              className="form-input"
              required
            />
          </div>
        </div>

        <Button type="submit" style={{ marginTop: '10px' }} disabled={submitting}>
          {submitting ? 'Đang tạo...' : 'Tạo công việc'}
        </Button>
      </form>
    </div>
  );
};
