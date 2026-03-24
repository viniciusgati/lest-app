import { ComponentFixture, TestBed } from '@angular/core/testing';
import { vi } from 'vitest';
import { of, throwError } from 'rxjs';
import { provideAnimationsAsync } from '@angular/platform-browser/animations/async';
import { CompleteSession } from './complete-session';
import { StudySessionService } from '../../../core/services/study-session.service';
import { StudySession } from '../../../core/models/study-session.model';

const MOCK_SESSION: StudySession = {
  id: 1,
  topic_id: 3,
  scheduled_date: '2026-03-15',
  expected_minutes: 30,
  actual_minutes: null,
  questions_done: 0,
  questions_correct: 0,
  status: 'scheduled',
  auto_generated: false,
  created_at: '2026-03-10'
};

const COMPLETED_SESSION: StudySession = {
  ...MOCK_SESSION,
  status: 'completed',
  actual_minutes: 28,
  questions_done: 10,
  questions_correct: 8
};

const NEXT_SESSION: StudySession = {
  ...MOCK_SESSION,
  id: 2,
  scheduled_date: '2026-03-30',
  auto_generated: true
};

describe('CompleteSession', () => {
  let fixture: ComponentFixture<CompleteSession>;
  let component: CompleteSession;
  let mockService: {
    complete: ReturnType<typeof vi.fn>;
    update: ReturnType<typeof vi.fn>;
  };

  beforeEach(async () => {
    mockService = {
      complete: vi.fn().mockReturnValue(of({ session: COMPLETED_SESSION, next_session: NEXT_SESSION })),
      update: vi.fn()
    };

    await TestBed.configureTestingModule({
      imports: [CompleteSession],
      providers: [
        provideAnimationsAsync(),
        { provide: StudySessionService, useValue: mockService }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(CompleteSession);
    component = fixture.componentInstance;
    component.session = MOCK_SESSION;
    fixture.detectChanges();
  });

  it('deve ser criado', () => {
    expect(component).toBeTruthy();
  });

  describe('validação do formulário', () => {
    it('formulário inválido quando actual_minutes é null', () => {
      component.resultForm.patchValue({ actual_minutes: null, questions_done: 5, questions_correct: 3 });
      expect(component.resultForm.invalid).toBe(true);
    });

    it('formulário inválido quando actual_minutes < 1', () => {
      component.resultForm.patchValue({ actual_minutes: 0, questions_done: 5, questions_correct: 3 });
      expect(component.resultForm.invalid).toBe(true);
    });

    it('formulário inválido quando questions_correct > questions_done', () => {
      component.resultForm.patchValue({ actual_minutes: 20, questions_done: 5, questions_correct: 8 });
      expect(component.resultForm.errors?.['correctsExceedDone']).toBe(true);
    });

    it('formulário válido quando questions_correct === questions_done', () => {
      component.resultForm.patchValue({ actual_minutes: 20, questions_done: 5, questions_correct: 5 });
      expect(component.resultForm.valid).toBe(true);
    });

    it('formulário válido com dados corretos', () => {
      component.resultForm.patchValue({ actual_minutes: 25, questions_done: 10, questions_correct: 8 });
      expect(component.resultForm.valid).toBe(true);
    });

    it('não chama service se formulário inválido', () => {
      component.resultForm.patchValue({ actual_minutes: null });
      component.submit();
      expect(mockService.complete).not.toHaveBeenCalled();
    });
  });

  describe('submit', () => {
    beforeEach(() => {
      component.resultForm.patchValue({ actual_minutes: 28, questions_done: 10, questions_correct: 8 });
    });

    it('chama service.complete com params corretos', () => {
      component.submit();
      expect(mockService.complete).toHaveBeenCalledWith(1, {
        actual_minutes: 28, questions_done: 10, questions_correct: 8
      });
    });

    it('avança para step 2 após sucesso', () => {
      component.submit();
      expect(component.step).toBe(2);
    });

    it('armazena completedSession e nextSession após sucesso', () => {
      component.submit();
      expect(component.completedSession).toEqual(COMPLETED_SESSION);
      expect(component.nextSession).toEqual(NEXT_SESSION);
    });

    it('define loading=false após sucesso', () => {
      component.submit();
      expect(component.loading).toBe(false);
    });

    it('define loading=false em caso de erro', () => {
      mockService.complete.mockReturnValue(throwError(() => ({ error: { errors: ['Erro'] } })));
      component.submit();
      expect(component.loading).toBe(false);
    });

    it('permanece no step 1 em caso de erro', () => {
      mockService.complete.mockReturnValue(throwError(() => new Error('HTTP error')));
      component.submit();
      expect(component.step).toBe(1);
    });
  });

  describe('sugestão SM-2 (step 2)', () => {
    beforeEach(() => {
      component.completedSession = COMPLETED_SESSION;
      component.nextSession = NEXT_SESSION;
      component.step = 2;
    });

    it('calcula porcentagem corretamente', () => {
      component.resultForm.patchValue({ questions_done: 10, questions_correct: 8 });
      expect(component.percentage).toBe(80);
    });

    it('retorna 0% quando questions_done = 0', () => {
      component.resultForm.patchValue({ questions_done: 0, questions_correct: 0 });
      expect(component.percentage).toBe(0);
    });

    it('formata nextReviewLabel em pt-BR', () => {
      expect(component.nextReviewLabel).toBeTruthy();
      expect(component.nextReviewLabel).toMatch(/de/);
    });

    it('calcula interval em dias', () => {
      expect(component.interval).toBeGreaterThan(0);
    });

    it('emite sessionCompleted ao aceitar', () => {
      const spy = vi.fn();
      component.sessionCompleted.subscribe(spy);
      component.accept();
      expect(spy).toHaveBeenCalledWith({
        completedSession: COMPLETED_SESSION,
        nextSession: NEXT_SESSION
      });
    });

    it('fecha dialog ao aceitar', () => {
      const spy = vi.fn();
      component.visibleChange.subscribe(spy);
      component.accept();
      expect(spy).toHaveBeenCalledWith(false);
    });
  });

  describe('ajuste de data (step 3)', () => {
    beforeEach(() => {
      component.completedSession = COMPLETED_SESSION;
      component.nextSession = NEXT_SESSION;
      component.step = 2;
      component.adjustingDate = true;
    });

    it('chama update com nova data ao confirmar', () => {
      const newDate = new Date(2026, 2, 28); // local time: março 28
      component.adjustedDate = newDate;
      mockService.update = vi.fn().mockReturnValue(of({ ...NEXT_SESSION, scheduled_date: '2026-03-28' }));
      component.confirmAdjusted();
      expect(mockService.update).toHaveBeenCalledWith(2, { scheduled_date: '2026-03-28' });
    });

    it('emite sessionCompleted com sessão atualizada', () => {
      const updated = { ...NEXT_SESSION, scheduled_date: '2026-03-28' };
      mockService.update = vi.fn().mockReturnValue(of(updated));
      component.adjustedDate = new Date(2026, 2, 28); // local time

      const spy = vi.fn();
      component.sessionCompleted.subscribe(spy);
      component.confirmAdjusted();

      expect(spy).toHaveBeenCalledWith({
        completedSession: COMPLETED_SESSION,
        nextSession: updated
      });
    });

    it('não chama update se adjustedDate é null', () => {
      component.adjustedDate = null;
      component.confirmAdjusted();
      expect(mockService.update).not.toHaveBeenCalled();
    });
  });

  describe('reset e fechamento', () => {
    it('reseta estado ao chamar reset()', () => {
      component.step = 2;
      component.adjustingDate = true;
      component.completedSession = COMPLETED_SESSION;
      component.reset();

      expect(component.step).toBe(1);
      expect(component.adjustingDate).toBe(false);
      expect(component.completedSession).toBeNull();
      expect(component.nextSession).toBeNull();
    });

    it('emite visibleChange=false ao fechar', () => {
      const spy = vi.fn();
      component.visibleChange.subscribe(spy);
      component.close();
      expect(spy).toHaveBeenCalledWith(false);
    });

    it('onDialogHide emite visibleChange=false e reseta estado', () => {
      const spy = vi.fn();
      component.visibleChange.subscribe(spy);
      component.step = 2;
      component.adjustingDate = true;
      component.onDialogHide();
      expect(spy).toHaveBeenCalledWith(false);
      expect(component.step).toBe(1);
      expect(component.adjustingDate).toBe(false);
    });
  });
});
