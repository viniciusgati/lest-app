import { TestBed } from '@angular/core/testing';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { provideHttpClient } from '@angular/common/http';
import { WeeklyGoalService } from './weekly-goal.service';
import { WeeklyGoal } from '../models/weekly-goal.model';

describe('WeeklyGoalService', () => {
  let service: WeeklyGoalService;
  let httpMock: HttpTestingController;

  const mockGoal: WeeklyGoal = {
    id: 1,
    week_start: '2026-03-09',
    target_hours: 10,
    target_questions: 50,
    target_percentage: 75
  };

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        WeeklyGoalService,
        provideHttpClient(),
        provideHttpClientTesting()
      ]
    });
    service = TestBed.inject(WeeklyGoalService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => httpMock.verify());

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  describe('getCurrent()', () => {
    it('should GET /api/v1/weekly_goals/current', () => {
      service.getCurrent().subscribe(goal => {
        expect(goal.week_start).toBe('2026-03-09');
      });
      const req = httpMock.expectOne('/api/v1/weekly_goals/current');
      expect(req.request.method).toBe('GET');
      req.flush(mockGoal);
    });
  });

  describe('updateCurrent()', () => {
    it('should PUT /api/v1/weekly_goals/current with correct body', () => {
      service.updateCurrent({ target_hours: 12 }).subscribe(goal => {
        expect(goal.target_hours).toBe(12);
      });
      const req = httpMock.expectOne('/api/v1/weekly_goals/current');
      expect(req.request.method).toBe('PUT');
      expect(req.request.body).toEqual({ weekly_goal: { target_hours: 12 } });
      req.flush({ ...mockGoal, target_hours: 12 });
    });
  });

  describe('getHistory()', () => {
    it('should GET /api/v1/weekly_goals', () => {
      service.getHistory().subscribe(goals => {
        expect(goals.length).toBe(1);
      });
      const req = httpMock.expectOne('/api/v1/weekly_goals');
      expect(req.request.method).toBe('GET');
      req.flush([mockGoal]);
    });
  });
});
