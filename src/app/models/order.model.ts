// Order Status Enum
export enum OrderStatus {
  PENDING = 'pending',
  APPROVED = 'approved',
  REJECTED = 'rejected'
}

// User Interface
export interface User {
  id: string;
  name: string;
  email: string;
  role: 'instructor' | 'student' | 'admin';
}

// Uploaded File Interface
export interface UploadedFile {
  id: string;
  name: string;
  size: number;
  type: string;
  url: string;
  uploadedAt: Date;
}

// Course Order Interface (for instructor course uploads)
export interface CourseOrder {
  id: string;
  user: User;
  orderDate: Date;
  status: OrderStatus;
  courseTitle: string;
  courseDescription: string;
  category: string;
  duration: number; // in hours
  price: number;
  uploadedFiles: UploadedFile[];
  submittedAt: Date;
  reviewedAt?: Date;
  reviewedBy?: string;
  adminNotes?: string;
}

// API Response Interfaces
export interface OrderListResponse {
  success: boolean;
  orders: CourseOrder[];
  total: number;
  page: number;
  limit: number;
}

export interface OrderDetailResponse {
  success: boolean;
  order: CourseOrder;
}

export interface OrderActionResponse {
  success: boolean;
  message: string;
  order?: CourseOrder;
}

// Admin Action Types
export type AdminAction = 'approve' | 'reject' | 'delete';

// Admin Action Request
export interface AdminActionRequest {
  orderId: string;
  action: AdminAction;
  adminNotes?: string;
}
