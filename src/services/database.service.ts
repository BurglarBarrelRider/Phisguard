import { Injectable } from '@angular/core';
import { Report, AnalysisResult } from '../models/report.model';
import { User, SessionUser } from '../models/user.model';
import { Comment } from '../models/comment.model';

const MOCK_REPORTS: Omit<Report, 'id' | 'timestamp'>[] = [
  {
    user: { id: 'user-1', username: 'alex_cyber', email: 'alex@example.com', password: 'password123' },
    originalEmail: `From: "Support" <support@microsft.com>\nSubject: Urgent: Your account is suspended!\n\nDear user,\n\nWe detected suspicious activity on your account. To fix this, please click here and login: http://microsft-login.com/auth\n\nThanks,\nSupport Team`,
    analysis: {
      isPhishing: true,
      confidenceScore: 0.98,
      summary: 'This email is a textbook phishing attack. It impersonates Microsoft by using a misspelled domain and creates a false sense of urgency to trick the user into clicking a malicious link. The goal is to steal account credentials.',
      redFlags: [
        { category: 'Sender Anomaly', description: 'The sender email "support@microsft.com" is a deliberate misspelling of the official "microsoft.com" domain.' },
        { category: 'Urgency', description: 'The subject line "Urgent: Your account is suspended!" and the body of the email pressure the user to act immediately without thinking.' },
        { category: 'Suspicious Link', description: 'The link "microsft-login.com" is not an official Microsoft domain and is designed to look legitimate at a glance.' }
      ],
      recommendedAction: 'Delete this email immediately. Do not click on any links or download attachments. Block the sender.',
      educationalTakeaway: 'Attackers often create lookalike domains by misspelling a single letter. Always inspect the sender\'s email address and hover over links to verify the destination URL before clicking.'
    },
    isPublic: true,
    likes: ['user-2']
  },
  {
    user: { id: 'user-2', username: 'sec_guru', email: 'guru@example.com', password: 'password123' },
    originalEmail: `From: "Your Bank" <no-reply@secure-banking-portal.net>\nSubject: Action Required: Verify Your Information\n\nHello,\n\nWe need to confirm your details. Please visit our portal to update your info: [link]\n\nFailure to do so may result in account limitation.`,
    analysis: {
      isPhishing: true,
      confidenceScore: 0.95,
      summary: 'This is a generic but effective phishing email that uses a vague threat and a non-official domain to lure victims. The lack of personalization is a key indicator of a broad-net phishing campaign.',
      redFlags: [
        { category: 'Generic Greeting', description: 'The email uses a generic greeting "Hello," instead of the customer\'s actual name, which legitimate banks rarely do.' },
        { category: 'Suspicious Link', description: 'The domain "secure-banking-portal.net" is not a legitimate banking domain and is likely a fraudulent site set up to capture user data.' },
        { category: 'Vague Threat', description: 'The email vaguely warns of "account limitation" without providing specifics, a common tactic to incite fear and rash action.'}
      ],
      recommendedAction: 'Mark this email as spam and delete it. Do not reply or provide any information. Check your bank account through official channels if you are concerned.',
      educationalTakeaway: 'Legitimate financial institutions will almost always address you by name. Be wary of generic greetings paired with requests for personal information or urgent action.'
    },
    isPublic: true,
    likes: []
  }
];

const MOCK_COMMENTS: Omit<Comment, 'id' | 'timestamp'>[] = [
    {
        reportId: 'rep-1',
        user: { id: 'user-2', username: 'sec_guru', email: 'guru@example.com' },
        content: 'Classic textbook example. The misspelled domain is a dead giveaway. Thanks for sharing!'
    }
];


@Injectable({ providedIn: 'root' })
export class DatabaseService {
  private readonly USERS_KEY = 'pg_users';
  private readonly REPORTS_KEY = 'pg_reports';
  private readonly ARCHIVED_REPORTS_KEY = 'pg_archived_reports';
  private readonly COMMENTS_KEY = 'pg_comments';

