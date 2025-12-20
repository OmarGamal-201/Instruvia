import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';

// Interfaces
export interface User {
  _id: string;
  name: string;
  email: string;
  role: 'student' | 'instructor' | 'admin';
  bio?: string;
  specialization?: string;
  isInstructorApproved?: boolean;
  isInstructorRequest?: boolean;
  createdAt: Date;
}

export interface DashboardStats {
  totalUsers: number;
  totalStudents: number;
  totalInstructors: number;
  totalAdmins: number;
  pendingInstructors: number;
  approvedInstructors: number;
}

export interface RecentUser {
  name: string;
  email: string;
  role: string;
  createdAt: Date;
}

export interface DashboardResponse {
  success: boolean;
  stats: DashboardStats;
  recentUsers: RecentUser[];
}

export interface PaginatedResponse<T> {
  success: boolean;
  data: T[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    pages: number;
  };
}

export interface InstructorApplication {
  _id: string;
  applicant: {
    _id: string;
    name: string;
    email: string;
    createdAt: Date;
  };
  bio: string;
  specialization: string;
  status: 'pending' | 'approved' | 'rejected';
  submittedAt: Date;
  reviewedBy?: {
    _id: string;
    name: string;
    email: string;
  };
  reviewedAt?: Date;
  rejectionReason?: string;
}

export interface ApprovalRequest {
  approved: boolean;
  rejectionReason?: string;
}

export interface ApprovalResponse {
  success: boolean;
  message: string;
  application: InstructorApplication;
  user: {
    id: string;
    name: string;
    email: string;
    role: string;
    isInstructorApproved: boolean;
  };
}
@Injectable({
  providedIn: 'root'
})
export class AdmindashboardService {
    private apiUrl = 'http://localhost:5000/api/admin';
constructor(private http: HttpClient) {}

  // Dashboard Statistics
  getDashboardStats(): Observable<DashboardResponse> {
    return this.http.get<DashboardResponse>(`${this.apiUrl}/stats`);
  }

  // User Management
  getAllUsers(page: number = 1, limit: number = 10, role?: string, isInstructorApproved?: boolean): Observable<PaginatedResponse<User>> {
    let params = new HttpParams()
      .set('page', page.toString())
      .set('limit', limit.toString());

    if (role) {
      params = params.set('role', role);
    }
    if (isInstructorApproved !== undefined) {
      params = params.set('isInstructorApproved', isInstructorApproved.toString());
    }

    return this.http.get<PaginatedResponse<User>>(`${this.apiUrl}/users`, { params });
  }

  getUserById(userId: string): Observable<{ success: boolean; user: User }> {
    return this.http.get<{ success: boolean; user: User }>(`${this.apiUrl}/users/${userId}`);
  }

  updateUser(userId: string, userData: Partial<User>): Observable<{ success: boolean; message: string; user: User }> {
    return this.http.put<{ success: boolean; message: string; user: User }>(
      `${this.apiUrl}/users/${userId}`,
      userData
    );
  }

  deleteUser(userId: string): Observable<{ success: boolean; message: string }> {
    return this.http.delete<{ success: boolean; message: string }>(`${this.apiUrl}/users/${userId}`);
  }

  // Instructor Applications
  getInstructorApplications(page: number = 1, limit: number = 10, status?: string): Observable<PaginatedResponse<InstructorApplication>> {
    let params = new HttpParams()
      .set('page', page.toString())
      .set('limit', limit.toString());

    if (status) {
      params = params.set('status', status);
    }

    return this.http.get<PaginatedResponse<InstructorApplication>>(
      `${this.apiUrl}/instructor-applications`,
      { params }
    );
  }

  getInstructorApplicationById(applicationId: string): Observable<{ success: boolean; application: InstructorApplication }> {
    return this.http.get<{ success: boolean; application: InstructorApplication }>(
      `${this.apiUrl}/instructor-applications/${applicationId}`
    );
  }

  approveInstructorApplication(applicationId: string, approvalData: ApprovalRequest): Observable<ApprovalResponse> {
    return this.http.put<ApprovalResponse>(
      `${this.apiUrl}/instructor-applications/${applicationId}/approve`,
      approvalData
    );
  }

  getPendingInstructors(page: number = 1, limit: number = 10): Observable<PaginatedResponse<User>> {
    const params = new HttpParams()
      .set('page', page.toString())
      .set('limit', limit.toString());

    return this.http.get<PaginatedResponse<User>>(`${this.apiUrl}/instructors/pending`, { params });
  }
}
