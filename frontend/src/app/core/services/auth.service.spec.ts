import { TestBed } from '@angular/core/testing';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { provideHttpClient } from '@angular/common/http';
import { provideRouter } from '@angular/router';
import { AuthService } from './auth.service';

describe('AuthService', () => {
  let service: AuthService;
  let httpMock: HttpTestingController;

  beforeEach(() => {
    localStorage.clear();

    TestBed.configureTestingModule({
      providers: [
        AuthService,
        provideHttpClient(),
        provideHttpClientTesting(),
        provideRouter([])
      ]
    });

    service = TestBed.inject(AuthService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
    localStorage.clear();
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  describe('login()', () => {
    it('armazena access token em localStorage', () => {
      service.login({ user: { email: 'test@test.com', password: '123456' } }).subscribe();

      const req = httpMock.expectOne('/api/v1/auth/login');
      req.flush(
        { message: 'Login realizado', user: { id: 1, name: 'Test', email: 'test@test.com' } },
        { headers: { Authorization: 'Bearer token123' } }
      );

      expect(localStorage.getItem('auth_token')).toBe('token123');
    });

    it('armazena refresh token em localStorage quando presente na resposta', () => {
      service.login({ user: { email: 'test@test.com', password: '123456' } }).subscribe();

      const req = httpMock.expectOne('/api/v1/auth/login');
      req.flush(
        { message: 'Login realizado', refresh_token: 'rt_abc123', user: { id: 1, name: 'Test', email: 'test@test.com' } },
        { headers: { Authorization: 'Bearer token123' } }
      );

      expect(localStorage.getItem('refresh_token')).toBe('rt_abc123');
    });

    it('define currentUser após login bem-sucedido', () => {
      service.login({ user: { email: 'test@test.com', password: '123456' } }).subscribe();

      const req = httpMock.expectOne('/api/v1/auth/login');
      req.flush(
        { message: 'Login realizado', user: { id: 1, name: 'Test', email: 'test@test.com' } },
        { headers: { Authorization: 'Bearer token123' } }
      );

      expect(service.currentUser()?.email).toBe('test@test.com');
    });
  });

  describe('logout()', () => {
    it('remove access token do localStorage', () => {
      localStorage.setItem('auth_token', 'token123');

      service.logout().subscribe();

      const req = httpMock.expectOne('/api/v1/auth/logout');
      req.flush({ message: 'Logout realizado com sucesso.' });

      expect(localStorage.getItem('auth_token')).toBeNull();
    });

    it('remove refresh token do localStorage', () => {
      localStorage.setItem('auth_token', 'token123');
      localStorage.setItem('refresh_token', 'rt_abc');

      service.logout().subscribe();

      const req = httpMock.expectOne('/api/v1/auth/logout');
      req.flush({ message: 'Logout realizado com sucesso.' });

      expect(localStorage.getItem('refresh_token')).toBeNull();
    });

    it('limpa currentUser', () => {
      localStorage.setItem('auth_token', 'token123');
      localStorage.setItem('auth_user', JSON.stringify({ id: 1, name: 'Test', email: 'test@test.com' }));

      service.logout().subscribe();

      const req = httpMock.expectOne('/api/v1/auth/logout');
      req.flush({ message: 'Logout realizado com sucesso.' });

      expect(service.currentUser()).toBeNull();
    });
  });

  describe('refreshToken()', () => {
    it('POST /api/v1/auth/refresh com refresh_token do localStorage', () => {
      localStorage.setItem('refresh_token', 'rt_stored');

      service.refreshToken().subscribe();

      const req = httpMock.expectOne('/api/v1/auth/refresh');
      expect(req.request.method).toBe('POST');
      expect(req.request.body).toEqual({ refresh_token: 'rt_stored' });
      req.flush({ token: 'new_jwt', expires_in: 86400 });
    });

    it('retorna novo token e expires_in', () => {
      localStorage.setItem('refresh_token', 'rt_stored');

      service.refreshToken().subscribe(res => {
        expect(res.token).toBe('new_jwt');
        expect(res.expires_in).toBe(86400);
      });

      const req = httpMock.expectOne('/api/v1/auth/refresh');
      req.flush({ token: 'new_jwt', expires_in: 86400 });
    });
  });

  describe('setToken()', () => {
    it('salva token no localStorage', () => {
      service.setToken('newtoken');
      expect(localStorage.getItem('auth_token')).toBe('newtoken');
    });
  });

  describe('isAuthenticated()', () => {
    it('retorna false quando não há token', () => {
      expect(service.isAuthenticated()).toBe(false);
    });

    it('retorna true quando token existe', () => {
      localStorage.setItem('auth_token', 'sometoken');
      expect(service.isAuthenticated()).toBe(true);
    });
  });

  describe('getToken()', () => {
    it('retorna null quando não há token', () => {
      expect(service.getToken()).toBeNull();
    });

    it('retorna token armazenado', () => {
      localStorage.setItem('auth_token', 'mytoken');
      expect(service.getToken()).toBe('mytoken');
    });
  });
});
