import { Component, OnInit, OnDestroy, ChangeDetectorRef, NgZone } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { TranslationService } from 'src/app/servicestow/translation.service';
import { ThemeService } from 'src/app/servicestow/theme.service';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule, FormBuilder, FormGroup, Validators, AbstractControl } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { HttpClient, HttpClientModule } from '@angular/common/http';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { TranslatePipe } from 'src/app/pipes/translate.pipe';
// import { environment } from 'src/environments/environment.development';
import { FooterComponent } from '../footer/footer.component';
import { NavComponent } from '../nav/nav.component';
@Component({
  selector: 'app-payment2',
  templateUrl: './payment2.component.html',
  styleUrls: ['./payment2.component.css'],
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule, RouterModule, HttpClientModule]
})
export class Payment2Component implements OnInit, OnDestroy {
  paymentForm: FormGroup;
  currentTheme: 'light' | 'dark' = 'light';
  private isNotificationActive = false;
  private notificationQueue: {message: string, type: 'success' | 'error' | 'info'}[] = [];

  transactionId: string = '';
  paymentMethods = [
    { id: 'card', name: 'CREDIT_CARD', icon: '💳', description: 'CREDIT_CARD_DESC' },
    { id: 'paypal', name: 'PAYPAL', icon: '💰', description: 'PAYPAL_DESC' }
  ];

  selectedMethod = 'card';
  isProcessing = false;
  paymentComplete = false;
  sandboxMode = true;
  courseId: string | null = null;

  // Dynamic data that updates after API call
  paymentData = { totalAmount: 0, instructorEarnings: 0, platformFee: 0, currency: 'USD' };

  testCards = [
    { number: '4242 4242 4242 4242', type: 'Visa', expiry: '12/28', cvv: '123' },
    { number: '5555 5555 5555 4444', type: 'Mastercard', expiry: '03/27', cvv: '456' }
  ];

  selectedTestCard = this.testCards[0];
  private destroy$ = new Subject<void>();
  private paypalMessageListener: ((event: MessageEvent) => void) | null = null;

  constructor(
    private fb: FormBuilder,
    private router: Router,
    private route: ActivatedRoute,
    private translationService: TranslationService,
    private themeService: ThemeService,
    private http: HttpClient,
    private cd: ChangeDetectorRef,
    private zone: NgZone
  ) {
    this.paymentForm = this.fb.group({
      cardNumber: ['', [Validators.required, Payment2Component.cardNumberValidator]],
      expiryDate: ['', [Validators.required, Payment2Component.expiryDateValidator]],
      cvv: ['', [Validators.required, Validators.pattern(/^[0-9]{3,4}$/)]],
      cardHolder: ['', [Validators.required, Validators.minLength(2), Validators.maxLength(50)]]
    });
  }

  get currentAppLang(): string { return 'en'; } // Forced English for this version

  ngOnInit(): void {
    this.courseId = this.route.snapshot.paramMap.get('id');

    // Fetch dynamic course data from Backend
    if (this.courseId) {
      this.http.get(`localhost:5000/api/courses/${this.courseId}`)
        .pipe(takeUntil(this.destroy$))
        .subscribe({
          next: (data: any) => {
            this.paymentData = {
              totalAmount: data.price || 89.99,
              instructorEarnings: (data.price || 89.99) * 0.8,
              platformFee: (data.price || 89.99) * 0.2,
              currency: data.currency || 'USD'
            };
            this.cd.detectChanges();
          },
          error: () => {
             // Fallback default data
             this.paymentData = { totalAmount: 89.99, instructorEarnings: 71.99, platformFee: 18, currency: 'USD' };
          }
        });
    }

    if (this.sandboxMode) this.autoFillTestData();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
    if (this.paypalMessageListener) window.removeEventListener('message', this.paypalMessageListener);
  }

  toggleSandboxMode(): void {
    this.sandboxMode = !this.sandboxMode;
    if (this.sandboxMode) this.autoFillTestData();
    else this.paymentForm.reset();
  }

  selectTestCard(card: any): void {
    this.selectedTestCard = card;
    this.autoFillTestData();
  }

  copyCardData(): void {
    navigator.clipboard.writeText(this.selectedTestCard.number).then(() => {
      this.showNotification("Card Number Copied ✅", 'info');
    });
  }

  formatCardNumber(e: any): void {
    let v = e.target.value.replace(/\s+/g, '');
    this.paymentForm.get('cardNumber')?.setValue(v.match(/.{1,4}/g)?.join(' ') || v, { emitEvent: false });
  }

  formatExpiryDate(e: any): void {
    let v = e.target.value.replace(/\D/g, '');
    if (v.length >= 2) v = v.substring(0, 2) + '/' + v.substring(2, 4);
    this.paymentForm.get('expiryDate')?.setValue(v, { emitEvent: false });
  }

  isControlInvalid(name: string): boolean {
    const c = this.paymentForm.get(name);
    return !!(c && c.invalid && c.touched);
  }

  getFormControlErrors(name: string): string[] {
    const control = this.paymentForm.get(name);
    const errors: string[] = [];
    if (control?.errors) {
      if (control.errors['required']) errors.push("Required");
      if (control.errors['invalidLength']) errors.push("Incomplete Number");
    }
    return errors;
  }

  getCurrentDate(): string {
    return new Date().toLocaleDateString('en-US');
  }

