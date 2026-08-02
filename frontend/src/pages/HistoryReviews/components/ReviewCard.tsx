import React, { useState } from 'react';

interface ReviewCardProps {
  booking: any;
  spaceAsset: any;
  isAdminOrStaff: boolean;
  onViewInvoice: (bookingId: number) => void;
}

export const ReviewCard: React.FC<ReviewCardProps> = ({
  booking,
  spaceAsset,
  isAdminOrStaff,
  onViewInvoice
}) => {
  const [replyText, setReplyText] = useState('');
  const [showReplyForm, setShowReplyForm] = useState(false);
  const [submittedReply, setSubmittedReply] = useState<string | null>(null);

  const renderStars = (rating: number) => {
    return (
      <div style={{ display: 'flex', gap: '2px', color: '#ffb703', fontSize: '1.1rem' }}>
        {'★'.repeat(rating)}
        {'☆'.repeat(5 - rating)}
      </div>
    );
  };

  const handleReplySubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (replyText.trim()) {
      setSubmittedReply(replyText.trim());
      setReplyText('');
      setShowReplyForm(false);
      alert('Đã gửi phản hồi đánh giá thành công!');
    }
  };

  return (
    <div
      style={{
        backgroundColor: 'var(--surface-color)',
        padding: '18px',
        borderRadius: '14px',
        border: '1px solid var(--border-color)',
        display: 'flex',
        flexDirection: 'column',
        gap: '12px',
        transition: 'var(--transition)',
        boxShadow: 'var(--shadow)',
      }}
    >
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <div>
          <span className="badge" style={{ 
            fontSize: '0.7rem', 
            backgroundColor: 'rgba(107,191,126,0.15)', 
            color: '#6bbf7e',
            padding: '4px 8px',
            borderRadius: '10px',
            fontWeight: 'bold',
            textTransform: 'uppercase'
          }}>
            Đã hoàn thành
          </span>
          <h4 style={{ margin: '8px 0 4px 0', color: 'var(--primary-text)', fontSize: '1.05rem', fontWeight: 'bold' }}>
            🏢 {spaceAsset?.assetName || `Phòng #${booking.assetId}`}
          </h4>
          <p style={{ margin: 0, fontSize: '0.8rem', color: 'var(--secondary-text)' }}>
            Mã: <span style={{ color: 'var(--accent-color)', fontWeight: 'bold' }}>{booking.bookingCode}</span> | {new Date(booking.startTime).toLocaleDateString('vi-VN')}
          </p>
        </div>
        <button
          onClick={() => onViewInvoice(booking.id)}
          className="btn btn-secondary"
          style={{ padding: '6px 12px', fontSize: '0.75rem', borderRadius: '6px' }}
        >
          📄 Hóa đơn
        </button>
      </div>

      <div style={{ borderTop: '1px solid var(--border-color)', paddingTop: '10px' }}>
        {booking.rating && booking.rating > 0 ? (
          <div style={{ backgroundColor: 'rgba(0,0,0,0.06)', padding: '12px', borderRadius: '8px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
              <span style={{ fontWeight: '600', fontSize: '0.85rem', color: 'var(--primary-text)' }}>Đánh giá của khách:</span>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                {renderStars(booking.rating)}
                <span style={{ fontWeight: 'bold', fontSize: '0.85rem', color: 'var(--primary-text)' }}>({booking.rating}/5)</span>
              </div>
            </div>
            {booking.reviewComment && (
              <p style={{ color: 'var(--secondary-text)', fontSize: '0.85rem', fontStyle: 'italic', margin: 0 }}>
                &ldquo;{booking.reviewComment}&rdquo;
              </p>
            )}

            {/* Render any submitted replies */}
            {submittedReply && (
              <div style={{ marginTop: '10px', padding: '8px 10px', backgroundColor: 'rgba(212,163,115,0.1)', borderRadius: '6px', borderLeft: '3px solid var(--accent-color)' }}>
                <span style={{ fontSize: '0.75rem', fontWeight: 'bold', color: 'var(--primary-text)', display: 'block' }}>
                  💬 Phản hồi của CozySpace:
                </span>
                <span style={{ fontSize: '0.8rem', color: 'var(--secondary-text)' }}>{submittedReply}</span>
              </div>
            )}

            {isAdminOrStaff && !submittedReply && (
              <div style={{ marginTop: '10px' }}>
                {!showReplyForm ? (
                  <button
                    onClick={() => setShowReplyForm(true)}
                    className="btn btn-primary"
                    style={{ padding: '4px 8px', fontSize: '0.7rem', borderRadius: '4px', backgroundColor: 'var(--nature-accent)', border: 'none', color: 'white', cursor: 'pointer' }}
                  >
                    Reply Trả lời
                  </button>
                ) : (
                  <form onSubmit={handleReplySubmit} style={{ display: 'flex', flexDirection: 'column', gap: '6px', marginTop: '6px' }}>
                    <textarea
                      value={replyText}
                      onChange={(e) => setReplyText(e.target.value)}
                      placeholder="Nhập nội dung phản hồi cho khách..."
                      style={{
                        width: '100%',
                        backgroundColor: 'rgba(255,255,255,0.15)',
                        border: '1px solid var(--border-color)',
                        borderRadius: '6px',
                        padding: '6px',
                        fontSize: '0.8rem',
                        color: 'var(--primary-text)',
                        resize: 'vertical'
                      }}
                      rows={2}
                      required
                    />
                    <div style={{ display: 'flex', gap: '6px' }}>
                      <button
                        type="submit"
                        className="btn btn-primary"
                        style={{ padding: '4px 8px', fontSize: '0.7rem', borderRadius: '4px', backgroundColor: 'var(--accent-color)', border: 'none', color: 'white', cursor: 'pointer' }}
                      >
                        Gửi
                      </button>
                      <button
                        type="button"
                        onClick={() => setShowReplyForm(false)}
                        className="btn btn-secondary"
                        style={{ padding: '4px 8px', fontSize: '0.7rem', borderRadius: '4px' }}
                      >
                        Hủy
                      </button>
                    </div>
                  </form>
                )}
              </div>
            )}
          </div>
        ) : (
          <div style={{ color: 'var(--secondary-text)', fontSize: '0.8rem', fontStyle: 'italic' }}>
            Chưa có đánh giá cho dịch vụ này.
          </div>
        )}
      </div>
    </div>
  );
};
