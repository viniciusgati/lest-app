import { ComponentFixture, TestBed } from '@angular/core/testing';
import { vi } from 'vitest';
import { of } from 'rxjs';
import { provideRouter } from '@angular/router';
import { provideAnimationsAsync } from '@angular/platform-browser/animations/async';
import { ActivatedRoute } from '@angular/router';
import { TopicDetail } from './topic-detail';
import { TopicService } from '../../../core/services/topic.service';
import { Topic } from '../../../core/models/topic.model';

const subjectId = 1;
const topicId = 10;

const MOCK_TOPIC: Topic = {
  id: topicId,
  subject_id: subjectId,
  name: 'Equações',
  notes: 'nota existente',
  ease_factor: 2.5,
  interval: 1,
  next_review: '2026-03-20',
  created_at: ''
};

describe('TopicDetail', () => {
  let fixture: ComponentFixture<TopicDetail>;
  let component: TopicDetail;
  let mockTopicService: {
    getOne: ReturnType<typeof vi.fn>;
    update: ReturnType<typeof vi.fn>;
  };

  beforeEach(async () => {
    mockTopicService = {
      getOne: vi.fn().mockReturnValue(of({ ...MOCK_TOPIC })),
      update: vi.fn().mockReturnValue(of({ ...MOCK_TOPIC }))
    };

    await TestBed.configureTestingModule({
      imports: [TopicDetail],
      providers: [
        provideRouter([]),
        provideAnimationsAsync(),
        { provide: TopicService, useValue: mockTopicService },
        {
          provide: ActivatedRoute,
          useValue: {
            snapshot: {
              paramMap: {
                get: (key: string) => key === 'subjectId' ? `${subjectId}` : `${topicId}`
              }
            }
          }
        }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(TopicDetail);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('deve ser criado', () => {
    expect(component).toBeTruthy();
  });

  it('carrega o tema ao iniciar', () => {
    expect(mockTopicService.getOne).toHaveBeenCalledWith(subjectId, topicId);
    expect(component.topic?.name).toBe('Equações');
  });

  it('preenche notesControl com nota existente', () => {
    expect(component.notesControl.value).toBe('nota existente');
  });

  it('auto-salva nota após 800ms de inatividade', async () => {
    vi.useFakeTimers();
    component.notesControl.setValue('nova nota');
    await vi.advanceTimersByTimeAsync(800);
    expect(mockTopicService.update).toHaveBeenCalledWith(
      subjectId, topicId, { notes: 'nova nota' }
    );
  });

  it('não dispara save antes de 800ms', async () => {
    vi.useFakeTimers();
    component.notesControl.setValue('digitando...');
    await vi.advanceTimersByTimeAsync(400);
    expect(mockTopicService.update).not.toHaveBeenCalled();
  });

  it('define saveStatus=saved após auto-save e idle após 2s', async () => {
    vi.useFakeTimers();
    component.notesControl.setValue('teste');
    await vi.advanceTimersByTimeAsync(800);
    expect(component.saveStatus()).toBe('saved');
    await vi.advanceTimersByTimeAsync(2000);
    expect(component.saveStatus()).toBe('idle');
  });

  it('isOverdue retorna true para data passada', () => {
    component.topic = { ...MOCK_TOPIC, next_review: '2020-01-01' };
    expect(component.isOverdue).toBe(true);
  });

  it('isOverdue retorna false para data futura', () => {
    component.topic = { ...MOCK_TOPIC, next_review: '2030-01-01' };
    expect(component.isOverdue).toBe(false);
  });

  it('nextReviewLabel formata a data em português', () => {
    component.topic = { ...MOCK_TOPIC, next_review: '2026-03-20' };
    const label = component.nextReviewLabel;
    expect(label).toContain('2026');
    expect(label).toContain('março');
  });

  it('nextReviewLabel retorna "—" sem topic', () => {
    component.topic = null;
    expect(component.nextReviewLabel).toBe('—');
  });
});
