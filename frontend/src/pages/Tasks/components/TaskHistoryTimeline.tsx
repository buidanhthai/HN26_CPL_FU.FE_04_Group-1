import React from 'react';
import type { TaskLog } from '../../../types/task.types';
import { formatToVNTime } from '../../../utils/dateFormatter';

interface TaskHistoryTimelineProps {
  logs?: TaskLog[];
}

export const TaskHistoryTimeline: React.FC<TaskHistoryTimelineProps> = ({ logs = [] }) => {
  if (logs.length === 0) {
    return (
      <div style={{
        fontSize: '0.8rem',
        color: 'var(--secondary-text, #6b7280)',
        padding: '8px 12px',
        fontStyle: 'italic',
        backgroundColor: 'rgba(0, 0, 0, 0.02)',
        borderRadius: '6px',
        border: '1px dashed var(--border-color, #e5e7eb)',
        marginTop: '8px'
      }}>
        Chưa ghi nhận lịch sử thao tác nào.
      </div>
    );
  }

  return (
    <div style={{
      marginTop: '10px',
      padding: '10px 12px',
      backgroundColor: 'rgba(0, 0, 0, 0.02)',
      borderRadius: '6px',
      border: '1px solid var(--border-color, #e5e7eb)',
      maxHeight: '150px',
      overflowY: 'auto'
    }}>
      <div style={{
        fontSize: '0.8rem',
        fontWeight: 'bold',
        color: 'var(--accent-color, #1e3a8a)',
        marginBottom: '8px',
        display: 'flex',
        alignItems: 'center',
        gap: '4px'
      }}>
        <span>📋 Lịch sử thao tác ({logs.length})</span>
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', position: 'relative', paddingLeft: '10px' }}>
        <div style={{
          position: 'absolute',
          left: '2px',
          top: '4px',
          bottom: '4px',
          width: '2px',
          backgroundColor: 'var(--border-color, #cbd5e1)'
        }} />
        {logs.map((log) => (
          <div key={log.id} style={{ position: 'relative', display: 'flex', flexDirection: 'column', gap: '2px' }}>
            <div style={{
              position: 'absolute',
              left: '-11px',
              top: '4px',
              width: '6px',
              height: '6px',
              borderRadius: '50%',
              backgroundColor: 'var(--accent-color, #3b82f6)',
              border: '1px solid #fff'
            }} />
            <div style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'flex-start',
              gap: '10px',
              fontSize: '0.75rem'
            }}>
              <span style={{ fontWeight: '600', color: 'var(--primary-text, #1f2937)' }}>
                {log.userFullName}
              </span>
              <span style={{ color: 'var(--secondary-text, #6b7280)', fontSize: '0.7rem', whiteSpace: 'nowrap' }}>
                {formatToVNTime(log.timestamp)}
              </span>
            </div>
            <div style={{ fontSize: '0.75rem', color: 'var(--secondary-text, #4b5563)' }}>
              {log.actionDescription}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
