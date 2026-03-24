import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TooltipModule } from 'primeng/tooltip';
import { StreakData } from '../../../core/models/metrics.model';

@Component({
  selector: 'app-streak-widget',
  standalone: true,
  imports: [CommonModule, TooltipModule],
  template: `
    <div class="streak-widget" [ngClass]="streakClass" [pTooltip]="'Recorde: ' + streak.longest_streak + ' dias'" tooltipPosition="top">
      @if (streak.current_streak > 0) {
        <span class="streak-icon">🔥</span>
        <span class="streak-count">{{ streak.current_streak }} {{ streak.current_streak === 1 ? 'dia' : 'dias' }}</span>
      } @else {
        <span class="streak-icon">📚</span>
        <span class="streak-label">Comece hoje!</span>
      }
    </div>
  `,
  styles: [`
    .streak-widget {
      display: inline-flex;
      align-items: center;
      gap: 0.4rem;
      font-weight: 700;
      font-size: 1.1rem;
      cursor: default;
    }
    .streak-zero   { color: var(--text-color-secondary); }
    .streak-low    { color: #6366f1; }
    .streak-medium { color: #f97316; }
    .streak-high   { color: #eab308; }
  `]
})
export class StreakWidget {
  @Input({ required: true }) streak!: StreakData;

  get streakClass(): string {
    const n = this.streak.current_streak;
    if (n === 0) return 'streak-zero';
    if (n < 7) return 'streak-low';
    if (n < 30) return 'streak-medium';
    return 'streak-high';
  }
}
