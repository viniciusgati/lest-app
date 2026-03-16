import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import { ButtonModule } from 'primeng/button';
import { CardModule } from 'primeng/card';
import { DialogModule } from 'primeng/dialog';
import { ConfirmDialogModule } from 'primeng/confirmdialog';
import { ToastModule } from 'primeng/toast';
import { ProgressSpinnerModule } from 'primeng/progressspinner';
import { InputTextModule } from 'primeng/inputtext';
import { MessageService, ConfirmationService } from 'primeng/api';
import { SubjectService } from '../../../core/services/subject.service';
import { Subject } from '../../../core/models/subject.model';

@Component({
  selector: 'app-subjects',
  standalone: true,
  imports: [
    CommonModule, RouterLink, ReactiveFormsModule,
    ButtonModule, CardModule, DialogModule, ConfirmDialogModule,
    ToastModule, ProgressSpinnerModule, InputTextModule
  ],
  providers: [MessageService, ConfirmationService],
  templateUrl: './subjects.html',
  styleUrl: './subjects.scss'
})
export class Subjects implements OnInit {
  subjects: Subject[] = [];
  loading = false;
  dialogVisible = false;
  editingSubject: Subject | null = null;
  form = inject(FormBuilder).group({
    name: ['', [Validators.required, Validators.maxLength(100)]]
  });

  private subjectService = inject(SubjectService);
  private messageService = inject(MessageService);
  private confirmationService = inject(ConfirmationService);

  constructor() {}

  ngOnInit(): void {
    this.loadSubjects();
  }

  loadSubjects(): void {
    this.loading = true;
    this.subjectService.getAll().subscribe({
      next: (data) => { this.subjects = data; this.loading = false; },
      error: () => { this.loading = false; }
    });
  }

  openCreate(): void {
    this.editingSubject = null;
    this.form.reset();
    this.dialogVisible = true;
  }

  openEdit(subject: Subject): void {
    this.editingSubject = subject;
    this.form.patchValue({ name: subject.name });
    this.dialogVisible = true;
  }

  save(): void {
    if (this.form.invalid) return;
    const name = this.form.value.name!;

    const request$ = this.editingSubject
      ? this.subjectService.update(this.editingSubject.id, name)
      : this.subjectService.create(name);

    request$.subscribe({
      next: (saved) => {
        if (this.editingSubject) {
          const idx = this.subjects.findIndex(s => s.id === saved.id);
          if (idx > -1) this.subjects[idx] = saved;
          this.subjects = [...this.subjects];
        } else {
          this.subjects = [...this.subjects, saved];
        }
        this.dialogVisible = false;
      },
      error: (err) => {
        const msg = err.error?.errors?.[0] ?? 'Erro ao salvar matéria';
        this.messageService.add({ severity: 'error', summary: 'Erro', detail: msg });
      }
    });
  }

  confirmDelete(subject: Subject): void {
    this.confirmationService.confirm({
      message: `Excluir "${subject.name}"? Todos os temas serão removidos.`,
      header: 'Confirmar exclusão',
      icon: 'pi pi-trash',
      accept: () => this.deleteSubject(subject)
    });
  }

  deleteSubject(subject: Subject): void {
    this.subjectService.delete(subject.id).subscribe({
      next: () => {
        this.subjects = this.subjects.filter(s => s.id !== subject.id);
      },
      error: () => {
        this.messageService.add({ severity: 'error', summary: 'Erro', detail: 'Erro ao excluir matéria' });
      }
    });
  }
}
