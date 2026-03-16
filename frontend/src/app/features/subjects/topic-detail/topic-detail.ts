import { Component, OnInit, OnDestroy, signal, inject } from '@angular/core';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormControl } from '@angular/forms';
import { Subject } from 'rxjs';
import { debounceTime, distinctUntilChanged, takeUntil } from 'rxjs/operators';
import { CardModule } from 'primeng/card';
import { ButtonModule } from 'primeng/button';
import { TextareaModule } from 'primeng/textarea';
import { ToastModule } from 'primeng/toast';
import { ProgressSpinnerModule } from 'primeng/progressspinner';
import { MessageService } from 'primeng/api';
import { TopicService } from '../../../core/services/topic.service';
import { Topic } from '../../../core/models/topic.model';

type SaveStatus = 'idle' | 'saving' | 'saved' | 'error';

@Component({
  selector: 'app-topic-detail',
  standalone: true,
  imports: [
    CommonModule, RouterLink, ReactiveFormsModule,
    CardModule, ButtonModule, TextareaModule, ToastModule, ProgressSpinnerModule
  ],
  providers: [MessageService],
  templateUrl: './topic-detail.html'
})
export class TopicDetail implements OnInit, OnDestroy {
  topic: Topic | null = null;
  loading = false;
  subjectId!: number;
  topicId!: number;
  notesControl = new FormControl('');
  saveStatus = signal<SaveStatus>('idle');

  private destroy$ = new Subject<void>();
  private route = inject(ActivatedRoute);
  private topicService = inject(TopicService);
  private messageService = inject(MessageService);

  get isOverdue(): boolean {
    if (!this.topic) return false;
    return new Date(this.topic.next_review) < new Date(new Date().toDateString());
  }

  get nextReviewLabel(): string {
    if (!this.topic) return '—';
    return new Date(this.topic.next_review + 'T00:00:00')
      .toLocaleDateString('pt-BR', { day: 'numeric', month: 'long', year: 'numeric' });
  }

  ngOnInit(): void {
    this.subjectId = Number(this.route.snapshot.paramMap.get('subjectId'));
    this.topicId = Number(this.route.snapshot.paramMap.get('id'));
    this.loadTopic();
    this.setupAutoSave();
  }

  loadTopic(): void {
    this.loading = true;
    this.topicService.getOne(this.subjectId, this.topicId).subscribe({
      next: (topic) => {
        this.topic = topic;
        this.notesControl.setValue(topic.notes ?? '', { emitEvent: false });
        this.loading = false;
      },
      error: () => { this.loading = false; }
    });
  }

  setupAutoSave(): void {
    this.notesControl.valueChanges.pipe(
      debounceTime(800),
      distinctUntilChanged(),
      takeUntil(this.destroy$)
    ).subscribe(notes => {
      this.saveStatus.set('saving');
      this.topicService.update(this.subjectId, this.topicId, { notes: notes ?? '' }).subscribe({
        next: () => {
          this.saveStatus.set('saved');
          setTimeout(() => this.saveStatus.set('idle'), 2000);
        },
        error: () => {
          this.saveStatus.set('error');
          this.messageService.add({ severity: 'error', summary: 'Erro', detail: 'Erro ao salvar nota' });
        }
      });
    });
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }
}
