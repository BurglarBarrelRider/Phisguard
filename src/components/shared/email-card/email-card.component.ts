import { Component, ChangeDetectionStrategy, input, output, computed, signal, inject, effect } from '@angular/core';
import { CommonModule, DatePipe } from '@angular/common';
import { RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { Report } from '../../../models/report.model';
import { Comment } from '../../../models/comment.model';
import { AuthService } from '../../../services/auth.service';
import { DatabaseService } from '../../../services/database.service';

@Component({
  selector: 'app-email-card',
  templateUrl: './email-card.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [CommonModule, RouterLink, DatePipe, FormsModule]
})
export class EmailCardComponent {
  authService = inject(AuthService);
  db = inject(DatabaseService);

  report = input.required<Report>();
  showDelete = input(false);
  showPublish = input(false);
  showUnpublish = input(false);
  isLoggedIn = input(false);
  isArchived = input(false);
  isJustPublished = input(false);
  isJustUnpublished = input(false);

  delete = output<string>();
  toggleArchive = output<string>();
  publish = output<string>();
  unpublish = output<string>();
  like = output<string>();

  isExpanded = signal(false);
  comments = signal<Comment[]>([]);
  newCommentContent = signal('');
  commentCount = signal(0);
  
  currentUserHasLiked = computed(() => {
    const user = this.authService.currentUser();
    if (!user) return false;
    return this.report().likes.includes(user.id);
  });

  constructor() {
    effect(() => {
      const currentReport = this.report();
      if (currentReport) {
        this.commentCount.set(this.db.getCommentsForReport(currentReport.id).length);
        if (this.isExpanded()) {
          this.comments.set(this.db.getCommentsForReport(currentReport.id));
        } else {
          this.comments.set([]);
        }
      }
    });
  }

  toggleExpand() {
    this.isExpanded.update(v => !v);
  }
  
  contentSnippet = computed(() => {
    const email = this.report().originalEmail;
    const subjectMatch = email.match(/^Subject: (.*)/m);
    if (subjectMatch && subjectMatch[1]) {
      return subjectMatch[1].trim();
    }
    return 'Forensic Payload';
  });

  verdict = computed(() => {
    const summary = this.report().analysis.summary;
    const firstSentence = summary.split('.')[0];
    return firstSentence || 'No verdict available';
  });

  getRiskColorClass(score: number): string {
    if (score > 0.8) return 'bg-danger/20 text-danger border-danger/50';
    if (score > 0.5) return 'bg-warning/20 text-warning border-warning/50';
    return 'bg-success/20 text-success border-success/50';
  }

  getDotColorClass(score: number): string {
    if (score > 0.8) return 'bg-danger';
    if (score > 0.5) return 'bg-warning';
    return 'bg-success';
  }
  
  getRiskText(score: number): string {
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

  onDeleteClick(event: Event) {
    event.preventDefault();
    event.stopPropagation();
    this.delete.emit(this.report().id);
  }

  onArchiveClick(event: Event) {
    event.preventDefault();
    event.stopPropagation();
    this.toggleArchive.emit(this.report().id);
  }
  
  onPublishClick(event: Event) {
    event.preventDefault();
    event.stopPropagation();
    this.publish.emit(this.report().id);
  }

  onUnpublishClick(event: Event) {
    event.preventDefault();
    event.stopPropagation();
    this.unpublish.emit(this.report().id);
  }

  onLikeClick(event: Event) {
    event.preventDefault();
    event.stopPropagation();
    this.like.emit(this.report().id);
  }

  onCardClick() {
    if (!this.isExpanded()) {
        this.isExpanded.set(true);
    }
  }

  onCloseClick(event: Event) {
    event.stopPropagation();
    this.isExpanded.set(false);
  }

  postComment(): void {
    const reportId = this.report().id;
    const content = this.newCommentContent().trim();
    const user = this.authService.currentUser();

    if (reportId && content && user) {
      this.db.addComment(reportId, user, content);
      const updatedComments = this.db.getCommentsForReport(reportId);
      this.comments.set(updatedComments);
      this.commentCount.set(updatedComments.length);
      this.newCommentContent.set('');
    }
  }
}