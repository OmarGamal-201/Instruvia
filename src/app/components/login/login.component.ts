import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css']
})
export class LoginComponent implements OnInit {
  loginForm: FormGroup;
  submitted = false;
  showPassword = false;
  isLoading = false; // لإظهار حالة التحميل على الزر
  currentLanguage: string = 'en';
  isDarkMode: boolean = false;

  translations = {
    en: {
      welcome: 'Welcome Back',
      signin: 'Sign in to continue your learning journey',
      email: 'Email',
      emailPlaceholder: 'your@email.com',
      password: 'Password',
      passwordPlaceholder: '••••••••',
      emailRequired: 'Email is required',
      emailInvalid: 'Please enter a valid email address',
      passwordRequired: 'Password is required',
      signinBtn: 'Sign In',
      loading: 'Loading...',
      remember: 'Remember me',
      forgot: 'Forgot password?',
      or: 'Or continue with',
      noAccount: 'Don\'t have an account?',
      signup: 'Sign up',
      back: 'Back to Home',
      google: 'Google',
      github: 'GitHub'
    },
    ar: {
      welcome: 'مرحباً بعودتك',
      signin: 'سجل الدخول لمواصلة رحلة التعلم',
      email: 'البريد الإلكتروني',
      emailPlaceholder: 'بريدك@الألكتروني.com',
      password: 'كلمة المرور',
      passwordPlaceholder: '••••••••',
      emailRequired: 'البريد الإلكتروني مطلوب',
      emailInvalid: 'يرجى إدخال بريد إلكتروني صحيح',
      passwordRequired: 'كلمة المرور مطلوبة',
      signinBtn: 'تسجيل الدخول',
      loading: 'جاري التحميل...',
      remember: 'تذكرني',
      forgot: 'نسيت كلمة المرور؟',
      or: 'أو تابع باستخدام',
      noAccount: 'ليس لديك حساب؟',
      signup: 'اشترك',
      back: 'العودة للرئيسية',
      google: 'جوجل',
      github: 'جيت هاب'
    }
  };

  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private router: Router
  ) {
    this.loginForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(8)]],
      rememberMe: [false]
    });
  }

  ngOnInit() {
    this.loadUserPreferences();
    this.applyTheme();
    this.setLanguageDirection();
  }

  get text() { return this.translations[this.currentLanguage as keyof typeof this.translations]; }
  get email() { return this.loginForm.get('email'); }
  get password() { return this.loginForm.get('password'); }

  onSubmit() {
    this.submitted = true;

    if (this.loginForm.invalid) return;

    const { email, password } = this.loginForm.value;
    this.isLoading = true;

    this.authService.login(email, password).subscribe({
      next: (res) => {
        console.log('Login success:', res);
        this.isLoading = false;
      },
      error: (err) => {
        console.error('Login error:', err);
        this.isLoading = false;

        alert(
          this.currentLanguage === 'ar'
            ? 'فشل تسجيل الدخول: تأكد من البيانات'
            : 'Login failed: Check your credentials'
        );
      }
    });
  }


  // دوال اللغة والسمات (Theme) تبقى كما هي في كودك الأصلي...
  onLanguageChange(event: any) { this.changeLanguage(event.target.value); }
  changeLanguage(lang: string) {
    this.currentLanguage = lang;
    localStorage.setItem('preferredLanguage', lang);
    this.setLanguageDirection();
  }
  setLanguageDirection() {
    document.body.setAttribute('dir', this.currentLanguage === 'ar' ? 'rtl' : 'ltr');
  }
  toggleTheme() {
    this.isDarkMode = !this.isDarkMode;
    this.applyTheme();
    localStorage.setItem('theme', this.isDarkMode ? 'dark' : 'light');
  }
  applyTheme() {
    document.body.className = this.isDarkMode ? 'dark-mode' : 'light-mode';
  }
  loadUserPreferences() {
    this.currentLanguage = localStorage.getItem('preferredLanguage') || 'en';
    this.isDarkMode = localStorage.getItem('theme') === 'dark';
  }
}
