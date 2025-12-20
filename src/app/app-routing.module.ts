import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { RegisterComponent } from './components/register/register.component';
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
import { AdmindashboardComponent } from './components/admindashboard/admindashboard.component';
import { InstructordashboardComponent } from './components/instructordashboard/instructordashboard.component';


const routes: Routes = [
  { path: '', redirectTo: '/home', pathMatch: 'full' },
  { path: 'register', component: RegisterComponent },
  { path: 'dashboard', component: DashboardComponent,canActivate: [AuthGuard],},
  { path: 'consultions', component: ConsultionsComponent,canActivate: [AuthGuard], },
  { path: 'profile', component: ProfileComponent,canActivate: [AuthGuard], },
  { path: 'login', component: LoginComponent},
  { path: 'courses', component: CoursesComponent,canActivate: [AuthGuard], },
  { path: 'about', component: AboutComponent },
  { path: 'page1', component: Page1Component,canActivate: [AuthGuard],},
  { path: 'page2', component: Page2Component,canActivate: [AuthGuard], },
  { path: 'page3', component: Page3Component ,canActivate: [AuthGuard],},
  { path: 'page4', component: Page4Component,canActivate: [AuthGuard], },
  { path: 'page5', component: Page5Component,canActivate: [AuthGuard], },

  // Protected routes - require authentication
  {
    path: 'home',
    component: HomeComponent,
    // canActivate: [AuthGuard],
    data: { roles: ['user', 'admin', 'instructor'] }
  },
  {
    path: 'admin-dashboard',
    component: AdmindashboardComponent,
    canActivate: [AuthGuard],
    data: { roles: ['admin'] }
  },
  {
    path: 'instructor-dashboard',
    component: InstructordashboardComponent,
    canActivate: [AuthGuard],
    data: { roles: ['instructor'] }
  },

  // Redirect unknown routes
  { path: '**', redirectTo: '/home' }
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
