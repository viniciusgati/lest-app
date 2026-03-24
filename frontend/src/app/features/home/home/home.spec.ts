import { ComponentFixture, TestBed } from '@angular/core/testing';
import { vi } from 'vitest';
import { of, throwError } from 'rxjs';
import { provideRouter } from '@angular/router';
import { provideAnimationsAsync } from '@angular/platform-browser/animations/async';
import { Home } from './home';
import { MetricsService } from '../../../core/services/metrics.service';
import { StudySessionService } from '../../../core/services/study-session.service';
import { ScheduleService } from '../../../core/services/schedule.service';
import { SubjectMetric, WeeklyProgress, MetricsHistory } from '../../../core/models/metrics.model';
import { StudySession } from '../../../core/models/study-session.model';

const MOCK_PROGRESS: WeeklyProgress = {
  week_start: '2026-03-09',
  actual_hours: 3.0, actual_questions: 20, actual_percentage: 70.0,
  target_hours: 10.0, target_questions: 50, target_percentage: 75.0
};

const MOCK_SUBJECTS: SubjectMetric[] = [
  { id: 1, name: 'Matemática', accuracy_percentage: 80.0, sessions_count: 4 },
  { id: 2, name: 'Português', accuracy_percentage: null, sessions_count: 0 }
];

