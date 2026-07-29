import React from 'react';

interface ServiceRequest {
  id: number;
  bookingId?: number;
  userId: number;
  requestType: 'SERVICE' | 'INCIDENT';
  roomName: string;
  title: string;
  detail?: string;
  requestStatus: 'Pending' | 'In_Progress' | 'Resolved';
  createdAt: string;
  userFullName?: string;
}

interface StaffServiceRequestsPanelProps {
  requests: ServiceRequest[];
  onUpdateRequestStatus: (id: number, nextStatus: string) => void;
}

export const StaffServiceRequestsPanel: React.FC<StaffServiceRequestsPanelProps> = ({
  requests,
  onUpdateRequestStatus,
}) => {
  // Sort requests: Pending first, then In_Progress, then Resolved. Within each, newest first.
  const sortedRequests = [...requests].sort((a, b) => {
    const statusOrder = { Pending: 0, In_Progress: 1, Resolved: 2 };
    if (statusOrder[a.requestStatus] !== statusOrder[b.requestStatus]) {
      return statusOrder[a.requestStatus] - statusOrder[b.requestStatus];
    }
    return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
  });

  const getStatusBadgeClass = (status: string) => {
    switch (status) {
      case 'Pending':
        return 'bg-amber-100 text-amber-800 border-amber-200';
      case 'In_Progress':
        return 'bg-sky-100 text-sky-800 border-sky-200';
      default:
        return 'bg-emerald-100 text-emerald-850 border-emerald-200';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'Pending':
        return 'Chờ xử lý';
      case 'In_Progress':
        return 'Đang xử lý';
      default:
        return 'Đã hoàn thành';
    }
  };

  return (
    <div className="bg-[var(--surface-color)] p-6 rounded-2xl border border-[var(--border-color)] shadow-md">
      <h3 className="text-xl font-serif text-[var(--primary-text)] mb-4 flex items-center gap-2 m-0">
        🛎️ Yêu cầu hỗ trợ & Dịch vụ ({requests.filter(r => r.requestStatus !== 'Resolved').length} yêu cầu chờ)
      </h3>

      {sortedRequests.length === 0 ? (
        <p className="text-[var(--secondary-text)] text-sm m-0">Chưa có yêu cầu hỗ trợ nào trên hệ thống.</p>
      ) : (
        <div className="space-y-4 max-h-[450px] overflow-y-auto pr-2 mt-4">
          {sortedRequests.map((req) => (
            <div
              key={req.id}
              className={`p-4 rounded-xl border transition-all ${
                req.requestStatus === 'Resolved'
                  ? 'bg-[var(--background-color)] border-[var(--border-color)] opacity-70'
                  : 'bg-[var(--background-color)] border-[var(--border-color)] hover:border-[var(--accent-color)] shadow-sm'
              }`}
            >
              <div className="flex justify-between items-start flex-wrap gap-2">
                <div>
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className={`text-[0.7rem] uppercase font-bold px-2 py-0.5 rounded border ${
                      req.requestType === 'SERVICE' ? 'bg-indigo-100 text-indigo-800 border-indigo-200' : 'bg-red-100 text-red-800 border-red-200'
                    }`}>
                      {req.requestType === 'SERVICE' ? '🛎️ Dịch vụ' : '⚠️ Sự cố'}
                    </span>
                    <span className={`text-[0.7rem] px-2 py-0.5 rounded border font-semibold ${getStatusBadgeClass(req.requestStatus)}`}>
                      {getStatusText(req.requestStatus)}
                    </span>
                    <span className="text-[var(--secondary-text)] text-xs font-semibold">
                      Phòng: <strong className="text-[var(--primary-text)]">{req.roomName}</strong>
                    </span>
                  </div>
                  <h4 className="text-sm font-bold text-[var(--primary-text)] mt-2 mb-1">{req.title}</h4>
                  {req.detail && <p className="text-xs text-[var(--secondary-text)] mt-1 mb-0">{req.detail}</p>}
                  <p className="text-[0.7rem] text-stone-500 mt-2 mb-0">
                    Gửi bởi: <strong className="text-[var(--primary-text)]">{req.userFullName || `User ID: ${req.userId}`}</strong> &bull; {new Date(req.createdAt).toLocaleString()}
                  </p>
                </div>

                <div className="flex gap-2">
                  {req.requestStatus === 'Pending' && (
                    <>
                      <button
                        onClick={() => onUpdateRequestStatus(req.id, 'In_Progress')}
                        className="px-3 py-1 bg-sky-50 border border-sky-200 text-sky-700 rounded-lg text-xs font-bold hover:bg-sky-100 transition-colors cursor-pointer"
                      >
                        Tiếp nhận
                      </button>
                      <button
                        onClick={() => onUpdateRequestStatus(req.id, 'Resolved')}
                        className="px-3 py-1 bg-emerald-50 border border-emerald-200 text-emerald-700 rounded-lg text-xs font-bold hover:bg-emerald-100 transition-colors cursor-pointer"
                      >
                        Giải quyết
                      </button>
                    </>
                  )}
                  {req.requestStatus === 'In_Progress' && (
                    <button
                      onClick={() => onUpdateRequestStatus(req.id, 'Resolved')}
                      className="px-3 py-1 bg-emerald-50 border border-emerald-200 text-emerald-700 rounded-lg text-xs font-bold hover:bg-emerald-100 transition-colors cursor-pointer"
                    >
                      Hoàn thành
                    </button>
                  )}
                  {req.requestStatus === 'Resolved' && (
                    <span className="text-emerald-700 text-xs font-bold flex items-center gap-1">
                      ✅ Đã xử lý
                    </span>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
