import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, FormArray, FormControl } from '@angular/forms';
import { Router } from '@angular/router';
import { debounceTime, distinctUntilChanged } from 'rxjs/operators';

interface Consultant {
  id: number;
  name: string;
  title: string;
  specialty: string;
  experience: string;
  price: number;
  rating: number;
  reviewCount: number;
  availability: string;
  image: string;
  topics: string[];
  duration: number;
}

@Component({
  selector: 'app-consultions',
  templateUrl: './consultions.component.html',
  styleUrls: ['./consultions.component.css'],
})
export class ConsultionsComponent implements OnInit {
  filterForm: FormGroup;
  currentLanguage: 'en' | 'ar' = 'en';
  isRTL: boolean = false;

  // Translations object
  translations: { [key: string]: { [key: string]: string } } = {
    en: {
      'header.title': 'Book Expert Consultations',
      'header.subtitle': 'Get personalized 1-on-1 guidance from industry-leading experts',
      'search.placeholder': 'Search experts, topics, or industries...',
      'search.button': 'Search',
      'filter.title': '📍 Filters',
      'filter.all': 'All Consultations',
      'filter.topic': '💼 Topic',
      'filter.price': '💰 Price Range',
      'filter.duration': '⏱️ Duration',
      'filter.rating': '⭐ Rating',
      'filter.apply': 'Apply Filters',
      'filter.clear': '🔄 Clear Filters',
      'results.showing': 'Showing',
      'results.of': 'of',
      'results.consultants': 'consultants',
      'consultant.session': '/session',
      'consultant.book': 'Book Now',
      'consultant.load': 'Load More Consultants',
      'consultant.none': 'No consultants found matching your criteria.',
      'how.title': 'How Consultations Work',
      'how.subtitle': 'Book a personalized session in 3 simple steps',
      'how.step1.title': 'Choose Your Expert',
      'how.step1.desc': 'Browse our curated list of verified experts in various fields. Read their profiles, reviews, and areas of expertise to find the perfect match.',
      'how.step2.title': 'Schedule Session',
      'how.step2.desc': 'Select a convenient time slot that works for both you and your chosen expert. You ll receive instant confirmation with all the details.',
      'how.step3.title': 'Get 1:1 Advice',
      'how.step3.desc': 'Join the video call at your scheduled time and receive personalized guidance tailored to your specific needs and goals.',
      'topic.self': 'Self-Consultations',
      'topic.business': 'Business',
      'topic.writing': 'Writing',
      'topic.tech': 'Technology',
      'topic.marketing': 'Marketing',
      'topic.finance': 'Finance',
      'duration.30': '30 minutes',
      'duration.60': '60 minutes',
      'duration.90': '90 minutes',
      'rating.4.5': '4.5+',
      'rating.4.0': '4.0+',
      'rating.3.5': '3.5+'
    },
    ar: {
      'header.title': 'احجز استشارات الخبراء',
      'header.subtitle': 'احصل على إرشاد شخصي فردي من خبراء رائدين في الصناعة',
      'search.placeholder': 'ابحث عن خبراء أو مواضيع أو صناعات...',
      'search.button': 'بحث',
      'filter.title': '📍 الفلاتر',
      'filter.all': 'جميع الاستشارات',
      'filter.topic': '💼 الموضوع',
      'filter.price': '💰 نطاق السعر',
      'filter.duration': '⏱️ المدة',
      'filter.rating': '⭐ التقييم',
      'filter.apply': 'تطبيق الفلاتر',
      'filter.clear': '🔄 مسح الفلاتر',
      'results.showing': 'عرض',
      'results.of': 'من',
      'results.consultants': 'مستشار',
      'consultant.session': '/جلسة',
      'consultant.book': 'احجز الآن',
      'consultant.load': 'تحميل المزيد من المستشارين',
      'consultant.none': 'لم يتم العثور على مستشارين يطابقون معاييرك.',
      'how.title': 'كيف تعمل الاستشارات',
      'how.subtitle': 'احجز جلسة شخصية في 3 خطوات بسيطة',
      'how.step1.title': 'اختر خبيرك',
      'how.step1.desc': 'تصفح قائمتنا المنسقة من الخبراء الموثقين في مختلف المجالات. اقرأ ملفاتهم الشخصية والمراجعات ومجالات خبرتهم للعثور على التطابق المثالي.',
      'how.step2.title': 'جدولة الجلسة',
      'how.step2.desc': 'اختر فترة زمنية مناسبة تناسبك أنت والخبير الذي اخترته. ستحصل على تأكيد فوري مع جميع التفاصيل.',
      'how.step3.title': 'احصل على نصيحة فردية',
      'how.step3.desc': 'انضم إلى مكالمة الفيديو في الوقت المحدد واحصل على إرشادات شخصية مصممة خصيصاً لاحتياجاتك وأهدافك المحددة.',
      'topic.self': 'استشارات ذاتية',
      'topic.business': 'الأعمال',
      'topic.writing': 'الكتابة',
      'topic.tech': 'التكنولوجيا',
      'topic.marketing': 'التسويق',
      'topic.finance': 'المالية',
      'duration.30': '30 دقيقة',
      'duration.60': '60 دقيقة',
      'duration.90': '90 دقيقة',
      'rating.4.5': '4.5+',
      'rating.4.0': '4.0+',
      'rating.3.5': '3.5+'
    }
  };

