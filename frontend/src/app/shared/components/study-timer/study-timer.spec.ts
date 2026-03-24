import { ComponentFixture, TestBed } from '@angular/core/testing';
import { vi } from 'vitest';
import { provideAnimationsAsync } from '@angular/platform-browser/animations/async';
import { StudyTimer } from './study-timer';

describe('StudyTimer', () => {
  let fixture: ComponentFixture<StudyTimer>;
  let component: StudyTimer;

  beforeEach(async () => {
    vi.useFakeTimers();

    await TestBed.configureTestingModule({
      imports: [StudyTimer],
      providers: [provideAnimationsAsync()]
    }).compileComponents();

    fixture = TestBed.createComponent(StudyTimer);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('deve ser criado', () => {
    expect(component).toBeTruthy();
  });

  it('inicia em status idle com elapsed 0', () => {
    expect(component.status).toBe('idle');
    expect(component.elapsedMs).toBe(0);
  });

  it('start() muda status para running', () => {
    component.start();
    expect(component.status).toBe('running');
  });

  it('start() incrementa elapsedMs a cada segundo', () => {
    component.start();
    vi.advanceTimersByTime(3000);
    expect(component.elapsedMs).toBe(3000);
  });

  it('pause() para o timer e muda status para paused', () => {
    component.start();
    vi.advanceTimersByTime(2000);
    component.pause();
    vi.advanceTimersByTime(2000);
    expect(component.elapsedMs).toBe(2000);
    expect(component.status).toBe('paused');
  });

  it('resume() continua o timer a partir do tempo pausado', () => {
    component.start();
    vi.advanceTimersByTime(2000);
    component.pause();
    component.resume();
    vi.advanceTimersByTime(3000);
    expect(component.elapsedMs).toBe(5000);
    expect(component.status).toBe('running');
  });

  it('stop() emite minutos e reseta estado', () => {
    const emitted: number[] = [];
    component.timerStopped.subscribe(m => emitted.push(m));

    component.start();
    vi.advanceTimersByTime(90000); // 90 segundos = 2 minutos (ceil)
    component.stop();

    expect(emitted).toEqual([2]);
    expect(component.status).toBe('idle');
    expect(component.elapsedMs).toBe(0);
  });

  it('stop() emite pelo menos 1 minuto mesmo com tempo pequeno', () => {
    const emitted: number[] = [];
    component.timerStopped.subscribe(m => emitted.push(m));

    component.start();
    vi.advanceTimersByTime(500); // menos de 1 minuto
    component.stop();

    expect(emitted[0]).toBe(1);
  });

  describe('displayTime', () => {
    it('exibe 00:00 no início', () => {
      expect(component.displayTime).toBe('00:00');
    });

    it('exibe MM:SS para tempo < 1 hora', () => {
      component.elapsedMs = 125000; // 2:05
      expect(component.displayTime).toBe('02:05');
    });

    it('exibe H:MM:SS para tempo >= 1 hora', () => {
      component.elapsedMs = 3661000; // 1:01:01
      expect(component.displayTime).toBe('1:01:01');
    });
  });

  it('ngOnDestroy emite parada se timer estiver rodando', () => {
    const emitted: number[] = [];
    component.timerStopped.subscribe(m => emitted.push(m));

    component.start();
    vi.advanceTimersByTime(60000);
    component.ngOnDestroy();

    expect(emitted.length).toBeGreaterThan(0);
  });

  it('ngOnDestroy não emite se timer nunca foi iniciado', () => {
    const emitted: number[] = [];
    component.timerStopped.subscribe(m => emitted.push(m));
    component.ngOnDestroy();
    expect(emitted.length).toBe(0);
  });
});
