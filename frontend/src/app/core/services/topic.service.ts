import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Topic } from '../models/topic.model';

@Injectable({ providedIn: 'root' })
export class TopicService {
  private http = inject(HttpClient);

  private url(subjectId: number): string {
    return `/api/v1/subjects/${subjectId}/topics`;
  }

  getAll(subjectId: number): Observable<Topic[]> {
    return this.http.get<Topic[]>(this.url(subjectId));
  }

  getOne(subjectId: number, id: number): Observable<Topic> {
    return this.http.get<Topic>(`${this.url(subjectId)}/${id}`);
  }

  create(subjectId: number, name: string): Observable<Topic> {
    return this.http.post<Topic>(this.url(subjectId), { topic: { name } });
  }

  update(subjectId: number, id: number, data: Partial<Pick<Topic, 'name' | 'notes'>>): Observable<Topic> {
    return this.http.put<Topic>(`${this.url(subjectId)}/${id}`, { topic: data });
  }

  delete(subjectId: number, id: number): Observable<void> {
    return this.http.delete<void>(`${this.url(subjectId)}/${id}`);
  }
}
