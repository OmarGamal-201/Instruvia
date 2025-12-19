import { Injectable } from '@angular/core';
import { CanActivate, ActivatedRouteSnapshot, RouterStateSnapshot, Router } from '@angular/router';
import { AuthService } from './auth.service';

@Injectable({
  providedIn: 'root'
})
export class AuthGuard implements CanActivate {

  constructor(
    private authService: AuthService,
    private router: Router
  ) {}

  canActivate(
    route: ActivatedRouteSnapshot,
    state: RouterStateSnapshot
  ): boolean {
    // Check if user is authenticated
    if (!this.authService.isAuthenticated()) {
      // Not logged in, redirect to login page with return url
      this.router.navigate(['/login'], {
        queryParams: { returnUrl: state.url }
      });
      return false;
    }

    // User is authenticated, now check role-based access
    const requiredRoles = route.data['roles'] as Array<string>;

    // If no specific roles are required, allow access (route is just protected by auth)
    if (!requiredRoles || requiredRoles.length === 0) {
      return true;
    }

    // Get current user
    const currentUser = this.authService.getCurrentUser();

    if (!currentUser) {
      this.router.navigate(['/login']);
      return false;
    }

    // Check if user has the required role
    const hasRole = requiredRoles.includes(currentUser.role);

    if (!hasRole) {
      // User doesn't have required role, redirect to their appropriate dashboard
      this.redirectToDashboard(currentUser.role);
      return false;
    }

    // User is authenticated and has the required role
    return true;
  }

  private redirectToDashboard(role: string): void {
    switch (role) {
      case 'admin':
        this.router.navigate(['/admin-dashboard']);
        break;
      case 'instructor':
        this.router.navigate(['/instructor-dashboard']);
        break;
      case 'student':
        this.router.navigate(['/home']);
        break;
      default:
        this.router.navigate(['/login']);
    }
  }
}
