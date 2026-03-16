import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { forkJoin } from 'rxjs';
import { CardModule } from 'primeng/card';
import { ProgressBarModule } from 'primeng/progressbar';
import { ProgressSpinnerModule } from 'primeng/progressspinner';
import { ButtonModule } from 'primeng/button';
import { ToastModule } from 'primeng/toast';
import { ConfirmDialogModule } from 'primeng/confirmdialog';
import { MessageModule } from 'primeng/message';
import { MessageService, ConfirmationService } from 'primeng/api';
import { MetricsService } from '../../../core/services/metrics.service';
import { StudySessionService } from '../../../core/services/study-session.service';
import { ScheduleService } from '../../../core/services/schedule.service';
import { SubjectMetric, WeeklyProgress } from '../../../core/models/metrics.model';
import { StudySession } from '../../../core/models/study-session.model';

const STATUS_COLORS: Record<string, string> = {
  scheduled: '#3b82f6',
  completed: '#22c55e',
  late: '#ef4444'
};

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [
    CommonModule, RouterModule,
    CardModule, ProgressBarModule, ProgressSpinnerModule,
    ButtonModule, ToastModule, ConfirmDialogModule, MessageModule
  ],
  providers: [MessageService, ConfirmationService],
  templateUrl: './home.html',
  styleUrl: './home.scss'
})
export class Home implements OnInit {
  loading = false;
  generating = false;
  hasGoal = false;
  weeklyProgress: WeeklyProgress | null = null;
  subjectsMetrics: SubjectMetric[] = [];
  weekSessions: StudySession[] = [];

  readonly weekDayLabels = ['Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb', 'Dom'];
  weekDates: string[] = [];

  private metricsService = inject(MetricsService);
  private sessionService = inject(StudySessionService);
  private scheduleService = inject(ScheduleService);
  private messageService = inject(MessageService);
  private confirmationService = inject(ConfirmationService);

  ngOnInit(): void {
    this.weekDates = this.computeWeekDates();
    const dateFrom = this.weekDates[0];
    const dateTo = this.weekDates[6];

    this.loading = true;
    forkJoin({
      progress: this.metricsService.getWeeklyProgress(),
      subjects: this.metricsService.getSubjectsMetrics(),
      sessions: this.sessionService.getAll({ date_from: dateFrom, date_to: dateTo })
    }).subscribe({
      next: ({ progress, subjects, sessions }) => {
        this.weeklyProgress = progress;
        this.hasGoal = (progress?.target_hours ?? 0) > 0;
        this.subjectsMetrics = subjects;
        this.weekSessions = sessions;
        this.loading = false;
      },
      error: () => { this.loading = false; }
    });
  }

  confirmGenerate(): void {
    if (this.subjectsMetrics.length === 0) {
      this.messageService.add({
        severity: 'warn',
        summary: 'Sem temas',
        detail: 'Cadastre matérias e temas antes de gerar a programação.',
        life: 5000
      });
      return;
    }

    this.confirmationService.confirm({
      message: 'Isso substituirá sessões agendadas automaticamente. Sessões concluídas não serão afetadas.',
      header: 'Gerar programação semanal?',
      icon: 'pi pi-calendar-plus',
      accept: () => this.generateSchedule()
    });
  }

  generateSchedule(): void {
    this.generating = true;
    this.scheduleService.generate().subscribe({
      next: (sessions) => {
        this.generating = false;
        this.weekSessions = [
          ...this.weekSessions.filter(s => s.status === 'completed'),
          ...sessions
        ];
        this.messageService.add({
          severity: 'success',
          summary: 'Semana gerada!',
          detail: `${sessions.length} sessões geradas para esta semana`
        });
      },
      error: (err) => {
        this.generating = false;
        this.messageService.add({
          severity: 'error',
          summary: 'Erro',
          detail: err.error?.error ?? 'Erro ao gerar programação'
        });
      }
    });
  }

  sessionsForDay(dateStr: string): StudySession[] {
    return this.weekSessions.filter(s => s.scheduled_date === dateStr);
  }

  isToday(dateStr: string): boolean {
    return dateStr === this.todayStr();
  }

  dayOfMonth(dateStr: string): string {
    return String(parseInt(dateStr.split('-')[2], 10));
  }

  statusColor(status: string): string {
    return STATUS_COLORS[status] ?? STATUS_COLORS['scheduled'];
  }

  progressValue(current: number, target: number): number {
    if (target === 0) return 0;
    return Math.min(Math.round((current / target) * 100), 100);
  }

  progressColor(current: number, target: number): string {
    if (target === 0) return '';
    if (current >= target) return 'success';
    if (current > 0) return 'warning';
    return '';
  }

  private todayStr(): string {
    const d = new Date();
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
  }

  private computeWeekDates(): string[] {
    const today = new Date();
    const day = today.getDay();
    const mondayOffset = today.getDate() - day + (day === 0 ? -6 : 1);
    return Array.from({ length: 7 }, (_, i) => {
      const d = new Date(today);
      d.setDate(mondayOffset + i);
      return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
    });
  }
}
