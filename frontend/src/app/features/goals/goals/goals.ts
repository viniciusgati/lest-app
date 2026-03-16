import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import { FormsModule } from '@angular/forms';
import { ButtonModule } from 'primeng/button';
import { CardModule } from 'primeng/card';
import { ProgressBarModule } from 'primeng/progressbar';
import { ToastModule } from 'primeng/toast';
import { InputNumberModule } from 'primeng/inputnumber';
import { CheckboxModule } from 'primeng/checkbox';
import { RadioButtonModule } from 'primeng/radiobutton';
import { DividerModule } from 'primeng/divider';
import { ProgressSpinnerModule } from 'primeng/progressspinner';
import { MessageService } from 'primeng/api';
import { forkJoin } from 'rxjs';
import { WeeklyGoalService } from '../../../core/services/weekly-goal.service';
import { UserConfigService } from '../../../core/services/user-config.service';
import { WeeklyGoal } from '../../../core/models/weekly-goal.model';
import { WeekDay, ScheduleStrategy } from '../../../core/models/user-config.model';

@Component({
  selector: 'app-goals',
  standalone: true,
  imports: [
    CommonModule, ReactiveFormsModule, FormsModule,
    ButtonModule, CardModule, ProgressBarModule, ToastModule,
    InputNumberModule, CheckboxModule, RadioButtonModule,
    DividerModule, ProgressSpinnerModule
  ],
  providers: [MessageService],
  templateUrl: './goals.html',
  styleUrl: './goals.scss'
})
export class Goals implements OnInit {
  loading = false;
  savingGoal = false;
  savingConfig = false;
  weekLabel = '';

  goalForm = inject(FormBuilder).group({
    target_hours: [0, [Validators.required, Validators.min(0)]],
    target_questions: [0, [Validators.required, Validators.min(0)]],
    target_percentage: [0, [Validators.required, Validators.min(0), Validators.max(100)]]
  });

  // Progresso real (placeholder até Epic 5)
  actualHours = 0;
  actualQuestions = 0;
  actualPercentage = 0;

  readonly days: { label: string; value: WeekDay }[] = [
    { label: 'Seg', value: 'mon' }, { label: 'Ter', value: 'tue' },
    { label: 'Qua', value: 'wed' }, { label: 'Qui', value: 'thu' },
    { label: 'Sex', value: 'fri' }, { label: 'Sáb', value: 'sat' },
    { label: 'Dom', value: 'sun' }
  ];

  readonly strategies: { label: string; value: ScheduleStrategy; description: string }[] = [
    { label: 'Revisão espaçada (SM-2)', value: 'sm2', description: 'Prioriza temas com revisão vencida ou vencendo' },
    { label: 'Pontos fracos', value: 'weak_points', description: 'Prioriza temas com menor % de acertos' },
    { label: 'Balanceado', value: 'balanced', description: 'Distribui igualmente entre todas as matérias' }
  ];

  selectedDays: WeekDay[] = [];
  selectedStrategy: ScheduleStrategy = 'sm2';

  private weeklyGoalService = inject(WeeklyGoalService);
  private userConfigService = inject(UserConfigService);
  private messageService = inject(MessageService);

  get noDaySelected(): boolean {
    return this.selectedDays.length === 0;
  }

  ngOnInit(): void {
    this.weekLabel = this.buildWeekLabel();
    this.loading = true;

    forkJoin({
      goal: this.weeklyGoalService.getCurrent(),
      config: this.userConfigService.get()
    }).subscribe({
      next: ({ goal, config }) => {
        this.goalForm.patchValue({
          target_hours: goal.target_hours,
          target_questions: goal.target_questions,
          target_percentage: goal.target_percentage
        });
        this.selectedDays = [...config.available_days];
        this.selectedStrategy = config.schedule_strategy;
        this.loading = false;
      },
      error: () => { this.loading = false; }
    });
  }

  saveGoal(): void {
    if (this.goalForm.invalid || this.savingGoal) return;
    this.savingGoal = true;
    this.weeklyGoalService.updateCurrent(this.goalForm.value as Partial<WeeklyGoal>).subscribe({
      next: () => {
        this.savingGoal = false;
        this.messageService.add({ severity: 'success', summary: 'Sucesso', detail: 'Meta salva com sucesso' });
      },
      error: (err) => {
        this.savingGoal = false;
        const msg = err.error?.errors?.[0] ?? 'Erro ao salvar meta';
        this.messageService.add({ severity: 'error', summary: 'Erro', detail: msg });
      }
    });
  }

  saveConfig(): void {
    if (this.noDaySelected || this.savingConfig) return;
    this.savingConfig = true;
    this.userConfigService.update({
      available_days: this.selectedDays,
      schedule_strategy: this.selectedStrategy
    }).subscribe({
      next: () => {
        this.savingConfig = false;
        this.messageService.add({ severity: 'success', summary: 'Sucesso', detail: 'Configurações salvas' });
      },
      error: () => {
        this.savingConfig = false;
        this.messageService.add({ severity: 'error', summary: 'Erro', detail: 'Erro ao salvar configurações' });
      }
    });
  }

  progressColor(current: number, target: number): string {
    if (target === 0) return '';
    if (current >= target) return 'success';
    if (current > 0) return 'warning';
    return '';
  }

  progressValue(current: number, target: number): number {
    if (target === 0) return 0;
    return Math.min(Math.round((current / target) * 100), 100);
  }

  private buildWeekLabel(): string {
    const today = new Date();
    const day = today.getDay();
    const diff = today.getDate() - day + (day === 0 ? -6 : 1);
    const monday = new Date(today);
    monday.setDate(diff);
    const sunday = new Date(monday);
    sunday.setDate(monday.getDate() + 6);
    const fmt = (d: Date) => d.toLocaleDateString('pt-BR', { day: 'numeric', month: 'long' });
    return `${fmt(monday)} a ${fmt(sunday)} de ${sunday.getFullYear()}`;
  }
}
