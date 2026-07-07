import React, { useEffect, useState } from 'react';
import { bookingService } from '../services/bookingService';
import type { Booking } from '../types/booking.types';
import Button from '../components/Button';

const Bookings: React.FC = () => {
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [bookingDate, setBookingDate] = useState('');
  const [error, setError] = useState('');

  const fetchBookings = async () => {
    try {
      setLoading(true);
      const data = await bookingService.getBookings();
      setBookings(data);
    } catch (err: any) {
      console.error(err);
      // Mock data fallback if backend is offline
      const mockBookings: Booking[] = [
        { id: 1, userId: 1, title: 'Consulting Session', description: 'Discuss project architecture', bookingDate: '2026-07-07', status: 'Confirmed' },
        { id: 2, userId: 1, title: 'Code Review', description: 'Review react-router configuration', bookingDate: '2026-07-09', status: 'Pending' },
        { id: 3, userId: 1, title: 'Design Review', description: 'Review CSS styling layout', bookingDate: '2026-07-10', status: 'Cancelled' },
      ];
      setBookings(mockBookings);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBookings();
  }, []);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title || !bookingDate) {
      setError('Title and Date are required');
      return;
    }
    setError('');

    try {
      const newBooking = await bookingService.createBooking({ title, description, bookingDate, status: 'Pending' });
      setBookings([...bookings, newBooking]);
      setTitle('');
      setDescription('');
      setBookingDate('');
    } catch (err) {
      console.error(err);
      // Fallback update
      const mockNew: Booking = {
        id: Date.now(),
        userId: 1,
        title,
        description,
        bookingDate,
        status: 'Pending',
      };
      setBookings([...bookings, mockNew]);
      setTitle('');
      setDescription('');
      setBookingDate('');
    }
  };

  const handleDelete = async (id: number) => {
    try {
      await bookingService.deleteBooking(id);
      setBookings(bookings.filter((b) => b.id !== id));
    } catch (err) {
      console.error(err);
      setBookings(bookings.filter((b) => b.id !== id));
    }
  };

  return (
    <div>
      <h1 style={{ fontSize: '2rem', margin: '0 0 8px 0', color: 'var(--primary-text)', fontFamily: 'var(--font-title)' }}>
        Lịch đặt chỗ
      </h1>
      <p style={{ color: 'var(--secondary-text)', margin: '0 0 30px 0', fontSize: '0.95rem' }}>
        Quản lý lịch làm việc và đặt chỗ của bạn tại Cozy Space.
      </p>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 340px', gap: '30px', alignItems: 'start' }}>
        {/* Bookings List */}
        <div style={{
          backgroundColor: 'var(--surface-color)',
          borderRadius: '16px',
          border: '1px solid var(--border-color)',
          padding: '30px 24px',
          boxShadow: 'var(--shadow)'
        }}>
          <h2 style={{ fontSize: '1.4rem', margin: '0 0 20px 0', color: 'var(--primary-text)', fontFamily: 'var(--font-title)' }}>
            Danh sách đặt chỗ sắp tới
          </h2>

          {loading ? (
            <p style={{ color: 'var(--secondary-text)' }}>Đang tải danh sách đặt chỗ...</p>
          ) : bookings.length === 0 ? (
            <p style={{ color: 'var(--secondary-text)' }}>Chưa có lịch đặt chỗ nào.</p>
          ) : (
            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', color: 'var(--primary-text)' }}>
              <thead>
                <tr style={{ borderBottom: '2px solid var(--border-color)', color: 'var(--secondary-text)', fontSize: '0.9rem', fontWeight: 'bold' }}>
                  <th style={{ padding: '12px 8px' }}>Tiêu đề</th>
                  <th style={{ padding: '12px 8px' }}>Mô tả</th>
                  <th style={{ padding: '12px 8px' }}>Ngày đặt</th>
                  <th style={{ padding: '12px 8px' }}>Trạng thái</th>
                  <th style={{ padding: '12px 8px', textAlign: 'right' }}>Thao tác</th>
                </tr>
              </thead>
              <tbody>
                {bookings.map((b) => (
                  <tr key={b.id} style={{ borderBottom: '1px solid var(--border-color)', fontSize: '0.9rem' }}>
                    <td style={{ padding: '14px 8px', fontWeight: '600', color: 'var(--primary-text)' }}>{b.title}</td>
                    <td style={{ padding: '14px 8px', color: 'var(--secondary-text)' }}>{b.description}</td>
                    <td style={{ padding: '14px 8px' }}>{b.bookingDate}</td>
                    <td style={{ padding: '14px 8px' }}>
                      <span style={{
                        padding: '4px 10px',
                        borderRadius: '20px',
                        fontSize: '0.75rem',
                        fontWeight: '600',
                        backgroundColor: 
                          b.status === 'Confirmed' ? 'rgba(122, 134, 106, 0.15)' :
                          b.status === 'Cancelled' ? 'rgba(224, 122, 95, 0.15)' : 'rgba(212, 163, 115, 0.15)',
                        color: 
                          b.status === 'Confirmed' ? 'var(--nature-accent)' :
                          b.status === 'Cancelled' ? '#e07a5f' : 'var(--accent-color)',
                      }}>
                        {b.status === 'Confirmed' ? 'Đã xác nhận' :
                         b.status === 'Cancelled' ? 'Đã hủy' : 'Chờ duyệt'}
                      </span>
                    </td>
                    <td style={{ padding: '14px 8px', textAlign: 'right' }}>
                      <button 
                        onClick={() => handleDelete(b.id)}
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
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>

        {/* Create Booking Form */}
        <div style={{
          backgroundColor: 'var(--surface-color)',
          borderRadius: '16px',
          border: '1px solid var(--border-color)',
          padding: '30px 24px',
          boxShadow: 'var(--shadow)'
        }}>
          <h2 style={{ fontSize: '1.4rem', margin: '0 0 20px 0', color: 'var(--primary-text)', fontFamily: 'var(--font-title)' }}>
            Thêm lịch đặt mới
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
                placeholder="Ví dụ: Họp nhóm dự án"
                className="input-field"
              />
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
              <label style={{ fontSize: '0.85rem', fontWeight: '600', color: 'var(--secondary-text)' }}>Mô tả</label>
              <textarea 
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Chi tiết lịch đặt..."
                className="input-field"
                style={{
                  resize: 'vertical',
                  minHeight: '80px'
                }}
              />
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
              <label style={{ fontSize: '0.85rem', fontWeight: '600', color: 'var(--secondary-text)' }}>Ngày đặt</label>
              <input 
                type="date"
                value={bookingDate}
                onChange={(e) => setBookingDate(e.target.value)}
                className="input-field"
              />
            </div>

            <Button type="submit" style={{ marginTop: '10px' }}>Tạo lịch đặt</Button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default Bookings;
