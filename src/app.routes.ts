import { inject } from '@angular/core';
import { CanActivateFn, Router, Routes } from '@angular/router';
import { AuthService } from './services/auth.service';
import { LoginComponent } from './components/auth/login/login.component';
import { RegisterComponent } from './components/auth/register/register.component';
import { GlobalFeedComponent } from './components/feed/global-feed/global-feed.component';
import { NewReportComponent } from './components/report/new-report/new-report.component';
import { ReportViewComponent } from './components/report/report-view/report-view.component';
import { LandingComponent } from './components/landing/landing.component';
import { StatisticsComponent } from './components/statistics/statistics.component';
import { ProfileComponent } from './components/profile/profile.component';

const authGuard: CanActivateFn = () => {
  const authService = inject(AuthService);
  const router = inject(Router);
  if (authService.currentUser()) {
    return true;
  }
  return router.parseUrl('/login');
};

const loggedInGuard: CanActivateFn = () => {
  const authService = inject(AuthService);
  const router = inject(Router);
  if (authService.currentUser()) {
    return router.parseUrl('/global-feed');
  }
  return true;
}

export const APP_ROUTES: Routes = [
  { path: '', component: LandingComponent, canActivate: [loggedInGuard] },
  { path: 'login', component: LoginComponent },
  { path: 'register', component: RegisterComponent },
  { path: 'global-feed', component: GlobalFeedComponent },
  { path: 'statistics', component: StatisticsComponent },
  { path: 'profile', component: ProfileComponent, canActivate: [authGuard] },
  { path: 'new-report', component: NewReportComponent, canActivate: [authGuard] },
  { path: 'report/:id', component: ReportViewComponent },
  { path: '**', redirectTo: '' },
];
