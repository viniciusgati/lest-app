import { TestBed } from '@angular/core/testing';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { provideHttpClient } from '@angular/common/http';
import { SubjectService } from './subject.service';
import { Subject } from '../models/subject.model';

describe('SubjectService', () => {
  let service: SubjectService;
  let httpMock: HttpTestingController;

  const mockSubject: Subject = { id: 1, name: 'Matemática', created_at: '2026-03-13' };

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        SubjectService,
        provideHttpClient(),
        provideHttpClientTesting()
      ]
    });

    service = TestBed.inject(SubjectService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  describe('getAll()', () => {
    it('should GET /api/v1/subjects', () => {
      service.getAll().subscribe(subjects => {
        expect(subjects.length).toBe(1);
        expect(subjects[0].name).toBe('Matemática');
      });

      const req = httpMock.expectOne('/api/v1/subjects');
      expect(req.request.method).toBe('GET');
      req.flush([mockSubject]);
    });
  });

  describe('create()', () => {
    it('should POST /api/v1/subjects with correct body', () => {
      service.create('Física').subscribe(subject => {
        expect(subject.name).toBe('Física');
      });

      const req = httpMock.expectOne('/api/v1/subjects');
      expect(req.request.method).toBe('POST');
      expect(req.request.body).toEqual({ subject: { name: 'Física' } });
      req.flush({ id: 2, name: 'Física', created_at: '' });
    });
  });

  describe('update()', () => {
    it('should PUT /api/v1/subjects/:id with correct body', () => {
      service.update(1, 'Física Quântica').subscribe(subject => {
        expect(subject.name).toBe('Física Quântica');
      });

      const req = httpMock.expectOne('/api/v1/subjects/1');
      expect(req.request.method).toBe('PUT');
      expect(req.request.body).toEqual({ subject: { name: 'Física Quântica' } });
      req.flush({ id: 1, name: 'Física Quântica', created_at: '' });
    });
  });

  describe('delete()', () => {
    it('should DELETE /api/v1/subjects/:id', () => {
      service.delete(1).subscribe();

      const req = httpMock.expectOne('/api/v1/subjects/1');
      expect(req.request.method).toBe('DELETE');
      req.flush(null);
    });
  });

  describe('getOne()', () => {
    it('should GET /api/v1/subjects/:id', () => {
      service.getOne(1).subscribe(subject => {
        expect(subject.id).toBe(1);
        expect(subject.name).toBe('Matemática');
      });

      const req = httpMock.expectOne('/api/v1/subjects/1');
      expect(req.request.method).toBe('GET');
      req.flush(mockSubject);
    });
  });
});
