import { Component, ChangeDetectionStrategy, inject, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterLink, RouterLinkActive } from '@angular/router';
import { AuthService } from '../../../services/auth.service';

@Component({
  selector: 'app-header',
  templateUrl: './header.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [CommonModule, RouterLink, RouterLinkActive]
})
export class HeaderComponent {
  authService = inject(AuthService);
  router = inject(Router);
  
  isLoggedIn = computed(() => !!this.authService.currentUser());

  logout() {
    this.authService.logout();
  }
}