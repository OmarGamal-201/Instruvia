import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
interface UserProfile {
  name: string;
  email: string;
  phone: string;
  bio: string;
  avatar: string;
  joinDate: string;
  isInstructor: boolean;
}
export interface InstructorApplicationRequest {
  bio: string;
  specialization: string;
  documents?: File[];
}

export interface InstructorApplicationResponse {
  success: boolean;
  message: string;
  application: {
    id: string;
    status: string;
    submittedAt: Date;
  };
}
@Injectable({
  providedIn: 'root'
})
export class ProfileService {
  private apiUrl = `http://localhost:5000/api`;
  constructor(private http: HttpClient) { }
  getUserData(): Observable<{ success: boolean; user: UserProfile }> {
    return this.http.get<{ success: boolean; user: UserProfile }>(
      `${this.apiUrl}/auth/me`
    );
  }
  changePassword(
    currentPassword: string,
    newPassword: string
  ): Observable<{ success: boolean; message: string }> {
    return this.http.put<{ success: boolean; message: string }>(
      `${this.apiUrl}/users/password`,
      {
        currentPassword,
        newPassword
      }
    );
  }
  updateProfile(
    name: string,
    bio: string,
    phone: string,
    specialization: string
  ): Observable<{ success: boolean; message: string; user: UserProfile }> {
    return this.http.put<{ success: boolean; message: string; user: UserProfile }>(
      `${this.apiUrl}/users/profile`,
      { name, bio, specialization, phone }
    );
  }
  applyForInstructor(
    data: InstructorApplicationRequest
  ): Observable<InstructorApplicationResponse> {

    const token = localStorage.getItem('authToken');

    // ✅ build FormData instead of JSON
    const formData = new FormData();
    formData.append('bio', data.bio);
    formData.append('specialization', data.specialization);

    if (data.documents) {
      data.documents.forEach((file) => {
        formData.append('documents', file);
      });
    }

    // ❌ DO NOT set Content-Type for FormData
    const headers = new HttpHeaders({
      'Authorization': `Bearer ${token}`
    });

    return this.http.post<InstructorApplicationResponse>(
      `${this.apiUrl}/instructor/apply`,
      formData,
      { headers }
    );
  }

}
