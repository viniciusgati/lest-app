import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import { forkJoin, map } from 'rxjs';
import { ActivatedRoute } from '@angular/router';
import { FullCalendarModule } from '@fullcalendar/angular';
import { CalendarOptions, EventClickArg, DateSelectArg, EventInput } from '@fullcalendar/core';
import dayGridPlugin from '@fullcalendar/daygrid';
import interactionPlugin from '@fullcalendar/interaction';
import ptLocale from '@fullcalendar/core/locales/pt-br';
import { ButtonModule } from 'primeng/button';
import { DialogModule } from 'primeng/dialog';
import { SelectModule } from 'primeng/select';
import { InputNumberModule } from 'primeng/inputnumber';
import { ToastModule } from 'primeng/toast';
import { ConfirmDialogModule } from 'primeng/confirmdialog';
import { ProgressSpinnerModule } from 'primeng/progressspinner';
import { TagModule } from 'primeng/tag';
import { MessageService, ConfirmationService } from 'primeng/api';
import { StudySessionService } from '../../../core/services/study-session.service';
import { SubjectService } from '../../../core/services/subject.service';
import { TopicService } from '../../../core/services/topic.service';
import { ScheduleService } from '../../../core/services/schedule.service';
import { StudySession } from '../../../core/models/study-session.model';
import { Subject } from '../../../core/models/subject.model';
import { Topic } from '../../../core/models/topic.model';
import { CompleteSession, SessionCompletedEvent } from '../complete-session/complete-session';

const STATUS_COLORS: Record<string, string> = {
  scheduled: '#3b82f6',
  completed: '#22c55e',
  late: '#ef4444'
};

@Component({
  selector: 'app-agenda',
  standalone: true,
  imports: [
    CommonModule, ReactiveFormsModule,
    FullCalendarModule,
    ButtonModule, DialogModule, SelectModule, InputNumberModule,
    ToastModule, ConfirmDialogModule, ProgressSpinnerModule, TagModule,
    CompleteSession
  ],
  providers: [MessageService, ConfirmationService],
  templateUrl: './agenda.html',
  styleUrl: './agenda.scss'
})
export class Agenda implements OnInit {
  loading = false;

  sessions: StudySession[] = [];
  subjects: Subject[] = [];
  topics: Topic[] = [];

  savingSession = false;

  // Dialog agendamento
  showScheduleDialog = false;
  scheduleForm = inject(FormBuilder).group({
    scheduled_date: ['', Validators.required],
    start_time: [null as string | null],
    subject_id: [null as number | null, Validators.required],
    topic_id: [null as number | null, Validators.required],
    expected_minutes: [30, [Validators.required, Validators.min(1)]]
  });

  // Painel detalhe
  showDetailDialog = false;
  selectedSession: StudySession | null = null;
  selectedSessionTopic: Topic | null = null;
  selectedSessionSubject: Subject | null = null;

  // Dialog registro de resultado
  showCompleteDialog = false;

  generating = false;

  calendarOptions: CalendarOptions = {
    plugins: [dayGridPlugin, interactionPlugin],
    initialView: 'dayGridMonth',
    locale: ptLocale,
    headerToolbar: {
      left: 'prev,next today',
      center: 'title',
      right: 'dayGridMonth,dayGridWeek'
    },
    events: [],
    selectable: true,
    eventClick: (arg: EventClickArg) => this.onEventClick(arg),
    dateClick: (arg: { dateStr: string }) => this.onDateClick(arg),
    height: 'auto'
  };

  private sessionService = inject(StudySessionService);
  private subjectService = inject(SubjectService);
  private topicService = inject(TopicService);
  private scheduleService = inject(ScheduleService);
  private messageService = inject(MessageService);
  private confirmationService = inject(ConfirmationService);
  private route = inject(ActivatedRoute);

  ngOnInit(): void {
    const dateParam = this.route.snapshot.queryParamMap.get('date');
    if (dateParam) {
      this.calendarOptions = { ...this.calendarOptions, initialDate: dateParam };
    }
    this.loadSessions();
    this.subjectService.getAll().subscribe({
      next: (subjects) => (this.subjects = subjects)
    });
  }

  loadSessions(): void {
    this.loading = true;
    this.sessionService.getAll().subscribe({
      next: (sessions) => {
        this.sessions = sessions;
        this.updateCalendarEvents();
        this.loading = false;
      },
      error: () => {
        this.loading = false;
        this.messageService.add({ severity: 'error', summary: 'Erro', detail: 'Falha ao carregar sessões' });
      }
    });
  }

  openNewSession(date?: string): void {
    this.scheduleForm.reset({
      scheduled_date: date ?? '',
      start_time: null,
      subject_id: null,
      topic_id: null,
      expected_minutes: 30
    });
    this.topics = [];
    this.showScheduleDialog = true;
  }

  onSubjectChange(subjectId: number | null): void {
    this.scheduleForm.patchValue({ topic_id: null });
    this.topics = [];
    if (!subjectId) return;
    this.topicService.getAll(subjectId).subscribe({
      next: (topics) => (this.topics = topics)
    });
  }

