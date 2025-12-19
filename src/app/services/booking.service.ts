import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class BookingService {
  private storage = new BehaviorSubject<any>({
    consultation: null,
    date: null,
    time: null,
    fullName: '',
    email: '',
    phone: '',
    notes: '',
    consultationFee: 0,
    platformFee: 0,
    total: 0,
  });

  bookingData$ = this.storage.asObservable();

  updateData(newData: any) {
    const current = this.storage.value;
    const updated = { ...current, ...newData };

    if (updated.consultation) {
      updated.consultationFee = updated.consultation.price;
      updated.platformFee = Math.round(updated.consultation.price * 0.2);
      updated.total = updated.consultationFee + updated.platformFee;
    }
    this.storage.next(updated);
  }

  getSnapshot() {
    return this.storage.value;
  }
}
