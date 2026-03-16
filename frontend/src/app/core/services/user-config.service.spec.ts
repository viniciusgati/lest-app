import { TestBed } from '@angular/core/testing';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { provideHttpClient } from '@angular/common/http';
import { UserConfigService } from './user-config.service';
import { UserConfig } from '../models/user-config.model';

describe('UserConfigService', () => {
  let service: UserConfigService;
  let httpMock: HttpTestingController;

  const mockConfig: UserConfig = {
    id: 1,
    available_days: ['mon', 'tue', 'wed', 'thu', 'fri'],
    schedule_strategy: 'sm2'
  };

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        UserConfigService,
        provideHttpClient(),
        provideHttpClientTesting()
      ]
    });
    service = TestBed.inject(UserConfigService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => httpMock.verify());

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  describe('get()', () => {
    it('should GET /api/v1/user_config', () => {
      service.get().subscribe(config => {
        expect(config.schedule_strategy).toBe('sm2');
      });
      const req = httpMock.expectOne('/api/v1/user_config');
      expect(req.request.method).toBe('GET');
      req.flush(mockConfig);
    });
  });

  describe('update()', () => {
    it('should PUT /api/v1/user_config with correct body', () => {
      service.update({ schedule_strategy: 'balanced', available_days: ['mon', 'wed'] }).subscribe(config => {
        expect(config.schedule_strategy).toBe('balanced');
      });
      const req = httpMock.expectOne('/api/v1/user_config');
      expect(req.request.method).toBe('PUT');
      expect(req.request.body).toEqual({
        user_config: { schedule_strategy: 'balanced', available_days: ['mon', 'wed'] }
      });
      req.flush({ ...mockConfig, schedule_strategy: 'balanced', available_days: ['mon', 'wed'] });
    });
  });
});
