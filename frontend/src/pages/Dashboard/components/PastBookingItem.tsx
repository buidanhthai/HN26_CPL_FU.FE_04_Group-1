import React, { useState } from 'react';
import type { Booking } from '../../../types/booking.types';
import { bookingService } from '../../../services/bookingService';

interface PastBookingItemProps {
  booking: Booking;
  spaceAsset: any;
  onReviewSubmitted: () => void;
}

export const PastBookingItem: React.FC<PastBookingItemProps> = ({
  booking,
  spaceAsset,
  onReviewSubmitted,
}) => {
  const [rating, setRating] = useState<number>(5);
  const [comment, setComment] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  const handleSubmitReview = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');
    setSubmitting(true);

    try {
      await bookingService.submitReview(booking.id, rating, comment);
      onReviewSubmitted();
      setShowForm(false);
    } catch (err: any) {
      setErrorMsg(err.response?.data?.message || 'Có lỗi xảy ra khi gửi đánh giá.');
    } finally {
      setSubmitting(false);
    }
  };

  const renderStars = (count: number) => {
    return '⭐'.repeat(count);
  };

  return (
    <div
      style={{
        backgroundColor: 'var(--surface-color)',
        padding: '16px',
        borderRadius: '12px',
        border: '1px solid var(--border-color)',
        display: 'flex',
        flexDirection: 'column',
        gap: '12px',
      }}
    >
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start' }}>
        <div>
          <span className="badge badge-completed" style={{ textTransform: 'uppercase', fontSize: '0.65rem', backgroundColor: 'rgba(107,191,126,0.1)', color: '#6bbf7e' }}>
            Đã hoàn thành
          </span>
          <h4 style={{ margin: '8px 0 4px 0', color: 'var(--primary-text)', fontSize: '1rem', fontWeight: 'bold' }}>
            🏢 {spaceAsset?.assetName || `Phòng #${booking.assetId}`}
          </h4>
          <p style={{ margin: 0, fontSize: '0.8rem', color: 'var(--secondary-text)' }}>
            Mã đơn: <span style={{ color: 'var(--accent-color)' }}>{booking.bookingCode}</span> | {new Date(booking.startTime).toLocaleDateString()}
          </p>
        </div>
        <span style={{ fontSize: '0.75rem', color: 'var(--secondary-text)' }}>#{booking.id}</span>
      </div>

      <div style={{ fontSize: '0.8rem', color: 'var(--primary-text)', borderTop: '1px solid var(--border-color)', paddingTop: '10px' }}>
        {booking.rating && booking.rating > 0 ? (
          <div style={{ backgroundColor: 'rgba(0,0,0,0.1)', padding: '10px', borderRadius: '8px' }}>
            <div style={{ fontWeight: 'bold', color: '#ffb703', marginBottom: '4px' }}>
              Đánh giá của bạn: {renderStars(booking.rating)} ({booking.rating}/5)
            </div>
            {booking.reviewComment && (
              <div style={{ color: 'var(--secondary-text)', fontStyle: 'italic' }}>
                &ldquo;{booking.reviewComment}&rdquo;
              </div>
            )}
          </div>
        ) : (
          <div>
            {!showForm ? (
              <button
                onClick={() => setShowForm(true)}
                className="btn btn-secondary"
                style={{ padding: '6px 12px', fontSize: '0.75rem', borderRadius: '6px' }}
              >
                ⭐ Đánh giá dịch vụ
              </button>
            ) : (
              <form onSubmit={handleSubmitReview} style={{ display: 'flex', flexDirection: 'column', gap: '10px', marginTop: '8px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <span style={{ fontSize: '0.8rem', fontWeight: '600' }}>Số sao:</span>
                  <div style={{ display: 'flex', gap: '4px' }}>
                    {[1, 2, 3, 4, 5].map((star) => (
                      <span
                        key={star}
                        onClick={() => setRating(star)}
                        style={{
                          fontSize: '1.25rem',
                          cursor: 'pointer',
                          opacity: star <= rating ? 1 : 0.3,
                          transition: 'opacity 0.2s',
                        }}
                      >
                        ★
                      </span>
                    ))}
                  </div>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                  <span style={{ fontSize: '0.8rem', fontWeight: '600' }}>Nhận xét:</span>
                  <textarea
                    value={comment}
                    onChange={(e) => setComment(e.target.value)}
                    placeholder="Chia sẻ trải nghiệm sử dụng không gian..."
                    style={{
                      width: '100%',
                      backgroundColor: 'rgba(0,0,0,0.2)',
                      border: '1px solid var(--border-color)',
                      borderRadius: '6px',
                      padding: '8px',
                      color: 'white',
                      fontSize: '0.8rem',
                      fontFamily: 'inherit',
                      resize: 'vertical',
                    }}
                    rows={2}
                  />
                </div>

                {errorMsg && <div style={{ color: '#e07a5f', fontSize: '0.75rem' }}>{errorMsg}</div>}

                <div style={{ display: 'flex', gap: '8px' }}>
                  <button
                    type="submit"
                    disabled={submitting}
                    className="btn btn-primary"
                    style={{ padding: '6px 12px', fontSize: '0.75rem', borderRadius: '6px' }}
                  >
                    {submitting ? 'Đang gửi...' : 'Gửi đánh giá'}
                  </button>
                  <button
                    type="button"
                    onClick={() => setShowForm(false)}
                    className="btn btn-secondary"
                    style={{ padding: '6px 12px', fontSize: '0.75rem', borderRadius: '6px' }}
                  >
                    Hủy
                  </button>
                </div>
              </form>
            )}
          </div>
        )}
      </div>
    </div>
  );
};
