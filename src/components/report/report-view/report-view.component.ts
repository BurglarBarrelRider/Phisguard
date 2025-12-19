import { Component, ChangeDetectionStrategy, inject, signal, computed, effect } from '@angular/core';
import { CommonModule, DatePipe } from '@angular/common';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { ReportService } from '../../../services/report.service';
import { Report } from '../../../models/report.model';
import { Comment } from '../../../models/comment.model';
import { map } from 'rxjs/operators';
import { toSignal } from '@angular/core/rxjs-interop';
import { DatabaseService } from '../../../services/database.service';
import { AuthService } from '../../../services/auth.service';

@Component({
  selector: 'app-report-view',
  templateUrl: './report-view.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [CommonModule, DatePipe, RouterLink, FormsModule]
})
export class ReportViewComponent {
  route = inject(ActivatedRoute);
  reportService = inject(ReportService);
  db = inject(DatabaseService);
  authService = inject(AuthService);
  router = inject(Router);

  private reportId = toSignal(this.route.paramMap.pipe(map(params => params.get('id'))));
  
  report = computed(() => {
    const id = this.reportId();
    return id ? this.reportService.getReportById(id) : undefined
  });
  
  comments = signal<Comment[]>([]);
  newCommentContent = signal('');
  isLoggedIn = computed(() => !!this.authService.currentUser());
  isOwner = computed(() => this.authService.currentUser()?.id === this.report()?.user.id);

  justPublished = signal(false);
  justUnpublished = signal(false);

  currentUserHasLiked = computed(() => {
    const user = this.authService.currentUser();
    const currentReport = this.report();
    if (!user || !currentReport) return false;
    return currentReport.likes.includes(user.id);
  });

  constructor() {
    effect(() => {
      const id = this.reportId();
      if (id) {
        this.comments.set(this.db.getCommentsForReport(id));
      }
    }, { allowSignalWrites: true });
  }

  toggleLike() {
    const id = this.reportId();
    if (id) {
      this.reportService.toggleLike(id);
    }
  }

  publishReport() {
    const id = this.reportId();
    if (!id) return;
    this.reportService.publishReport(id);
    this.justPublished.set(true);
    setTimeout(() => this.justPublished.set(false), 2000);
  }

  unpublishReport() {
    const id = this.reportId();
    if (!id) return;
    this.reportService.unpublishReport(id);
    this.justUnpublished.set(true);
    setTimeout(() => this.justUnpublished.set(false), 2000);
  }

  deleteReport() {
    const id = this.reportId();
    if (!id) return;
    if (confirm('Are you sure you want to permanently delete this report? This action cannot be undone.')) {
      this.reportService.deleteReport(id);
      this.router.navigate(['/profile']);
    }
  }

  postComment() {
    const id = this.reportId();
    const content = this.newCommentContent().trim();
    const user = this.authService.currentUser();

    if (id && content && user) {
      this.db.addComment(id, user, content);
      this.comments.set(this.db.getCommentsForReport(id));
      this.newCommentContent.set('');
    }
  }
  
  getRiskColorClass(score: number | undefined): string {
    if(score === undefined) return 'bg-gray-500';
    if (score > 0.8) return 'text-danger';
    if (score > 0.5) return 'text-warning';
    return 'text-success';
  }

  getRiskText(score: number | undefined): string {
    if(score === undefined) return 'Unknown';
    if (score > 0.8) return 'High Risk';
    if (score > 0.5) return 'Medium Risk';
    return 'Low Risk';
  }

  getFlagIcon(category: string): string {
    const cat = category.toLowerCase();
    if (cat.includes('link')) return 'fa-link';
    if (cat.includes('sender')) return 'fa-user-secret';
    if (cat.includes('urgency')) return 'fa-bolt';
    if (cat.includes('grammar')) return 'fa-spell-check';
    if (cat.includes('generic')) return 'fa-at';
    return 'fa-flag';
  }

  getActionIcon(action: string | undefined): string {
    if (!action) return 'fa-info-circle';
    const act = action.toLowerCase();
    if (act.includes('delete')) return 'fa-trash-alt';
    if (act.includes('spam') || act.includes('block')) return 'fa-ban';
    if (act.includes('cautious') || act.includes('careful')) return 'fa-exclamation-triangle';
    if (act.includes('safe')) return 'fa-check-circle';
    return 'fa-info-circle';
  }

  getActionColorClass(score: number | undefined): string {
    if (score === undefined) return 'bg-gray-500/20 border-gray-500/50 text-text-primary';
    if (score > 0.8) return 'bg-danger/20 border-danger/50 text-danger';
    if (score > 0.5) return 'bg-warning/20 border-warning/50 text-warning';
    return 'bg-success/20 border-success/50 text-success';
  }
}