  constructor() {
    this.initDb();
  }

  private initDb() {
    // Seed users only if the user list doesn't exist.
    if (!localStorage.getItem(this.USERS_KEY)) {
        const initialUsers = MOCK_REPORTS.map(r => r.user);
        localStorage.setItem(this.USERS_KEY, JSON.stringify(initialUsers));
    }

    // Seed reports only if the report list doesn't exist.
    if (!localStorage.getItem(this.REPORTS_KEY)) {
        const initialReports = MOCK_REPORTS.map((r, index) => ({
            ...r,
            id: `rep-${index + 1}`,
            timestamp: new Date(Date.now() - (index + 1) * 3600000)
        }));
        localStorage.setItem(this.REPORTS_KEY, JSON.stringify(initialReports));
    }

    // Seed comments only if the comment list doesn't exist.
     if (!localStorage.getItem(this.COMMENTS_KEY)) {
        const initialComments = MOCK_COMMENTS.map((c, index) => ({
            ...c,
            id: `com-${index + 1}`,
            timestamp: new Date()
        }));
        localStorage.setItem(this.COMMENTS_KEY, JSON.stringify(initialComments));
     }

    // Initialize archived reports if it doesn't exist.
    if (!localStorage.getItem(this.ARCHIVED_REPORTS_KEY)) {
        localStorage.setItem(this.ARCHIVED_REPORTS_KEY, JSON.stringify({}));
     }
  }

  // User Methods
  getUsers(): User[] {
    return JSON.parse(localStorage.getItem(this.USERS_KEY) || '[]');
  }

  getUserByUsername(username: string): User | undefined {
    return this.getUsers().find(u => u.username.toLowerCase() === username.toLowerCase());
  }
  
  getUserByEmail(email: string): User | undefined {
    return this.getUsers().find(u => u.email.toLowerCase() === email.toLowerCase());
  }

  addUser(username: string, email: string, password: string): User {
    const users = this.getUsers();
    const newUser: User = { id: `user-${Date.now()}`, username, email, password };
    users.push(newUser);
    localStorage.setItem(this.USERS_KEY, JSON.stringify(users));
    return newUser;
  }

  deleteUser(userId: string) {
    // 1. Delete user from users list
    let users = this.getUsers();
    users = users.filter(u => u.id !== userId);
    localStorage.setItem(this.USERS_KEY, JSON.stringify(users));

    // 2. Delete user's reports and remove their likes from other reports
    let reports = this.getReports();
    reports = reports.filter(r => r.user.id !== userId); // Remove user's reports
    reports.forEach(r => { // Remove user's likes
        const likeIndex = r.likes.indexOf(userId);
        if (likeIndex > -1) {
            r.likes.splice(likeIndex, 1);
        }
    });
    localStorage.setItem(this.REPORTS_KEY, JSON.stringify(reports));

    // 3. Delete user's comments
    let comments = this.getComments();
    comments = comments.filter(c => c.user.id !== userId);
    localStorage.setItem(this.COMMENTS_KEY, JSON.stringify(comments));

    // 4. Delete user's archived reports list
    const archived = this.getArchivedReports();
    if (archived[userId]) {
        delete archived[userId];
        localStorage.setItem(this.ARCHIVED_REPORTS_KEY, JSON.stringify(archived));
    }
  }

  // Report Methods
  getReports(): Report[] {
    const reports = JSON.parse(localStorage.getItem(this.REPORTS_KEY) || '[]');
    return reports.map((r: any) => ({...r, timestamp: new Date(r.timestamp)}));
  }

  addReport(user: User, originalEmail: string, analysis: AnalysisResult, isPublic: boolean = false): Report {
    const reports = this.getReports();
    const newReport: Report = {
      id: `rep-${Date.now()}`,
      user,
      originalEmail,
      analysis,
      timestamp: new Date(),
      isPublic,
      likes: []
    };
    reports.unshift(newReport);
    localStorage.setItem(this.REPORTS_KEY, JSON.stringify(reports));
    return newReport;
  }

