import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { OrderService } from '../../services/order.service';
import { CourseOrder, OrderStatus } from '../../models/order.model';

@Component({
  selector: 'app-admin-order-details',
  templateUrl: './admin-order-details.component.html',
  styleUrls: ['./admin-order-details.component.css']
})
export class AdminOrderDetailsComponent implements OnInit {
  order: CourseOrder | null = null;
  isLoading = false;
  errorMessage = '';
  successMessage = '';
  
  // Action states
  isApproving = false;
  isRejecting = false;
  isDeleting = false;
  
  // Admin notes
  adminNotes = '';
  showRejectModal = false;
  showDeleteModal = false;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private orderService: OrderService
  ) {}

  ngOnInit(): void {
    this.loadOrderDetails();
  }

  /**
   * Load order details from the service
   */
  loadOrderDetails(): void {
    this.isLoading = true;
    this.errorMessage = '';
    
    const orderId = this.route.snapshot.paramMap.get('orderId');
    
    if (!orderId) {
      this.errorMessage = 'Order ID not provided';
      this.isLoading = false;
      return;
    }

    this.orderService.getOrderById(orderId).subscribe({
      next: (response) => {
        if (response.success && response.order) {
          this.order = response.order;
          this.adminNotes = response.order.adminNotes || '';
        } else {
          this.errorMessage = 'Order not found';
        }
        this.isLoading = false;
      },
      error: (error) => {
        console.error('Error loading order details:', error);
        this.errorMessage = 'An error occurred while loading order details';
        this.isLoading = false;
      }
    });
  }

  /**
   * Approve the order
   */
  approveOrder(): void {
    if (!this.order) return;
    
    this.isApproving = true;
    this.clearMessages();

    this.orderService.approveOrder(this.order.id, this.adminNotes).subscribe({
      next: (response) => {
        if (response.success) {
          this.successMessage = 'Order approved successfully!';
          if (response.order) {
            this.order = response.order;
          }
          // Auto-refresh after 2 seconds
          setTimeout(() => {
            this.loadOrderDetails();
          }, 2000);
        } else {
          this.errorMessage = response.message || 'Failed to approve order';
        }
        this.isApproving = false;
      },
      error: (error) => {
        console.error('Error approving order:', error);
        this.errorMessage = 'An error occurred while approving the order';
        this.isApproving = false;
      }
    });
  }

  /**
   * Reject the order
   */
  rejectOrder(): void {
    if (!this.order) return;
    
    this.isRejecting = true;
    this.clearMessages();

    this.orderService.rejectOrder(this.order.id, this.adminNotes).subscribe({
      next: (response) => {
        if (response.success) {
          this.successMessage = 'Order rejected successfully!';
          if (response.order) {
            this.order = response.order;
          }
          this.showRejectModal = false;
          // Auto-refresh after 2 seconds
          setTimeout(() => {
            this.loadOrderDetails();
          }, 2000);
        } else {
          this.errorMessage = response.message || 'Failed to reject order';
        }
        this.isRejecting = false;
      },
      error: (error) => {
        console.error('Error rejecting order:', error);
        this.errorMessage = 'An error occurred while rejecting the order';
        this.isRejecting = false;
      }
    });
  }

  /**
   * Delete the order
   */
  deleteOrder(): void {
    if (!this.order) return;
    
    this.isDeleting = true;
    this.clearMessages();

    this.orderService.deleteOrder(this.order.id).subscribe({
      next: (response) => {
        if (response.success) {
          this.successMessage = 'Order deleted successfully!';
          // Redirect to orders list after 1.5 seconds
          setTimeout(() => {
            this.router.navigate(['/admin/orders']);
          }, 1500);
        } else {
          this.errorMessage = response.message || 'Failed to delete order';
        }
        this.isDeleting = false;
        this.showDeleteModal = false;
      },
      error: (error) => {
        console.error('Error deleting order:', error);
        this.errorMessage = 'An error occurred while deleting the order';
        this.isDeleting = false;
        this.showDeleteModal = false;
      }
    });
  }

  /**
   * Navigate back to orders list
   */
  goBack(): void {
    this.router.navigate(['/admin/orders']);
  }

  /**
   * Get status badge class
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
   * Format file size for display
   */
  formatFileSize(bytes: number): string {
    return this.orderService.formatFileSize(bytes);
  }

  /**
   * Get file icon based on file type
   */
  getFileIcon(fileType: string): string {
    if (fileType.includes('pdf')) return 'fa-file-pdf';
    if (fileType.includes('video')) return 'fa-file-video';
    if (fileType.includes('image')) return 'fa-file-image';
    if (fileType.includes('word') || fileType.includes('document')) return 'fa-file-word';
    if (fileType.includes('powerpoint') || fileType.includes('presentation')) return 'fa-file-powerpoint';
    if (fileType.includes('excel') || fileType.includes('spreadsheet')) return 'fa-file-excel';
    if (fileType.includes('zip') || fileType.includes('compressed')) return 'fa-file-zipper';
    return 'fa-file';
  }

  /**
   * Check if actions are available
   */
  canPerformActions(): boolean {
    return this.order?.status === OrderStatus.PENDING;
  }

  /**
   * Open reject modal
   */
  openRejectModal(): void {
    this.showRejectModal = true;
  }

  /**
   * Close reject modal
   */
  closeRejectModal(): void {
    this.showRejectModal = false;
  }

  /**
   * Open delete modal
   */
  openDeleteModal(): void {
    this.showDeleteModal = true;
  }

  /**
   * Close delete modal
   */
  closeDeleteModal(): void {
    this.showDeleteModal = false;
  }

  /**
   * Clear success and error messages
   */
  clearMessages(): void {
    this.successMessage = '';
    this.errorMessage = '';
  }

  /**
   * Check if order has uploaded files
   */
  hasUploadedFiles(): boolean {
    return !!(this.order?.uploadedFiles && this.order.uploadedFiles.length > 0);
  }

  /**
   * Get uploaded files count
   */
  getUploadedFilesCount(): number {
    return this.order?.uploadedFiles?.length || 0;
  }

  /**
   * Download file (mock implementation)
   */
  downloadFile(file: any): void {
    // In real implementation, this would trigger file download
    console.log('Downloading file:', file.name);
    // window.open(file.url, '_blank');
  }
}
