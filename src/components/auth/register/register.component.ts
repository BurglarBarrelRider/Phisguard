import { Component, ChangeDetectionStrategy, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { AuthService } from '../../../services/auth.service';

@Component({
  selector: 'app-register',
  templateUrl: './register.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [CommonModule, FormsModule, RouterLink]
})
export class RegisterComponent {
  authService = inject(AuthService);
  router = inject(Router);

  username = '';
  email = '';
  password = '';
  confirmPassword = '';
  error = signal<string | null>(null);
  isLoading = signal(false);

  register() {
    if (this.isLoading()) return;
    this.error.set(null);
    
    if (this.password !== this.confirmPassword) {
      this.error.set("Passwords do not match.");
      return;
    }
    
    const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)[a-zA-Z\d\w\W]{8,}$/;
    if (!passwordRegex.test(this.password)) {
      this.error.set("Password must be at least 8 characters long and contain an uppercase letter, a lowercase letter, and a number.");
      return;
    }
    
    this.isLoading.set(true);

    // Simulate network latency for better UX
    setTimeout(() => {
        const result = this.authService.register(this.username, this.email, this.password);

        if (result.success) {
          this.router.navigateByUrl('/global-feed');
        } else {
          this.error.set(result.message || 'Registration failed.');
          this.isLoading.set(false);
        }
    }, 500);
  }
}
