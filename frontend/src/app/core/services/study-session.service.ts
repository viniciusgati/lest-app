import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, map } from 'rxjs';
import { StudySession, StudySessionResult } from '../models/study-session.model';
import { PaginatedResponse } from '../models/paginated-response.model';

@Injectable({ providedIn: 'root' })
export class StudySessionService {
  private http = inject(HttpClient);
  private readonly url = '/api/v1/study_sessions';

  getAll(filters?: { status?: string; date_from?: string; date_to?: string; page?: number; per_page?: number }): Observable<PaginatedResponse<StudySession>> {
    return this.http.get<PaginatedResponse<StudySession>>(this.url, { params: filters ?? {} });
  }

  getAllData(filters?: { status?: string; date_from?: string; date_to?: string }): Observable<StudySession[]> {
    return this.getAll(filters).pipe(map(r => r.data));
  }

  create(session: Partial<StudySession>): Observable<StudySession> {
    return this.http.post<StudySession>(this.url, { study_session: session });
  }

  update(id: number, session: Partial<StudySession>): Observable<StudySession> {
    return this.http.put<StudySession>(`${this.url}/${id}`, { study_session: session });
  }

  delete(id: number): Observable<void> {
    return this.http.delete<void>(`${this.url}/${id}`);
  }

  complete(id: number, result: StudySessionResult): Observable<{ session: StudySession; next_session: StudySession }> {
    return this.http.put<{ session: StudySession; next_session: StudySession }>(
      `${this.url}/${id}/complete`,
      { study_session: result }
    );
  }
}
