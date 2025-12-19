import { Component } from '@angular/core';
import { DashboardService } from 'src/app/services/stats.service';

@Component({
  selector: 'app-quick-actions',
  templateUrl: './quick-actions.component.html',
  styleUrls: ['./quick-actions.component.css'],
})
export class QuickActionsComponent {
  activeModal: string | null = null; // بيحدد أي شباك مفتوح

  // بيانات فورم الكورس (رجعت زي الأول)
  courseForm = {
    title: '',
    price: null,
    duration: null,
    description: '',
  };

  availabilityForm = { date: '', startTime: '', endTime: '' };
  uploadForm = { courseId: '', file: null };

  // قائمة الأزرار (بدون Questions)
  actions = [
    { icon: '📘', label: 'Create New Course', id: 'create', active: true },
    {
      icon: '📅',
      label: 'Set Availability',
      id: 'availability',
      active: false,
    },
    { icon: '📤', label: 'Upload Content', id: 'upload', active: false },
  ];

  constructor(private dashService: DashboardService) {}

  onActionClick(item: any) {
    this.activeModal = item.id;
  }

  closeModal() {
    this.activeModal = null;
  }

  // وظيفة Publish المرتبطة بالباك
  publishCourse() {
    this.dashService.createCourse(this.courseForm).subscribe({
      next: (res) => {
        alert('Course Created Successfully! 🎉');
        this.closeModal();
      },
      error: (err) => alert('Error creating course login first'),
    });
  }

  saveAvailability() {
    console.log('Availability data:', this.availabilityForm);
    alert('Availability Saved!');
    this.closeModal();
  }

  uploadFile() {
    alert('File Uploaded!');
    this.closeModal();
  }
}
