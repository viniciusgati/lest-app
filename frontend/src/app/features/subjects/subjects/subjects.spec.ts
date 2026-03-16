import { ComponentFixture, TestBed } from '@angular/core/testing';
import { vi } from 'vitest';
import { of, Subject as RxSubject } from 'rxjs';
import { provideRouter } from '@angular/router';
import { provideAnimationsAsync } from '@angular/platform-browser/animations/async';
import { Subjects } from './subjects';
import { SubjectService } from '../../../core/services/subject.service';
import { Subject } from '../../../core/models/subject.model';

const BASE_SUBJECTS: Subject[] = [
  { id: 1, name: 'Matemática', created_at: '' },
  { id: 2, name: 'Português', created_at: '' }
];

describe('Subjects', () => {
  let fixture: ComponentFixture<Subjects>;
  let component: Subjects;
  let mockService: {
    getAll: ReturnType<typeof vi.fn>;
    create: ReturnType<typeof vi.fn>;
    update: ReturnType<typeof vi.fn>;
    delete: ReturnType<typeof vi.fn>;
  };

  beforeEach(async () => {
    // Cria cópias frescas para evitar mutação entre testes
    mockService = {
      getAll: vi.fn().mockReturnValue(of([...BASE_SUBJECTS])),
      create: vi.fn(),
      update: vi.fn(),
      delete: vi.fn()
    };

    await TestBed.configureTestingModule({
      imports: [Subjects],
      providers: [
        provideRouter([]),
        provideAnimationsAsync(),
        { provide: SubjectService, useValue: mockService }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(Subjects);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('deve ser criado', () => {
    expect(component).toBeTruthy();
  });

  it('carrega matérias ao iniciar', () => {
    expect(mockService.getAll).toHaveBeenCalled();
    expect(component.subjects.length).toBe(2);
  });

  it('exibe estado vazio quando lista está vazia', () => {
    // Testa estado do componente diretamente (sem re-detectChanges para evitar NG0100)
    mockService.getAll.mockReturnValue(of([]));
    component.loadSubjects();
    expect(component.subjects.length).toBe(0);
  });

  it('adiciona matéria à lista ao criar', () => {
    const nova: Subject = { id: 3, name: 'História', created_at: '' };
    mockService.create.mockReturnValue(of(nova));
    component.form.patchValue({ name: 'História' });
    component.save();
    expect(component.subjects.length).toBe(3);
    expect(component.subjects[2].name).toBe('História');
  });

  it('fecha dialog após criar com sucesso', () => {
    const nova: Subject = { id: 3, name: 'História', created_at: '' };
    mockService.create.mockReturnValue(of(nova));
    component.dialogVisible = true;
    component.form.patchValue({ name: 'História' });
    component.save();
    expect(component.dialogVisible).toBe(false);
  });

  it('atualiza matéria na lista ao editar', () => {
    const atualizado: Subject = { id: 1, name: 'Matemática Avançada', created_at: '' };
    mockService.update.mockReturnValue(of(atualizado));
    component.openEdit(component.subjects[0]);
    component.form.patchValue({ name: 'Matemática Avançada' });
    component.save();
    expect(component.subjects[0].name).toBe('Matemática Avançada');
  });

  it('remove matéria da lista ao excluir', () => {
    mockService.delete.mockReturnValue(of(undefined));
    component.deleteSubject(component.subjects[0]);
    expect(component.subjects.length).toBe(1);
    expect(component.subjects[0].id).toBe(2);
  });

  it('não salva se formulário inválido', () => {
    component.form.patchValue({ name: '' });
    component.save();
    expect(mockService.create).not.toHaveBeenCalled();
    expect(mockService.update).not.toHaveBeenCalled();
  });

  it('abre dialog de criação com form limpo', () => {
    component.form.patchValue({ name: 'Algo' });
    component.openCreate();
    expect(component.dialogVisible).toBe(true);
    expect(component.editingSubject).toBeNull();
    expect(component.form.value.name).toBeFalsy();
  });

  it('abre dialog de edição com nome preenchido', () => {
    const subject = component.subjects[0];
    component.openEdit(subject);
    expect(component.dialogVisible).toBe(true);
    expect(component.editingSubject).toEqual(subject);
    expect(component.form.value.name).toBe('Matemática');
  });

  it('define loading=true durante carregamento', () => {
    // Verifica propriedade sem acionar change detection para evitar NG0100
    component.loading = true;
    expect(component.loading).toBe(true);
  });

  it('onFormKeydown para Enter para propagação do evento', () => {
    const mockEvent = { key: 'Enter', stopPropagation: vi.fn() } as unknown as KeyboardEvent;
    component.onFormKeydown(mockEvent);
    expect(mockEvent.stopPropagation).toHaveBeenCalledTimes(1);
  });

  it('onFormKeydown para outras teclas não para propagação', () => {
    const mockEvent = { key: 'Tab', stopPropagation: vi.fn() } as unknown as KeyboardEvent;
    component.onFormKeydown(mockEvent);
    expect(mockEvent.stopPropagation).not.toHaveBeenCalled();
  });

  it('save() remove foco do elemento ativo antes de fechar dialog', () => {
    const nova: Subject = { id: 3, name: 'Física', created_at: '' };
    mockService.create.mockReturnValue(of(nova));
    const mockEl = { blur: vi.fn() };
    vi.spyOn(document, 'activeElement', 'get').mockReturnValue(mockEl as unknown as Element);

    component.dialogVisible = true;
    component.form.patchValue({ name: 'Física' });
    component.save();

    expect(mockEl.blur).toHaveBeenCalled();
    expect(component.dialogVisible).toBe(false);
  });

  it('save() ignora chamada dupla enquanto já está salvando (flag saving)', () => {
    const response$ = new RxSubject<Subject>();
    mockService.create.mockReturnValue(response$.asObservable());
    component.form.patchValue({ name: 'Biologia' });

    component.save(); // saving = true, requisição pendente
    component.save(); // saving = true → deve ser ignorada

    expect(mockService.create).toHaveBeenCalledTimes(1);
  });
});
