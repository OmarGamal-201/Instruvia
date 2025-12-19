import { Component } from '@angular/core';

@Component({
  selector: 'app-enroll',
  templateUrl: './enroll.component.html',
  styleUrls: ['./enroll.component.css'],
})
export class EnrollComponent {
  // Data like the design
  course = {
    title: 'Complete Web Development Bootcamp 2025',
    category: 'Development',
    subtitle:
      'Master modern web development from scratch. Build real-world projects with HTML, CSS, JavaScript, React, Node.js and more.',
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


}