  showNotification(message: string, type: 'success' | 'error' | 'info'): void {
    if (this.isNotificationActive) { this.notificationQueue.push({ message, type }); return; }
    this.isNotificationActive = true;
    const notification = document.createElement('div');
    const gradient = type === 'error' ? 'linear-gradient(135deg, #ff4b2b, #ff416c)' : 'linear-gradient(135deg, #6e8efb, #a777e3)';
    notification.style.cssText = `position:fixed; top:20px; right:20px; padding:16px 28px; border-radius:12px; z-index:10000; color:white; background:${gradient}; transition:all 0.5s ease; font-family: sans-serif; box-shadow: 0 10px 15px rgba(0,0,0,0.2);`;
    notification.innerHTML = message;
    document.body.appendChild(notification);
    setTimeout(() => {
      if (notification.parentNode) document.body.removeChild(notification);
      this.isNotificationActive = false;
      if (this.notificationQueue.length > 0) {
        const next = this.notificationQueue.shift();
        if (next) this.showNotification(next.message, next.type);
      }
    }, 3000);
  }

  markFormGroupTouched(g: FormGroup): void {
    Object.values(g.controls).forEach(c => c.markAsTouched());
  }

  processPayment(): void {
    if (!this.sandboxMode && this.paymentForm.invalid && this.selectedMethod === 'card') {
      this.markFormGroupTouched(this.paymentForm);
      this.showNotification("Please complete payment details correctly", 'error');
      return;
    }

    if (this.selectedMethod === 'paypal') {
      this.processPayPalPayment();
      return;
    }

    this.isProcessing = true;
    this.http.post(`localhost:5000/api/payments/process`, {
      courseId: this.courseId,
      amount: this.paymentData.totalAmount
    })
    .pipe(takeUntil(this.destroy$))
    .subscribe({
      next: () => {
        this.isProcessing = false;
        this.transactionId = this.generateTransactionId();
        this.paymentComplete = true;
        this.showNotification("Payment Successful ✅", 'success');
        this.cd.detectChanges();
      },
      error: () => {
        this.isProcessing = false;
        this.showNotification("Payment Failed. Please try again.", 'error');
      }
    });
  }

  processPayPalPayment(): void {
    const paypalWindow = window.open('', '_blank', 'width=500,height=600');
    if (!paypalWindow) {
      this.showNotification("Popup blocked! Please allow popups for this site.", "error");
      return;
    }

    const { totalAmount, currency } = this.paymentData;

    const html = `
      <!DOCTYPE html>
      <html>
      <head>
        <title>PayPal Integration</title>
        <style>
          body { margin: 0; padding: 0; font-family: 'Segoe UI', sans-serif; background: linear-gradient(135deg, #8e73d6 0%, #1f2937 100%); display: flex; justify-content: center; align-items: center; height: 100vh; color: white; overflow: hidden; }
          .card { background: rgba(255, 255, 255, 0.1); backdrop-filter: blur(15px); padding: 40px; border-radius: 30px; text-align: center; width: 85%; max-width: 380px; box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.5); border: 1px solid rgba(255, 255, 255, 0.1); }
          .paypal-logo { width: 130px; margin-bottom: 25px; }
          .icon-box { font-size: 2.5rem; margin-bottom: 15px; }
          h2 { margin: 10px 0; font-size: 1.4rem; font-weight: 700; }
          p { color: #d1d5db; font-size: 0.95rem; margin-bottom: 30px; }
          .price { font-size: 2.5rem; font-weight: 800; color: #fbbf24; margin-bottom: 35px; }
          .btn-group { display: flex; gap: 15px; }
          button { padding: 14px 20px; border-radius: 16px; border: none; font-weight: 700; cursor: pointer; transition: 0.3s; flex: 1; }
          .btn-pay { background: #fbbf24; color: #111827; }
          .btn-pay:hover { background: #f59e0b; transform: translateY(-2px); }
          .btn-back { background: rgba(255, 255, 255, 0.2); color: white; }
          .btn-back:hover { background: rgba(255, 255, 255, 0.3); }
        </style>
      </head>
      <body>
        <div class="card">
          <img src="https://upload.wikimedia.org/wikipedia/commons/b/b5/PayPal.svg" class="paypal-logo">
          <div class="icon-box">💰</div>
          <h2>PayPal Checkout</h2>
          <p>Secure Demo Sandbox Payment</p>
          <div class="price">${totalAmount} ${currency}</div>
          <div class="btn-group">
            <button class="btn-pay" onclick="window.opener.postMessage('payment_success','*');window.close()">Pay Now</button>
            <button class="btn-back" onclick="window.close()">Cancel</button>
          </div>
        </div>
      </body>
      </html>
    `;

    paypalWindow.document.write(html);
    paypalWindow.document.close();

    this.paypalMessageListener = (e: MessageEvent) => {
      if (e.data === 'payment_success') {
        this.zone.run(() => {
          this.transactionId = this.generateTransactionId();
          this.paymentComplete = true;
          this.showNotification("Paid via PayPal Successfully ✅", 'success');
          this.cd.detectChanges();
        });
      }
    };
    window.addEventListener('message', this.paypalMessageListener);
  }

  generateTransactionId(): string {
    return 'TXN-' + Math.random().toString(36).substr(2, 9).toUpperCase();
  }

  autoFillTestData(): void {
    this.paymentForm.patchValue({
      cardNumber: this.selectedTestCard.number,
      expiryDate: '12/28',
      cvv: '123',
      cardHolder: 'JON DOE'
    });
  }

  static cardNumberValidator(c: AbstractControl) {
    return c.value?.replace(/\s/g, '').length >= 13 ? null : { invalidLength: true };
  }

  static expiryDateValidator(c: AbstractControl) {
    return /^(0[1-9]|1[0-2])\/?([0-9]{2})$/.test(c.value) ? null : { invalidFormat: true };
  }
}
