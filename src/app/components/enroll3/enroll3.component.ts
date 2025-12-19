import { Component } from '@angular/core';

interface Lesson {
  title: string;
  duration: string;
  locked: boolean;
  url: string; // رابط الفيديو
  completed?: boolean;
  preview?: boolean; // احتفظنا بها لو حبيت تميز الدروس المجانية
}

interface Section {
  title: string;
  lessons: Lesson[];
  isOpen: boolean;
  lessonsCount?: number;
}

@Component({
  selector: 'app-enroll3',
  templateUrl: './enroll3.component.html',
  styleUrls: ['./enroll3.component.css'],
})
export class Enroll3Component {
  // فيديو تجريبي افتراضي

  currentLesson: Lesson | null = null;
  currentSectionIndex = 0;
  currentLessonIndex = 0;

  sections: Section[] = [
    {
      title: 'Introduction to Web Development',
      isOpen: true,
      lessonsCount: 4,
      lessons: [
        {
          title: 'Course Overview & Setup',
          duration: '00:15',
          locked: false,
          preview: true,
          url: 'https://videos.pexels.com/video-files/5495845/5495845-sd_640_360_30fps.mp4',
        },
        {
          title: 'Introduction to HTML',
          duration: '00:20',
          locked: true,
          preview: true,
          url: 'https://videos.pexels.com/video-files/5495845/5495845-sd_640_360_30fps.mp4',
        },
        {
          title: 'HTML Elements & Attributes',
          duration: '00:18',
          locked: true,
          preview: true,
          url: 'https://videos.pexels.com/video-files/5495845/5495845-sd_640_360_30fps.mp4',
        },
        {
          title: 'Building Your First Webpage',
          duration: '00:25',
          locked: true,
          url: 'https://videos.pexels.com/video-files/5495845/5495845-sd_640_360_30fps.mp4',
        },
      ],
    },

    {
      title: 'CSS Fundamentals',
      isOpen: false,
      lessonsCount: 4,
      lessons: [
        {
          title: 'Introduction to CSS',
          duration: '00:12',
          locked: true,
          url: 'https://videos.pexels.com/video-files/5495843/5495843-sd_640_360_30fps.mp4', // كود CSS ملون
        },
        {
          title: 'Selectors and Properties',
          duration: '00:15',
          locked: true,
          url: 'https://videos.pexels.com/video-files/8721932/8721932-sd_640_360_25fps.mp4',
        },
        {
          title: 'Box Model & Layout',
          duration: '00:22',
          locked: true,
          url: 'https://videos.pexels.com/video-files/6994640/6994640-sd_640_360_30fps.mp4',
        },
        {
          title: 'Responsive Design',
          duration: '00:30',
          locked: true,
          url: 'https://videos.pexels.com/video-files/4443906/4443906-sd_640_360_25fps.mp4', // تصميم متجاوب
        },
      ],
    },

    {
      title: 'JavaScript Basics',
      isOpen: false,
      lessonsCount: 4,
      lessons: [
        {
          title: 'Variables and Data Types',
          duration: '00:15',
          locked: true,
          url: 'https://videos.pexels.com/video-files/5495781/5495781-sd_640_360_30fps.mp4', // كود JS سريع
        },
        {
          title: 'Functions and Scope',
          duration: '00:20',
          locked: true,
          url: 'https://videos.pexels.com/video-files/2278095/2278095-sd_640_360_30fps.mp4',
        },
        {
          title: 'DOM Manipulation',
          duration: '00:18',
          locked: true,
          url: 'https://videos.pexels.com/video-files/9669046/9669046-sd_640_360_25fps.mp4',
        },
        {
          title: 'Events and Event Handling',
          duration: '00:25',
          locked: true,
          url: 'https://videos.pexels.com/video-files/5309381/5309381-sd_640_360_25fps.mp4',
        },
      ],
    },
  ];

  constructor() {
    // تشغيل أول درس تلقائياً عند تحميل الصفحة
    if (this.sections.length > 0 && this.sections[0].lessons.length > 0) {
      this.playLesson(this.sections[0].lessons[0], 0, 0);
    }
  }

  // لفتح وقفل القائمة الجانبية (Accordion)
  toggleSection(index: number) {
    // الخيار لك: هل تريد السماح بفتح قسم واحد فقط؟ أم عدة أقسام؟
    // الكود الحالي يفتح ويغلق القسم الذي تم الضغط عليه
    this.sections[index].isOpen = !this.sections[index].isOpen;
  }

  playLesson(lesson: Lesson, secIndex: number, lessonIndex: number) {
    if (lesson.locked) {
      alert('🔒 Complete the previous lesson to unlock this one!');
      return;
    }

    this.currentLesson = lesson;
    this.currentSectionIndex = secIndex;
    this.currentLessonIndex = lessonIndex;

    // سكرول للأعلى بسلاسة عند اختيار درس جديد
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  // يتم استدعاء هذه الدالة من ملف HTML عند انتهاء الفيديو أو الضغط على زر الإكمال
  onVideoEnded() {
    if (!this.currentLesson) return;

    // 1. تعليم الدرس الحالي كمكتمل
    this.currentLesson.completed = true;

    // 2. فك قفل الدرس التالي
    this.unlockNextLesson();
  }

  unlockNextLesson() {
    const currentSec = this.sections[this.currentSectionIndex];

    // الحالة 1: هل يوجد درس تالي في نفس القسم؟
    if (this.currentLessonIndex < currentSec.lessons.length - 1) {
      const nextLesson = currentSec.lessons[this.currentLessonIndex + 1];
      nextLesson.locked = false;
      // اختياري: هل تريد تشغيل الدرس التالي تلقائياً؟
      // this.playLesson(nextLesson, this.currentSectionIndex, this.currentLessonIndex + 1);
    }
    // الحالة 2: الانتقال للقسم التالي
    else if (this.currentSectionIndex < this.sections.length - 1) {
      const nextSec = this.sections[this.currentSectionIndex + 1];

      nextSec.isOpen = true; // فتح القسم الجديد في القائمة
      nextSec.lessons[0].locked = false; // فك قفل أول درس في القسم الجديد

      // رسالة تشجيعية (اختياري)
      // alert(`Congratulations! You've unlocked the ${nextSec.title} section.`);
    }
  }
}
