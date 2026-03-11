import { Injectable, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { tap, map } from 'rxjs/operators';
import { Observable } from 'rxjs';

export interface AuthUser {
  id: number;
  name: string;
  email: string;
}

export interface LoginPayload {
  user: {
    email: string;
    password: string;
  };
}

export interface SignupPayload {
  user: {
    name: string;
    email: string;
    password: string;
    password_confirmation: string;
  };
}

export interface AuthResponse {
  message: string;
  user: AuthUser;
}

@Injectable({ providedIn: 'root' })
export class AuthService {
  private readonly API_URL = '/api/v1/auth';
  private readonly TOKEN_KEY = 'auth_token';

  currentUser = signal<AuthUser | null>(this.loadUserFromStorage());

  constructor(private http: HttpClient, private router: Router) {}

  login(payload: LoginPayload): Observable<AuthResponse> {
    return this.http.post<AuthResponse>(`${this.API_URL}/login`, payload, {
      observe: 'response'
    }).pipe(
      tap(response => {
        const token = response.headers.get('Authorization');
        if (token) {
          localStorage.setItem(this.TOKEN_KEY, token.replace('Bearer ', ''));
        }
        if (response.body?.user) {
          this.currentUser.set(response.body.user);
          localStorage.setItem('auth_user', JSON.stringify(response.body.user));
        }
      }),
      map(response => response.body as AuthResponse)
    );
  }

  signup(payload: SignupPayload): Observable<AuthResponse> {
    return this.http.post<AuthResponse>(`${this.API_URL}/signup`, payload);
  }

  logout(): Observable<{ message: string }> {
    return this.http.delete<{ message: string }>(`${this.API_URL}/logout`).pipe(
      tap(() => this.clearSession())
    );
  }

  getToken(): string | null {
    return localStorage.getItem(this.TOKEN_KEY);
  }

  isAuthenticated(): boolean {
    return !!this.getToken();
  }

  clearSession(): void {
    localStorage.removeItem(this.TOKEN_KEY);
    localStorage.removeItem('auth_user');
    this.currentUser.set(null);
    this.router.navigate(['/auth/login']);
  }

  private loadUserFromStorage(): AuthUser | null {
    const raw = localStorage.getItem('auth_user');
    if (!raw) return null;
    try {
      return JSON.parse(raw) as AuthUser;
    } catch {
      return null;
    }
  }
}
