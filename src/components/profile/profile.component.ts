import { Component, ChangeDetectionStrategy, inject, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AuthService } from '../../services/auth.service';
import { ReportService } from '../../services/report.service';
import { EmailCardComponent } from '../shared/email-card/email-card.component';
import { RouterLink } from '@angular/router';

type ProfileTab = 'my-reports' | 'archived-reports';

@Component({
  selector: 'app-profile',
  templateUrl: './profile.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [CommonModule, EmailCardComponent, RouterLink]
})
export class ProfileComponent {
  authService = inject(AuthService);
  reportService = inject(ReportService);

  currentUser = this.authService.currentUser;
  myReports = this.reportService.personalFeed;
  archivedReports = this.reportService.archivedFeed;

  activeTab = signal<ProfileTab>('my-reports');
  justPublishedReportId = signal<string | null>(null);
  justUnpublishedReportId = signal<string | null>(null);

  setActiveTab(tab: ProfileTab) {
    this.activeTab.set(tab);
  }

  deleteReport(id: string) {
    if (confirm('Are you sure you want to permanently delete this report? This action cannot be undone.')) {
      this.reportService.deleteReport(id);
    }
  }

  toggleArchive(reportId: string) {
    this.reportService.toggleArchiveReport(reportId);
  }
  
  toggleLike(reportId: string) {
    this.reportService.toggleLike(reportId);
  }

  publishReport(id: string) {
    if (confirm('Are you sure you want to publish this report to the global feed?')) {
      this.reportService.publishReport(id);
      this.justPublishedReportId.set(id);
      this.justUnpublishedReportId.set(null);
      setTimeout(() => this.justPublishedReportId.set(null), 2000);
    }
  }

  unpublishReport(id: string) {
    if (confirm('Are you sure you want to remove this report from the global feed? It will become private.')) {
      this.reportService.unpublishReport(id);
      this.justUnpublishedReportId.set(id);
      this.justPublishedReportId.set(null);
      setTimeout(() => this.justUnpublishedReportId.set(null), 2000);
    }
  }

  logout() {
    this.authService.logout();
  }

  deleteAccount() {
    if (confirm('Are you absolutely sure you want to delete your account? This will permanently erase all your reports and comments. This action cannot be undone.')) {
      this.authService.deleteAccount();
    }
  }
}