const today = new Date();
const todayStr = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`;

const MOCK_SESSION: StudySession = {
  id: 1, topic_id: 3, scheduled_date: todayStr,
  expected_minutes: 30, actual_minutes: null,
  questions_done: 0, questions_correct: 0,
  status: 'scheduled', auto_generated: false, created_at: ''
};

const LATE_SESSION: StudySession = {
  ...MOCK_SESSION, id: 2, status: 'late'
};

describe('Home', () => {
  let fixture: ComponentFixture<Home>;
  let component: Home;
  let mockMetrics: { getWeeklyProgress: ReturnType<typeof vi.fn>; getSubjectsMetrics: ReturnType<typeof vi.fn>; getHistory: ReturnType<typeof vi.fn> };
  let mockSessions: { getAll: ReturnType<typeof vi.fn> };
  let mockSchedule: { generate: ReturnType<typeof vi.fn> };

  beforeEach(async () => {
    const MOCK_HISTORY: MetricsHistory = { subjects: [] };
    mockMetrics = {
      getWeeklyProgress: vi.fn().mockReturnValue(of(MOCK_PROGRESS)),
      getSubjectsMetrics: vi.fn().mockReturnValue(of([...MOCK_SUBJECTS])),
      getHistory: vi.fn().mockReturnValue(of(MOCK_HISTORY))
    };
    mockSessions = {
      getAll: vi.fn().mockReturnValue(of({ data: [MOCK_SESSION], meta: { page: 1, per_page: 20, total: 1, total_pages: 1 } }))
    };
    mockSchedule = {
      generate: vi.fn().mockReturnValue(of([]))
    };

    await TestBed.configureTestingModule({
      imports: [Home],
      providers: [
        provideRouter([]),
        provideAnimationsAsync(),
        { provide: MetricsService, useValue: mockMetrics },
        { provide: StudySessionService, useValue: mockSessions },
        { provide: ScheduleService, useValue: mockSchedule }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(Home);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('deve ser criado', () => {
    expect(component).toBeTruthy();
  });

  describe('carregamento inicial via forkJoin', () => {
    it('carrega weeklyProgress', () => {
      expect(mockMetrics.getWeeklyProgress).toHaveBeenCalled();
      expect(component.weeklyProgress).toEqual(MOCK_PROGRESS);
    });

    it('carrega subjectsMetrics', () => {
      expect(mockMetrics.getSubjectsMetrics).toHaveBeenCalled();
      expect(component.subjectsMetrics.length).toBe(2);
    });

    it('carrega weekSessions com filtro de datas da semana', () => {
      expect(mockSessions.getAll).toHaveBeenCalledWith(
        expect.objectContaining({ date_from: expect.stringMatching(/^\d{4}-\d{2}-\d{2}$/), date_to: expect.stringMatching(/^\d{4}-\d{2}-\d{2}$/) })
      );
      expect(component.weekSessions.length).toBe(1);
    });

    it('define loading=false após carregar', () => {
      expect(component.loading).toBe(false);
    });

    it('define loading=false em caso de erro', () => {
      mockMetrics.getWeeklyProgress.mockReturnValue(throwError(() => new Error()));
      component.ngOnInit();
      expect(component.loading).toBe(false);
    });
  });

  describe('mini-calendário semanal', () => {
    it('computeWeekDates gera 7 datas', () => {
      expect(component.weekDates.length).toBe(7);
    });

    it('weekDates[0] é segunda-feira', () => {
      const monday = new Date(component.weekDates[0] + 'T00:00:00');
      expect(monday.getDay()).toBe(1); // 1 = segunda
    });

    it('weekDates[6] é domingo', () => {
      const sunday = new Date(component.weekDates[6] + 'T00:00:00');
      expect(sunday.getDay()).toBe(0); // 0 = domingo
    });

    it('isToday retorna true para data de hoje', () => {
      expect(component.isToday(todayStr)).toBe(true);
    });

    it('isToday retorna false para outra data', () => {
      expect(component.isToday('2020-01-01')).toBe(false);
    });

    it('dayOfMonth retorna número sem zero à esquerda', () => {
      expect(component.dayOfMonth('2026-03-05')).toBe('5');
      expect(component.dayOfMonth('2026-03-15')).toBe('15');
    });

    it('sessionsForDay retorna sessões do dia', () => {
      const sessions = component.sessionsForDay(todayStr);
      expect(sessions.length).toBe(1);
      expect(sessions[0].id).toBe(1);
    });

    it('sessionsForDay retorna vazio para dia sem sessões', () => {
      expect(component.sessionsForDay('2020-01-01').length).toBe(0);
    });

    it('statusColor retorna vermelho para late', () => {
      expect(component.statusColor('late')).toBe('#ef4444');
    });

    it('statusColor retorna verde para completed', () => {
      expect(component.statusColor('completed')).toBe('#22c55e');
    });

    it('statusColor retorna azul para scheduled', () => {
      expect(component.statusColor('scheduled')).toBe('#3b82f6');
    });
  });

  describe('progresso semanal', () => {
    it('progressValue retorna 0 quando target é 0', () => {
      expect(component.progressValue(5, 0)).toBe(0);
    });

    it('progressValue calcula percentual corretamente', () => {
      expect(component.progressValue(3, 10)).toBe(30);
    });

    it('progressValue limita a 100', () => {
      expect(component.progressValue(15, 10)).toBe(100);
    });

    it('progressColor retorna success quando atingiu meta', () => {
      expect(component.progressColor(10, 10)).toBe('success');
    });

    it('progressColor retorna warning quando parcial', () => {
      expect(component.progressColor(5, 10)).toBe('warning');
    });

    it('progressColor retorna vazio quando target é 0', () => {
      expect(component.progressColor(0, 0)).toBe('');
    });
  });

  describe('desempenho por matéria', () => {
    it('carrega lista de matérias', () => {
      expect(component.subjectsMetrics.length).toBe(2);
      expect(component.subjectsMetrics[0].name).toBe('Matemática');
    });

    it('matéria sem sessões tem accuracy_percentage null', () => {
      expect(component.subjectsMetrics[1].accuracy_percentage).toBeNull();
    });

    it('estado vazio quando não há matérias', () => {
      mockMetrics.getSubjectsMetrics.mockReturnValue(of([]));
      component.ngOnInit();
      expect(component.subjectsMetrics.length).toBe(0);
    });
  });

  describe('sessão atrasada', () => {
    it('statusColor retorna vermelho para sessão late', () => {
      mockSessions.getAll.mockReturnValue(of({ data: [LATE_SESSION], meta: { page: 1, per_page: 20, total: 1, total_pages: 1 } }));
      component.ngOnInit();
      const sessions = component.sessionsForDay(todayStr);
      expect(sessions[0].status).toBe('late');
      expect(component.statusColor('late')).toBe('#ef4444');
    });
  });

  describe('gerar semana', () => {
    const NEW_SESSION: StudySession = {
      id: 5, topic_id: 3, scheduled_date: todayStr,
      expected_minutes: 60, actual_minutes: null,
      questions_done: 0, questions_correct: 0,
      status: 'scheduled', auto_generated: true, created_at: ''
    };

    it('hasGoal é true quando target_hours > 0', () => {
      expect(component.hasGoal).toBe(true);
    });

    it('hasGoal é false quando weeklyProgress não tem meta', () => {
      mockMetrics.getWeeklyProgress.mockReturnValue(of({
        ...MOCK_PROGRESS, target_hours: 0
      }));
      component.ngOnInit();
      expect(component.hasGoal).toBe(false);
    });

    it('generateSchedule chama scheduleService.generate()', () => {
      mockSchedule.generate.mockReturnValue(of([NEW_SESSION]));
      component.generateSchedule();
      expect(mockSchedule.generate).toHaveBeenCalled();
    });

    it('generateSchedule atualiza weekSessions com novas sessões', () => {
      mockSchedule.generate.mockReturnValue(of([NEW_SESSION]));
      component.weekSessions = [MOCK_SESSION];
      component.generateSchedule();
      const ids = component.weekSessions.map(s => s.id);
      expect(ids).toContain(5);
    });

    it('generateSchedule mantém sessões completed existentes', () => {
      const completed: StudySession = { ...MOCK_SESSION, id: 10, status: 'completed' };
      mockSchedule.generate.mockReturnValue(of([NEW_SESSION]));
      component.weekSessions = [MOCK_SESSION, completed];
      component.generateSchedule();
      const ids = component.weekSessions.map(s => s.id);
      expect(ids).toContain(10);
    });

    it('generateSchedule define generating=false após sucesso', () => {
      mockSchedule.generate.mockReturnValue(of([NEW_SESSION]));
      component.generateSchedule();
      expect(component.generating).toBe(false);
    });

    it('generateSchedule define generating=false em erro', () => {
      mockSchedule.generate.mockReturnValue(throwError(() => ({ error: { error: 'fail' } })));
      component.generateSchedule();
      expect(component.generating).toBe(false);
    });

    it('confirmGenerate exibe aviso quando não há matérias', () => {
      component.subjectsMetrics = [];
      component.confirmGenerate();
      expect(mockSchedule.generate).not.toHaveBeenCalled();
    });
  });
});
