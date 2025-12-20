import { Component } from '@angular/core';
import { InstructorService } from 'src/app/services/instructor.service';

@Component({
  selector: 'app-quick-actions',
  templateUrl: './quick-actions.component.html',
  styleUrls: ['./quick-actions.component.css'],
})
export class QuickActionsComponent {
  activeModal: string | null = null;
  isLoading: boolean = false;

  // FIXED: Added all required fields for course creation
  courseForm = {
    title: '',
    description: '',
    category: 'Programming', // Default category
    level: 'beginner', // Default level
    price: 0,
    duration: 0,
    language: 'en', // Default language
    requirements: [] as string[],
    whatYouWillLearn: [] as string[],
    tags: [] as string[]
  };

  availabilityForm = {
    date: '',
    startTime: '',
    endTime: ''
  };

  uploadForm = {
    courseId: '',
    file: null
  };

  // Available categories and levels
  categories = [
    'Programming', 'Design', 'Business', 'Marketing',
    'Photography', 'Music', 'Data Science', 'Personal Development',
    'Health & Fitness', 'Language', 'Academic', 'Other'
  ];

  levels = ['beginner', 'intermediate', 'advanced'];

  actions = [
    { icon: '📘', label: 'Create New Course', id: 'create', active: true },
    { icon: '📅', label: 'Set Availability', id: 'availability', active: false },
    { icon: '📤', label: 'Upload Content', id: 'upload', active: false },
  ];

  constructor(private instructorService: InstructorService) {}

  onActionClick(item: any) {
    this.activeModal = item.id;
  }

  closeModal() {
    this.activeModal = null;
    this.resetForms();
  }

  resetForms() {
    this.courseForm = {
      title: '',
      description: '',
      category: 'Programming',
      level: 'beginner',
      price: 0,
      duration: 0,
      language: 'en',
      requirements: [],
      whatYouWillLearn: [],
      tags: []
    };
  }

  // FIXED: Proper validation and error handling
  publishCourse() {
    // Validate required fields
    if (!this.courseForm.title || !this.courseForm.description) {
      alert('Please fill in all required fields (Title and Description)');
      return;
    }

    if (this.courseForm.price < 0) {
      alert('Price cannot be negative');
      return;
    }

    this.isLoading = true;

    // Prepare course data
    const courseData = {
      ...this.courseForm,
      status: 'draft' as const // Create as draft initially
    };

    console.log('Creating course with data:', courseData);

    this.instructorService.createCourse(courseData).subscribe({
      next: (response) => {
        console.log('Course created successfully:', response);
        alert(`Course "${response.course.title}" Created Successfully! 🎉`);
        this.isLoading = false;
        this.closeModal();
      },
      error: (error) => {
        console.error('Error creating course:', error);
        this.isLoading = false;

        // Handle different error scenarios
        if (error.status === 401) {
          alert('Please login first to create a course');
        } else if (error.status === 403) {
          alert('Only approved instructors can create courses');
        } else if (error.status === 400) {
          alert(`Validation error: ${error.error.message || 'Please check your input'}`);
        } else {
          alert(`Error creating course: ${error.error?.message || 'Please try again'}`);
        }
      }
    });
  }

  saveAvailability() {
    if (!this.availabilityForm.date || !this.availabilityForm.startTime || !this.availabilityForm.endTime) {
      alert('Please fill in all availability fields');
      return;
    }

    console.log('Availability data:', this.availabilityForm);
    alert('Availability Saved!');
    this.closeModal();
  }

  uploadFile() {
    if (!this.uploadForm.courseId || !this.uploadForm.file) {
      alert('Please select a course and file');
      return;
    }

    console.log('Uploading file:', this.uploadForm);
    alert('File Uploaded!');
    this.closeModal();
  }

  // Helper method to handle file selection
  onFileSelected(event: any) {
    const file = event.target.files[0];
    if (file) {
      this.uploadForm.file = file;
    }
  }
}
