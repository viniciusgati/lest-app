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
    it('should store token in localStorage on successful login', () => {
      service.login({ user: { email: 'test@test.com', password: '123456' } }).subscribe();

      const req = httpMock.expectOne('/api/v1/auth/login');
      req.flush(
        { message: 'Login realizado', user: { id: 1, name: 'Test', email: 'test@test.com' } },
        { headers: { Authorization: 'Bearer token123' } }
      );

      expect(localStorage.getItem('auth_token')).toBe('token123');
    });

    it('should set currentUser signal on successful login', () => {
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
    it('should remove token from localStorage on logout', () => {
      localStorage.setItem('auth_token', 'token123');

      service.logout().subscribe();

      const req = httpMock.expectOne('/api/v1/auth/logout');
      req.flush({ message: 'Logout realizado com sucesso.' });

      expect(localStorage.getItem('auth_token')).toBeNull();
    });

    it('should clear currentUser on logout', () => {
      localStorage.setItem('auth_token', 'token123');
      localStorage.setItem('auth_user', JSON.stringify({ id: 1, name: 'Test', email: 'test@test.com' }));

      service.logout().subscribe();

      const req = httpMock.expectOne('/api/v1/auth/logout');
      req.flush({ message: 'Logout realizado com sucesso.' });

      expect(service.currentUser()).toBeNull();
    });
  });

  describe('isAuthenticated()', () => {
    it('should return false when no token exists', () => {
      expect(service.isAuthenticated()).toBe(false);
    });

    it('should return true when token exists', () => {
      localStorage.setItem('auth_token', 'sometoken');
      expect(service.isAuthenticated()).toBe(true);
    });
  });

  describe('getToken()', () => {
    it('should return null when no token stored', () => {
      expect(service.getToken()).toBeNull();
    });

    it('should return stored token', () => {
      localStorage.setItem('auth_token', 'mytoken');
      expect(service.getToken()).toBe('mytoken');
    });
  });
});
