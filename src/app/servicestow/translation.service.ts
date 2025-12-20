// src/app/services/translation.service.ts

import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

export interface Translation {
  [key: string]: {
    en: string;
    ar: string;
  };
}

@Injectable({
  providedIn: 'root'
})
export class TranslationService {
  private translations: Translation = {
    // Navigation & General
    'complete_enrollment': {
      en: 'Complete Your Enrollment',
      ar: 'أكمل تسجيلك'
    },
    'secure_checkout': {
      en: 'Secure checkout - Your information is protected',
      ar: 'دفع آمن - معلوماتك محمية'
    },
    'order_summary': {
      en: 'Order Summary',
      ar: 'ملخص الطلب'
    },
    'course_price': {
      en: 'Course Price',
      ar: 'سعر الدورة'
    },
    'discount': {
      en: 'Discount',
      ar: 'خصم'
    },
    'total': {
      en: 'Total',
      ar: 'الإجمالي'
    },
    'whats_included': {
      en: 'What\'s Included',
      ar: 'ما المضمن'
    },
    'payment_breakdown': {
      en: 'Payment Breakdown',
      ar: 'تفصيل الدفع'
    },
    'instructor_earnings': {
      en: 'Instructor Earnings',
      ar: 'أرباح المدرب'
    },
    'platform_fee': {
      en: 'Platform Fee',
      ar: 'رسوم المنصة'
    },
    'money_back_guarantee': {
      en: '30-Day Money-Back Guarantee',
      ar: 'ضمان استرداد الأموال لمدة 30 يوم'
    },
    'money_back_description': {
      en: 'Not satisfied? Get a full refund within 30 days, no questions asked.',
      ar: 'غير راضٍ؟ احصل على استرداد كامل خلال 30 يومًا، بدون أي أسئلة.'
    },
    'enroll_now': {
      en: 'Enroll Now',
      ar: 'سجل الآن'
    },
    'proceed_to_payment': {
      en: 'Proceed to Payment',
      ar: 'المتابعة للدفع'
    },
    'back_to_course': {
      en: 'Back to Course',
      ar: 'العودة للدورة'
    },
    'lifetime_access': {
      en: 'Lifetime access',
      ar: 'وصول مدى الحياة'
    },
    'certificate': {
      en: 'Certificate of completion',
      ar: 'شهادة إتمام'
    },
    'lectures': {
      en: 'lectures',
      ar: 'محاضرة'
    },
    'students': {
      en: 'students',
      ar: 'طالب'
    },
    'hours': {
      en: 'h',
      ar: 'ساعة'
    },
    // ✅ إضافة مفاتيح الـ Footer المفقودة
    'terms_of_service': {
        en: 'Terms of Service',
        ar: 'شروط الخدمة'
    },
    'privacy_policy': {
        en: 'Privacy Policy',
        ar: 'سياسة الخصوصية'
    },
    'contact_us': {
        en: 'Contact Us',
        ar: 'اتصل بنا'
    }
  };

  private currentLang = new BehaviorSubject<string>('en');
  currentLang$ = this.currentLang.asObservable();

  constructor() {
    // استعادة اللغة من localStorage إذا كانت موجودة
    const savedLang = localStorage.getItem('preferredLanguage') || 'en';
    this.currentLang.next(savedLang);
  }

  setLanguage(lang: string) {
    this.currentLang.next(lang);
    localStorage.setItem('preferredLanguage', lang);
  }

  getCurrentLang(): string {
    return this.currentLang.value;
  }

  translate(key: string): string {
    const lang = this.currentLang.value;
    const translation = this.translations[key];
    
    if (!translation) {
      console.warn(`Translation missing for key: ${key}`);
      return key;
    }
    
    return translation[lang as 'en' | 'ar'] || translation['en'];
  }

  isRTL(): boolean {
    return this.currentLang.value === 'ar';
  }
}
