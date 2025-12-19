import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { NgModel, ReactiveFormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { HttpClientModule, HTTP_INTERCEPTORS } from '@angular/common/http';
import { FormsModule } from '@angular/forms';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { RegisterComponent } from './components/register/register.component';
import { AuthService } from './services/auth.service';
import { AuthInterceptor } from './services/auth-interceptor.service';
import { AuthGuard } from './services/auth-guard.service';
import { DashboardComponent } from './components/dashboard/dashboard.component';
import { ConsultionsComponent } from './components/consultions/consultions.component';
import { ProfileComponent } from './components/profile/profile.component';
import { LoginComponent } from './components/login/login.component';
import { HomeComponent } from './components/home/home.component';
import { CoursesComponent } from './components/courses/courses.component';
import { AboutComponent } from './components/about/about.component';
import { Page1Component } from './components/page1/page1.component';
import { Page2Component } from './components/page2/page2.component';
import { Page3Component } from './components/page3/page3.component';
import { Page4Component } from './components/page4/page4.component';
import { Page5Component } from './components/page5/page5.component';
import { SummaryComponent } from './components/summary/summary.component';
import { EnrollComponent } from './components/enroll/enroll.component';
import { Enroll2Component } from './components/enroll2/enroll2.component';
import { Enroll3Component } from './components/enroll3/enroll3.component';
import { Enroll4Component } from './components/enroll4/enroll4.component';
import { AdmindashboardComponent } from './components/admindashboard/admindashboard.component';
import { InstructordashboardComponent } from './components/instructordashboard/instructordashboard.component';
import { MonthlyEarningComponent } from './components/monthly-earning/monthly-earning.component';
import { QuickActionsComponent } from './components/quick-actions/quick-actions.component';
import { StatsCardComponent } from './components/stats-card/stats-card.component';
import { StudentMassegeComponent } from './components/student-massege/student-massege.component';
import { RecentDashboardComponent } from './components/recent-dashboard/recent-dashboard.component';
import { CourseTableComponent } from './components/course-table/course-table.component';


@NgModule({
  declarations: [
    AppComponent,
    RegisterComponent,
    DashboardComponent,
    ConsultionsComponent,
    ProfileComponent,
    LoginComponent,
    HomeComponent,
    CoursesComponent,
    AboutComponent,
    Page1Component,
    Page2Component,
    Page3Component,
    Page4Component,
    Page5Component,
    SummaryComponent,
    EnrollComponent,
    Enroll2Component,
    Enroll3Component,
    Enroll4Component,
    AdmindashboardComponent,
    InstructordashboardComponent,
    MonthlyEarningComponent,
    QuickActionsComponent,
    StatsCardComponent,
    StudentMassegeComponent,
    RecentDashboardComponent,
    CourseTableComponent,
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    ReactiveFormsModule,
    CommonModule,
    HttpClientModule,
    FormsModule,

  ],
  providers: [
    AuthService,
    AuthGuard,
    {
      provide: HTTP_INTERCEPTORS,
      useClass: AuthInterceptor,
      multi: true
    }
  ],
  bootstrap: [AppComponent]
})
export class AppModule { }
