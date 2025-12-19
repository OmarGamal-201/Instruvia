import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
// import { environment } from 'src/environments/environment.development';
@Injectable({ providedIn: 'root' })
export class CourseService {
  private apiUrl = `http://localhost:5000/api/courses`;

  constructor(private http: HttpClient) {}

  getCourses(category?: string): Observable<any> {
    let params = new HttpParams();
    if (category && category !== 'all') {
      params = params.set('category', category);
    }
    return this.http.get(this.apiUrl, { params });
  }
}
