import { ComponentFixture, TestBed } from '@angular/core/testing';

import { RecentDashboardComponent } from './recent-dashboard.component';

describe('RecentDashboardComponent', () => {
  let component: RecentDashboardComponent;
  let fixture: ComponentFixture<RecentDashboardComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [RecentDashboardComponent]
    });
    fixture = TestBed.createComponent(RecentDashboardComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
