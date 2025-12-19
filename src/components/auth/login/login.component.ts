import { Component, ChangeDetectionStrategy, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { AuthService } from '../../../services/auth.service';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [CommonModule, FormsModule, RouterLink]
})
export class LoginComponent {
  authService = inject(AuthService);
  router = inject(Router);

  username = '';
  password = '';
  error = signal<string | null>(null);
  isLoading = signal(false);

  login() {
    if (this.isLoading() || !this.username.trim() || !this.password.trim()) {
      return;
    }
    this.isLoading.set(true);
    this.error.set(null);

    // Simulate network latency for better UX
    setTimeout(() => {
      const result = this.authService.login(this.username, this.password);
      if (result.success) {
        this.router.navigateByUrl('/global-feed');
      } else {
        this.error.set(result.message || 'Login failed.');
        this.isLoading.set(false);
      }
    }, 500);
  }
}
