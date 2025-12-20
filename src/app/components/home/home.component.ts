  import { User } from './../../services/admindashboard.service';
  import { Component, OnInit } from '@angular/core';
  import { Router } from '@angular/router';
  import { AuthService, LoginResponse} from 'src/app/services/auth.service';
  import { CourseService, Course, Category } from '../../services/courses.service';
  // import { ThemeService } from 'src/app/shared/theme.service';

  interface CategoryDisplay {
    name: string;
    courses: number;
    icon: string;
  }

  interface FeaturedCourse {
    id: string;
    title: string;
    category: string;
    instructor: string;
    rating: number;
    students: number;
    duration: number;
    lessons: number;
    price: number;
    image: string;
  }

  @Component({
    selector: 'app-home',
    templateUrl: './home.component.html',
    styleUrls: ['./home.component.css']
  })
  export class HomeComponent implements OnInit {
    isLoggedIn = false;
    currentUser: LoginResponse | null = null;
    userRole: 'student' | 'instructor' | 'admin' = 'student';
    isDarkMode = false;
    isOpen = false;
    searchQuery = '';
    
    // Data arrays
    categories: CategoryDisplay[] = [];
    featuredCourses: FeaturedCourse[] = [];
    
    // Stats
    stats = {
      activeStudents: '0',
      expertInstructors: '0',
      qualityCourses: '0',
      successRate: '0%'
    };

    // Loading states
    isLoadingCategories = false;
    isLoadingCourses = false;
    isLoadingStats = false;

    // Default category icons
    private categoryIcons: { [key: string]: string } = {
      'Development': '../../assets/it-department.png',
      'Business': '../../assets/cooperation.png',
      'Design': '../../assets/palette.png',
      'Data Science': '../../assets/exploratory-analysis.png',
      'Marketing': '../../assets/social-media.png',
      'Communication': '../../assets/cooperation.png'
    };

    constructor(
      private router: Router,
      private authService: AuthService,
      private courseService: CourseService,
      // private themeService: ThemeService
    ) {
    }

    ngOnInit() {
      this.checkAuthentication();
      this.loadCategories();
      this.loadFeaturedCourses();
      this.loadHomeStats();
    }

    // Check if user is authenticated
    checkAuthentication() {
      this.authService.currentUser$.subscribe(user => {
        this.currentUser = user;
        this.isLoggedIn = !!user;
        if (user) {
          this.userRole = user.role;
        }
      });
    }

    // Load categories with course counts
    loadCategories() {
      this.isLoadingCategories = true;
      
      this.courseService.getCategories().subscribe({
        next: (response) => {
          if (response.success) {
            this.categories = response.categories.map(cat => ({
              name: cat.name,
              courses: cat.count,
              icon: this.categoryIcons[cat.name] || '../../assets/cooperation.png'
            }));
          }
          this.isLoadingCategories = false;
        },
        error: (error) => {
          console.error('Error loading categories:', error);
          this.loadDefaultCategories();
          this.isLoadingCategories = false;
        }
      });
    }

    // Load default categories as fallback
    loadDefaultCategories() {
      this.categories = [
        { name: 'Development', courses: 342, icon: '../../assets/it-department.png' },
        { name: 'Business', courses: 189, icon: '../../assets/cooperation.png' },
        { name: 'Design', courses: 267, icon: '../../assets/palette.png' },
        { name: 'Data Science', courses: 156, icon: '../../assets/exploratory-analysis.png' },
        { name: 'Marketing', courses: 198, icon: '../../assets/social-media.png' },
        { name: 'Communication', courses: 123, icon: '../../assets/cooperation.png' }
      ];
    }

    // Load featured courses
    loadFeaturedCourses() {
      this.isLoadingCourses = true;
      
      this.courseService.getFeaturedCourses(6).subscribe({
        next: (response) => {
          if (response.success && response.data) {
            this.featuredCourses = response.data.map(course => ({
              id: course._id,
              title: course.title,
              category: course.category,
              instructor: course.instructor.name,
              rating: course.rating || 0,
              students: course.enrolledStudents?.length || 0,
              duration: course.duration || 0,
              lessons: course.lessons?.length || 0,
              price: course.price,
              image: course.thumbnail || 'https://images.unsplash.com/photo-1461749280684-dccba630e2f6?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&q=80'
            }));
          }
          this.isLoadingCourses = false;
        },
        error: (error) => {
          console.error('Error loading featured courses:', error);
          this.isLoadingCourses = false;
        }
      });
    }

    // Load home statistics
    loadHomeStats() {
      this.isLoadingStats = true;
      
      this.courseService.getHomeStats().subscribe({
        next: (response) => {
          if (response.success) {
            this.stats = {
              activeStudents: this.formatNumber(response.stats.totalStudents),
              expertInstructors: this.formatNumber(response.stats.totalInstructors),
              qualityCourses: this.formatNumber(response.stats.totalCourses),
              successRate: response.stats.successRate + '%'
            };
          }
          this.isLoadingStats = false;
        },
        error: (error) => {
          console.error('Error loading home stats:', error);
          // Keep default values
          this.stats = {
            activeStudents: '50K+',
            expertInstructors: '1,200+',
            qualityCourses: '5,000+',
            successRate: '98%'
          };
          this.isLoadingStats = false;
        }
      });
    }

    // Format numbers for display
    formatNumber(num: number): string {
      if (num >= 1000000) {
        return (num / 1000000).toFixed(1) + 'M+';
      } else if (num >= 1000) {
        return (num / 1000).toFixed(1) + 'K+';
      }
      return num.toString() + '+';
    }

    // Navigation methods
    toggleMenu() {
      this.isOpen = !this.isOpen;
    }

    goHome() {
      this.router.navigate(['/home']);
    }

    goLogin() {
      this.router.navigate(['/login']);
    }

    goCourses() {
      this.router.navigate(['/courses']);
    }

    goConsultation() {
      this.router.navigate(['/consultions']);
    }

    goCategory(categoryName: string) {
      this.router.navigate(['/courses'], { queryParams: { category: categoryName } });
    }

    goEnrollment(course: FeaturedCourse) {
      if (this.isLoggedIn) {
        this.router.navigate(['/courses', course.id]);
      } else {
        // Save intended destination and redirect to login
        sessionStorage.setItem('redirectAfterLogin', `/courses/${course.id}`);
        this.router.navigate(['/login']);
      }
    }

    performSearch() {
      if (this.searchQuery.trim()) {
        this.router.navigate(['/courses'], { 
          queryParams: { search: this.searchQuery } 
        });
      }
    }

    goProfile() {
      if (this.userRole === 'student') {
        this.router.navigate(['/student-profile']);
      } else if (this.userRole === 'instructor') {
        this.router.navigate(['/teacher-profile']);
      } else if (this.userRole === 'admin') {
        this.router.navigate(['/admin-dashboard']);
      }
    }

    logout() {
      this.authService.logout();
    }
  }