  consultants: Consultant[] = [
    {
      id: 1,
      name: 'Dr. Sarah Cohen',
      title: 'Clinical Psychologist',
      specialty: 'Psychology & Counseling',
      experience: '15+ years experience',
      price: 75,
      rating: 4.9,
      reviewCount: 267,
      availability: 'Monday, Wednesday, Friday',
      image: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=200&h=200&fit=crop',
      topics: ['self', 'psychology'],
      duration: 60
    },
    {
      id: 2,
      name: 'Michael Chen',
      title: 'Business Strategy Consultant',
      specialty: 'Business & Consulting',
      experience: '12+ years experience',
      price: 125,
      rating: 4.8,
      reviewCount: 183,
      availability: 'Tuesday, Thursday, Saturday',
      image: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=200&h=200&fit=crop',
      topics: ['business', 'strategy'],
      duration: 60
    },
    {
      id: 3,
      name: 'Emma Williams',
      title: 'Career Coach',
      specialty: 'Career & Personal Development',
      experience: 'Former Google Recruiter',
      price: 85,
      rating: 4.9,
      reviewCount: 342,
      availability: 'Monday, Tuesday, Thursday',
      image: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=200&h=200&fit=crop',
      topics: ['self', 'career'],
      duration: 60
    },
    {
      id: 4,
      name: 'James Martinez',
      title: 'Full-Stack Developer',
      specialty: 'Technology & Development',
      experience: '10+ years experience',
      price: 95,
      rating: 4.7,
      reviewCount: 156,
      availability: 'Wednesday, Friday, Sunday',
      image: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=200&h=200&fit=crop',
      topics: ['tech', 'development'],
      duration: 90
    },
    {
      id: 5,
      name: 'Lisa Thompson',
      title: 'Content Marketing Strategist',
      specialty: 'Marketing & Growth',
      experience: '8+ years experience',
      price: 110,
      rating: 4.8,
      reviewCount: 198,
      availability: 'Tuesday, Thursday, Saturday',
      image: 'https://images.unsplash.com/photo-1487412720507-e7ab37603c6f?w=200&h=200&fit=crop',
      topics: ['marketing', 'writing'],
      duration: 60
    },
    {
      id: 6,
      name: 'Robert Kim',
      title: 'Financial Advisor',
      specialty: 'Finance & Investment',
      experience: '20+ years experience',
      price: 150,
      rating: 4.9,
      reviewCount: 412,
      availability: 'Monday, Wednesday, Friday',
      image: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=200&h=200&fit=crop',
      topics: ['finance', 'investment'],
      duration: 90
    }
  ];

  filteredConsultants: Consultant[] = [];
  displayedConsultants: Consultant[] = [];

  itemsPerPage: number = 3;
  currentPage: number = 1;

  topicsList = [
    { value: 'self', label: 'topic.self' },
    { value: 'business', label: 'topic.business' },
    { value: 'writing', label: 'topic.writing' },
    { value: 'tech', label: 'topic.tech' },
    { value: 'marketing', label: 'topic.marketing' },
    { value: 'finance', label: 'topic.finance' }
  ];

  priceRangesList = [
    { value: '0-50', label: '$ 0 - 50' },
    { value: '51-100', label: '$$ 51 - 100' },
    { value: '101-200', label: '$$$ 101 - 200' },
    { value: '200+', label: '$$$$ 200+' }
  ];

  durationsList = [
    { value: 30, label: 'duration.30' },
    { value: 60, label: 'duration.60' },
    { value: 90, label: 'duration.90' }
  ];

  ratingsList = [
    { value: 4.5, label: 'rating.4.5' },
    { value: 4.0, label: 'rating.4.0' },
    { value: 3.5, label: 'rating.3.5' }
  ];

  constructor(private fb: FormBuilder,private router: Router,) {
    this.filterForm = this.fb.group({
      searchQuery: [''],
      topics: this.fb.array(this.topicsList.map(() => false)),
      priceRanges: this.fb.array(this.priceRangesList.map(() => false)),
      durations: this.fb.array(this.durationsList.map(() => false)),
      ratings: this.fb.array(this.ratingsList.map(() => false))
    });
  }

