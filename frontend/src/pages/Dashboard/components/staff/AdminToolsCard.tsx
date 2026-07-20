import React from 'react';
import { Link } from 'react-router-dom';

interface AdminToolsCardProps {
  userRole: string;
}

export const AdminToolsCard: React.FC<AdminToolsCardProps> = ({ userRole }) => {
  if (userRole !== 'ADMIN') return null;

  return (
    <div className="bg-amber-950/20 p-6 rounded-xl border border-amber-800/40 shadow-md mt-6">
      <h3 className="text-xl font-serif text-amber-400 mb-2 flex items-center gap-2">
        <i className="fa-solid fa-user-shield text-amber-500"></i> Quản trị viên (Admin Panel)
      </h3>
      <p className="text-stone-300 text-xs leading-relaxed mb-4">
        Khu vực dành riêng cho Quản trị viên để quản lý toàn bộ hệ thống. Background service
        tự động hủy lịch chưa thanh toán sau 10 phút đang hoạt động.
      </p>
      <div className="flex flex-wrap gap-3">
        <Link
          to="/space-assets"
          className="inline-flex items-center gap-2 bg-amber-600 hover:bg-amber-500 text-white px-4 py-2 rounded-lg text-xs font-bold transition shadow-md"
        >
          <i className="fa-solid fa-building"></i> Quản lý Tài sản (Space Assets)
        </Link>
        <button
          onClick={() => alert('Chức năng Báo cáo doanh thu đang được kết nối dữ liệu.')}
          className="inline-flex items-center gap-2 bg-stone-800 hover:bg-stone-700 text-stone-200 border border-stone-700 px-4 py-2 rounded-lg text-xs font-bold transition cursor-pointer"
        >
          <i className="fa-solid fa-chart-line"></i> Báo cáo Doanh thu
        </button>
      </div>
    </div>
  );
};

export default AdminToolsCard;
