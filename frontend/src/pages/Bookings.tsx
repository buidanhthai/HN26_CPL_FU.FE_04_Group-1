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
      <h1 style={{ fontSize: '1.8rem', margin: '0 0 10px 0', color: '#00e1d9' }}>Bookings</h1>
      <p style={{ color: '#a2a5b9', margin: '0 0 24px 0' }}>Manage calendar and appointments bookings.</p>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 320px', gap: '24px', alignItems: 'start' }}>
        {/* Bookings List */}
        <div style={{
          backgroundColor: '#151521',
          borderRadius: '8px',
          border: '1px solid #2d2d3f',
          padding: '24px',
          boxShadow: '0 4px 6px rgba(0,0,0,0.15)'
        }}>
          <h2 style={{ fontSize: '1.2rem', margin: '0 0 16px 0', color: '#fff' }}>Upcoming Appointments</h2>

          {loading ? (
            <p style={{ color: '#a2a5b9' }}>Loading bookings...</p>
          ) : bookings.length === 0 ? (
            <p style={{ color: '#a2a5b9' }}>No bookings found.</p>
          ) : (
            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', color: '#d1d2db' }}>
              <thead>
                <tr style={{ borderBottom: '2px solid #2d2d3f', color: '#a2a5b9', fontSize: '0.85rem' }}>
                  <th style={{ padding: '12px 8px' }}>Title</th>
                  <th style={{ padding: '12px 8px' }}>Description</th>
                  <th style={{ padding: '12px 8px' }}>Date</th>
                  <th style={{ padding: '12px 8px' }}>Status</th>
                  <th style={{ padding: '12px 8px', textAlign: 'right' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {bookings.map((b) => (
                  <tr key={b.id} style={{ borderBottom: '1px solid #2d2d3f', fontSize: '0.9rem' }}>
                    <td style={{ padding: '12px 8px', fontWeight: '500' }}>{b.title}</td>
                    <td style={{ padding: '12px 8px', color: '#a2a5b9' }}>{b.description}</td>
                    <td style={{ padding: '12px 8px' }}>{b.bookingDate}</td>
                    <td style={{ padding: '12px 8px' }}>
                      <span style={{
                        padding: '3px 8px',
                        borderRadius: '12px',
                        fontSize: '0.75rem',
                        backgroundColor: 
                          b.status === 'Confirmed' ? 'rgba(0, 225, 217, 0.15)' :
                          b.status === 'Cancelled' ? 'rgba(255, 92, 117, 0.15)' : 'rgba(255, 193, 7, 0.15)',
                        color: 
                          b.status === 'Confirmed' ? '#00e1d9' :
                          b.status === 'Cancelled' ? '#ff5c75' : '#ffc107',
                      }}>
                        {b.status}
                      </span>
                    </td>
                    <td style={{ padding: '12px 8px', textAlign: 'right' }}>
                      <button 
                        onClick={() => handleDelete(b.id)}
                        style={{
                          backgroundColor: 'transparent',
                          color: '#ff5c75',
                          border: 'none',
                          cursor: 'pointer',
                          fontSize: '0.85rem',
                          fontWeight: 'bold'
                        }}
                      >
                        Delete
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
          backgroundColor: '#151521',
          borderRadius: '8px',
          border: '1px solid #2d2d3f',
          padding: '24px',
          boxShadow: '0 4px 6px rgba(0,0,0,0.15)'
        }}>
          <h2 style={{ fontSize: '1.2rem', margin: '0 0 16px 0', color: '#00e1d9' }}>Add Appointment</h2>

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
                placeholder="e.g. Daily Standup"
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
                placeholder="Details..."
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
              <label style={{ fontSize: '0.85rem', color: '#a2a5b9' }}>Date</label>
              <input 
                type="date"
                value={bookingDate}
                onChange={(e) => setBookingDate(e.target.value)}
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

            <Button type="submit" style={{ marginTop: '10px' }}>Create Appointment</Button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default Bookings;
