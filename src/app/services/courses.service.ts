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
  price_min?: number;
  price_max?: number;
  rating?: number;
  search?: string;
  sort?: 'price_low' | 'price_high' | 'rating' | 'newest' | 'popular';
  tags?: string[];
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

  // Original method - Get courses with any filters (updated to support all backend params)
  getCourses(filters?: any): Observable<any> {
    let params = new HttpParams();

    if (filters) {
      // Add all filter parameters
      Object.keys(filters).forEach(key => {
        if (filters[key] !== null && filters[key] !== undefined && filters[key] !== '') {
          if (Array.isArray(filters[key])) {
            // Handle array parameters (like tags)
            filters[key].forEach((value: any) => {
              params = params.append(key, value);
            });
          } else {
            params = params.set(key, filters[key].toString());
          }
        }
      });
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
      .set('limit', limit.toString());

    if (filters) {
      if (filters.category) params = params.set('category', filters.category);
      if (filters.level) params = params.set('level', filters.level);
      if (filters.price_min) params = params.set('price_min', filters.price_min.toString());
      if (filters.price_max) params = params.set('price_max', filters.price_max.toString());
      if (filters.rating) params = params.set('rating', filters.rating.toString());
      if (filters.search) params = params.set('search', filters.search);
      if (filters.sort) params = params.set('sort', filters.sort);
      if (filters.tags && filters.tags.length > 0) {
        filters.tags.forEach(tag => {
          params = params.append('tags', tag);
        });
      }
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
    maxPrice: number,
    page: number = 1,
    limit: number = 10
  ): Observable<PaginatedResponse<Course>> {
    const params = new HttpParams()
      .set('price_min', minPrice.toString())
      .set('price_max', maxPrice.toString())
      .set('page', page.toString())
      .set('limit', limit.toString());

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
