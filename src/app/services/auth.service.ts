import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Observable, tap } from 'rxjs';

export interface CurrentUser {
  _id: string;
  username: string;
  email: string;
  bio?: string;
  profilePicture?: string;
  friends?: string[];
  friendRequests?: string[];
}

interface LoginResponse {
  message: string;
  user: CurrentUser;
}

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private apiUrl = 'http://localhost:3000/api/users';

  private currentUserSubject = new BehaviorSubject<CurrentUser | null>(this.getUserFromStorage());
  currentUser$ = this.currentUserSubject.asObservable();

  constructor(private http: HttpClient) {}

  register(username: string, email: string, password: string): Observable<any> {
    return this.http.post(`${this.apiUrl}`, { username, email, password });
  }

  login(email: string, password: string): Observable<LoginResponse> {
    return this.http.post<LoginResponse>(`${this.apiUrl}/login`, {
      email,
      password
    }).pipe(
      tap((response) => {
        this.saveUser(response.user);
      })
    );
  }

  updateUser(userId: string, updates: Partial<CurrentUser>): Observable<CurrentUser> {
    return this.http.put<CurrentUser>(`${this.apiUrl}/${userId}`, updates).pipe(
      tap((updatedUser) => {
        this.saveUser(updatedUser);
      })
    );
  }

  saveUser(user: CurrentUser): void {
    localStorage.setItem('currentUser', JSON.stringify(user));
    this.currentUserSubject.next(user);
  }

  getCurrentUser(): CurrentUser | null {
    return this.currentUserSubject.value;
  }

  isLoggedIn(): boolean {
    return this.currentUserSubject.value !== null;
  }

  logout(): void {
    localStorage.removeItem('currentUser');
    this.currentUserSubject.next(null);
  }

  private getUserFromStorage(): CurrentUser | null {
    const user = localStorage.getItem('currentUser');
    return user ? JSON.parse(user) : null;
  }
}