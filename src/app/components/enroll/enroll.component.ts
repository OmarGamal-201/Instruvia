import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { HttpClient } from '@angular/common/http';

@Component({
  selector: 'app-enroll',
  templateUrl: './enroll.component.html',
  styleUrls: ['./enroll.component.css'],
})
export class EnrollComponent implements OnInit {

  courseId: string | null = null;
  isLoading: boolean = true;

  // Data like the design
  course: any = {
    title: 'Complete Web Development Bootcamp 2025',
    category: 'Development',
    subtitle: 'Master modern web development from scratch. Build real-world projects with HTML, CSS, JavaScript, React, Node.js and more.',
    rating: 4.9,
    ratingsCount: 2845,
    students: 12450,
    hours: 42,
    lessons: 312,
    price: 89.99,
    instructor: 'Dr. Sarah Johnson',
    instructorImg: 'assets/instructor.jpg',
    videoThumbnail: 'assets/video-thumb.png',
  };

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private http: HttpClient
  ) {}

  ngOnInit() {
    // Get the course ID from route parameters
    this.courseId = this.route.snapshot.paramMap.get('courseId');

    if (this.courseId) {
      this.fetchCourseDetails(this.courseId);
    } else {
      this.isLoading = false;
    }
  }

  fetchCourseDetails(id: string) {
    this.isLoading = true;
    this.http.get(`http:/localhost:5000/api/courses/${id}`)
      .subscribe({
        next: (response: any) => {
          this.course = response.data || response;
          this.isLoading = false;
        },
        error: (error) => {
          console.error('Error loading course details:', error);
          this.isLoading = false;
        }
      });
  }

  enrollInCourse() {
    // Navigate to payment with the course ID
    this.router.navigate(['/payment', this.courseId || this.course._id || this.course.id]);
  }
}