  saveSession(): void {
    if (this.scheduleForm.invalid || this.savingSession) return;
    const { subject_id, ...sessionData } = this.scheduleForm.value;
    this.savingSession = true;
    this.sessionService.create(sessionData as Partial<StudySession>).subscribe({
      next: (session) => {
        this.sessions = [...this.sessions, session];
        this.updateCalendarEvents();
        this.showScheduleDialog = false;
        this.savingSession = false;
        this.messageService.add({ severity: 'success', summary: 'Sucesso', detail: 'Sessão agendada' });
      },
      error: (err) => {
        const msg = err.error?.errors?.[0] ?? 'Erro ao agendar sessão';
        this.savingSession = false;
        this.messageService.add({ severity: 'error', summary: 'Erro', detail: msg });
      }
    });
  }

  openSessionDetail(session: StudySession): void {
    this.selectedSession = session;
    this.selectedSessionTopic = null;
    this.selectedSessionSubject = null;
    this.showDetailDialog = true;

    if (this.subjects.length === 0) return;

    forkJoin(
      this.subjects.map(subj =>
        this.topicService.getAll(subj.id).pipe(map(topics => ({ subj, topics })))
      )
    ).subscribe({
      next: (results) => {
        for (const { subj, topics } of results) {
          const found = topics.find(t => t.id === session.topic_id);
          if (found) {
            this.selectedSessionTopic = found;
            this.selectedSessionSubject = subj;
            break;
          }
        }
      }
    });
  }

  confirmDelete(): void {
    if (!this.selectedSession) return;
    this.confirmationService.confirm({
      message: 'Deseja excluir esta sessão?',
      header: 'Confirmar exclusão',
      icon: 'pi pi-exclamation-triangle',
      accept: () => this.deleteSession()
    });
  }

  deleteSession(): void {
    if (!this.selectedSession) return;
    const id = this.selectedSession.id;
    this.sessionService.delete(id).subscribe({
      next: () => {
        this.sessions = this.sessions.filter(s => s.id !== id);
        this.updateCalendarEvents();
        this.showDetailDialog = false;
        this.selectedSession = null;
        this.messageService.add({ severity: 'success', summary: 'Sucesso', detail: 'Sessão removida' });
      },
      error: () => {
        this.messageService.add({ severity: 'error', summary: 'Erro', detail: 'Erro ao remover sessão' });
      }
    });
  }

  openCompleteSession(): void {
    this.showDetailDialog = false;
    this.showCompleteDialog = true;
  }

  onSessionCompleted(event: SessionCompletedEvent): void {
    this.sessions = this.sessions
      .filter(s => s.id !== event.completedSession.id)
      .concat([event.completedSession, event.nextSession]);
    this.updateCalendarEvents();
    this.showCompleteDialog = false;
    this.messageService.add({ severity: 'success', summary: 'Sucesso', detail: 'Resultado registrado' });
  }

  confirmGenerateSchedule(): void {
    this.confirmationService.confirm({
      message: 'Isso substituirá sessões agendadas automaticamente. Sessões concluídas não serão afetadas.',
      header: 'Gerar programação semanal?',
      icon: 'pi pi-calendar-plus',
      accept: () => {
        this.generating = true;
        this.scheduleService.generate().subscribe({
          next: (newSessions) => {
            this.generating = false;
            const kept = this.sessions.filter(
              s => s.status === 'completed' || !s.auto_generated
            );
            this.sessions = [...kept, ...newSessions];
            this.updateCalendarEvents();
            this.messageService.add({
              severity: 'success',
              summary: 'Semana gerada!',
              detail: `${newSessions.length} sessões criadas`
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
    });
  }

  statusLabel(status: string): string {
    const labels: Record<string, string> = {
      scheduled: 'Agendada',
      completed: 'Concluída',
      late: 'Atrasada'
    };
    return labels[status] ?? status;
  }

  statusSeverity(status: string): 'info' | 'success' | 'danger' | 'secondary' {
    const map: Record<string, 'info' | 'success' | 'danger'> = {
      scheduled: 'info',
      completed: 'success',
      late: 'danger'
    };
    return map[status] ?? 'secondary';
  }

  private onEventClick(arg: EventClickArg): void {
    const session = arg.event.extendedProps['session'] as StudySession;
    if (session) this.openSessionDetail(session);
  }

  private onDateClick(arg: { dateStr: string }): void {
    this.openNewSession(arg.dateStr);
  }

  private updateCalendarEvents(): void {
    const events: EventInput[] = this.sessions.map(s => {
      const startKey = s.start_time ? 'start' : 'date';
      const startVal = s.start_time ? `${s.scheduled_date}T${s.start_time}` : s.scheduled_date;
      return {
        id: String(s.id),
        title: `Sessão #${s.id}`,
        [startKey]: startVal,
        backgroundColor: STATUS_COLORS[s.status] ?? STATUS_COLORS['scheduled'],
        borderColor: STATUS_COLORS[s.status] ?? STATUS_COLORS['scheduled'],
        extendedProps: { session: s }
      };
    });
    this.calendarOptions = { ...this.calendarOptions, events };
  }
}
