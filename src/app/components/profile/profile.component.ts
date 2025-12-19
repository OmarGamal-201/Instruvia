import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators, AbstractControl } from '@angular/forms';
import { ProfileService, InstructorApplicationRequest } from '../../services/profile.service';

@Component({
  selector: 'app-profile',
  templateUrl: './profile.component.html',
  styleUrls: ['./profile.component.css'],
})
export class ProfileComponent implements OnInit {
  // ================= BASIC STATE =================
  currentLang: 'en' | 'ar' = 'en';
  isEditing = false;
  showInstructorModal = false;
  showPasswordModal = false;

  showCurrentPassword = false;
  showNewPassword = false;
  showConfirmPassword = false;

  profileForm!: FormGroup;
  passwordForm!: FormGroup;
  instructorForm!: FormGroup;

  user: any;

  // Instructor application state
  isSubmitting = false;
  applicationError = '';
  applicationSuccess = '';

  successMessage = '';
  errorMessage = '';

  // ================= TRANSLATIONS =================
  translations: any = {
    en: {
      name: 'Full Name',
      email: 'Email',
      phone: 'Phone',
      bio: 'Bio',
      specialization: 'Specialization',
      edit: 'Edit Profile',
      save: 'Save',
      cancel: 'Cancel',
      changePassword: 'Change Password',
      updatePassword: 'Update Password',
      required: 'This field is required',
      invalidEmail: 'Invalid email address',
      minLength: 'Minimum length is',
      passwordMismatch: 'Passwords do not match',
      instructorBadge: 'Instructor',
      beInstructor: 'Become Instructor',
      becomeInstructorTitle: 'Become an Instructor',
      becomeInstructorDesc: 'Share your knowledge and earn by teaching others',
      reason1: 'Create and sell your own courses',
      reason2: 'Build your professional reputation',
      reason3: 'Flexible schedule and income',
      reason4: 'Join a community of expert instructors',
      close: 'Close',
      apply: 'Apply Now',
      personalInfo: 'Personal Information',
      memberSince: 'Member since',
      changePasswordTitle: 'Change Password',
      currentPassword: 'Current Password',
      newPassword: 'New Password',
      confirmPassword: 'Confirm Password',
      bioLabel: 'Tell us about yourself',
      bioPlaceholder: 'Share your teaching experience, expertise, and why you want to become an instructor...',
      bioRequired: 'Bio is required',
      bioMinLength: 'Bio must be at least 50 characters',
      specializationLabel: 'Specialization',
      specializationPlaceholder: 'e.g., Web Development, Data Science, Design...',
      specializationRequired: 'Specialization is required',
      documentsLabel: 'Supporting Documents',
      documentsPlaceholder: 'Add documents',
      documentsHint: 'e.g., Portfolio, certificates, LinkedIn profile',
      submitting: 'Submitting...',
    },
    ar: {
      name: 'الاسم',
      email: 'البريد الإلكتروني',
      phone: 'الهاتف',
      bio: 'نبذة',
      specialization: 'التخصص',
      edit: 'تعديل',
      save: 'حفظ',
      cancel: 'إلغاء',
      changePassword: 'تغيير كلمة المرور',
      updatePassword: 'تحديث كلمة المرور',
      required: 'هذا الحقل مطلوب',
      invalidEmail: 'بريد إلكتروني غير صالح',
      minLength: 'الحد الأدنى',
      passwordMismatch: 'كلمتا المرور غير متطابقتين',
      instructorBadge: 'مدرب',
      beInstructor: 'كن مدرباً',
      becomeInstructorTitle: 'كن مدرباً',
      becomeInstructorDesc: 'شارك معرفتك واكسب من خلال التدريس',
      reason1: 'أنشئ وبع دوراتك الخاصة',
      reason2: 'ابنِ سمعتك المهنية',
      reason3: 'جدول مرن ودخل',
      reason4: 'انضم لمجتمع المدربين الخبراء',
      close: 'إغلاق',
      apply: 'تقديم الآن',
      personalInfo: 'المعلومات الشخصية',
      memberSince: 'عضو منذ',
      changePasswordTitle: 'تغيير كلمة المرور',
      currentPassword: 'كلمة المرور الحالية',
      newPassword: 'كلمة المرور الجديدة',
      confirmPassword: 'تأكيد كلمة المرور',
      bioLabel: 'أخبرنا عن نفسك',
      bioPlaceholder: 'شارك خبرتك التدريسية ومهاراتك ولماذا تريد أن تصبح مدرباً...',
      bioRequired: 'النبذة مطلوبة',
      bioMinLength: 'يجب أن تكون النبذة 50 حرفاً على الأقل',
      specializationLabel: 'التخصص',
      specializationPlaceholder: 'مثال: تطوير الويب، علوم البيانات، التصميم...',
      specializationRequired: 'التخصص مطلوب',
      documentsLabel: 'المستندات الداعمة',
      documentsPlaceholder: 'أضف المستندات',
      documentsHint: 'مثال: معرض الأعمال، الشهادات، ملف LinkedIn',
      submitting: 'جاري الإرسال...',
    },
  };
  selectedFiles: any;
  constructor(
    private fb: FormBuilder,
    private profileService: ProfileService,
  ) { }