  deleteReport(reportId: string, userId: string) {
    const reports = this.getReports();
    const initialLength = reports.length;
    const updatedReports = reports.filter(r => !(r.id === reportId && r.user.id === userId));

    if (updatedReports.length < initialLength) {
        localStorage.setItem(this.REPORTS_KEY, JSON.stringify(updatedReports));
    }
  }

  publishReport(reportId: string, userId: string) {
    const reports = this.getReports();
    let reportUpdated = false;
    const updatedReports = reports.map(report => {
        if (report.id === reportId && report.user.id === userId && !report.isPublic) {
            reportUpdated = true;
            return { ...report, isPublic: true };
        }
        return report;
    });

    if (reportUpdated) {
        localStorage.setItem(this.REPORTS_KEY, JSON.stringify(updatedReports));
    }
  }

  unpublishReport(reportId: string, userId: string) {
    const reports = this.getReports();
    let reportUpdated = false;
    const updatedReports = reports.map(report => {
        if (report.id === reportId && report.user.id === userId && report.isPublic) {
            reportUpdated = true;
            return { ...report, isPublic: false };
        }
        return report;
    });

    if (reportUpdated) {
        localStorage.setItem(this.REPORTS_KEY, JSON.stringify(updatedReports));
    }
  }
  
  toggleLike(reportId: string, userId: string) {
    let reports = this.getReports();
    const reportIndex = reports.findIndex(r => r.id === reportId);
    if (reportIndex > -1) {
      const report = reports[reportIndex];
      const likeIndex = report.likes.indexOf(userId);
      if (likeIndex > -1) {
        report.likes.splice(likeIndex, 1);
      } else {
        report.likes.push(userId);
      }
      localStorage.setItem(this.REPORTS_KEY, JSON.stringify(reports));
    }
  }

  // Archived Reports Methods
  private getArchivedReports(): Record<string, string[]> {
    return JSON.parse(localStorage.getItem(this.ARCHIVED_REPORTS_KEY) || '{}');
  }

  getArchivedReportIdsForUser(userId: string): Set<string> {
    const archived = this.getArchivedReports();
    return new Set(archived[userId] || []);
  }

  archiveReport(userId: string, reportId: string) {
    const archived = this.getArchivedReports();
    if (!archived[userId]) {
      archived[userId] = [];
    }
    if (!archived[userId].includes(reportId)) {
        archived[userId].push(reportId);
    }
    localStorage.setItem(this.ARCHIVED_REPORTS_KEY, JSON.stringify(archived));
  }
  
  unarchiveReport(userId: string, reportId: string) {
    const archived = this.getArchivedReports();
    if (archived[userId]) {
      archived[userId] = archived[userId].filter(id => id !== reportId);
    }
    localStorage.setItem(this.ARCHIVED_REPORTS_KEY, JSON.stringify(archived));
  }
  
  // Comment Methods
  private getComments(): Comment[] {
     const comments = JSON.parse(localStorage.getItem(this.COMMENTS_KEY) || '[]');
     return comments.map((c: any) => ({...c, timestamp: new Date(c.timestamp)}));
  }
  
  getCommentsForReport(reportId: string): Comment[] {
    return this.getComments()
      .filter(c => c.reportId === reportId)
      .sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime());
  }
  
  addComment(reportId: string, user: SessionUser, content: string): Comment {
    const comments = this.getComments();
    const newComment: Comment = {
        id: `com-${Date.now()}`,
        reportId,
        user,
        content,
        timestamp: new Date()
    };
    comments.push(newComment);
    localStorage.setItem(this.COMMENTS_KEY, JSON.stringify(comments));
    return newComment;
  }
}