import { ComponentFixture, TestBed } from '@angular/core/testing';
import { vi } from 'vitest';
import { of, throwError } from 'rxjs';
import { provideRouter } from '@angular/router';
import { provideAnimationsAsync } from '@angular/platform-browser/animations/async';
import { ActivatedRoute } from '@angular/router';
import { Agenda } from './agenda';
import { StudySessionService } from '../../../core/services/study-session.service';
import { SubjectService } from '../../../core/services/subject.service';
import { TopicService } from '../../../core/services/topic.service';
import { ScheduleService } from '../../../core/services/schedule.service';
import { StudySession } from '../../../core/models/study-session.model';
import { Subject } from '../../../core/models/subject.model';
import { Topic } from '../../../core/models/topic.model';

const MOCK_SUBJECTS: Subject[] = [
  { id: 1, name: 'Matemática', created_at: '' }
];

const MOCK_TOPICS: Topic[] = [
  { id: 3, subject_id: 1, name: 'Álgebra', notes: null, ease_factor: 2.5, interval: 1, next_review: '2026-03-20', created_at: '' }
];

const MOCK_SESSION: StudySession = {
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

const LATE_SESSION: StudySession = {
  ...MOCK_SESSION,
  id: 2,
  scheduled_date: '2026-03-10',
  status: 'late'
};

describe('Agenda', () => {
  let fixture: ComponentFixture<Agenda>;
  let component: Agenda;
  let mockSessionService: {
    getAll: ReturnType<typeof vi.fn>;
    create: ReturnType<typeof vi.fn>;
    update: ReturnType<typeof vi.fn>;
    delete: ReturnType<typeof vi.fn>;
    complete: ReturnType<typeof vi.fn>;
  };
  let mockSubjectService: { getAll: ReturnType<typeof vi.fn> };
  let mockTopicService: { getAll: ReturnType<typeof vi.fn> };
  let mockScheduleService: { generate: ReturnType<typeof vi.fn> };

  beforeEach(async () => {
    mockSessionService = {
      getAll: vi.fn().mockReturnValue(of([MOCK_SESSION])),
      create: vi.fn(),
      update: vi.fn(),
      delete: vi.fn(),
      complete: vi.fn()
    };

    mockSubjectService = {
      getAll: vi.fn().mockReturnValue(of([...MOCK_SUBJECTS]))
    };

    mockTopicService = {
      getAll: vi.fn().mockReturnValue(of([...MOCK_TOPICS]))
    };
    mockScheduleService = {
      generate: vi.fn().mockReturnValue(of([]))
    };

    await TestBed.configureTestingModule({
      imports: [Agenda],
      providers: [
        provideRouter([]),
        provideAnimationsAsync(),
        { provide: StudySessionService, useValue: mockSessionService },
        { provide: SubjectService, useValue: mockSubjectService },
        { provide: TopicService, useValue: mockTopicService },
        { provide: ScheduleService, useValue: mockScheduleService }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(Agenda);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('deve ser criado', () => {
    expect(component).toBeTruthy();
  });

  describe('carregamento inicial', () => {
    it('carrega sessões ao iniciar', () => {
      expect(mockSessionService.getAll).toHaveBeenCalled();
      expect(component.sessions.length).toBe(1);
      expect(component.sessions[0].id).toBe(1);
    });

    it('carrega matérias ao iniciar', () => {
      expect(mockSubjectService.getAll).toHaveBeenCalled();
      expect(component.subjects.length).toBe(1);
    });

    it('define loading=false após carregar', () => {
      expect(component.loading).toBe(false);
    });

    it('define loading=false em caso de erro', () => {
      mockSessionService.getAll.mockReturnValue(throwError(() => new Error('HTTP error')));
      component.loadSessions();
      expect(component.loading).toBe(false);
    });
  });

  describe('criação de sessão', () => {
    it('cria sessão e adiciona à lista', () => {
      const novaSession: StudySession = { ...MOCK_SESSION, id: 2, scheduled_date: '2026-03-25' };
      mockSessionService.create.mockReturnValue(of(novaSession));

      component.scheduleForm.patchValue({
        scheduled_date: '2026-03-25',
        subject_id: 1,
        topic_id: 3,
        expected_minutes: 45
      });
      component.saveSession();

      expect(mockSessionService.create).toHaveBeenCalled();
      expect(component.sessions.length).toBe(2);
      expect(component.sessions[1].id).toBe(2);
    });

    it('fecha dialog após criar com sucesso', () => {
      mockSessionService.create.mockReturnValue(of(MOCK_SESSION));
      component.showScheduleDialog = true;
      component.scheduleForm.patchValue({
        scheduled_date: '2026-03-25',
        subject_id: 1,
        topic_id: 3,
        expected_minutes: 30
      });
      component.saveSession();
      expect(component.showScheduleDialog).toBe(false);
    });

    it('não salva se formulário inválido', () => {
      component.scheduleForm.reset();
      component.saveSession();
      expect(mockSessionService.create).not.toHaveBeenCalled();
    });

    it('abre dialog com data pré-preenchida ao chamar openNewSession com data', () => {
      component.openNewSession('2026-03-22');
      expect(component.showScheduleDialog).toBe(true);
      expect(component.scheduleForm.value.scheduled_date).toBe('2026-03-22');
    });
  });

  describe('seleção de matéria no form', () => {
    it('carrega temas ao selecionar matéria', () => {
      component.onSubjectChange(1);
      expect(mockTopicService.getAll).toHaveBeenCalledWith(1);
      expect(component.topics.length).toBe(1);
    });

    it('limpa temas e topic_id ao selecionar nova matéria', () => {
      component.scheduleForm.patchValue({ topic_id: 3 });
      component.onSubjectChange(1);
      expect(component.scheduleForm.value.topic_id).toBeNull();
    });

    it('limpa temas se subject_id for null', () => {
      component.topics = [...MOCK_TOPICS];
      component.onSubjectChange(null);
      expect(component.topics.length).toBe(0);
      expect(mockTopicService.getAll).not.toHaveBeenCalled();
    });
  });

  describe('remoção de sessão', () => {
    it('remove sessão da lista ao excluir', () => {
      mockSessionService.delete.mockReturnValue(of(undefined));
      component.selectedSession = MOCK_SESSION;
      component.deleteSession();

      expect(mockSessionService.delete).toHaveBeenCalledWith(1);
      expect(component.sessions.length).toBe(0);
    });

    it('fecha dialog de detalhe após excluir', () => {
      mockSessionService.delete.mockReturnValue(of(undefined));
      component.selectedSession = MOCK_SESSION;
      component.showDetailDialog = true;
      component.deleteSession();
      expect(component.showDetailDialog).toBe(false);
    });

    it('não faz nada se selectedSession for null', () => {
      component.selectedSession = null;
      component.deleteSession();
      expect(mockSessionService.delete).not.toHaveBeenCalled();
    });
  });

  describe('status labels e severity', () => {
    it('retorna label correto para scheduled', () => {
      expect(component.statusLabel('scheduled')).toBe('Agendada');
    });

    it('retorna label correto para completed', () => {
      expect(component.statusLabel('completed')).toBe('Concluída');
    });

    it('retorna label correto para late', () => {
      expect(component.statusLabel('late')).toBe('Atrasada');
    });

    it('retorna severity danger para late', () => {
      expect(component.statusSeverity('late')).toBe('danger');
    });

    it('retorna severity success para completed', () => {
      expect(component.statusSeverity('completed')).toBe('success');
    });

    it('retorna severity info para scheduled', () => {
      expect(component.statusSeverity('scheduled')).toBe('info');
    });
  });

  describe('detalhe da sessão', () => {
    it('abre dialog de detalhe com sessão selecionada', () => {
      component.openSessionDetail(MOCK_SESSION);
      expect(component.showDetailDialog).toBe(true);
      expect(component.selectedSession).toEqual(MOCK_SESSION);
    });

    it('resolve topic e subject via forkJoin ao abrir detalhe', () => {
      component.openSessionDetail(MOCK_SESSION);
      expect(mockTopicService.getAll).toHaveBeenCalledWith(MOCK_SUBJECTS[0].id);
      expect(component.selectedSessionTopic).toEqual(MOCK_TOPICS[0]);
      expect(component.selectedSessionSubject).toEqual(MOCK_SUBJECTS[0]);
    });

    it('não chama topicService se subjects estiver vazio', () => {
      component.subjects = [];
      mockTopicService.getAll.mockClear();
      component.openSessionDetail(MOCK_SESSION);
      expect(mockTopicService.getAll).not.toHaveBeenCalled();
    });

    it('define sessão atrasada corretamente', () => {
      mockSessionService.getAll.mockReturnValue(of([LATE_SESSION]));
      component.loadSessions();
      expect(component.sessions[0].status).toBe('late');
    });
  });

  describe('query param date (5.2 C1)', () => {
    it('usa initialDate padrão quando não há query param', () => {
      expect(component.calendarOptions.initialDate).toBeUndefined();
    });

    it('aplica initialDate quando query param date está presente', async () => {
      await TestBed.resetTestingModule();
      await TestBed.configureTestingModule({
        imports: [Agenda],
        providers: [
          provideAnimationsAsync(),
          provideRouter([]),
          {
            provide: ActivatedRoute,
            useValue: {
              snapshot: { queryParamMap: { get: (k: string) => k === 'date' ? '2026-03-17' : null } }
            }
          },
          { provide: StudySessionService, useValue: mockSessionService },
          { provide: SubjectService, useValue: mockSubjectService },
          { provide: TopicService, useValue: mockTopicService },
          { provide: ScheduleService, useValue: mockScheduleService }
        ]
      }).compileComponents();

      const f = TestBed.createComponent(Agenda);
      f.detectChanges();
      expect(f.componentInstance.calendarOptions.initialDate).toBe('2026-03-17');
    });
  });

  describe('gerar semana (6.2)', () => {
    const AUTO_SESSION: StudySession = {
      id: 10, topic_id: 3, scheduled_date: '2026-03-17',
      expected_minutes: 60, actual_minutes: null,
      questions_done: 0, questions_correct: 0,
      status: 'scheduled', auto_generated: true, created_at: ''
    };

    it('generating inicia como false', () => {
      expect(component.generating).toBe(false);
    });

    it('confirmGenerateSchedule chama confirmationService.confirm', () => {
      const confirmSpy = vi.spyOn((component as any).confirmationService, 'confirm');
      component.confirmGenerateSchedule();
      expect(confirmSpy).toHaveBeenCalled();
    });

    it('após confirmação, chama scheduleService.generate()', () => {
      mockScheduleService.generate.mockReturnValue(of([AUTO_SESSION]));
      // Acessa o accept diretamente simulando o confirm
      (component as any).confirmationService.confirm = (config: { accept: () => void }) => config.accept();
      component.confirmGenerateSchedule();
      expect(mockScheduleService.generate).toHaveBeenCalled();
    });

    it('atualiza sessions após geração com sucesso', () => {
      mockScheduleService.generate.mockReturnValue(of([AUTO_SESSION]));
      (component as any).confirmationService.confirm = (config: { accept: () => void }) => config.accept();
      component.confirmGenerateSchedule();
      expect(component.sessions.some(s => s.id === 10)).toBe(true);
    });

    it('mantém sessões completed após geração', () => {
      const completed: StudySession = { ...MOCK_SESSION, id: 99, status: 'completed', auto_generated: true };
      component.sessions = [MOCK_SESSION, completed];
      mockScheduleService.generate.mockReturnValue(of([AUTO_SESSION]));
      (component as any).confirmationService.confirm = (config: { accept: () => void }) => config.accept();
      component.confirmGenerateSchedule();
      expect(component.sessions.some(s => s.id === 99)).toBe(true);
    });

    it('defining generating=false após erro', () => {
      mockScheduleService.generate.mockReturnValue(throwError(() => ({ error: { error: 'fail' } })));
      (component as any).confirmationService.confirm = (config: { accept: () => void }) => config.accept();
      component.confirmGenerateSchedule();
      expect(component.generating).toBe(false);
    });
  });

  describe('registro de resultado (integração 4.3)', () => {
    const completedSession: StudySession = { ...MOCK_SESSION, status: 'completed', actual_minutes: 28 };
    const nextSession: StudySession = { ...MOCK_SESSION, id: 2, scheduled_date: '2026-03-26', auto_generated: true };

    it('abre dialog de registro ao chamar openCompleteSession', () => {
      component.showDetailDialog = true;
      component.openCompleteSession();
      expect(component.showDetailDialog).toBe(false);
      expect(component.showCompleteDialog).toBe(true);
    });

    it('atualiza sessão completada no calendário', () => {
      component.onSessionCompleted({ completedSession, nextSession });
      const found = component.sessions.find(s => s.id === 1);
      expect(found?.status).toBe('completed');
    });

    it('adiciona próxima sessão ao calendário', () => {
      component.onSessionCompleted({ completedSession, nextSession });
      const found = component.sessions.find(s => s.id === 2);
      expect(found?.auto_generated).toBe(true);
    });

    it('remove versão antiga da sessão completada', () => {
      component.onSessionCompleted({ completedSession, nextSession });
      const duplicates = component.sessions.filter(s => s.id === 1);
      expect(duplicates.length).toBe(1);
    });
  });
});