  // ================= INIT =================
  ngOnInit(): void {
    this.initProfileForm();
    this.initPasswordForm();
    this.initInstructorForm();
    this.loadUser();
  }

  // ================= FORMS =================
  initProfileForm() {
    this.profileForm = this.fb.group({
      name: ['', [Validators.required, Validators.minLength(3)]],
      email: [{ value: '', disabled: true }],
      phone: ['', Validators.required],
      bio: [''],
      specialization: [''],
    });
  }

  initPasswordForm() {
    this.passwordForm = this.fb.group(
      {
        currentPassword: ['', Validators.required],
        newPassword: ['', [Validators.required, Validators.minLength(6)]],
        confirmPassword: ['', Validators.required],
      },
      { validators: this.passwordMatch }
    );
  }

  initInstructorForm() {
    this.instructorForm = this.fb.group({
      bio: ['', [Validators.required, Validators.minLength(10)]],
      specialization: ['', Validators.required],
      documents: ['']
    });
  }

  passwordMatch(group: FormGroup) {
    return group.get('newPassword')?.value === group.get('confirmPassword')?.value
      ? null
      : { passwordMismatch: true };
  }

  // ================= LOAD USER =================
  loadUser() {
    this.profileService.getUserData().subscribe((res) => {
      this.user = res.user;
      this.profileForm.patchValue(this.user);
    });
  }

  // ================= PROFILE ACTIONS =================
  toggleEdit() {
    this.isEditing = !this.isEditing;
    if (!this.isEditing) {
      this.profileForm.patchValue(this.user);
    }
  }

  saveProfile() {
    try {
      if (this.profileForm.invalid) {
        console.log(this.errorMessage);
        return;
      }
      const { name, bio, phone, specialization } = this.profileForm.getRawValue();

      this.profileService.updateProfile(name, bio, phone, specialization).subscribe((res) => {
        console.log("Saved");
        this.user = res.user;
        console.log(this.user);
        this.isEditing = false;
      });
    } catch (error) {
      console.log(error);
    }
  }

  // ================= PASSWORD =================
  openPasswordModal() {
    this.showPasswordModal = true;
  }

  closePasswordModal() {
    this.showPasswordModal = false;
    this.passwordForm.reset();
  }

  changePassword() {
    if (this.passwordForm.invalid) return;

    const { currentPassword, newPassword } = this.passwordForm.value;
    this.profileService.changePassword(currentPassword, newPassword).subscribe(() => {
      this.closePasswordModal();
    });
  }

  togglePasswordVisibility(type: 'current' | 'new' | 'confirm') {
    if (type === 'current') this.showCurrentPassword = !this.showCurrentPassword;
    if (type === 'new') this.showNewPassword = !this.showNewPassword;
    if (type === 'confirm') this.showConfirmPassword = !this.showConfirmPassword;
  }

  // ================= INSTRUCTOR =================
  openInstructorModal() {
    this.showInstructorModal = true;
    this.resetInstructorForm();
  }

