import { Component } from '@angular/core';

@Component({
  selector: 'app-nav',
  templateUrl: './nav.component.html',
  styleUrls: ['./nav.component.css'],
})
export class NavComponent {
  isOpen = false; // للمنيو بتاعة الموبايل
  isDark = false; // لحالة الدارك مود

  toggleMenu() {
    this.isOpen = !this.isOpen;
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
