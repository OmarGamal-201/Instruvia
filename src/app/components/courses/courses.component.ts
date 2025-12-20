import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { CourseService, Course } from '../../services/courses.service';

@Component({
  selector: 'app-courses',
  templateUrl: './courses.component.html',
  styleUrls: ['./courses.component.css']
})
export class CoursesComponent implements OnInit {
  // Language & Theme
  currentLanguage: string = 'en';
  isDarkMode: boolean = false;

  // Filters
  searchTerm: string = '';
  selectedCategory: string = 'all';
  selectedLevel: string = 'All';
  sortBy: string = 'newest';

  // Loading state
  isLoading: boolean = false;

  // Course data
  allCourses: any[] = [];
  filteredCourses: any[] = [];

  // Pagination
  currentPage: number = 1;
  itemsPerPage: number = 12;
  totalCourses: number = 0;
  totalPages: number = 1;

  // Price ranges - FIXED: Updated to match your original
  priceRanges = [
    { id: 'free', label: 'Free', min: 0, max: 0, checked: false },
    { id: 'low', label: '$0 - $50', min: 1, max: 50, checked: false },
    { id: 'mid', label: '$50 - $100', min: 51, max: 100, checked: false },
    { id: 'high', label: '$100+', min: 101, max: 10000, checked: false }
  ];

  // Translations (keeping your exact translations)
  translations = {
    en: {
      pageTitle: 'Explore Our Courses',
      subtitle: '5,000+ courses to transform your career',
      searchPlaceholder: 'Search for courses...',
      searchButton: 'Search',
      filtersTitle: 'Filters',
      categoryLabel: 'Category',
      levelLabel: 'Course Level',
      priceLabel: 'Price Range',
      showingResults: 'Showing',
      coursesLabel: 'courses',
      reviews: 'reviews',
      enroll: 'Enroll Now',
      viewDetails: 'View Details',
      sortBy: 'Sort by:',
      clearFilters: 'Clear Filters',
      featuredCourses: 'Featured Courses',
      noResults: 'No courses found.',
      loading: 'Loading courses...',
      page: 'Page',
      of: 'of',
      previous: 'Previous',
      next: 'Next',
      categories: {
        all: 'All',
        Development: 'Development',
        Business: 'Business',
        Design: 'Design',
        'Data Science': 'Data Science',
        Marketing: 'Marketing',
        Communication: 'Communication'
      },
      levels: {
        All: 'All',
        beginner: 'Beginner',
        intermediate: 'Intermediate',
        advanced: 'Advanced'
      }
    },
    ar: {
      pageTitle: 'استكشف دوراتنا',
      subtitle: 'أكثر من 5,000 دورة لتحويل مسارك المهني',
      searchPlaceholder: 'ابحث عن الدورات...',
      searchButton: 'بحث',
      filtersTitle: 'الفلاتر',
      categoryLabel: 'التصنيف',
      levelLabel: 'المستوى',
      priceLabel: 'نطاق السعر',
      showingResults: 'عرض',
      coursesLabel: 'دورة',
      reviews: 'مراجعة',
      enroll: 'سجل الآن',
      viewDetails: 'عرض التفاصيل',
      sortBy: 'ترتيب حسب:',
      clearFilters: 'مسح الفلاتر',
      featuredCourses: 'الدورات المميزة',
      noResults: 'لم يتم العثور على دورات.',
      loading: 'جاري تحميل الدورات...',
      page: 'صفحة',
      of: 'من',
      previous: 'السابق',
      next: 'التالي',
      categories: {
        all: 'الكل',
        Development: 'التطوير',
        Business: 'الأعمال',
        Design: 'التصميم',
        'Data Science': 'علوم البيانات',
        Marketing: 'التسويق',
        Communication: 'التواصل'
      },
      levels: {
        All: 'الكل',
        beginner: 'مبتدئ',
        intermediate: 'متوسط',
        advanced: 'متقدم'
      }
    }
  };

  categories: any[] = [];
  courseLevels: any[] = [];
  sortOptions: any[] = [];

  constructor(
    private courseService: CourseService,
    private route: ActivatedRoute,
    private router: Router
  ) {
    this.updateLabels();
  }