  closeInstructorModal() {
    this.showInstructorModal = false;
    this.resetInstructorForm();
  }

  resetInstructorForm() {
    this.instructorForm.reset();
    this.applicationError = '';
    this.applicationSuccess = '';
    this.isSubmitting = false;
  }

    onFilesSelected(event: Event) {
    const input = event.target as HTMLInputElement;
    if (!input.files) return;

    this.selectedFiles = Array.from(input.files);


    // Reset input to allow selecting same file again
    input.value = '';
  }

  removeFile(index: number) {
    this.selectedFiles.splice(index, 1);
  }
  submitInstructorApplication() {
    if (this.instructorForm.invalid) {
      this.markFormGroupTouched(this.instructorForm);
      return;
    }

    this.isSubmitting = true;
    this.applicationError = '';
    this.applicationSuccess = '';

    const formValue = this.instructorForm.value;

    const applicationData: InstructorApplicationRequest = {
      bio: formValue.bio,
      specialization: formValue.specialization,
      documents: this.selectedFiles.length > 0 ? this.selectedFiles : undefined
    };

    this.profileService.applyForInstructor(applicationData).subscribe({
      next: (response) => {
        this.isSubmitting = false;
        this.applicationSuccess = response.message;

        setTimeout(() => {
          this.closeInstructorModal();
          this.loadUser();
        }, 500);
      },
      error: (error) => {
        this.isSubmitting = false;
        this.applicationError =
          error.error?.message ||
          'Failed to submit application. Please try again.';
      }
    });
  }

  // Backward compatibility with existing button
  applyAsInstructor() {
    this.submitInstructorApplication();
  }

  // Helper method to mark all fields as touched for validation
  private markFormGroupTouched(formGroup: FormGroup): void {
    Object.keys(formGroup.controls).forEach(key => {
      const control = formGroup.get(key);
      control?.markAsTouched();

      if (control instanceof FormGroup) {
        this.markFormGroupTouched(control);
      }
    });
  }

  // ================= HELPERS =================
  switchLanguage(lang: 'en' | 'ar') {
    this.currentLang = lang;
  }

  get t() {
    return this.translations[this.currentLang];
  }

  get isRTL() {
    return this.currentLang === 'ar';
  }

  // ================= FORM CONTROLS =================
  get nameControl() {
    return this.profileForm.get('name');
  }

  get phoneControl() {
    return this.profileForm.get('phone');
  }

  get currentPasswordControl() {
    return this.passwordForm.get('currentPassword');
  }

  get newPasswordControl() {
    return this.passwordForm.get('newPassword');
  }

  get confirmPasswordControl() {
    return this.passwordForm.get('confirmPassword');
  }

  // Instructor form controls
  get instructorBioControl() {
    return this.instructorForm.get('bio');
  }

  get instructorSpecializationControl() {
    return this.instructorForm.get('specialization');
  }

  // ================= ERROR MESSAGES =================
  getNameError() {
    if (this.nameControl?.hasError('required')) return this.t.required;
    if (this.nameControl?.hasError('minlength'))
      return `${this.t.minLength} 3`;
    return '';
  }

  getPhoneError() {
    if (this.phoneControl?.hasError('required')) return this.t.required;
    return '';
  }

  getPasswordError(control: AbstractControl | null) {
    if (!control) return '';
    if (control.hasError('required')) return this.t.required;
    if (control.hasError('minlength')) return `${this.t.minLength} 6`;
    return '';
  }

  getConfirmPasswordError() {
    if (this.passwordForm.hasError('passwordMismatch'))
      return this.t.passwordMismatch;
    return this.t.required;
  }

  // Instructor form error messages
  getInstructorBioError() {
    if (this.instructorBioControl?.hasError('required')) return this.t.bioRequired;
    if (this.instructorBioControl?.hasError('minlength')) return this.t.bioMinLength;
    return '';
  }

  getInstructorSpecializationError() {
    if (this.instructorSpecializationControl?.hasError('required')) return this.t.specializationRequired;
    return '';
  }
}
