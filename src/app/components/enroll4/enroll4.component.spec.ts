import { ComponentFixture, TestBed } from '@angular/core/testing';

import { Enroll4Component } from './enroll4.component';

describe('Enroll4Component', () => {
  let component: Enroll4Component;
  let fixture: ComponentFixture<Enroll4Component>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [Enroll4Component]
    });
    fixture = TestBed.createComponent(Enroll4Component);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
