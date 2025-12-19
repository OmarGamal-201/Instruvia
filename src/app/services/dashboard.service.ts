import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
// import { environment } from '../environments/environment';


export interface DashboardStats {
  enrolledCourses: number;
  upcomingSessions: number;
  certificatesEarned: number;
  learningStreakDays: number;
}

export interface ContinueLearning {
  _id: string;
  title: string;
  description: string;
  instructor: string;
  progress: number;
  totalLessons: number;
  completedLessons: number;
  thumbnail: string;
  category: string;
  lastAccessedAt: string;
}

export interface RecentActivity {
  title: string;
  subtitle: string;
  instructor: string;
  time: string;
  type: string;
}

export interface RecommendedCourse {
  _id: string;
  title: string;
  instructor: string;
  rating: string;
  thumbnail: string;
}

export interface DashboardData {
  user: {
    name: string;
    email: string;
    role: string;
  };
  stats: DashboardStats;
  continueLearning: ContinueLearning[];
  recentActivity: RecentActivity[];
  recommended: RecommendedCourse[];
  consultations: any[];
}

export interface EnrolledCourse {
  _id: string;
  title: string;
  description: string;
  instructor: {
    name: string;
    specialization: string;
  };
  thumbnail: string;
  category: string;
  rating: number;
  ratingCount: number;
  duration: number;
  totalLessons: number;
  completedLessons: number;
  progress: number;
  lastAccessedAt: string;
  enrolledAt: string;
  status: string;
}

export interface Certificate {
  _id: string;
  courseTitle: string;
  courseDescription: string;
  instructor: {
    name: string;
    specialization: string;
  };
  category: string;
  thumbnail: string;
  completedAt: string;
  totalLessons: number;
  enrolledAt: string;
}

export interface CourseProgress {
  courseId: string;
  courseTitle: string;
  progress: number;
  totalLessons: number;
  completedLessons: number;
  lessons: {
    _id: string;
    title: string;
    duration: number;
    order: number;
    isCompleted: boolean;
    completedAt?: string;
  }[];
  lastAccessedAt: string;
  enrolledAt: string;
}

@Injectable({
  providedIn: 'root'
})
export class DashboardService {
    private apiUrl = `http://localhost:5000/api/users`;

  constructor(private http: HttpClient) {}

  // Get dashboard data
  getDashboardData(): Observable<{ success: boolean; data: DashboardData }> {
    return this.http.get<{ success: boolean; data: DashboardData }>(
      `${this.apiUrl}/dashboard`
    );
  }

  // Get enrolled courses
  getEnrolledCourses(
    status?: string,
    sort?: string
  ): Observable<{ success: boolean; count: number; courses: EnrolledCourse[] }> {
    let params = new HttpParams();
    if (status) params = params.set('status', status);
    if (sort) params = params.set('sort', sort);

    return this.http.get<{ success: boolean; count: number; courses: EnrolledCourse[] }>(
      `${this.apiUrl}/enrolled-courses`,
      { params }
    );
  }

  // Get course progress
  getCourseProgress(
    courseId: string
  ): Observable<{ success: boolean; data: CourseProgress }> {
    return this.http.get<{ success: boolean; data: CourseProgress }>(
      `${this.apiUrl}/course-progress/${courseId}`
    );
  }

  // Get certificates
  getCertificates(): Observable<{ success: boolean; count: number; certificates: Certificate[] }> {
    return this.http.get<{ success: boolean; count: number; certificates: Certificate[] }>(
      `${this.apiUrl}/certificates`
    );
  }

  // Update profile
  updateProfile(data: any): Observable<any> {
    return this.http.put(`${this.apiUrl}/profile`, data);
  }

}
