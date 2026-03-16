import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Subject } from '../models/subject.model';

@Injectable({ providedIn: 'root' })
export class SubjectService {
  private readonly url = '/api/v1/subjects';

  constructor(private http: HttpClient) {}

  getAll(): Observable<Subject[]> {
    return this.http.get<Subject[]>(this.url);
  }

  getOne(id: number): Observable<Subject> {
    return this.http.get<Subject>(`${this.url}/${id}`);
  }

  create(name: string): Observable<Subject> {
    return this.http.post<Subject>(this.url, { subject: { name } });
  }

  update(id: number, name: string): Observable<Subject> {
    return this.http.put<Subject>(`${this.url}/${id}`, { subject: { name } });
  }

  delete(id: number): Observable<void> {
    return this.http.delete<void>(`${this.url}/${id}`);
  }
}
