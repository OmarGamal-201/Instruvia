import { Component } from '@angular/core';

@Component({
  selector: 'app-enroll2',
  templateUrl: './enroll2.component.html',
  styleUrls: ['./enroll2.component.css'],
})
export class Enroll2Component {
  learnList = [
    'Build modern, responsive websites from scratch',
    'Create dynamic web applications with React',
    'Work with databases and APIs',
    'Best practices for web security',
    'Master HTML5, CSS3, and JavaScript fundamentals',
    'Understand backend development with Node.js',
    'Deploy applications to production',
    'Version control with Git and GitHub',
  ];

  instructor = {
    name: 'Dr. Sarah Johnson',
    title: 'Full Stack Developer',
    rating: 4.9,
    students: 25000,
    courses: 12,
    bio: `Sarah is a senior full-stack developer with 10+ years of experience.
She’s passionate about teaching and has helped thousands of students launch their tech careers.`,
    img: 'assets/instructor.jpg',
  };
}
