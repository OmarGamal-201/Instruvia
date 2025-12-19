import { ComponentFixture, TestBed } from '@angular/core/testing';

import { Enroll3Component } from './enroll3.component';

describe('Enroll3Component', () => {
  let component: Enroll3Component;
  let fixture: ComponentFixture<Enroll3Component>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [Enroll3Component]
    });
    fixture = TestBed.createComponent(Enroll3Component);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
