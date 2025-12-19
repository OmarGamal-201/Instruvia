import { Component, OnInit } from '@angular/core';
import { CourseService } from '../../services/courses.service';

@Component({
  selector: 'app-courses',
  templateUrl: './courses.component.html',
  styleUrls: ['./courses.component.css']
})
export class CoursesComponent implements OnInit {
  currentLanguage: string = 'en';
  isDarkMode: boolean = false;
  searchTerm: string = '';
  selectedCategory: string = 'all';
  selectedLevel: string = 'All';
  sortBy: string = 'newest';
  isLoading: boolean = false;

  allCourses: any[] = [];
  filteredCourses: any[] = [];

  priceRanges = [
    { id: 'free', label: 'Free', min: 0, max: 0, checked: false },
    { id: 'low', label: '$0 - $50', min: 1, max: 50, checked: false },
    { id: 'mid', label: '$50 - $100', min: 51, max: 100, checked: false },
    { id: 'high', label: '$100+', min: 101, max: 10000, checked: false }
  ];

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
      categories: { all: 'All', development: 'Development', business: 'Business', design: 'Design' },
      levels: { All: 'All', Beginner: 'Beginner', Intermediate: 'Intermediate', Advanced: 'Advanced' }
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
      categories: { all: 'الكل', development: 'التطوير', business: 'الأعمال', design: 'التصميم' },
      levels: { All: 'الكل', Beginner: 'مبتدئ', Intermediate: 'متوسط', Advanced: 'متقدم' }
    }
  };

  categories: any[] = [];
  courseLevels: any[] = [];
  sortOptions: any[] = [];

  constructor(private courseService: CourseService) {
    this.updateLabels();
  }

  ngOnInit() {
    this.loadUserPreferences();
    this.applyTheme();
    this.fetchCourses();
  }

  fetchCourses() {
    this.isLoading = true;

    const selectedPrices = this.priceRanges.filter(r => r.checked);
    let priceMin = null;
    let priceMax = null;

    if (selectedPrices.length > 0) {
      priceMin = Math.min(...selectedPrices.map(r => r.min));
      priceMax = Math.max(...selectedPrices.map(r => r.max));
    }

    const queryParams: any = {
      search: this.searchTerm || null,
      sort: this.sortBy,
      category: this.selectedCategory !== 'all' ? this.selectedCategory : null,
      level: this.selectedLevel !== 'All' ? this.selectedLevel : null,
      price_min: priceMin,
      price_max: priceMax
    };

    this.courseService.getCourses(queryParams).subscribe({
      next: (res: any) => {
        this.allCourses = res.data || res.courses || res;
        this.filteredCourses = this.allCourses;
        this.isLoading = false;
      },
      error: (err) => {
        console.error('API Error:', err);
        this.isLoading = false;
      }
    });
  }

  onSearch() { this.fetchCourses(); }
  onCategoryChange(id: string) { this.selectedCategory = id; this.fetchCourses(); }
  onLevelChange(id: string) { this.selectedLevel = id; this.fetchCourses(); }
  onPriceChange() { this.fetchCourses(); }
  onSortChange(val: string) { this.sortBy = val; this.fetchCourses(); }

  clearFilters() {
    this.searchTerm = '';
    this.selectedCategory = 'all';
    this.selectedLevel = 'All';
    this.priceRanges.forEach(r => r.checked = false);
    this.fetchCourses();
  }

  updateLabels() {
    const t = this.translations[this.currentLanguage as keyof typeof this.translations];
    this.categories = Object.keys(t.categories).map(key => ({ id: key, name: (t.categories as any)[key] }));
    this.courseLevels = Object.keys(t.levels).map(key => ({ id: key, name: (t.levels as any)[key] }));
    this.sortOptions = [
      { id: 'newest', name: this.currentLanguage === 'ar' ? 'الأحدث' : 'Newest' },
      { id: 'price_low', name: this.currentLanguage === 'ar' ? 'السعر: الأقل' : 'Price: Low' },
      { id: 'price_high', name: this.currentLanguage === 'ar' ? 'السعر: الأعلى' : 'Price: High' },
      { id: 'rating', name: this.currentLanguage === 'ar' ? 'الأعلى تقييماً' : 'Highest Rated' }
    ];
  }

  get text() { return this.translations[this.currentLanguage as keyof typeof this.translations]; }
  get filteredCoursesCount() { return this.filteredCourses.length; }
  get featuredCourses() { return this.filteredCourses.filter(c => c.featured); }
  getCategoryName(key: string) { return (this.text.categories as any)[key] || key; }
  getLevelText(key: string) { return (this.text.levels as any)[key] || key; }
  formatPrice(p: number) { return this.currentLanguage === 'ar' ? `${p} ج.م` : `$${p}`; }

  changeLanguage(lang: string) {
    this.currentLanguage = lang;
    localStorage.setItem('preferredLanguage', lang);
    document.body.setAttribute('dir', lang === 'ar' ? 'rtl' : 'ltr');
    this.updateLabels();
  }
  onLanguageChange(e: any) { this.changeLanguage(e.target.value); }
  toggleTheme() { this.isDarkMode = !this.isDarkMode; this.applyTheme(); }
  applyTheme() { document.body.className = this.isDarkMode ? 'dark-mode' : 'light-mode'; }
  loadUserPreferences() {
    this.currentLanguage = localStorage.getItem('preferredLanguage') || 'en';
    this.isDarkMode = localStorage.getItem('theme') === 'dark';
    document.body.setAttribute('dir', this.currentLanguage === 'ar' ? 'rtl' : 'ltr');
  }
}
