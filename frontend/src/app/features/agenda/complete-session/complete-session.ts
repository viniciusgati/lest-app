import { Component, Input, Output, EventEmitter, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormsModule, FormBuilder, Validators, AbstractControl, ValidationErrors } from '@angular/forms';
import { ButtonModule } from 'primeng/button';
import { DialogModule } from 'primeng/dialog';
import { InputNumberModule } from 'primeng/inputnumber';
import { CardModule } from 'primeng/card';
import { DatePickerModule } from 'primeng/datepicker';
import { ProgressSpinnerModule } from 'primeng/progressspinner';
import { ToastModule } from 'primeng/toast';
import { MessageService } from 'primeng/api';
import { StudySessionService } from '../../../core/services/study-session.service';
import { StudySession, StudySessionResult } from '../../../core/models/study-session.model';

export interface SessionCompletedEvent {
  completedSession: StudySession;
  nextSession: StudySession;
}

function correctsLteDoneValidator(group: AbstractControl): ValidationErrors | null {
  const done = group.get('questions_done')?.value ?? 0;
  const correct = group.get('questions_correct')?.value ?? 0;
  return correct > done ? { correctsExceedDone: true } : null;
}

@Component({
  selector: 'app-complete-session',
  standalone: true,
  imports: [
    CommonModule, ReactiveFormsModule, FormsModule,
    ButtonModule, DialogModule, InputNumberModule,
    CardModule, DatePickerModule, ProgressSpinnerModule, ToastModule
  ],
  providers: [MessageService],
  templateUrl: './complete-session.html'
})
export class CompleteSession {
  @Input() session: StudySession | null = null;
  @Input() visible = false;
  @Output() visibleChange = new EventEmitter<boolean>();
  @Output() sessionCompleted = new EventEmitter<SessionCompletedEvent>();

  step: 1 | 2 = 1;
  loading = false;
  adjustingDate = false;
  adjustedDate: Date | null = null;
  completedSession: StudySession | null = null;
  nextSession: StudySession | null = null;

  readonly tomorrow: Date = (() => {
    const d = new Date();
    d.setDate(d.getDate() + 1);
    d.setHours(0, 0, 0, 0);
    return d;
  })();

  resultForm = inject(FormBuilder).group({
    actual_minutes: [null as number | null, [Validators.required, Validators.min(1)]],
    questions_done: [0, [Validators.required, Validators.min(0)]],
    questions_correct: [0, [Validators.required, Validators.min(0)]]
  }, { validators: correctsLteDoneValidator });

  private sessionService = inject(StudySessionService);
  private messageService = inject(MessageService);

  get hasCorrectsExceedError(): boolean {
    return !!this.resultForm.errors?.['correctsExceedDone'] && this.resultForm.dirty;
  }

  get percentage(): number {
    const done = this.resultForm.get('questions_done')?.value ?? 0;
    const correct = this.resultForm.get('questions_correct')?.value ?? 0;
    if (!done) return 0;
    return Math.round((correct / done) * 100);
  }

  get nextReviewLabel(): string {
    if (!this.nextSession) return '';
    return new Date(this.nextSession.scheduled_date + 'T00:00:00').toLocaleDateString('pt-BR', {
      day: 'numeric', month: 'long', year: 'numeric'
    });
  }

  get interval(): number {
    if (!this.nextSession) return 0;
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const next = new Date(this.nextSession.scheduled_date + 'T00:00:00');
    return Math.round((next.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
  }

  submit(): void {
    if (this.resultForm.invalid || !this.session) return;
    this.loading = true;
    const result = this.resultForm.value as StudySessionResult;
    this.sessionService.complete(this.session.id, result).subscribe({
      next: ({ session, next_session }) => {
        this.completedSession = session;
        this.nextSession = next_session;
        this.step = 2;
        this.loading = false;
      },
      error: (err) => {
        const msg = err.error?.errors?.[0] ?? 'Erro ao registrar resultado';
        this.messageService.add({ severity: 'error', summary: 'Erro', detail: msg });
        this.loading = false;
      }
    });
  }

  accept(): void {
    if (!this.completedSession || !this.nextSession) return;
    this.sessionCompleted.emit({ completedSession: this.completedSession, nextSession: this.nextSession });
    this.close();
  }

  confirmAdjusted(): void {
    if (!this.adjustedDate || !this.nextSession) return;
    const d = this.adjustedDate;
    const dateStr = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
    this.sessionService.update(this.nextSession.id, { scheduled_date: dateStr }).subscribe({
      next: (updated) => {
        if (this.completedSession) {
          this.sessionCompleted.emit({ completedSession: this.completedSession, nextSession: updated });
        }
        this.close();
      },
      error: () => {
        this.messageService.add({ severity: 'error', summary: 'Erro', detail: 'Erro ao ajustar data' });
      }
    });
  }

  onDialogHide(): void {
    this.visibleChange.emit(false);
    this.reset();
  }

  close(): void {
    this.visibleChange.emit(false);
    this.reset();
  }

  reset(): void {
    this.step = 1;
    this.loading = false;
    this.adjustingDate = false;
    this.adjustedDate = null;
    this.completedSession = null;
    this.nextSession = null;
    this.resultForm.reset({ actual_minutes: null, questions_done: 0, questions_correct: 0 });
  }
}
