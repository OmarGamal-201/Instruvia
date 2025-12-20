import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';

// Interfaces
export interface Course {
  _id: string;
  title: string;
  description: string;
  instructor: {
    _id: string;
    name: string;
    bio?: string;
  };
  category: string;
  level: 'beginner' | 'intermediate' | 'advanced';
  price: number;
  thumbnail?: string;
  status: 'draft' | 'pending' | 'published' | 'rejected';
  enrolledStudents: any[];
  lessons: Lesson[];
  rating: number;
  requirements?: string[];
  whatYouWillLearn?: string[];
  duration?: number;
  totalStudents?: number;
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
}

export interface CourseFilters {
  category?: string;
  level?: string;
  minPrice?: number;
  maxPrice?: number;
  rating?: number;
  search?: string;
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

export interface Category {
  name: string;
  count: number;
  icon?: string;
}

export interface HomeStats {
  totalCourses: number;
  totalInstructors: number;
  totalStudents: number;
  successRate: number;
}

export interface Review {
  _id: string;
  student: {
    _id: string;
    name: string;
  };
  rating: number;
  comment: string;
  createdAt: Date;
}

@Injectable({ providedIn: 'root' })
export class CourseService {
  private apiUrl = `http://localhost:5000/api/courses`;

  constructor(private http: HttpClient) {}

  // Original method - Get courses with category filter
  getCourses(category?: string): Observable<any> {
    let params = new HttpParams();
    if (category && category !== 'all') {
      params = params.set('category', category);
    }
    return this.http.get(this.apiUrl, { params });
  }

  // Get all published courses with filters and pagination
  getCoursesWithFilters(
    page: number = 1,
    limit: number = 10,
    filters?: CourseFilters
  ): Observable<PaginatedResponse<Course>> {
    let params = new HttpParams()
      .set('page', page.toString())
      .set('limit', limit.toString())
      .set('status', 'published'); // Only show published courses

    if (filters) {
      if (filters.category) params = params.set('category', filters.category);
      if (filters.level) params = params.set('level', filters.level);
      if (filters.minPrice) params = params.set('minPrice', filters.minPrice.toString());
      if (filters.maxPrice) params = params.set('maxPrice', filters.maxPrice.toString());
      if (filters.rating) params = params.set('rating', filters.rating.toString());
      if (filters.search) params = params.set('search', filters.search);
    }

    return this.http.get<PaginatedResponse<Course>>(this.apiUrl, { params });
  }

  // Get featured courses (top rated or most enrolled)
  getFeaturedCourses(limit: number = 6): Observable<PaginatedResponse<Course>> {
    const params = new HttpParams()
      .set('limit', limit.toString())
      .set('status', 'published')
      .set('sort', 'rating'); // Sort by rating for featured courses

    return this.http.get<PaginatedResponse<Course>>(this.apiUrl, { params });
  }

  // Get trending courses (sorted by enrollment)
  getTrendingCourses(limit: number = 6): Observable<PaginatedResponse<Course>> {
    const params = new HttpParams()
      .set('limit', limit.toString())
      .set('status', 'published')
      .set('sort', 'students'); // Sort by number of students

    return this.http.get<PaginatedResponse<Course>>(this.apiUrl, { params });
  }

  // Get single course details
  getCourseById(courseId: string): Observable<{ success: boolean; course: Course }> {
    return this.http.get<{ success: boolean; course: Course }>(`${this.apiUrl}/${courseId}`);
  }

  // Search courses
  searchCourses(query: string, page: number = 1, limit: number = 10): Observable<PaginatedResponse<Course>> {
    const params = new HttpParams()
      .set('search', query)
      .set('page', page.toString())
      .set('limit', limit.toString())
      .set('status', 'published');

    return this.http.get<PaginatedResponse<Course>>(this.apiUrl, { params });
  }

  // Get courses by category with pagination
  getCoursesByCategory(
    category: string,
    page: number = 1,
    limit: number = 10
  ): Observable<PaginatedResponse<Course>> {
    const params = new HttpParams()
      .set('category', category)
      .set('page', page.toString())
      .set('limit', limit.toString())
      .set('status', 'published');

    return this.http.get<PaginatedResponse<Course>>(this.apiUrl, { params });
  }

  // Get all categories with course counts
  getCategories(): Observable<{ success: boolean; categories: Category[] }> {
    return this.http.get<{ success: boolean; categories: Category[] }>(
      `${this.apiUrl}/categories`
    );
  }

  // Get course reviews
  getCourseReviews(courseId: string): Observable<{
    success: boolean;
    reviews: Review[];
    averageRating: number;
  }> {
    return this.http.get<any>(`${this.apiUrl}/${courseId}/reviews`);
  }

  // Add course review (for enrolled students)
  addCourseReview(
    courseId: string,
    rating: number,
    comment: string
  ): Observable<{ success: boolean; message: string; review: Review }> {
    return this.http.post<any>(`${this.apiUrl}/${courseId}/reviews`, {
      rating,
      comment
    });
  }

  // Get home page statistics
  getHomeStats(): Observable<{ success: boolean; stats: HomeStats }> {
    return this.http.get<{ success: boolean; stats: HomeStats }>(
      `http://localhost:5000/api/stats/home`
    );
  }

  // Get popular instructors
  getPopularInstructors(limit: number = 10): Observable<{
    success: boolean;
    instructors: any[];
  }> {
    const params = new HttpParams().set('limit', limit.toString());
    return this.http.get<any>(
      `http://localhost:5000/api/instructors/popular`, 
      { params }
    );
  }

  // Get courses by level
  getCoursesByLevel(level: string): Observable<PaginatedResponse<Course>> {
    const params = new HttpParams()
      .set('level', level)
      .set('status', 'published');

    return this.http.get<PaginatedResponse<Course>>(this.apiUrl, { params });
  }

  // Get courses by price range
  getCoursesByPriceRange(
    minPrice: number,
    maxPrice: number
  ): Observable<PaginatedResponse<Course>> {
    const params = new HttpParams()
      .set('minPrice', minPrice.toString())
      .set('maxPrice', maxPrice.toString())
      .set('status', 'published');

    return this.http.get<PaginatedResponse<Course>>(this.apiUrl, { params });
  }

  // Get courses by rating
  getCoursesByRating(minRating: number): Observable<PaginatedResponse<Course>> {
    const params = new HttpParams()
      .set('rating', minRating.toString())
      .set('status', 'published');

    return this.http.get<PaginatedResponse<Course>>(this.apiUrl, { params });
  }

  // Get instructor's courses (for instructor dashboard)
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

    return this.http.get<PaginatedResponse<Course>>(
      `${this.apiUrl}/instructor/my-courses`,
      { params }
    );
  }

  // Get enrolled courses (for student)
  getEnrolledCourses(
    page: number = 1,
    limit: number = 10
  ): Observable<PaginatedResponse<any>> {
    const params = new HttpParams()
      .set('page', page.toString())
      .set('limit', limit.toString());

    return this.http.get<PaginatedResponse<any>>(
      `http://localhost:5000/api/enrollments/my-courses`,
      { params }
    );
  }
}