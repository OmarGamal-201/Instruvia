import { ComponentFixture, TestBed } from '@angular/core/testing';

import { StudentMassegeComponent } from './student-massege.component';

describe('StudentMassegeComponent', () => {
  let component: StudentMassegeComponent;
  let fixture: ComponentFixture<StudentMassegeComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [StudentMassegeComponent]
    });
    fixture = TestBed.createComponent(StudentMassegeComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
