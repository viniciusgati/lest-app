import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { SubjectMetric, WeeklyProgress } from '../models/metrics.model';

@Injectable({ providedIn: 'root' })
export class MetricsService {
  private http = inject(HttpClient);
  private readonly base = '/api/v1/metrics';

  getSubjectsMetrics(): Observable<SubjectMetric[]> {
    return this.http.get<SubjectMetric[]>(`${this.base}/subjects`);
  }

  getWeeklyProgress(): Observable<WeeklyProgress> {
    return this.http.get<WeeklyProgress>(`${this.base}/weekly_progress`);
  }
}
