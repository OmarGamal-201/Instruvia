import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';

// Interfaces
export interface InstructorStats {
  totalRevenue: number;
  totalEnrollments: number;
  totalCourses: number;
  averageRating: number;
}

export interface Course {
  _id: string;
  title: string;
  description: string;
  instructor: string;
  category: string;
  level: string;
  price: number;
  thumbnail?: string;
  status: 'draft' | 'pending' | 'published' | 'rejected';
  enrolledStudents: any[];
  lessons: Lesson[];
  rating: number;
  requirements?: string[];
  whatYouWillLearn?: string[];
  duration?: number;
  createdAt: Date;
  updatedAt: Date;
}

export interface Lesson {
  _id: string;
  title: string;
  description: string;
  videoUrl?: string;
  duration: number;
  order: number;
  isPreview: boolean;
  resources?: Resource[];
}

export interface Resource {
  title: string;
  url: string;
  type: string;
}

export interface RecentEnrollment {
  _id: string;
  student: {
    _id: string;
    name: string;
    email: string;
  };
  course: {
    _id: string;
    title: string;
    price: number;
  };
  enrolledAt: Date;
}

export interface CoursePerformance {
  courseId: string;
  courseName: string;
  totalStudents: number;
  averageRating: number;
  totalRevenue: number;
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

export interface DashboardResponse {
  success: boolean;
  dashboard: {
    statistics: InstructorStats;
    recentEnrollments: RecentEnrollment[];
    coursePerformance: CoursePerformance[];
    monthlyEarnings: MonthlyEarning[];
  };
}

export interface MonthlyEarning {
  month: string;
  earnings: number;
  enrollments: number;
}

@Injectable({
  providedIn: 'root'
})
export class InstructorService {
  // FIXED: Removed trailing slash and corrected base URL
  private apiUrl = 'http://localhost:5000/api/courses';

  constructor(private http: HttpClient) {}

  // Get instructor dashboard statistics
  getInstructorStats(): Observable<DashboardResponse> {
    return this.http.get<DashboardResponse>(`${this.apiUrl}/instructor/dashboard`);
  }

  // Get instructor's courses with pagination and filters
  getInstructorCourses(
    page: number = 1,
    limit: number = 10,
    status?: string
  ): Observable<PaginatedResponse<Course>> {
    let params = new HttpParams()
      .set('page', page.toString())
      .set('limit', limit.toString());

    if (status) {
      params = params.set('status', status);
    }

    return this.http.get<PaginatedResponse<Course>>(`${this.apiUrl}/instructor/my-courses`, { params });
  }

  // Get single course details
  getCourseById(courseId: string): Observable<{ success: boolean; course: Course }> {
    return this.http.get<{ success: boolean; course: Course }>(
      `${this.apiUrl}/${courseId}`
    );
  }

  // Create new course - FIXED: Correct endpoint
  createCourse(courseData: Partial<Course>): Observable<{ success: boolean; message: string; course: Course }> {
    return this.http.post<{ success: boolean; message: string; course: Course }>(
      this.apiUrl, // POST to /api/courses
      courseData
    );
  }

  // Update course
  updateCourse(
    courseId: string,
    courseData: Partial<Course>
  ): Observable<{ success: boolean; message: string; course: Course }> {
    return this.http.put<{ success: boolean; message: string; course: Course }>(
      `${this.apiUrl}/${courseId}`,
      courseData
    );
  }

  // Delete course
  deleteCourse(courseId: string): Observable<{ success: boolean; message: string }> {
    return this.http.delete<{ success: boolean; message: string }>(
      `${this.apiUrl}/${courseId}`
    );
  }

  // Add lesson to course
  addLesson(
    courseId: string,
    lessonData: Partial<Lesson>
  ): Observable<{ success: boolean; message: string; lesson: Lesson }> {
    return this.http.post<{ success: boolean; message: string; lesson: Lesson }>(
      `${this.apiUrl}/${courseId}/lessons`,
      lessonData
    );
  }

  // Update lesson
  updateLesson(
    courseId: string,
    lessonId: string,
    lessonData: Partial<Lesson>
  ): Observable<{ success: boolean; message: string; lesson: Lesson }> {
    return this.http.put<{ success: boolean; message: string; lesson: Lesson }>(
      `${this.apiUrl}/${courseId}/lessons/${lessonId}`,
      lessonData
    );
  }

  // Delete lesson
  deleteLesson(
    courseId: string,
    lessonId: string
  ): Observable<{ success: boolean; message: string }> {
    return this.http.delete<{ success: boolean; message: string }>(
      `${this.apiUrl}/${courseId}/lessons/${lessonId}`
    );
  }

  // Reorder lessons
  reorderLessons(
    courseId: string,
    lessonOrders: { lessonId: string; order: number }[]
  ): Observable<{ success: boolean; message: string }> {
    return this.http.put<{ success: boolean; message: string }>(
      `${this.apiUrl}/${courseId}/lessons/reorder`,
      { lessonOrders }
    );
  }

  // Get course performance analytics
  getCoursePerformance(courseId: string): Observable<CoursePerformance> {
    return this.http.get<CoursePerformance>(`${this.apiUrl}/${courseId}/performance`);
  }

  // Get recent enrollments for instructor
  getRecentEnrollments(limit: number = 10): Observable<{ success: boolean; enrollments: RecentEnrollment[] }> {
    const params = new HttpParams().set('limit', limit.toString());
    return this.http.get<{ success: boolean; enrollments: RecentEnrollment[] }>(
      `${this.apiUrl}/instructor/recent-enrollments`,
      { params }
    );
  }

  // Get monthly earnings
  getMonthlyEarnings(months: number = 12): Observable<{ success: boolean; earnings: MonthlyEarning[] }> {
    const params = new HttpParams().set('months', months.toString());
    return this.http.get<{ success: boolean; earnings: MonthlyEarning[] }>(
      `${this.apiUrl}/instructor/monthly-earnings`,
      { params }
    );
  }
}
