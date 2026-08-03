import React from 'react';

interface BookingToolbarProps {
  statusFilter: string;
  onStatusChange: (status: string) => void;
  startDateFilter: string;
  onStartDateChange: (date: string) => void;
  endDateFilter: string;
  onEndDateChange: (date: string) => void;
  searchTerm: string;
  onSearchChange: (term: string) => void;
  onCreateClick: () => void;
  onRefresh: () => void;
}

export const BookingToolbar: React.FC<BookingToolbarProps> = ({
  statusFilter,
  onStatusChange,
  startDateFilter,
  onStartDateChange,
  endDateFilter,
  onEndDateChange,
  searchTerm,
  onSearchChange,
  onCreateClick,
  onRefresh,
}) => {
  return (
    <div style={{
      backgroundColor: 'var(--surface-color)',
      padding: '16px 20px',
      borderRadius: '12px',
      border: '1px solid var(--border-color)',
      display: 'flex',
      flexWrap: 'wrap',
      gap: '15px',
      alignItems: 'center',
      justifyContent: 'space-between',
      marginBottom: '20px',
      boxShadow: 'var(--shadow)'
    }}>
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '15px', alignItems: 'center', flex: 1 }}>
        {/* Status Filter */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
          <label style={{ fontSize: '0.75rem', fontWeight: 'bold', color: 'var(--secondary-text)' }}>Trạng thái</label>
          <select
            value={statusFilter}
            onChange={(e) => onStatusChange(e.target.value)}
            style={{
              padding: '8px 12px',
              borderRadius: '8px',
              border: '1px solid var(--border-color)',
              backgroundColor: 'var(--background-color)',
              color: 'var(--primary-text)',
              fontSize: '0.85rem',
              fontWeight: '500',
              outline: 'none'
            }}
          >
            <option value="ALL">Tất cả</option>
            <option value="Checked_In">Đang hoạt động</option>
            <option value="Confirmed">Đã xác nhận</option>
            <option value="Awaiting_Payment">Chờ thanh toán</option>
            <option value="Checked_Out">Đã hoàn thành</option>
            <option value="Cancelled">Đã hủy</option>
          </select>
        </div>

        {/* Search filter */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '4px', minWidth: '220px' }}>
          <label style={{ fontSize: '0.75rem', fontWeight: 'bold', color: 'var(--secondary-text)' }}>Tìm kiếm</label>
          <input
            type="text"
            placeholder="Tên phòng hoặc mã đơn (BK-...)"
            value={searchTerm}
            onChange={(e) => onSearchChange(e.target.value)}
            style={{
              padding: '8px 12px',
              borderRadius: '8px',
              border: '1px solid var(--border-color)',
              backgroundColor: 'var(--background-color)',
              color: 'var(--primary-text)',
              fontSize: '0.85rem',
              outline: 'none'
            }}
          />
        </div>

        {/* Date filters */}
        <div style={{ display: 'flex', gap: '10px' }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
            <label style={{ fontSize: '0.75rem', fontWeight: 'bold', color: 'var(--secondary-text)' }}>Từ ngày</label>
            <input
              type="date"
              value={startDateFilter}
              onChange={(e) => onStartDateChange(e.target.value)}
              style={{
                padding: '8px 12px',
                borderRadius: '8px',
                border: '1px solid var(--border-color)',
                backgroundColor: 'var(--background-color)',
                color: 'var(--primary-text)',
                fontSize: '0.85rem',
                outline: 'none'
              }}
            />
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
            <label style={{ fontSize: '0.75rem', fontWeight: 'bold', color: 'var(--secondary-text)' }}>Đến ngày</label>
            <input
              type="date"
              value={endDateFilter}
              onChange={(e) => onEndDateChange(e.target.value)}
              style={{
                padding: '8px 12px',
                borderRadius: '8px',
                border: '1px solid var(--border-color)',
                backgroundColor: 'var(--background-color)',
                color: 'var(--primary-text)',
                fontSize: '0.85rem',
                outline: 'none'
              }}
            />
          </div>
        </div>
      </div>

      <div style={{ display: 'flex', gap: '10px' }}>
        <button
          onClick={onRefresh}
          className="btn btn-secondary hover-lift"
          style={{
            padding: '10px 18px',
            borderRadius: '8px',
            fontWeight: 'bold',
            fontSize: '0.85rem',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: '6px'
          }}
        >
          🔄 Làm mới
        </button>
        <button
          onClick={onCreateClick}
          className="btn btn-primary hover-lift"
          style={{
            padding: '10px 18px',
            borderRadius: '8px',
            fontWeight: 'bold',
            fontSize: '0.85rem',
            backgroundColor: 'var(--accent-color)',
            color: 'white',
            border: 'none',
            cursor: 'pointer'
          }}
        >
          ➕ Tạo đơn đặt mới
        </button>
      </div>
    </div>
  );
};
export default BookingToolbar;
