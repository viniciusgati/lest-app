import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { WeeklyGoal } from '../models/weekly-goal.model';

@Injectable({ providedIn: 'root' })
export class WeeklyGoalService {
  private readonly url = '/api/v1/weekly_goals';
  private http = inject(HttpClient);

  getCurrent(): Observable<WeeklyGoal> {
    return this.http.get<WeeklyGoal>(`${this.url}/current`);
  }

  updateCurrent(goal: Partial<WeeklyGoal>): Observable<WeeklyGoal> {
    return this.http.put<WeeklyGoal>(`${this.url}/current`, { weekly_goal: goal });
  }

  getHistory(): Observable<WeeklyGoal[]> {
    return this.http.get<WeeklyGoal[]>(this.url);
  }
}
