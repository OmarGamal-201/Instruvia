import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
// import { environment } from '../../environments/environment';
import { Course, Lesson } from './instructor.service';

export interface CreateCourseDto {
  title: string;
  description: string;
  category: string;
  level: 'beginner' | 'intermediate' | 'advanced';
  price: number;
  thumbnail?: string;
  requirements?: string[];
  whatYouWillLearn?: string[];
}

export interface UpdateCourseDto {
  title?: string;
  description?: string;
  category?: string;
  level?: 'beginner' | 'intermediate' | 'advanced';
  price?: number;
  thumbnail?: string;
  requirements?: string[];
  whatYouWillLearn?: string[];
  status?: 'draft' | 'pending' | 'published';
}

export interface CreateLessonDto {
  title: string;
  description: string;
  videoUrl?: string;
  duration: number;
  order: number;
  isPreview: boolean;
  resources?: {
    title: string;
    url: string;
    type: string;
  }[];
}

@Injectable({
  providedIn: 'root'
})
export class CourseManagementService {
  private apiUrl = `http://localhost:5000/api/courses`;

  constructor(private http: HttpClient) {}

  // Create a new course
  createCourse(courseData: CreateCourseDto): Observable<{
    success: boolean;
    message: string;
    course: Course;
  }> {
    return this.http.post<{
      success: boolean;
      message: string;
      course: Course;
    }>(this.apiUrl, courseData);
  }

  // Update existing course
  updateCourse(courseId: string, courseData: UpdateCourseDto): Observable<{
    success: boolean;
    message: string;
    course: Course;
  }> {
    return this.http.put<{
      success: boolean;
      message: string;
      course: Course;
    }>(`${this.apiUrl}/${courseId}`, courseData);
  }

  // Delete course
  deleteCourse(courseId: string): Observable<{
    success: boolean;
    message: string;
  }> {
    return this.http.delete<{
      success: boolean;
      message: string;
    }>(`${this.apiUrl}/${courseId}`);
  }

  // Publish course (submit for review)
  publishCourse(courseId: string): Observable<{
    success: boolean;
    message: string;
    course: Course;
  }> {
    return this.http.put<{
      success: boolean;
      message: string;
      course: Course;
    }>(`${this.apiUrl}/${courseId}`, { status: 'pending' });
  }

  // Add lesson to course
  addLesson(courseId: string, lessonData: CreateLessonDto): Observable<{
    success: boolean;
    message: string;
    lesson: Lesson;
  }> {
    return this.http.post<{
      success: boolean;
      message: string;
      lesson: Lesson;
    }>(`${this.apiUrl}/${courseId}/lessons`, lessonData);
  }

  // Update lesson
  updateLesson(
    courseId: string,
    lessonId: string,
    lessonData: Partial<CreateLessonDto>
  ): Observable<{
    success: boolean;
    message: string;
    lesson: Lesson;
  }> {
    return this.http.put<{
      success: boolean;
      message: string;
      lesson: Lesson;
    }>(`${this.apiUrl}/${courseId}/lessons/${lessonId}`, lessonData);
  }

  // Delete lesson
  deleteLesson(courseId: string, lessonId: string): Observable<{
    success: boolean;
    message: string;
  }> {
    return this.http.delete<{
      success: boolean;
      message: string;
    }>(`${this.apiUrl}/${courseId}/lessons/${lessonId}`);
  }

  // Reorder lessons
  reorderLessons(
    courseId: string,
    lessonOrders: { lessonId: string; order: number }[]
  ): Observable<{
    success: boolean;
    message: string;
  }> {
    return this.http.put<{
      success: boolean;
      message: string;
    }>(`${this.apiUrl}/${courseId}/lessons/reorder`, { lessonOrders });
  }

  // Upload thumbnail
  uploadThumbnail(file: File): Observable<{ success: boolean; url: string }> {
    const formData = new FormData();
    formData.append('thumbnail', file);

    return this.http.post<{ success: boolean; url: string }>(
      `${this.apiUrl}/upload/thumbnail`,
      formData
    );
  }

  // Upload video
  uploadVideo(file: File): Observable<{ success: boolean; url: string }> {
    const formData = new FormData();
    formData.append('video', file);

    return this.http.post<{ success: boolean; url: string }>(
      `${this.apiUrl}/upload/video`,
      formData
    );
  }

  // Get course statistics for instructor
  getCourseStats(courseId: string): Observable<{
    success: boolean;
    stats: {
      totalEnrollments: number;
      totalRevenue: number;
      averageRating: number;
      completionRate: number;
      enrollmentTrend: { date: string; count: number }[];
    };
  }> {
    return this.http.get<any>(`${this.apiUrl}/${courseId}/stats`);
  }

  // Get enrolled students for a course
  getEnrolledStudents(courseId: string, page: number = 1, limit: number = 10): Observable<{
    success: boolean;
    data: any[];
    pagination: any;
  }> {
    const params = new HttpParams()
      .set('page', page.toString())
      .set('limit', limit.toString());

    return this.http.get<any>(`${this.apiUrl}/${courseId}/students`, { params });
  }
}