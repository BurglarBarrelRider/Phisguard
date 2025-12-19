import { Component, ChangeDetectionStrategy, inject, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReportService } from '../../../services/report.service';
import { EmailCardComponent } from '../../shared/email-card/email-card.component';
import { AuthService } from '../../../services/auth.service';

@Component({
  selector: 'app-global-feed',
  templateUrl: './global-feed.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [CommonModule, EmailCardComponent]
})
export class GlobalFeedComponent {
  reportService = inject(ReportService);
  authService = inject(AuthService);

  reports = this.reportService.globalFeed;
  isLoggedIn = computed(() => !!this.authService.currentUser());

  toggleArchive(reportId: string) {
    this.reportService.toggleArchiveReport(reportId);
  }

  toggleLike(reportId: string) {
    this.reportService.toggleLike(reportId);
  }
}