  ngOnInit() {
    this.loadUserPreferences();
    this.applyTheme();

    // Check for query parameters
    this.route.queryParams.subscribe(params => {
      if (params['search']) {
        this.searchTerm = params['search'];
      }
      if (params['category']) {
        this.selectedCategory = params['category'];
      }
      if (params['page']) {
        this.currentPage = parseInt(params['page'], 10);
      }
      this.fetchCourses();
    });
  }

  // FIXED: Main fetch method with proper parameter handling
  fetchCourses() {
    this.isLoading = true;

    // Calculate price range
    const selectedPrices = this.priceRanges.filter(r => r.checked);
    let priceMin = null;
    let priceMax = null;

    if (selectedPrices.length > 0) {
      priceMin = Math.min(...selectedPrices.map(r => r.min));
      priceMax = Math.max(...selectedPrices.map(r => r.max));
    }

    // Build query params - ONLY include non-null values
    const queryParams: any = {
      page: this.currentPage,
      limit: this.itemsPerPage,
      sort: this.sortBy
    };

    // Add optional filters ONLY if they have valid values
    if (this.searchTerm && this.searchTerm.trim() !== '') {
      queryParams.search = this.searchTerm.trim();
    }

    if (this.selectedCategory && this.selectedCategory !== 'all') {
      queryParams.category = this.selectedCategory;
    }

    if (this.selectedLevel && this.selectedLevel !== 'All') {
      queryParams.level = this.selectedLevel.toLowerCase(); // Convert to lowercase for backend
    }

    if (priceMin !== null && priceMin !== undefined) {
      queryParams.price_min = priceMin;
    }

    if (priceMax !== null && priceMax !== undefined) {
      queryParams.price_max = priceMax;
    }

    console.log('Fetching courses with params:', queryParams); // Debug log

    // Call API
    this.courseService.getCourses(queryParams).subscribe({
      next: (response: any) => {
        console.log('API Response:', response); // Debug log

        // Handle different response formats
        if (response.success && response.data) {
          this.allCourses = response.data;
          this.filteredCourses = response.data;

          // Handle pagination
          if (response.pagination) {
            this.totalCourses = response.pagination.total;
            this.totalPages = response.pagination.pages;
            this.currentPage = response.pagination.page;
          }
        } else if (response.courses) {
          this.allCourses = response.courses;
          this.filteredCourses = response.courses;
        } else if (Array.isArray(response)) {
          this.allCourses = response;
          this.filteredCourses = response;
        }

        this.isLoading = false;
      },
      error: (error) => {
        console.error('Error fetching courses:', error);
        this.allCourses = [];
        this.filteredCourses = [];
        this.isLoading = false;
      }
    });
  }

  // FIXED: Filter handlers now reset page to 1
 onSearch() {
  console.log('=== SEARCH DEBUG START ===');
  console.log('Search term:', this.searchTerm);
  console.log('Search term length:', this.searchTerm?.length);
  console.log('Search term trimmed:', this.searchTerm?.trim());
  console.log('Selected category:', this.selectedCategory);
  console.log('Selected level:', this.selectedLevel);
  console.log('Current page before reset:', this.currentPage);

  this.currentPage = 1;
  console.log('Current page after reset:', this.currentPage);
  console.log('=== CALLING fetchCourses ===');

  this.fetchCourses();
}

  onCategoryChange(id: string) {
    console.log('Category changed:', id); // Debug
    this.selectedCategory = id;
    this.currentPage = 1;
    this.fetchCourses();
  }

  onLevelChange(id: string) {
    console.log('Level changed:', id); // Debug
    this.selectedLevel = id;
    this.currentPage = 1;
    this.fetchCourses();
  }

  onPriceChange() {
    console.log('Price changed:', this.priceRanges.filter(r => r.checked)); // Debug
    this.currentPage = 1;
    this.fetchCourses();
  }

  onSortChange(val: string) {
    console.log('Sort changed:', val); // Debug
    this.sortBy = val;
    this.currentPage = 1;
    this.fetchCourses();
  }

  clearFilters() {
    console.log('Clearing filters'); // Debug
    this.searchTerm = '';
    this.selectedCategory = 'all';
    this.selectedLevel = 'All';
    this.sortBy = 'newest';
    this.priceRanges.forEach(r => r.checked = false);
    this.currentPage = 1;
    this.fetchCourses();
  }

