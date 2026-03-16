import { TestBed } from '@angular/core/testing';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { provideHttpClient } from '@angular/common/http';
import { StudySessionService } from './study-session.service';
import { StudySession, StudySessionResult } from '../models/study-session.model';

describe('StudySessionService', () => {
  let service: StudySessionService;
  let httpMock: HttpTestingController;

  const mockSession: StudySession = {
    id: 1,
    topic_id: 3,
    scheduled_date: '2026-03-20',
    expected_minutes: 30,
    actual_minutes: null,
    questions_done: 0,
    questions_correct: 0,
    status: 'scheduled',
    auto_generated: false,
    created_at: '2026-03-15'
  };

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        StudySessionService,
        provideHttpClient(),
        provideHttpClientTesting()
      ]
    });

    service = TestBed.inject(StudySessionService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  describe('getAll()', () => {
    it('should GET /api/v1/study_sessions', () => {
      service.getAll().subscribe(sessions => {
        expect(sessions.length).toBe(1);
        expect(sessions[0].id).toBe(1);
      });

      const req = httpMock.expectOne(r => r.url === '/api/v1/study_sessions');
      expect(req.request.method).toBe('GET');
      req.flush([mockSession]);
    });

    it('should pass status filter as query param', () => {
      service.getAll({ status: 'completed' }).subscribe();

      const req = httpMock.expectOne(r =>
        r.url === '/api/v1/study_sessions' && r.params.get('status') === 'completed'
      );
      expect(req.request.method).toBe('GET');
      req.flush([]);
    });

    it('should pass date_from filter as query param', () => {
      service.getAll({ date_from: '2026-03-01' }).subscribe();

      const req = httpMock.expectOne(r =>
        r.url === '/api/v1/study_sessions' && r.params.get('date_from') === '2026-03-01'
      );
      req.flush([]);
    });
  });

  describe('create()', () => {
    it('should POST /api/v1/study_sessions with study_session wrapper', () => {
      const payload = { topic_id: 3, scheduled_date: '2026-03-20', expected_minutes: 30 };
      service.create(payload).subscribe(session => {
        expect(session.id).toBe(1);
      });

      const req = httpMock.expectOne('/api/v1/study_sessions');
      expect(req.request.method).toBe('POST');
      expect(req.request.body).toEqual({ study_session: payload });
      req.flush(mockSession);
    });
  });

  describe('update()', () => {
    it('should PUT /api/v1/study_sessions/:id with study_session wrapper', () => {
      service.update(1, { expected_minutes: 45 }).subscribe(session => {
        expect(session.expected_minutes).toBe(45);
      });

      const req = httpMock.expectOne('/api/v1/study_sessions/1');
      expect(req.request.method).toBe('PUT');
      expect(req.request.body).toEqual({ study_session: { expected_minutes: 45 } });
      req.flush({ ...mockSession, expected_minutes: 45 });
    });
  });

  describe('delete()', () => {
    it('should DELETE /api/v1/study_sessions/:id', () => {
      service.delete(1).subscribe();

      const req = httpMock.expectOne('/api/v1/study_sessions/1');
      expect(req.request.method).toBe('DELETE');
      req.flush(null);
    });
  });

  describe('complete()', () => {
    it('should PUT /api/v1/study_sessions/:id/complete with result', () => {
      const result: StudySessionResult = { actual_minutes: 28, questions_done: 10, questions_correct: 8 };
      const completedSession = { ...mockSession, status: 'completed' as const, actual_minutes: 28 };
      const nextSession = { ...mockSession, id: 2, scheduled_date: '2026-03-26', auto_generated: true };

      service.complete(1, result).subscribe(res => {
        expect(res.session.status).toBe('completed');
        expect(res.next_session.auto_generated).toBe(true);
      });

      const req = httpMock.expectOne('/api/v1/study_sessions/1/complete');
      expect(req.request.method).toBe('PUT');
      expect(req.request.body).toEqual({ study_session: result });
      req.flush({ session: completedSession, next_session: nextSession });
    });
  });
});
