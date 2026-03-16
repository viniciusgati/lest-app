import { ComponentFixture, TestBed } from '@angular/core/testing';
import { vi } from 'vitest';
import { of } from 'rxjs';
import { provideAnimationsAsync } from '@angular/platform-browser/animations/async';
import { Goals } from './goals';
import { WeeklyGoalService } from '../../../core/services/weekly-goal.service';
import { UserConfigService } from '../../../core/services/user-config.service';
import { WeeklyGoal } from '../../../core/models/weekly-goal.model';
import { UserConfig } from '../../../core/models/user-config.model';

const mockGoal: WeeklyGoal = {
  id: 1,
  week_start: '2026-03-09',
  target_hours: 10,
  target_questions: 50,
  target_percentage: 75
};

const mockConfig: UserConfig = {
  id: 1,
  available_days: ['mon', 'tue', 'wed'],
  schedule_strategy: 'sm2'
};

describe('Goals', () => {
  let fixture: ComponentFixture<Goals>;
  let component: Goals;
  let mockGoalService: { getCurrent: ReturnType<typeof vi.fn>; updateCurrent: ReturnType<typeof vi.fn>; getHistory: ReturnType<typeof vi.fn> };
  let mockConfigService: { get: ReturnType<typeof vi.fn>; update: ReturnType<typeof vi.fn> };

  beforeEach(async () => {
    mockGoalService = {
      getCurrent: vi.fn().mockReturnValue(of({ ...mockGoal })),
      updateCurrent: vi.fn().mockReturnValue(of({ ...mockGoal })),
      getHistory: vi.fn().mockReturnValue(of([]))
    };
    mockConfigService = {
      get: vi.fn().mockReturnValue(of({ ...mockConfig })),
      update: vi.fn().mockReturnValue(of({ ...mockConfig }))
    };

    await TestBed.configureTestingModule({
      imports: [Goals],
      providers: [
        provideAnimationsAsync(),
        { provide: WeeklyGoalService, useValue: mockGoalService },
        { provide: UserConfigService, useValue: mockConfigService }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(Goals);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('deve ser criado', () => {
    expect(component).toBeTruthy();
  });

  it('carrega meta e config ao iniciar', () => {
    expect(mockGoalService.getCurrent).toHaveBeenCalled();
    expect(mockConfigService.get).toHaveBeenCalled();
    expect(component.goalForm.value.target_hours).toBe(10);
    expect(component.goalForm.value.target_questions).toBe(50);
    expect(component.goalForm.value.target_percentage).toBe(75);
  });

  it('popula selectedDays com dados da config', () => {
    expect(component.selectedDays).toContain('mon');
    expect(component.selectedDays).toContain('tue');
    expect(component.selectedDays).toContain('wed');
  });

  it('popula selectedStrategy com dados da config', () => {
    expect(component.selectedStrategy).toBe('sm2');
  });

  it('salva meta ao chamar saveGoal()', () => {
    component.goalForm.patchValue({ target_hours: 12 });
    component.saveGoal();
    expect(mockGoalService.updateCurrent).toHaveBeenCalledWith(
      expect.objectContaining({ target_hours: 12 })
    );
  });

  it('não salva meta se formulário inválido', () => {
    component.goalForm.patchValue({ target_percentage: 150 });
    component.saveGoal();
    expect(mockGoalService.updateCurrent).not.toHaveBeenCalled();
  });

  it('salva config ao chamar saveConfig()', () => {
    component.selectedDays = ['mon', 'wed'];
    component.selectedStrategy = 'balanced';
    component.saveConfig();
    expect(mockConfigService.update).toHaveBeenCalledWith({
      available_days: ['mon', 'wed'],
      schedule_strategy: 'balanced'
    });
  });

  it('não salva config quando nenhum dia selecionado', () => {
    component.selectedDays = [];
    component.saveConfig();
    expect(mockConfigService.update).not.toHaveBeenCalled();
  });

  it('noDaySelected retorna true quando selectedDays está vazio', () => {
    component.selectedDays = [];
    expect(component.noDaySelected).toBe(true);
  });

  it('noDaySelected retorna false quando há dias selecionados', () => {
    component.selectedDays = ['mon'];
    expect(component.noDaySelected).toBe(false);
  });

  describe('progressColor()', () => {
    it('retorna "success" quando atingiu a meta', () => {
      expect(component.progressColor(10, 10)).toBe('success');
      expect(component.progressColor(15, 10)).toBe('success');
    });

    it('retorna "warning" quando há progresso parcial', () => {
      expect(component.progressColor(5, 10)).toBe('warning');
    });

    it('retorna "" quando sem progresso', () => {
      expect(component.progressColor(0, 10)).toBe('');
    });

    it('retorna "" quando meta é 0', () => {
      expect(component.progressColor(0, 0)).toBe('');
    });
  });

  describe('progressValue()', () => {
    it('calcula percentual correto', () => {
      expect(component.progressValue(5, 10)).toBe(50);
      expect(component.progressValue(10, 10)).toBe(100);
    });

    it('limita a 100 quando supera a meta', () => {
      expect(component.progressValue(20, 10)).toBe(100);
    });

    it('retorna 0 quando meta é 0', () => {
      expect(component.progressValue(0, 0)).toBe(0);
    });
  });

  it('gera weekLabel com formato correto', () => {
    expect(component.weekLabel).toMatch(/\d+ de .+ a \d+ de .+ de \d{4}/);
  });
});