  // Pagination methods
  goToPage(page: number) {
    if (page >= 1 && page <= this.totalPages) {
      this.currentPage = page;
      this.fetchCourses();
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  }

  nextPage() {
    if (this.currentPage < this.totalPages) {
      this.goToPage(this.currentPage + 1);
    }
  }

  previousPage() {
    if (this.currentPage > 1) {
      this.goToPage(this.currentPage - 1);
    }
  }

  getPageNumbers(): number[] {
    const pages: number[] = [];
    const maxPagesToShow = 5;

    let startPage = Math.max(1, this.currentPage - Math.floor(maxPagesToShow / 2));
    let endPage = Math.min(this.totalPages, startPage + maxPagesToShow - 1);

    if (endPage - startPage < maxPagesToShow - 1) {
      startPage = Math.max(1, endPage - maxPagesToShow + 1);
    }

    for (let i = startPage; i <= endPage; i++) {
      pages.push(i);
    }

    return pages;
  }

  // Helper methods
  updateLabels() {
    const t = this.translations[this.currentLanguage as keyof typeof this.translations];
    this.categories = Object.keys(t.categories).map(key => ({
      id: key,
      name: (t.categories as any)[key]
    }));
    this.courseLevels = Object.keys(t.levels).map(key => ({
      id: key,
      name: (t.levels as any)[key]
    }));
    this.sortOptions = [
      { id: 'newest', name: this.currentLanguage === 'ar' ? 'الأحدث' : 'Newest' },
      { id: 'price_low', name: this.currentLanguage === 'ar' ? 'السعر: الأقل' : 'Price: Low' },
      { id: 'price_high', name: this.currentLanguage === 'ar' ? 'السعر: الأعلى' : 'Price: High' },
      { id: 'rating', name: this.currentLanguage === 'ar' ? 'الأعلى تقييماً' : 'Highest Rated' }
    ];
  }

  // Getters
  get text() {
    return this.translations[this.currentLanguage as keyof typeof this.translations];
  }

  get filteredCoursesCount() {
    return this.filteredCourses.length;
  }

  get featuredCourses() {
    return this.filteredCourses.filter(c => c.featured);
  }

  getCategoryName(key: string) {
    return (this.text.categories as any)[key] || key;
  }

  getLevelText(key: string) {
    return (this.text.levels as any)[key] || key;
  }

  formatPrice(p: number) {
    return this.currentLanguage === 'ar' ? `${p} ج.م` : `$${p.toFixed(2)}`;
  }

  // Helper to get instructor name
  getInstructorName(course: any): string {
    if (course.instructor && typeof course.instructor === 'object' && course.instructor.name) {
      return course.instructor.name;
    }
    return 'Unknown Instructor';
  }

  // Helper to get course rating
  getCourseRating(course: any): number {
    return course.rating || 0;
  }

  // Helper to get number of students
  getStudentCount(course: any): number {
    return course.enrolledStudents?.length || 0;
  }

// Course actions
enrollInCourse(course: any) {
  // Pass only the course ID in the route
  this.router.navigate(['/enroll', course._id || course.id]);
}

  // Language & Theme
  changeLanguage(lang: string) {
    this.currentLanguage = lang;
    localStorage.setItem('preferredLanguage', lang);
    document.body.setAttribute('dir', lang === 'ar' ? 'rtl' : 'ltr');
    this.updateLabels();
  }

  onLanguageChange(e: any) {
    this.changeLanguage(e.target.value);
  }

  toggleTheme() {
    this.isDarkMode = !this.isDarkMode;
    localStorage.setItem('theme', this.isDarkMode ? 'dark' : 'light');
    this.applyTheme();
  }

  applyTheme() {
    document.body.className = this.isDarkMode ? 'dark-mode' : 'light-mode';
  }

  loadUserPreferences() {
    this.currentLanguage = localStorage.getItem('preferredLanguage') || 'en';
    this.isDarkMode = localStorage.getItem('theme') === 'dark';
    document.body.setAttribute('dir', this.currentLanguage === 'ar' ? 'rtl' : 'ltr');
  }

  // Make Math available in template
  Math = Math;
}
