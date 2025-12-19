import { Component, ChangeDetectionStrategy, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { GeminiService } from '../../../services/gemini.service';
import { ReportService } from '../../../services/report.service';
import { AuthService } from '../../../services/auth.service';
import { SpinnerComponent } from '../../shared/spinner/spinner.component';
import { AnalysisResult } from '../../../models/report.model';
import { User } from '../../../models/user.model';

@Component({
  selector: 'app-new-report',
  templateUrl: './new-report.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [CommonModule, FormsModule, SpinnerComponent]
})
export class NewReportComponent {
  geminiService = inject(GeminiService);
  reportService = inject(ReportService);
  authService = inject(AuthService);
  router = inject(Router);

  subject = signal('');
  emailContent = signal('');
  isPublic = signal(false);
  isLoading = signal(false);
  error = signal<string | null>(null);

  async analyzeEmail() {
    if (!this.emailContent().trim()) {
      this.error.set('Email content cannot be empty.');
      return;
    }

    const currentUser = this.authService.currentUser();
    if (!currentUser) {
        this.error.set('You must be logged in to submit a report.');
        return;
    }

    this.isLoading.set(true);
    this.error.set(null);

    const fullContent = `Subject: ${this.subject()}\n\n${this.emailContent()}`;

    try {
      const analysis: AnalysisResult = await this.geminiService.analyzeEmail(fullContent);
      const newReport = this.reportService.addReport(currentUser as User, fullContent, analysis, this.isPublic());
      this.router.navigate(['/report', newReport.id]);
    } catch (e: any) {
      this.error.set(e.message || 'An unknown error occurred during analysis.');
    } finally {
      this.isLoading.set(false);
    }
  }
}