import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { SubjectMetric, WeeklyProgress, MetricsHistory, StreakData } from '../models/metrics.model';

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

  getHistory(weeks = 8): Observable<MetricsHistory> {
    return this.http.get<MetricsHistory>(`${this.base}/history`, { params: { weeks: weeks.toString() } });
  }

  getStreak(): Observable<StreakData> {
    return this.http.get<StreakData>(`${this.base}/streak`);
  }
}
