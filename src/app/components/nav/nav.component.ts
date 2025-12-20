import { Component, OnInit, OnDestroy } from '@angular/core';
import { AuthService } from '../../services/auth.service';
import { Router } from '@angular/router';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-nav',
  templateUrl: './nav.component.html',
  styleUrls: ['./nav.component.css'],
})
export class NavComponent implements OnInit, OnDestroy {
  isOpen = false; // للمنيو بتاعة الموبايل
  isDark = false; // لحالة الدارك مود
  isLoggedIn = false;
  currentUser: any = null;
  private authSubscription: Subscription | null = null;

  constructor(
    private authService: AuthService,
    private router: Router
  ) {
    // Check authentication status on component init
    this.checkAuthStatus();
  }

  ngOnInit() {
    // Subscribe to authentication state changes
    this.authSubscription = this.authService.currentUser$.subscribe((user: any) => {
      this.currentUser = user;
      this.isLoggedIn = !!user;
    });
  }

  ngOnDestroy() {
    // Clean up subscription to prevent memory leaks
    if (this.authSubscription) {
      this.authSubscription.unsubscribe();
    }
  }

  toggleMenu() {
    this.isOpen = !this.isOpen;
  }

  checkAuthStatus() {
    this.isLoggedIn = this.authService.isAuthenticated();
    this.currentUser = this.authService.getCurrentUser();
  }

  logout() {
    this.authService.logout();
    this.isLoggedIn = false;
    this.currentUser = null;
  }

  // الفنكشن السحرية للدارك مود
  toggleDarkMode() {
    this.isDark = !this.isDark;

    if (this.isDark) {
      // السطر ده بيعكس ألوان الصفحة كلها وبيحافظ على ألوان الصور طبيعية
      document.documentElement.style.filter = 'invert(1) hue-rotate(180deg)';
      // عشان الصور واللوجو ميتعكسوش هما كمان ونحافظ على شكلهم
      document.querySelectorAll('img').forEach((el: any) => {
      el.style.filter = 'invert(1) hue-rotate(180deg)';
      });
    } else {
      // بيرجع كل حاجة لأصلها
      document.documentElement.style.filter = '';
      document.querySelectorAll('img').forEach((el: any) => {
        el.style.filter = '';
      });
    }
  }
}
