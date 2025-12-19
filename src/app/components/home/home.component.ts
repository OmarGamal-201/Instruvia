import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { FormsModule } from '@angular/forms';


@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.css']
})
export class HomeComponent {

  isLoggedIn = false; // toggle based on auth state
  userRole: 'student' | 'teacher' | 'admin' = 'student'; // example
  isDarkMode = false;
  isOpen = false;
  

  toggleMenu() {
    this.isOpen = !this.isOpen;
  }
  constructor(private router: Router) {}

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

  searchQuery = '';

  performSearch() {
    if (this.searchQuery.trim()) {
      // Navigate to courses page with search query
      this.router.navigate(['/courses'], { queryParams: { search: this.searchQuery } });
    }
  }

  goProfile() {
    if(this.userRole === 'student') this.router.navigate(['/student-profile']);
    else if(this.userRole === 'teacher') this.router.navigate(['/teacher-profile']);
    else if(this.userRole === 'admin') this.router.navigate(['/admin-dashboard']);
  }

  toggleDarkMode() {
    this.isDarkMode = !this.isDarkMode;
  }

categories = [
  { name: 'Development', courses: 342, icon: '../../assets/it-department.png' },
  { name: 'Business', courses: 189, icon: '../../assets/cooperation.png' },
  { name: 'Design', courses: 267, icon: '../../assets/palette.png' },
  { name: 'Data Science', courses: 156, icon: '../../assets/exploratory-analysis.png' },
  { name: 'Marketing', courses: 198, icon: '../../assets/social-media.png' },
  { name: 'Communication', courses: 123, icon: '../../assets/cooperation.png' }
];

goCategory(categoryName: string) {
  // توجه لصفحة الكورسات مع الفلتر حسب الكاتجوري
  this.router.navigate(['/courses'], { queryParams: { category: categoryName } });
}

featuredCourses = [
  {
    title: 'Complete Web Development Bootcamp 2025',
    category: 'Development',
    instructor: 'Sarah Johnson',
    rating: 4.9,
    students: 12450,
    duration: 42,
    lessons: 312,
    price: 89.99,
    image: 'https://images.unsplash.com/photo-1461749280684-dccba630e2f6?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=400&q=80'
  },
  {
    title: 'Business Strategy & Leadership Masterclass',
    category: 'Business',
    instructor: 'Michael Chen',
    rating: 4.8,
    students: 8920,
    duration: 28,
    lessons: 156,
    price: 79.99,
    image: 'https://images.unsplash.com/photo-1461749280684-dccba630e2f6?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=400&q=80'
  },
  {
    title: 'UI/UX Design Complete Course',
    category: 'Design',
    instructor: 'Emma Davis',
    rating: 4.9,
    students: 15320,
    duration: 35,
    lessons: 248,
    price: 94.99,
    image: 'https://images.unsplash.com/photo-1461749280684-dccba630e2f6?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=400&q=80'
  }
];

goEnrollment(course: any) {
  // توجه لصفحة Enrollment مع course parameter
  this.router.navigate(['/enrollment'], { queryParams: { course: course.title } });
}
}
