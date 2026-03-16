import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { StudySession } from '../models/study-session.model';

@Injectable({ providedIn: 'root' })
export class ScheduleService {
  private http = inject(HttpClient);

  generate(): Observable<StudySession[]> {
    return this.http.post<StudySession[]>('/api/v1/schedule/generate', {});
  }
}
