import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MonthlyEarningComponent } from './monthly-earning.component';

describe('MonthlyEarningComponent', () => {
  let component: MonthlyEarningComponent;
  let fixture: ComponentFixture<MonthlyEarningComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [MonthlyEarningComponent]
    });
    fixture = TestBed.createComponent(MonthlyEarningComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
