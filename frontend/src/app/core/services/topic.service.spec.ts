import { TestBed } from '@angular/core/testing';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { provideHttpClient } from '@angular/common/http';
import { TopicService } from './topic.service';
import { Topic } from '../models/topic.model';

describe('TopicService', () => {
  let service: TopicService;
  let httpMock: HttpTestingController;

  const subjectId = 1;
  const topicId = 10;
  const mockTopic: Topic = {
    id: topicId,
    subject_id: subjectId,
    name: 'Equações',
    notes: null,
    ease_factor: 2.5,
    interval: 1,
    next_review: '2026-03-20',
    created_at: '2026-03-13'
  };

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        TopicService,
        provideHttpClient(),
        provideHttpClientTesting()
      ]
    });

    service = TestBed.inject(TopicService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  describe('getAll()', () => {
    it('should GET /api/v1/subjects/:subjectId/topics returning paginated response', () => {
      const paginatedResponse = {
        data: [mockTopic],
        meta: { page: 1, per_page: 50, total: 1, total_pages: 1 }
      };
      service.getAll(subjectId).subscribe(response => {
        expect(response.data.length).toBe(1);
        expect(response.data[0].name).toBe('Equações');
        expect(response.meta.total).toBe(1);
      });

      const req = httpMock.expectOne(r => r.url === `/api/v1/subjects/${subjectId}/topics`);
      expect(req.request.method).toBe('GET');
      req.flush(paginatedResponse);
    });
  });

  describe('getAllData()', () => {
    it('should return only data array', () => {
      const paginatedResponse = {
        data: [mockTopic],
        meta: { page: 1, per_page: 50, total: 1, total_pages: 1 }
      };
      service.getAllData(subjectId).subscribe(topics => {
        expect(topics.length).toBe(1);
        expect(topics[0].name).toBe('Equações');
      });

      const req = httpMock.expectOne(r => r.url === `/api/v1/subjects/${subjectId}/topics`);
      req.flush(paginatedResponse);
    });
  });

  describe('getOne()', () => {
    it('should GET /api/v1/subjects/:subjectId/topics/:id', () => {
      service.getOne(subjectId, topicId).subscribe(topic => {
        expect(topic.id).toBe(topicId);
      });

      const req = httpMock.expectOne(`/api/v1/subjects/${subjectId}/topics/${topicId}`);
      expect(req.request.method).toBe('GET');
      req.flush(mockTopic);
    });
  });

  describe('create()', () => {
    it('should POST /api/v1/subjects/:subjectId/topics with correct body', () => {
      service.create(subjectId, 'Novo Tema').subscribe(topic => {
        expect(topic.name).toBe('Novo Tema');
      });

      const req = httpMock.expectOne(`/api/v1/subjects/${subjectId}/topics`);
      expect(req.request.method).toBe('POST');
      expect(req.request.body).toEqual({ topic: { name: 'Novo Tema' } });
      req.flush({ ...mockTopic, id: 11, name: 'Novo Tema' });
    });
  });

  describe('update()', () => {
    it('should PUT /api/v1/subjects/:subjectId/topics/:id with data', () => {
      service.update(subjectId, topicId, { name: 'Atualizado' }).subscribe(topic => {
        expect(topic.name).toBe('Atualizado');
      });

      const req = httpMock.expectOne(`/api/v1/subjects/${subjectId}/topics/${topicId}`);
      expect(req.request.method).toBe('PUT');
      expect(req.request.body).toEqual({ topic: { name: 'Atualizado' } });
      req.flush({ ...mockTopic, name: 'Atualizado' });
    });

    it('should PUT with notes data for auto-save', () => {
      service.update(subjectId, topicId, { notes: 'minha nota' }).subscribe();

      const req = httpMock.expectOne(`/api/v1/subjects/${subjectId}/topics/${topicId}`);
      expect(req.request.body).toEqual({ topic: { notes: 'minha nota' } });
      req.flush({ ...mockTopic, notes: 'minha nota' });
    });
  });

  describe('delete()', () => {
    it('should DELETE /api/v1/subjects/:subjectId/topics/:id', () => {
      service.delete(subjectId, topicId).subscribe();

      const req = httpMock.expectOne(`/api/v1/subjects/${subjectId}/topics/${topicId}`);
      expect(req.request.method).toBe('DELETE');
      req.flush(null);
    });
  });
});
