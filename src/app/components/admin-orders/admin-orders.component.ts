import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { OrderService } from '../../services/order.service';
import { CourseOrder, OrderStatus } from '../../models/order.model';

@Component({
  selector: 'app-admin-orders',
  templateUrl: './admin-orders.component.html',
  styleUrls: ['./admin-orders.component.css']
})
export class AdminOrdersComponent implements OnInit {
  orders: CourseOrder[] = [];
  isLoading = false;
  currentPage = 1;
  pageSize = 10;
  totalOrders = 0;
  errorMessage = '';
  Math = Math; // Add Math property for template access

  // Status filter
  statusFilter: OrderStatus | 'all' = 'all';
  statusOptions = [
    { value: 'all', label: 'All Orders' },
    { value: OrderStatus.PENDING, label: 'Pending' },
    { value: OrderStatus.APPROVED, label: 'Approved' },
    { value: OrderStatus.REJECTED, label: 'Rejected' }
  ];

  constructor(
    private orderService: OrderService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.loadOrders();
  }

  /**
   * Load orders from the service
   */
  loadOrders(): void {
    this.isLoading = true;
    this.errorMessage = '';

    this.orderService.getOrders(this.currentPage, this.pageSize).subscribe({
      next: (response) => {
        if (response.success) {
          this.orders = response.orders;
          this.totalOrders = response.total;
          // Apply status filter if needed
          if (this.statusFilter !== 'all') {
            this.orders = this.orders.filter(order => order.status === this.statusFilter);
          }
        } else {
          this.errorMessage = 'Failed to load orders';
        }
        this.isLoading = false;
      },
      error: (error) => {
        console.error('Error loading orders:', error);
        this.errorMessage = 'An error occurred while loading orders';
        this.isLoading = false;
      }
    });
  }

  /**
   * Navigate to order details page
   */
  viewOrderDetails(orderId: string): void {
    this.router.navigate(['/admin/orders', orderId]);
  }

  /**
   * Handle status filter change
   */
  onStatusFilterChange(): void {
    this.currentPage = 1;
    this.loadOrders();
  }

  /**
   * Get status badge class based on order status
   */
  getStatusBadgeClass(status: OrderStatus): string {
    switch (status) {
      case OrderStatus.PENDING:
        return 'status-pending';
      case OrderStatus.APPROVED:
        return 'status-approved';
      case OrderStatus.REJECTED:
        return 'status-rejected';
      default:
        return '';
    }
  }

  /**
   * Get status display text
   */
  getStatusText(status: OrderStatus): string {
    return status.charAt(0).toUpperCase() + status.slice(1);
  }

  /**
   * Format date for display
   */
  formatDate(date: Date): string {
    return this.orderService.formatDate(date);
  }

  /**
   * Handle pagination
   */
  onPageChange(page: number): void {
    this.currentPage = page;
    this.loadOrders();
  }

  /**
   * Get total pages for pagination
   */
  get totalPages(): number {
    return Math.ceil(this.totalOrders / this.pageSize);
  }

  /**
   * Get pagination array
   */
  get paginationArray(): number[] {
    const pages: number[] = [];
    const start = Math.max(1, this.currentPage - 2);
    const end = Math.min(this.totalPages, this.currentPage + 2);
    
    for (let i = start; i <= end; i++) {
      pages.push(i);
    }
    return pages;
  }

  /**
   * Check if there are uploaded files
   */
  hasUploadedFiles(order: CourseOrder): boolean {
    return order.uploadedFiles && order.uploadedFiles.length > 0;
  }

  /**
   * Get file count display
   */
  getFileCount(order: CourseOrder): string {
    const count = order.uploadedFiles?.length || 0;
    return count === 1 ? '1 file' : `${count} files`;
  }

  /**
   * Retry loading orders
   */
  retryLoadOrders(): void {
    this.loadOrders();
  }
}
