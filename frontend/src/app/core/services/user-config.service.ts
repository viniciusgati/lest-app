import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { UserConfig } from '../models/user-config.model';

@Injectable({ providedIn: 'root' })
export class UserConfigService {
  private readonly url = '/api/v1/user_config';
  private http = inject(HttpClient);

  get(): Observable<UserConfig> {
    return this.http.get<UserConfig>(this.url);
  }

  update(config: Partial<UserConfig>): Observable<UserConfig> {
    return this.http.put<UserConfig>(this.url, { user_config: config });
  }
}
