import { ComponentFixture, TestBed } from '@angular/core/testing';
import { vi } from 'vitest';
import { of } from 'rxjs';
import { provideRouter } from '@angular/router';
import { provideAnimationsAsync } from '@angular/platform-browser/animations/async';
import { ActivatedRoute } from '@angular/router';
import { SubjectDetail } from './subject-detail';
import { TopicService } from '../../../core/services/topic.service';
import { SubjectService } from '../../../core/services/subject.service';
import { Topic } from '../../../core/models/topic.model';
import { Subject } from '../../../core/models/subject.model';

const MOCK_SUBJECT: Subject = { id: 1, name: 'Matemática', created_at: '' };

const BASE_TOPICS: Topic[] = [
  { id: 10, subject_id: 1, name: 'Equações', notes: null, ease_factor: 2.5, interval: 1, next_review: '2026-03-20', created_at: '' },
  { id: 11, subject_id: 1, name: 'Funções', notes: null, ease_factor: 2.5, interval: 1, next_review: '2026-03-21', created_at: '' }
];

describe('SubjectDetail', () => {
  let fixture: ComponentFixture<SubjectDetail>;
  let component: SubjectDetail;
  let mockTopicService: {
    getAll: ReturnType<typeof vi.fn>;
    create: ReturnType<typeof vi.fn>;
    update: ReturnType<typeof vi.fn>;
    delete: ReturnType<typeof vi.fn>;
  };
  let mockSubjectService: { getOne: ReturnType<typeof vi.fn> };

  beforeEach(async () => {
    mockTopicService = {
      getAll: vi.fn().mockReturnValue(of([...BASE_TOPICS])),
      create: vi.fn(),
      update: vi.fn(),
      delete: vi.fn()
    };

    mockSubjectService = {
      getOne: vi.fn().mockReturnValue(of(MOCK_SUBJECT))
    };

    await TestBed.configureTestingModule({
      imports: [SubjectDetail],
      providers: [
        provideRouter([]),
        provideAnimationsAsync(),
        { provide: TopicService, useValue: mockTopicService },
        { provide: SubjectService, useValue: mockSubjectService },
        {
          provide: ActivatedRoute,
          useValue: { snapshot: { paramMap: { get: () => '1' } } }
        }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(SubjectDetail);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('deve ser criado', () => {
    expect(component).toBeTruthy();
  });

  it('carrega temas ao iniciar', () => {
    expect(mockTopicService.getAll).toHaveBeenCalledWith(1);
    expect(component.topics.length).toBe(2);
  });

  it('carrega matéria para o header', () => {
    expect(mockSubjectService.getOne).toHaveBeenCalledWith(1);
    expect(component.subject?.name).toBe('Matemática');
  });

  it('exibe estado vazio quando não há temas', () => {
    mockTopicService.getAll.mockReturnValue(of([]));
    component.loadTopics();
    expect(component.topics.length).toBe(0);
  });

  it('adiciona tema à lista ao criar', () => {
    const novo: Topic = { id: 12, subject_id: 1, name: 'Geometria', notes: null, ease_factor: 2.5, interval: 1, next_review: '2026-03-22', created_at: '' };
    mockTopicService.create.mockReturnValue(of(novo));
    component.form.patchValue({ name: 'Geometria' });
    component.save();
    expect(component.topics.length).toBe(3);
    expect(component.topics[2].name).toBe('Geometria');
  });

  it('fecha dialog após criar com sucesso', () => {
    const novo: Topic = { id: 12, subject_id: 1, name: 'Geometria', notes: null, ease_factor: 2.5, interval: 1, next_review: '2026-03-22', created_at: '' };
    mockTopicService.create.mockReturnValue(of(novo));
    component.dialogVisible = true;
    component.form.patchValue({ name: 'Geometria' });
    component.save();
    expect(component.dialogVisible).toBe(false);
  });

  it('atualiza tema na lista ao editar', () => {
    const atualizado: Topic = { ...BASE_TOPICS[0], name: 'Equações Avançadas' };
    mockTopicService.update.mockReturnValue(of(atualizado));
    component.openEdit(component.topics[0]);
    component.form.patchValue({ name: 'Equações Avançadas' });
    component.save();
    expect(component.topics[0].name).toBe('Equações Avançadas');
  });

  it('remove tema da lista ao excluir', () => {
    mockTopicService.delete.mockReturnValue(of(undefined));
    component.deleteTopic(component.topics[0]);
    expect(component.topics.length).toBe(1);
    expect(component.topics[0].id).toBe(11);
  });

  it('não salva se formulário inválido', () => {
    component.form.patchValue({ name: '' });
    component.save();
    expect(mockTopicService.create).not.toHaveBeenCalled();
    expect(mockTopicService.update).not.toHaveBeenCalled();
  });

  it('abre dialog de criação com form limpo', () => {
    component.form.patchValue({ name: 'algo' });
    component.openCreate();
    expect(component.dialogVisible).toBe(true);
    expect(component.editingTopic).toBeNull();
    expect(component.form.value.name).toBeFalsy();
  });

  it('abre dialog de edição com nome preenchido', () => {
    const topic = component.topics[0];
    component.openEdit(topic);
    expect(component.dialogVisible).toBe(true);
    expect(component.editingTopic).toEqual(topic);
    expect(component.form.value.name).toBe('Equações');
  });
});
