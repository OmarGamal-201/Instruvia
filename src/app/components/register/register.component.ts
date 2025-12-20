import { Component } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '../../services/auth.service';

interface Translation {
  header: {
    title: string;
    subtitle: string;
  };
  form: {
    name: string;
    fullNamePlaceholder: string;
    email: string;
    emailPlaceholder: string;
    password: string;
    passwordPlaceholder: string;
    agreeToTerms: string;
    terms: string;
    and: string;
    privacy: string;
    createAccount: string;
  };
  err: {
    fullNameRequired: string;
    fullNameMin: string;
    emailRequired: string;
    emailValid: string;
    passwordRequired: string;
    passwordMin: string;
    passwordPattern: string;
  }
  info: {
    title: string;
    text: string;
  };
  links: {
    alreadyHaveAccount: string;
    signIn: string;
    backToHome: string;
  };
}

@Component({
  selector: 'app-register',
  templateUrl: './register.component.html',
  styleUrls: ['./register.component.css']
})
export class RegisterComponent {
  registerForm: FormGroup;
  showPassword = false;
  currentLang: 'en' | 'ar' = 'en';

  translations: { en: Translation; ar: Translation } = {
    en: {
      header: {
        title: 'Create Account',
        subtitle: 'Join Instruvia and start learning today'
      },
      form: {
        name: 'Full Name',
        fullNamePlaceholder: 'John Doe',
        email: 'Email',
        emailPlaceholder: 'your@email.com',
        password: 'Password',
        passwordPlaceholder: '••••••••',
        agreeToTerms: 'I agree to the',
        terms: 'Terms',
        and: 'and',
        privacy: 'Privacy Policy',
        createAccount: 'Create Account'
      },
      err: {
        fullNameRequired: "Fullname is Required",
        fullNameMin: "Fullname must be at least 2 letters",
        emailRequired: "Email is Required",
        emailValid: "Email is Invalid",
        passwordRequired: "Password is Required",
        passwordMin: "Password must be at least 8 characters",
        passwordPattern: "Password must contain at least one uppercase, one lowercase, one number, one special char"
      },
      info: {
        title: 'Want to teach on Instruvia?',
        text: 'Create a student account first, then apply to become an instructor from your dashboard!'
      },
      links: {
        alreadyHaveAccount: 'Already have an account?',
        signIn: 'Sign in',
        backToHome: '← Back to Home'
      },

    },
    ar: {
      header: {
        title: 'إنشاء حساب',
        subtitle: 'انضم إلى Instruvia وابدأ التعلم اليوم'
      },
      form: {
        name: 'الاسم الكامل',
        fullNamePlaceholder: 'أحمد محمد',
        email: 'البريد الإلكتروني',
        emailPlaceholder: 'example@email.com',
        password: 'كلمة المرور',
        passwordPlaceholder: '••••••••',
        agreeToTerms: 'أوافق على',
        terms: 'الشروط',
        and: 'و',
        privacy: 'سياسة الخصوصية',
        createAccount: 'إنشاء حساب'
      },
      err: {
        "fullNameRequired": "الاسم مطلوب",
        "fullNameMin": "يجب أن يحتوي الاسم على حرفين على الأقل",

        "emailRequired": "البريد الإلكتروني مطلوب",
        "emailValid": "البريد الإلكتروني غير صالح",

        "passwordRequired": "كلمة المرور مطلوبة",
        "passwordMin": "يجب أن تكون كلمة المرور 8 أحرف على الأقل",
        "passwordPattern": "يجب أن تحتوي كلمة المرور على حرف كبير واحد على الأقل، وحرف صغير واحد على الأقل، ورقم واحد على الأقل، ورمز خاص واحد على الأقل."
      },
      info: {
        title: 'تريد التدريس على Instruvia؟',
        text: 'قم بإنشاء حساب طالب أولاً، ثم تقدم بطلب لتصبح مدرسًا من لوحة التحكم الخاصة بك!'
      },
      links: {
        alreadyHaveAccount: 'لديك حساب بالفعل؟',
        signIn: 'تسجيل الدخول',
        backToHome: 'العودة إلى الصفحة الرئيسية ←'
      }
    }
  };

  isSubmitting = false;
  errorMessage = '';

  constructor(
    private fb: FormBuilder,
    private router: Router,
    private authService: AuthService
  ) {
    this.registerForm = this.fb.group({
      name: ['', [Validators.required, Validators.minLength(2)]],
      email: ['', [Validators.required, Validators.email]],
      password: [
  '',
  [
    Validators.required,
    Validators.minLength(8),
    Validators.pattern(
      '^(?=.*[a-z])(?=.*[A-Z])(?=.*\\d)(?=.*[@$!%*?&])[A-Za-z\\d@$!%*?&]{8,}$'
    )
  ]
],
      agreeToTerms: [false, Validators.requiredTrue]
    });

    // Load saved language preference
    const savedLang = localStorage.getItem('language') as 'en' | 'ar';
    if (savedLang) {
      this.currentLang = savedLang;
    }
  }

  get t(): Translation {
    return this.translations[this.currentLang];
  }

  get isRTL(): boolean {
    return this.currentLang === 'ar';
  }

  toggleLanguage() {
    this.currentLang = this.currentLang === 'en' ? 'ar' : 'en';
    localStorage.setItem('language', this.currentLang);
  }

  togglePasswordVisibility() {
    this.showPassword = !this.showPassword;
  }

  onSubmit() {
    if (this.registerForm.valid && !this.isSubmitting) {
      this.isSubmitting = true;
      this.errorMessage = '';

      const registerData = {
        name: this.registerForm.value.name,
        email: this.registerForm.value.email,
        password: this.registerForm.value.password
      };

      this.authService.register(registerData).subscribe({
        next: (response) => {
          console.log('Registration successful:', response);
          console.log('Token stored:', this.authService.getToken());

          // Redirect to home page
          setTimeout(() => {
            this.router.navigate(['/profile']);
          }, 500);
        },
        error: (error) => {
          console.error('Registration error:', error);
          this.isSubmitting = false;

          // Handle error message
          if (error.error?.message) {
            this.errorMessage = error.error.message;
          } else if (error.status === 409) {
            this.errorMessage = this.currentLang === 'en'
              ? 'Email already exists'
              : 'البريد الإلكتروني موجود بالفعل';
          } else {
            this.errorMessage = this.currentLang === 'en'
              ? 'Registration failed. Please try again.'
              : 'فشل التسجيل. يرجى المحاولة مرة أخرى.';
          }
        },
        complete: () => {
          this.isSubmitting = false;
        }
      });
    } else {
      Object.keys(this.registerForm.controls).forEach(key => {
        this.registerForm.get(key)?.markAsTouched();
      });
    }
  }
  hasError(controlarName: string, errorName: string) {
    const c = this.registerForm.get(controlarName)
    return c?.touched && c?.hasError(errorName)
  }
  navigateToSignIn() {
    this.router.navigate(['/login']);
  }

  navigateToHome() {
    this.router.navigate(['/home']);
  }
}
