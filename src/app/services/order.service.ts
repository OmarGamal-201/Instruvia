import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable, of } from 'rxjs';
import { map, delay, tap } from 'rxjs/operators';
import {
  CourseOrder,
  OrderListResponse,
  OrderDetailResponse,
  OrderActionResponse,
  AdminActionRequest,
  OrderStatus,
  User,
  UploadedFile
} from '../models/order.model';

@Injectable({
  providedIn: 'root'
})
export class OrderService {
  private readonly apiUrl = 'http://localhost:5000/api/admin/orders';
  
  constructor(private http: HttpClient) {}

  // Mock data for development - replace with real API calls
  private mockOrders: CourseOrder[] = [
    {
      id: 'ORD-001',
      user: {
        id: 'USR-001',
        name: 'John Smith',
        email: 'john.smith@example.com',
        role: 'instructor'
      },
      orderDate: new Date('2024-01-15'),
      status: OrderStatus.PENDING,
      courseTitle: 'Advanced JavaScript Programming',
      courseDescription: 'Complete guide to modern JavaScript including ES6+, async programming, and advanced patterns',
      category: 'Programming',
      duration: 40,
      price: 199.99,
      uploadedFiles: [
        {
          id: 'FILE-001',
          name: 'course-outline.pdf',
          size: 2048576,
          type: 'application/pdf',
          url: '/uploads/course-outline.pdf',
          uploadedAt: new Date('2024-01-15T10:30:00')
        },
        {
          id: 'FILE-002',
          name: 'intro-video.mp4',
          size: 52428800,
          type: 'video/mp4',
          url: '/uploads/intro-video.mp4',
          uploadedAt: new Date('2024-01-15T10:35:00')
        }
      ],
      submittedAt: new Date('2024-01-15T10:30:00')
    },
    {
      id: 'ORD-002',
      user: {
        id: 'USR-002',
        name: 'Sarah Johnson',
        email: 'sarah.j@example.com',
        role: 'instructor'
      },
      orderDate: new Date('2024-01-14'),
      status: OrderStatus.APPROVED,
      courseTitle: 'UI/UX Design Fundamentals',
      courseDescription: 'Learn the principles of user interface and user experience design',
      category: 'Design',
      duration: 25,
      price: 149.99,
      uploadedFiles: [
        {
          id: 'FILE-003',
          name: 'design-principles.pptx',
          size: 10485760,
          type: 'application/vnd.openxmlformats-officedocument.presentationml.presentation',
          url: '/uploads/design-principles.pptx',
          uploadedAt: new Date('2024-01-14T14:20:00')
        }
      ],
      submittedAt: new Date('2024-01-14T14:20:00'),
      reviewedAt: new Date('2024-01-14T16:45:00'),
      reviewedBy: 'Admin User',
      adminNotes: 'Great course content! Approved for publication.'
    },
    {
      id: 'ORD-003',
      user: {
        id: 'USR-003',
        name: 'Mike Wilson',
        email: 'mike.w@example.com',
        role: 'instructor'
      },
      orderDate: new Date('2024-01-13'),
      status: OrderStatus.REJECTED,
      courseTitle: 'Basic Python Tutorial',
      courseDescription: 'Introduction to Python programming for beginners',
      category: 'Programming',
      duration: 15,
      price: 79.99,
      uploadedFiles: [
        {
          id: 'FILE-004',
          name: 'python-basics.pdf',
          size: 3145728,
          type: 'application/pdf',
          url: '/uploads/python-basics.pdf',
          uploadedAt: new Date('2024-01-13T09:15:00')
        }
      ],
      submittedAt: new Date('2024-01-13T09:15:00'),
      reviewedAt: new Date('2024-01-13T11:30:00'),
      reviewedBy: 'Admin User',
      adminNotes: 'Content needs improvement. Please add more practical examples.'
    }
  ];

  /**
   * Get all orders with pagination
   */
  getOrders(page: number = 1, limit: number = 10): Observable<OrderListResponse> {
    // Mock API call - replace with real HTTP request
    return of({
      success: true,
      orders: this.mockOrders.slice((page - 1) * limit, page * limit),
      total: this.mockOrders.length,
      page,
      limit
    }).pipe(
      delay(500), // Simulate network delay
      tap(response => console.log('Orders fetched:', response))
    );

    // Real API call (uncomment when backend is ready):
    // return this.http.get<OrderListResponse>(`${this.apiUrl}?page=${page}&limit=${limit}`);
  }

  /**
   * Get order details by ID
   */
  getOrderById(orderId: string): Observable<OrderDetailResponse> {
    const order = this.mockOrders.find(o => o.id === orderId);
    
    if (!order) {
      return of({
        success: false,
        order: null as any
      }).pipe(
        delay(300)
      );
    }

    return of({
      success: true,
      order
    }).pipe(
      delay(300),
      tap(response => console.log('Order details fetched:', response))
    );

    // Real API call (uncomment when backend is ready):
    // return this.http.get<OrderDetailResponse>(`${this.apiUrl}/${orderId}`);
  }

  /**
   * Approve an order
   */
  approveOrder(orderId: string, adminNotes?: string): Observable<OrderActionResponse> {
    return this.performOrderAction(orderId, 'approve', adminNotes);
  }

  /**
   * Reject an order
   */
  rejectOrder(orderId: string, adminNotes?: string): Observable<OrderActionResponse> {
    return this.performOrderAction(orderId, 'reject', adminNotes);
  }

  /**
   * Delete an order
   */
  deleteOrder(orderId: string): Observable<OrderActionResponse> {
    return this.performOrderAction(orderId, 'delete');
  }

  /**
   * Perform admin action on order
   */
  private performOrderAction(orderId: string, action: 'approve' | 'reject' | 'delete', adminNotes?: string): Observable<OrderActionResponse> {
    // Mock API call
    const orderIndex = this.mockOrders.findIndex(o => o.id === orderId);
    
    if (orderIndex === -1) {
      return of({
        success: false,
        message: `Order ${orderId} not found`
      }).pipe(delay(300));
    }

    // Update local mock data
    const order = this.mockOrders[orderIndex];
    
    switch (action) {
      case 'approve':
        order.status = OrderStatus.APPROVED;
        order.reviewedAt = new Date();
        order.reviewedBy = 'Current Admin';
        order.adminNotes = adminNotes || 'Order approved by admin';
        break;
      case 'reject':
        order.status = OrderStatus.REJECTED;
        order.reviewedAt = new Date();
        order.reviewedBy = 'Current Admin';
        order.adminNotes = adminNotes || 'Order rejected by admin';
        break;
      case 'delete':
        this.mockOrders.splice(orderIndex, 1);
        return of({
          success: true,
          message: `Order ${orderId} deleted successfully`
        }).pipe(delay(500));
    }

    return of({
      success: true,
      message: `Order ${orderId} ${action}d successfully`,
      order
    }).pipe(
      delay(500),
      tap(response => console.log(`Order ${action} result:`, response))
    );

    // Real API call (uncomment when backend is ready):
    // const request: AdminActionRequest = { orderId, action, adminNotes };
    // return this.http.post<OrderActionResponse>(`${this.apiUrl}/${orderId}/${action}`, request);
  }

  /**
   * Get authentication headers
   */
  private getAuthHeaders(): HttpHeaders {
    const token = localStorage.getItem('auth_token');
    return new HttpHeaders({
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    });
  }

  /**
   * Format file size for display
   */
  formatFileSize(bytes: number): string {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  }

  /**
   * Format date for display
   */
  formatDate(date: Date): string {
    return new Date(date).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  }
}
