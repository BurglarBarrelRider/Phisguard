import { Injectable, signal, inject } from '@angular/core';
import { User, SessionUser } from '../models/user.model';
import { Router } from '@angular/router';
import { DatabaseService } from './database.service';

@Injectable({ providedIn: 'root' })
export class AuthService {
  private db = inject(DatabaseService);
  private router = inject(Router);

  private _currentUser = signal<SessionUser | null>(this.getStoredUser());
  currentUser = this._currentUser.asReadonly();

  register(username: string, email: string, password: string): { success: boolean, message?: string } {
    if (this.db.getUserByUsername(username)) {
      return { success: false, message: 'Username already taken.' };
    }
    if (this.db.getUserByEmail(email)) {
      return { success: false, message: 'An account with this email already exists.' };
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
        return { success: false, message: 'Invalid email format.' };
    }

    const user = this.db.addUser(username, email, password);
    this.setCurrentUser(user);
    return { success: true };
  }

  login(username: string, password: string): { success: boolean, message?: string } {
    const user = this.db.getUserByUsername(username);
    if (!user || user.password !== password) {
      return { success: false, message: 'Invalid username or password.' };
    }
    this.setCurrentUser(user);
    return { success: true };
  }

  logout() {
    localStorage.removeItem('phishguard_user');
    this._currentUser.set(null);
    this.router.navigateByUrl('/');
  }

  deleteAccount() {
    const currentUser = this.currentUser();
    if (!currentUser) return;

    this.db.deleteUser(currentUser.id);
    this.logout(); // Reuse logout to clear session and redirect
  }

  private setCurrentUser(userWithPassword: User) {
    const userForSession: SessionUser = {
      id: userWithPassword.id,
      username: userWithPassword.username,
      email: userWithPassword.email,
    };
    
    localStorage.setItem('phishguard_user', JSON.stringify(userForSession));
    this._currentUser.set(userForSession);
  }

  private getStoredUser(): SessionUser | null {
    const userJson = typeof window !== 'undefined' ? localStorage.getItem('phishguard_user') : null;
    return userJson ? JSON.parse(userJson) : null;
  }
}