  ngOnInit(): void {
    // Load saved language
    const savedLang = localStorage.getItem('language') as 'en' | 'ar' || 'en';
    this.setLanguage(savedLang);

    this.filteredConsultants = [...this.consultants];
    this.updateDisplayedConsultants();

    // Subscribe to search query changes with debounce
    this.filterForm.get('searchQuery')?.valueChanges
      .pipe(
        debounceTime(300),
        distinctUntilChanged()
      )
      .subscribe(() => {
        this.applyFilters();
      });

    // Subscribe to all filter changes
    this.filterForm.get('topics')?.valueChanges.subscribe(() => this.applyFilters());
    this.filterForm.get('priceRanges')?.valueChanges.subscribe(() => this.applyFilters());
    this.filterForm.get('durations')?.valueChanges.subscribe(() => this.applyFilters());
    this.filterForm.get('ratings')?.valueChanges.subscribe(() => this.applyFilters());
  }

  setLanguage(lang: 'en' | 'ar'): void {
    this.currentLanguage = lang;
    this.isRTL = lang === 'ar';
    localStorage.setItem('language', lang);
    document.documentElement.dir = this.isRTL ? 'rtl' : 'ltr';
    document.documentElement.lang = lang;
  }

  toggleLanguage(): void {
    const newLang: 'en' | 'ar' = this.currentLanguage === 'en' ? 'ar' : 'en';
    this.setLanguage(newLang);
  }

  translate(key: string): string {
    const lang = this.currentLanguage;
    return this.translations[lang]?.[key] || key;
  }

  get topicsFormArray(): FormArray {
    return this.filterForm.get('topics') as FormArray;
  }

  get priceRangesFormArray(): FormArray {
    return this.filterForm.get('priceRanges') as FormArray;
  }

  get durationsFormArray(): FormArray {
    return this.filterForm.get('durations') as FormArray;
  }

  get ratingsFormArray(): FormArray {
    return this.filterForm.get('ratings') as FormArray;
  }

  applyFilters(): void {
    const searchQuery = this.filterForm.get('searchQuery')?.value.toLowerCase() || '';

    // Get selected topics
    const selectedTopics = this.topicsList
      .filter((_, i) => this.topicsFormArray.at(i).value)
      .map(topic => topic.value);

    // Get selected price ranges
    const selectedPriceRanges = this.priceRangesList
      .filter((_, i) => this.priceRangesFormArray.at(i).value)
      .map(range => range.value);

    // Get selected durations
    const selectedDurations = this.durationsList
      .filter((_, i) => this.durationsFormArray.at(i).value)
      .map(duration => duration.value);

    // Get selected ratings
    const selectedRatings = this.ratingsList
      .filter((_, i) => this.ratingsFormArray.at(i).value)
      .map(rating => rating.value);

    this.filteredConsultants = this.consultants.filter(consultant => {
      // Search filter
      const matchesSearch = searchQuery === '' ||
        consultant.name.toLowerCase().includes(searchQuery) ||
        consultant.title.toLowerCase().includes(searchQuery) ||
        consultant.specialty.toLowerCase().includes(searchQuery);

      // Topic filter
      const matchesTopic = selectedTopics.length === 0 ||
        selectedTopics.some(topic => consultant.topics.includes(topic));

      // Price filter
      const matchesPrice = selectedPriceRanges.length === 0 ||
        selectedPriceRanges.some(range => {
          if (range === '0-50') return consultant.price <= 50;
          if (range === '51-100') return consultant.price > 50 && consultant.price <= 100;
          if (range === '101-200') return consultant.price > 100 && consultant.price <= 200;
          if (range === '200+') return consultant.price > 200;
          return false;
        });

      // Duration filter
      const matchesDuration = selectedDurations.length === 0 ||
        selectedDurations.includes(consultant.duration);

      // Rating filter
      const matchesRating = selectedRatings.length === 0 ||
        selectedRatings.some(rating => consultant.rating >= rating);

      return matchesSearch && matchesTopic && matchesPrice && matchesDuration && matchesRating;
    });

    this.currentPage = 1;
    this.updateDisplayedConsultants();
  }

  updateDisplayedConsultants(): void {
    const startIndex = 0;
    const endIndex = this.currentPage * this.itemsPerPage;
    this.displayedConsultants = this.filteredConsultants.slice(startIndex, endIndex);
  }

  loadMore(): void {
    this.currentPage++;
    this.updateDisplayedConsultants();
  }

  hasMore(): boolean {
    return this.displayedConsultants.length < this.filteredConsultants.length;
  }

  bookConsultation(consultant: Consultant): void {
    // alert(`Booking consultation with ${consultant.name}`);
    this.router.navigate(['/page1'])
  }

  clearFilters(): void {
    this.filterForm.reset({
      searchQuery: '',
      topics: this.topicsList.map(() => false),
      priceRanges: this.priceRangesList.map(() => false),
      durations: this.durationsList.map(() => false),
      ratings: this.ratingsList.map(() => false)
    });
  }

  getTotalResults(): number {
    return this.filteredConsultants.length;
  }
}
