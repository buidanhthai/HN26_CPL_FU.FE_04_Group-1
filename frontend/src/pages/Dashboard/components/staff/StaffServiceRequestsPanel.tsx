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
        return 'bg-amber-950/20 text-amber-500 border-amber-800';
      case 'In_Progress':
        return 'bg-sky-950/20 text-sky-500 border-sky-800';
      default:
        return 'bg-emerald-950/20 text-emerald-500 border-emerald-800';
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
    <div className="bg-[#2b201c] p-6 rounded-2xl border border-[#3d2e29] shadow-lg">
      <h3 className="text-xl font-serif text-white mb-4 flex items-center gap-2">
        🛎️ Yêu cầu hỗ trợ & Dịch vụ ({requests.filter(r => r.requestStatus !== 'Resolved').length} yêu cầu chờ)
      </h3>

      {sortedRequests.length === 0 ? (
        <p className="text-stone-400 text-sm">Chưa có yêu cầu hỗ trợ nào trên hệ thống.</p>
      ) : (
        <div className="space-y-4 max-h-[450px] overflow-y-auto pr-2">
          {sortedRequests.map((req) => (
            <div
              key={req.id}
              className={`p-4 rounded-xl border transition-all ${
                req.requestStatus === 'Resolved'
                  ? 'bg-stone-900/40 border-stone-800/80 opacity-75'
                  : 'bg-stone-900/70 border-stone-800 hover:border-stone-700'
              }`}
            >
              <div className="flex justify-between items-start flex-wrap gap-2">
                <div>
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className={`text-[0.7rem] uppercase font-bold px-2 py-0.5 rounded border ${
                      req.requestType === 'SERVICE' ? 'bg-indigo-950/20 text-indigo-400 border-indigo-800' : 'bg-red-950/20 text-red-400 border-red-800'
                    }`}>
                      {req.requestType === 'SERVICE' ? '🛎️ Dịch vụ' : '⚠️ Sự cố'}
                    </span>
                    <span className={`text-[0.7rem] px-2 py-0.5 rounded border font-semibold ${getStatusBadgeClass(req.requestStatus)}`}>
                      {getStatusText(req.requestStatus)}
                    </span>
                    <span className="text-stone-400 text-xs font-semibold">
                      Phòng: <strong className="text-white">{req.roomName}</strong>
                    </span>
                  </div>
                  <h4 className="text-sm font-bold text-white mt-2">{req.title}</h4>
                  {req.detail && <p className="text-xs text-stone-400 mt-1">{req.detail}</p>}
                  <p className="text-[0.7rem] text-stone-500 mt-2">
                    Gửi bởi: <strong className="text-stone-400">{req.userFullName || `User ID: ${req.userId}`}</strong> &bull; {new Date(req.createdAt).toLocaleString()}
                  </p>
                </div>

                <div className="flex gap-2">
                  {req.requestStatus === 'Pending' && (
                    <>
                      <button
                        onClick={() => onUpdateRequestStatus(req.id, 'In_Progress')}
                        className="px-3 py-1 bg-sky-950 border border-sky-800 text-sky-400 rounded-lg text-xs font-bold hover:bg-sky-900 transition-colors"
                      >
                        Tiếp nhận
                      </button>
                      <button
                        onClick={() => onUpdateRequestStatus(req.id, 'Resolved')}
                        className="px-3 py-1 bg-emerald-950 border border-emerald-800 text-emerald-400 rounded-lg text-xs font-bold hover:bg-emerald-900 transition-colors"
                      >
                        Giải quyết
                      </button>
                    </>
                  )}
                  {req.requestStatus === 'In_Progress' && (
                    <button
                      onClick={() => onUpdateRequestStatus(req.id, 'Resolved')}
                      className="px-3 py-1 bg-emerald-950 border border-emerald-800 text-emerald-400 rounded-lg text-xs font-bold hover:bg-emerald-900 transition-colors"
                    >
                      Hoàn thành
                    </button>
                  )}
                  {req.requestStatus === 'Resolved' && (
                    <span className="text-emerald-500 text-xs font-bold flex items-center gap-1">
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
