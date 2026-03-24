import { TestBed } from '@angular/core/testing';
import { HttpClient, provideHttpClient, withInterceptors } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { provideRouter } from '@angular/router';
import { of, throwError } from 'rxjs';
import { AuthService } from '../services/auth.service';
import { authInterceptor } from './auth.interceptor';
import { vi } from 'vitest';

describe('authInterceptor', () => {
  let http: HttpClient;
  let httpMock: HttpTestingController;
  let authServiceMock: {
    getToken: ReturnType<typeof vi.fn>;
    setToken: ReturnType<typeof vi.fn>;
    refreshToken: ReturnType<typeof vi.fn>;
    clearSession: ReturnType<typeof vi.fn>;
  };

  beforeEach(() => {
    authServiceMock = {
      getToken: vi.fn(),
      setToken: vi.fn(),
      refreshToken: vi.fn(),
      clearSession: vi.fn()
    };

    TestBed.configureTestingModule({
      providers: [
        provideRouter([]),
        provideHttpClient(withInterceptors([authInterceptor])),
        provideHttpClientTesting(),
        { provide: AuthService, useValue: authServiceMock }
      ]
    });

    http = TestBed.inject(HttpClient);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => httpMock.verify());

  it('adiciona Authorization header quando token existe', () => {
    authServiceMock.getToken.mockReturnValue('mytoken');

    http.get('/api/test').subscribe();

    const req = httpMock.expectOne('/api/test');
    expect(req.request.headers.get('Authorization')).toBe('Bearer mytoken');
    req.flush({});
  });

  it('não adiciona Authorization header quando não há token', () => {
    authServiceMock.getToken.mockReturnValue(null);

    http.get('/api/test').subscribe();

    const req = httpMock.expectOne('/api/test');
    expect(req.request.headers.has('Authorization')).toBe(false);
    req.flush({});
  });

  it('tenta refresh ao receber 401 em endpoint não-auth', () => {
    authServiceMock.getToken.mockReturnValue('expiredtoken');
    authServiceMock.refreshToken.mockReturnValue(of({ token: 'newtoken', expires_in: 86400 }));

    http.get('/api/test').subscribe({ error: () => {} });

    const req = httpMock.expectOne('/api/test');
    req.flush('Unauthorized', { status: 401, statusText: 'Unauthorized' });

    expect(authServiceMock.refreshToken).toHaveBeenCalled();

    const retried = httpMock.expectOne('/api/test');
    expect(retried.request.headers.get('Authorization')).toBe('Bearer newtoken');
    retried.flush({});
  });

  it('salva novo token após refresh bem-sucedido', () => {
    authServiceMock.getToken.mockReturnValue('expiredtoken');
    authServiceMock.refreshToken.mockReturnValue(of({ token: 'newtoken', expires_in: 86400 }));

    http.get('/api/test').subscribe({ error: () => {} });

    const req = httpMock.expectOne('/api/test');
    req.flush('Unauthorized', { status: 401, statusText: 'Unauthorized' });

    expect(authServiceMock.setToken).toHaveBeenCalledWith('newtoken');

    const retried = httpMock.expectOne('/api/test');
    retried.flush({});
  });

  it('chama clearSession() se refresh falhar', () => {
    authServiceMock.getToken.mockReturnValue('expiredtoken');
    authServiceMock.refreshToken.mockReturnValue(throwError(() => new Error('refresh failed')));

    http.get('/api/test').subscribe({ error: () => {} });

    const req = httpMock.expectOne('/api/test');
    req.flush('Unauthorized', { status: 401, statusText: 'Unauthorized' });

    expect(authServiceMock.clearSession).toHaveBeenCalled();
  });

  it('não tenta refresh para endpoints /auth/', () => {
    authServiceMock.getToken.mockReturnValue('expiredtoken');

    http.post('/api/v1/auth/login', {}).subscribe({ error: () => {} });

    const req = httpMock.expectOne('/api/v1/auth/login');
    req.flush('Unauthorized', { status: 401, statusText: 'Unauthorized' });

    expect(authServiceMock.refreshToken).not.toHaveBeenCalled();
  });
});
