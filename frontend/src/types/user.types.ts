export interface User {
  id: number;
  fullName: string; // Đồng bộ kiểu chữ thường/hoa
  email: string;
  role: 'ADMIN' | 'STAFF' | 'USER'; // Khớp cứng với dữ liệu DB
  phoneNumber?: string;
  token?: string;
}