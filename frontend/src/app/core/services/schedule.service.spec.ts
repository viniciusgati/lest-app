import { TestBed } from '@angular/core/testing';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { provideHttpClient } from '@angular/common/http';
import { ScheduleService } from './schedule.service';
import { StudySession } from '../models/study-session.model';

describe('ScheduleService', () => {
  let service: ScheduleService;
  let httpMock: HttpTestingController;

  const mockSession: StudySession = {
    id: 1, topic_id: 3, scheduled_date: '2026-03-17',
    expected_minutes: 60, actual_minutes: null,
    questions_done: 0, questions_correct: 0,
    status: 'scheduled', auto_generated: true, created_at: ''
  };

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [ScheduleService, provideHttpClient(), provideHttpClientTesting()]
    });
    service = TestBed.inject(ScheduleService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => httpMock.verify());

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  describe('generate()', () => {
    it('should POST /api/v1/schedule/generate', () => {
      service.generate().subscribe(sessions => {
        expect(sessions.length).toBe(1);
        expect(sessions[0].auto_generated).toBe(true);
      });
      const req = httpMock.expectOne('/api/v1/schedule/generate');
      expect(req.request.method).toBe('POST');
      req.flush([mockSession]);
    });

    it('should send empty body', () => {
      service.generate().subscribe();
      const req = httpMock.expectOne('/api/v1/schedule/generate');
      expect(req.request.body).toEqual({});
      req.flush([]);
    });

    it('should return empty array when no sessions generated', () => {
      service.generate().subscribe(sessions => {
        expect(sessions).toEqual([]);
      });
      const req = httpMock.expectOne('/api/v1/schedule/generate');
      req.flush([]);
    });
  });
});
