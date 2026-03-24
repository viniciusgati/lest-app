import { Component, Output, EventEmitter, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ButtonModule } from 'primeng/button';

@Component({
  selector: 'app-study-timer',
  standalone: true,
  imports: [CommonModule, ButtonModule],
  template: `
    <div class="flex align-items-center gap-3">
      <span class="text-2xl font-mono font-bold">{{ displayTime }}</span>

      <p-button
        *ngIf="status === 'idle'"
        label="Iniciar"
        icon="pi pi-play"
        severity="success"
        size="small"
        (onClick)="start()"
      />
      <p-button
        *ngIf="status === 'running'"
        label="Pausar"
        icon="pi pi-pause"
        severity="warn"
        size="small"
        (onClick)="pause()"
      />
      <p-button
        *ngIf="status === 'paused'"
        label="Retomar"
        icon="pi pi-play"
        severity="success"
        size="small"
        (onClick)="resume()"
      />
      <p-button
        *ngIf="status === 'running' || status === 'paused'"
        label="Parar"
        icon="pi pi-stop"
        severity="danger"
        size="small"
        (onClick)="stop()"
      />
    </div>
  `
})
export class StudyTimer implements OnDestroy {
  @Output() timerStopped = new EventEmitter<number>();

  status: 'idle' | 'running' | 'paused' = 'idle';
  elapsedMs = 0;
  private intervalId?: ReturnType<typeof setInterval>;

  start(): void {
    this.status = 'running';
    this.intervalId = setInterval(() => (this.elapsedMs += 1000), 1000);
  }

  pause(): void {
    this.status = 'paused';
    clearInterval(this.intervalId);
  }

  resume(): void {
    this.start();
  }

  stop(): void {
    clearInterval(this.intervalId);
    this.status = 'idle';
    const minutes = Math.ceil(this.elapsedMs / 60000) || 1;
    this.timerStopped.emit(minutes);
    this.elapsedMs = 0;
  }

  get displayTime(): string {
    const totalSec = Math.floor(this.elapsedMs / 1000);
    const h = Math.floor(totalSec / 3600);
    const m = Math.floor((totalSec % 3600) / 60);
    const s = totalSec % 60;
    if (h > 0) {
      return `${h}:${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
    }
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  }

  ngOnDestroy(): void {
    if (this.status === 'running' && this.elapsedMs > 0) {
      this.timerStopped.emit(Math.ceil(this.elapsedMs / 60000) || 1);
    }
    clearInterval(this.intervalId);
  }
}
