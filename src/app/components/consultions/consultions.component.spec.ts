import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ConsultionsComponent } from './consultions.component';

describe('ConsultionsComponent', () => {
  let component: ConsultionsComponent;
  let fixture: ComponentFixture<ConsultionsComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [ConsultionsComponent]
    });
    fixture = TestBed.createComponent(ConsultionsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
