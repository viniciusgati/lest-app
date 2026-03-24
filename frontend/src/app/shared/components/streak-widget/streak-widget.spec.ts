import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideAnimationsAsync } from '@angular/platform-browser/animations/async';
import { StreakWidget } from './streak-widget';
import { StreakData } from '../../../core/models/metrics.model';

const makeStreak = (current: number, longest = current): StreakData => ({
  current_streak: current,
  longest_streak: longest,
  last_study_date: current > 0 ? '2026-03-22' : null,
  studied_today: false
});

describe('StreakWidget', () => {
  let fixture: ComponentFixture<StreakWidget>;
  let component: StreakWidget;

  async function create(streak: StreakData) {
    await TestBed.configureTestingModule({
      imports: [StreakWidget],
      providers: [provideAnimationsAsync()]
    }).compileComponents();

    fixture = TestBed.createComponent(StreakWidget);
    component = fixture.componentInstance;
    component.streak = streak;
    fixture.detectChanges();
  }

  describe('streakClass', () => {
    it('retorna streak-zero quando current_streak é 0', async () => {
      await create(makeStreak(0));
      expect(component.streakClass).toBe('streak-zero');
    });

    it('retorna streak-low para 1 a 6 dias', async () => {
      await create(makeStreak(3));
      expect(component.streakClass).toBe('streak-low');
    });

    it('retorna streak-low no limite inferior (1 dia)', async () => {
      await create(makeStreak(1));
      expect(component.streakClass).toBe('streak-low');
    });

    it('retorna streak-low no limite superior (6 dias)', async () => {
      await create(makeStreak(6));
      expect(component.streakClass).toBe('streak-low');
    });

    it('retorna streak-medium para 7 a 29 dias', async () => {
      await create(makeStreak(7));
      expect(component.streakClass).toBe('streak-medium');
    });

    it('retorna streak-medium no limite superior (29 dias)', async () => {
      await create(makeStreak(29));
      expect(component.streakClass).toBe('streak-medium');
    });

    it('retorna streak-high para 30+ dias', async () => {
      await create(makeStreak(30));
      expect(component.streakClass).toBe('streak-high');
    });

    it('retorna streak-high para streaks grandes (100 dias)', async () => {
      await create(makeStreak(100));
      expect(component.streakClass).toBe('streak-high');
    });
  });

  describe('template — streak ativo', () => {
    beforeEach(async () => {
      await create(makeStreak(5, 10));
    });

    it('exibe ícone de fogo quando streak > 0', () => {
      const icon = fixture.nativeElement.querySelector('.streak-icon');
      expect(icon.textContent.trim()).toBe('🔥');
    });

    it('exibe contagem de dias no singular (1 dia)', async () => {
      TestBed.resetTestingModule();
      await create(makeStreak(1));
      const count = fixture.nativeElement.querySelector('.streak-count');
      expect(count.textContent).toContain('1 dia');
      expect(count.textContent).not.toContain('dias');
    });

    it('exibe contagem de dias no plural (5 dias)', () => {
      const count = fixture.nativeElement.querySelector('.streak-count');
      expect(count.textContent).toContain('5 dias');
    });
  });

  describe('template — streak zero', () => {
    beforeEach(async () => {
      await create(makeStreak(0));
    });

    it('exibe ícone de livro quando streak é 0', () => {
      const icon = fixture.nativeElement.querySelector('.streak-icon');
      expect(icon.textContent.trim()).toBe('📚');
    });

    it('exibe label "Comece hoje!" quando streak é 0', () => {
      const label = fixture.nativeElement.querySelector('.streak-label');
      expect(label.textContent.trim()).toBe('Comece hoje!');
    });
  });
});
