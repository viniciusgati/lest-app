import { Component, OnInit, inject } from '@angular/core';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import { ButtonModule } from 'primeng/button';
import { CardModule } from 'primeng/card';
import { DialogModule } from 'primeng/dialog';
import { ConfirmDialogModule } from 'primeng/confirmdialog';
import { ToastModule } from 'primeng/toast';
import { ProgressSpinnerModule } from 'primeng/progressspinner';
import { InputTextModule } from 'primeng/inputtext';
import { MessageService, ConfirmationService } from 'primeng/api';
import { TopicService } from '../../../core/services/topic.service';
import { SubjectService } from '../../../core/services/subject.service';
import { Topic } from '../../../core/models/topic.model';
import { Subject } from '../../../core/models/subject.model';

@Component({
  selector: 'app-subject-detail',
  standalone: true,
  imports: [
    CommonModule, RouterLink, ReactiveFormsModule,
    ButtonModule, CardModule, DialogModule, ConfirmDialogModule,
    ToastModule, ProgressSpinnerModule, InputTextModule
  ],
  providers: [MessageService, ConfirmationService],
  templateUrl: './subject-detail.html'
})
export class SubjectDetail implements OnInit {
  subject: Subject | null = null;
  topics: Topic[] = [];
  loading = false;
  saving = false;
  dialogVisible = false;
  editingTopic: Topic | null = null;
  subjectId!: number;

  form = inject(FormBuilder).group({
    name: ['', [Validators.required, Validators.maxLength(100)]]
  });

  private route = inject(ActivatedRoute);
  private topicService = inject(TopicService);
  private subjectService = inject(SubjectService);
  private messageService = inject(MessageService);
  private confirmationService = inject(ConfirmationService);

  ngOnInit(): void {
    this.subjectId = Number(this.route.snapshot.paramMap.get('id'));
    this.loadSubject();
    this.loadTopics();
  }

  loadSubject(): void {
    this.subjectService.getOne(this.subjectId).subscribe({
      next: (data) => { this.subject = data; },
      error: () => {}
    });
  }

  loadTopics(): void {
    this.loading = true;
    this.topicService.getAll(this.subjectId, { page: 1, per_page: 50 }).subscribe({
      next: (response) => { this.topics = response.data; this.loading = false; },
      error: () => { this.loading = false; }
    });
  }

  openCreate(): void {
    this.editingTopic = null;
    this.form.reset();
    this.dialogVisible = true;
  }

  openEdit(topic: Topic): void {
    this.editingTopic = topic;
    this.form.patchValue({ name: topic.name });
    this.dialogVisible = true;
  }

  onFormKeydown(event: KeyboardEvent): void {
    if (event.key === 'Enter') {
      event.stopPropagation();
    }
  }

  save(): void {
    if (this.form.invalid || this.saving) return;
    const name = this.form.value.name!;
    this.saving = true;

    const request$ = this.editingTopic
      ? this.topicService.update(this.subjectId, this.editingTopic.id, { name })
      : this.topicService.create(this.subjectId, name);

    request$.subscribe({
      next: (saved) => {
        if (this.editingTopic) {
          const idx = this.topics.findIndex(t => t.id === saved.id);
          if (idx > -1) this.topics[idx] = saved;
          this.topics = [...this.topics];
        } else {
          this.topics = [...this.topics, saved];
        }
        (document.activeElement as HTMLElement)?.blur();
        this.dialogVisible = false;
        this.saving = false;
      },
      error: (err) => {
        const msg = err.error?.errors?.[0] ?? 'Erro ao salvar tema';
        this.messageService.add({ severity: 'error', summary: 'Erro', detail: msg });
        this.saving = false;
      }
    });
  }

  confirmDelete(topic: Topic): void {
    this.confirmationService.confirm({
      message: `Excluir "${topic.name}"? O histórico de sessões será removido.`,
      header: 'Confirmar exclusão',
      icon: 'pi pi-trash',
      accept: () => this.deleteTopic(topic)
    });
  }

  deleteTopic(topic: Topic): void {
    this.topicService.delete(this.subjectId, topic.id).subscribe({
      next: () => { this.topics = this.topics.filter(t => t.id !== topic.id); },
      error: () => this.messageService.add({ severity: 'error', summary: 'Erro', detail: 'Erro ao excluir tema' })
    });
  }
}
