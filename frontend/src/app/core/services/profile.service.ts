import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface UserProfile {
  id: number;
  name: string;
  email: string;
  created_at?: string;
}

export interface UpdateProfileDto {
  name?: string;
  current_password?: string;
  password?: string;
  password_confirmation?: string;
}

@Injectable({ providedIn: 'root' })
export class ProfileService {
  private readonly url = '/api/v1/profile';
  private http = inject(HttpClient);

  getProfile(): Observable<UserProfile> {
    return this.http.get<UserProfile>(this.url);
  }

  updateProfile(data: UpdateProfileDto): Observable<UserProfile> {
    return this.http.put<UserProfile>(this.url, data);
  }
}
