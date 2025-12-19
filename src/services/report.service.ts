import { Injectable, signal, computed, inject, effect } from '@angular/core';
import { Report, AnalysisResult } from '../models/report.model';
import { User } from '../models/user.model';
import { AuthService } from './auth.service';
import { DatabaseService } from './database.service';

@Injectable({ providedIn: 'root' })
export class ReportService {
  private authService = inject(AuthService);
  private db = inject(DatabaseService);
  
  private reports = signal<Report[]>(this.db.getReports());
  private archivedReportIds = signal(new Set<string>());

  constructor() {
    effect(() => {
        const currentUser = this.authService.currentUser();
        if (currentUser) {
            this.archivedReportIds.set(this.db.getArchivedReportIdsForUser(currentUser.id));
        } else {
            this.archivedReportIds.set(new Set());
        }
    });
  }

  globalFeed = computed(() => this.reports().filter(r => r.isPublic));
  
  personalFeed = computed(() => {
    const currentUser = this.authService.currentUser();
    if (!currentUser) return [];
    return this.reports().filter(r => r.user.id === currentUser.id);
  });

  archivedFeed = computed(() => {
    const ids = this.archivedReportIds();
    return this.reports().filter(r => ids.has(r.id));
  });

  isReportArchived(reportId: string) {
    return computed(() => this.archivedReportIds().has(reportId));
  }

  getReportById(id: string): Report | undefined {
    return this.reports().find(r => r.id === id);
  }

  addReport(user: User, originalEmail: string, analysis: AnalysisResult, isPublic: boolean = false): Report {
    const newReport = this.db.addReport(user, originalEmail, analysis, isPublic);
    this.reports.set(this.db.getReports());
    return newReport;
  }

  deleteReport(id: string) {
    const currentUser = this.authService.currentUser();
    if (!currentUser) return;

    this.db.deleteReport(id, currentUser.id);
    this.reports.set(this.db.getReports());
  }

  publishReport(reportId: string) {
    const currentUser = this.authService.currentUser();
    if (!currentUser) return;
    this.db.publishReport(reportId, currentUser.id);
    this.reports.set(this.db.getReports());
  }

  unpublishReport(reportId: string) {
    const currentUser = this.authService.currentUser();
    if (!currentUser) return;
    this.db.unpublishReport(reportId, currentUser.id);
    this.reports.set(this.db.getReports());
  }

  toggleArchiveReport(reportId: string) {
    const currentUser = this.authService.currentUser();
    if (!currentUser) return;

    if (this.archivedReportIds().has(reportId)) {
      this.db.unarchiveReport(currentUser.id, reportId);
    } else {
      this.db.archiveReport(currentUser.id, reportId);
    }
    this.archivedReportIds.set(this.db.getArchivedReportIdsForUser(currentUser.id));
  }
  
  toggleLike(reportId: string) {
    const currentUser = this.authService.currentUser();
    if (!currentUser) return;

    this.db.toggleLike(reportId, currentUser.id);
    this.reports.set(this.db.getReports());
  }
}