import { TestBed } from '@angular/core/testing';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { provideHttpClient } from '@angular/common/http';
import { MetricsService } from './metrics.service';
import { SubjectMetric, WeeklyProgress, MetricsHistory, StreakData } from '../models/metrics.model';

describe('MetricsService', () => {
  let service: MetricsService;
  let httpMock: HttpTestingController;

  const mockSubjectMetric: SubjectMetric = {
    id: 1, name: 'Matemática', accuracy_percentage: 75.0, sessions_count: 4
  };

  const mockWeeklyProgress: WeeklyProgress = {
    week_start: '2026-03-09',
    actual_hours: 4.5, actual_questions: 30, actual_percentage: 68.0,
    target_hours: 10.0, target_questions: 50, target_percentage: 75.0
  };

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [MetricsService, provideHttpClient(), provideHttpClientTesting()]
    });
    service = TestBed.inject(MetricsService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => httpMock.verify());

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  describe('getSubjectsMetrics()', () => {
    it('should GET /api/v1/metrics/subjects', () => {
      service.getSubjectsMetrics().subscribe(metrics => {
        expect(metrics.length).toBe(1);
        expect(metrics[0].name).toBe('Matemática');
      });
      const req = httpMock.expectOne('/api/v1/metrics/subjects');
      expect(req.request.method).toBe('GET');
      req.flush([mockSubjectMetric]);
    });
  });

  describe('getWeeklyProgress()', () => {
    it('should GET /api/v1/metrics/weekly_progress', () => {
      service.getWeeklyProgress().subscribe(progress => {
        expect(progress.actual_hours).toBe(4.5);
        expect(progress.target_hours).toBe(10.0);
      });
      const req = httpMock.expectOne('/api/v1/metrics/weekly_progress');
      expect(req.request.method).toBe('GET');
      req.flush(mockWeeklyProgress);
    });
  });

  describe('getHistory()', () => {
    const mockHistory: MetricsHistory = {
      subjects: [
        { id: 1, name: 'Matemática', weeks: [{ week_start: '2026-03-09', accuracy: 0.75, sessions_count: 3 }] }
      ]
    };

    it('should GET /api/v1/metrics/history com weeks=8 por padrão', () => {
      service.getHistory().subscribe(h => {
        expect(h.subjects.length).toBe(1);
        expect(h.subjects[0].name).toBe('Matemática');
      });
      const req = httpMock.expectOne('/api/v1/metrics/history?weeks=8');
      expect(req.request.method).toBe('GET');
      req.flush(mockHistory);
    });

    it('should GET /api/v1/metrics/history com weeks customizado', () => {
      service.getHistory(4).subscribe();
      const req = httpMock.expectOne('/api/v1/metrics/history?weeks=4');
      expect(req.request.method).toBe('GET');
      req.flush({ subjects: [] });
    });
  });

  describe('getStreak()', () => {
    const mockStreak: StreakData = {
      current_streak: 5,
      longest_streak: 14,
      last_study_date: '2026-03-22',
      studied_today: false
    };

    it('should GET /api/v1/metrics/streak', () => {
      service.getStreak().subscribe(streak => {
        expect(streak.current_streak).toBe(5);
        expect(streak.longest_streak).toBe(14);
        expect(streak.studied_today).toBe(false);
      });
      const req = httpMock.expectOne('/api/v1/metrics/streak');
      expect(req.request.method).toBe('GET');
      req.flush(mockStreak);
    });

    it('retorna last_study_date como string ISO', () => {
      service.getStreak().subscribe(streak => {
        expect(streak.last_study_date).toBe('2026-03-22');
      });
      const req = httpMock.expectOne('/api/v1/metrics/streak');
      req.flush(mockStreak);
    });
  });
});
