import { Component } from '@angular/core';
import { ChatService, ChatMessage } from '../../services/chat.service';
interface Question {
  user: string;
  avatarLetter: string;
  avatarColorClass: string;
  question: string;
  answer: string;
  likes: number;
  isLiked: boolean; // 1. ضفنا دي عشان نتابع حالة اللايك
}

@Component({
  selector: 'app-enroll4',
  templateUrl: './enroll4.component.html',
  styleUrls: ['./enroll4.component.css'],
})
export class Enroll4Component {
  isChatOpen = false;
  txtMessage = '';
  messages: ChatMessage[] = [];

  constructor(private chatService: ChatService) {}

  ngOnInit() {
    // الاشتراك عشان يشوف الرسايل والردود
    this.chatService.currentMessages.subscribe((msgs) => {
      this.messages = msgs;
      this.scrollToBottom();
    });
  }

  toggleChat() {
    this.isChatOpen = !this.isChatOpen;
    if (this.isChatOpen) this.scrollToBottom();
  }

  send() {
    if (!this.txtMessage.trim()) return;

    // إرسال رسالة كطالب
    this.chatService.sendMessage({
      text: this.txtMessage,
      sender: 'student',
      time: new Date(),
    });
    this.txtMessage = '';
  }

  scrollToBottom() {
    setTimeout(() => {
      const body = document.querySelector('.chat-body');
      if (body) body.scrollTop = body.scrollHeight;
    }, 100);
  }
  qaList: Question[] = [
    {
      user: 'Alex Johnson',
      avatarLetter: 'A',
      avatarColorClass: 'blue',
      question: 'How do I handle responsive images in CSS?',
      answer: 'Great question! You can use the max-width: 100% property...',
      likes: 24,
      isLiked: false, // البداية مفيش لايك
    },
    {
      user: 'Maria Garcia',
      avatarLetter: 'M',
      avatarColorClass: 'purple',
      question: "What's the difference between let and const?",
      answer: 'Let allows you to reassign values, while const creates...',
      likes: 18,
      isLiked: false, // البداية مفيش لايك
    },
  ];

  // 2. دالة التعامل مع الضغط
  toggleLike(item: Question) {
    if (item.isLiked) {
      // لو كان معمول لايك، هنلغيه وننقص العدد
      item.likes--;
      item.isLiked = false;
    } else {
      // لو مش معمول، هنزود العدد ونعلم إنه عمل لايك
      item.likes++;
      item.isLiked = true;
    }
  }
}
