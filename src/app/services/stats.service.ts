import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class DashboardService {
  // تأكد أن العناوين مطابقة للـ Routes في الباك إند عندك
  private baseUrl = 'http://localhost:5000/api';

  constructor(private http: HttpClient) {}

  // جلب بيانات الإحصائيات (الأصفار)
  getInstructorStats(): Observable<any> {
    return this.http.get(`${this.baseUrl}/dashboard/instructor`);
  }

  // إنشاء كورس جديد وترحيله لقاعدة البيانات
  createCourse(courseData: any): Observable<any> {
    return this.http.post(`${this.baseUrl}/courses`, courseData);
  }
}
