import { Component, OnInit } from '@angular/core';
import { ChatService, ChatMessage } from '../../services/chat.service';
import { FormsModule } from '@angular/forms';
@Component({
  selector: 'app-student-massege',
  templateUrl: './student-massege.component.html',
  styleUrls: ['./student-massege.component.css'],
})
export class StudentMassegeComponent {
  messages: ChatMessage[] = [];
  replyText = '';

  constructor(private chatService: ChatService) {}

  ngOnInit() {
    // 1. الاشتراك في السرفيس
    this.chatService.currentMessages.subscribe((msgs) => {
      console.log('🔴 Dashboard received messages:', msgs); // بص في الكونسول شوف دي هتطبع إيه
      this.messages = msgs;
    });
  }

  sendReply() {
    if (!this.replyText.trim()) return;

    const reply: ChatMessage = {
      text: this.replyText,
      sender: 'instructor',
      time: new Date(),
    };

    this.chatService.sendMessage(reply);
    this.replyText = '';
  }
}
