import { Injectable, NgZone } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

// تعريف شكل الرسالة
export interface ChatMessage {
  text: string;
  sender: 'student' | 'instructor';
  time: Date;
}

@Injectable({
  providedIn: 'root',
})
export class ChatService {
  // المفتاح ده لازم يكون هو هو في الملفين عشان يشوفوا بعض
  private STORAGE_KEY = 'course_chat';

  // مخزن الرسائل
  private messagesSource = new BehaviorSubject<ChatMessage[]>([]);
  currentMessages = this.messagesSource.asObservable();

  // بنستخدم NgZone عشان نضمن ان الصفحة تتحدث لما رسالة تيجي
  constructor(private ngZone: NgZone) {
    // 1. تحميل الرسائل القديمة أول ما الموقع يفتح
    this.loadFromStorage();

    // 2. الاستماع لأي تغيير يحصل في المتصفح (من التبويب التاني)
    if (typeof window !== 'undefined') {
      window.addEventListener('storage', (event) => {
        if (event.key === this.STORAGE_KEY) {
          // NgZone.run: بتقول لأنجولار "اصحي فيه داتا اتغيرت"
          this.ngZone.run(() => {
            this.loadFromStorage();
          });
        }
      });
    }
  }

  // دالة الإرسال
  sendMessage(msg: ChatMessage) {
    const currentMsgs = this.messagesSource.value;
    const updatedMsgs = [...currentMsgs, msg];

    // تحديث المتغير الداخلي
    this.messagesSource.next(updatedMsgs);

    // الحفظ في المتصفح (عشان يسمع عند الطرف التاني)
    localStorage.setItem(this.STORAGE_KEY, JSON.stringify(updatedMsgs));
  }

  // دالة التحميل من الذاكرة
  private loadFromStorage() {
    const saved = localStorage.getItem(this.STORAGE_KEY);
    if (saved) {
      this.messagesSource.next(JSON.parse(saved));
    }
  }
}
