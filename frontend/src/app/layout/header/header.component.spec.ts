import { TestBed } from '@angular/core/testing';
import { Component } from '@angular/core';
import { HeaderComponent } from './header.component';
import { provideRouter, Router } from '@angular/router';
import { provideHttpClient } from '@angular/common/http';
import { AuthService } from '../../core/services/auth.service';
import { of, throwError } from 'rxjs';
import { vi } from 'vitest';

@Component({ standalone: true, template: '' })
class StubComponent {}

const testRoutes = [
  { path: '', component: StubComponent },
  { path: 'subjects', component: StubComponent },
  { path: 'agenda', component: StubComponent },
  { path: 'goals', component: StubComponent },
];

describe('HeaderComponent', () => {
  const authServiceMock = {
    logout: vi.fn().mockReturnValue(of({ message: 'Logged out' })),
    clearSession: vi.fn()
  };

  beforeEach(async () => {
    vi.clearAllMocks();
    authServiceMock.logout.mockReturnValue(of({ message: 'Logged out' }));

    await TestBed.configureTestingModule({
      imports: [HeaderComponent],
      providers: [
        provideRouter(testRoutes),
        provideHttpClient(),
        { provide: AuthService, useValue: authServiceMock }
      ]
    }).compileComponents();
  });

  it('should create', () => {
    const fixture = TestBed.createComponent(HeaderComponent);
    expect(fixture.componentInstance).toBeTruthy();
  });

  it('pageTitle() should return "EduTrack" for root route', () => {
    const fixture = TestBed.createComponent(HeaderComponent);
    expect(fixture.componentInstance.pageTitle()).toBe('EduTrack');
  });

  it('should call AuthService.logout() on logout()', () => {
    const fixture = TestBed.createComponent(HeaderComponent);
    fixture.componentInstance.logout();
    expect(authServiceMock.logout).toHaveBeenCalled();
  });

  it('should render a logout button', () => {
    const fixture = TestBed.createComponent(HeaderComponent);
    fixture.detectChanges();
    const compiled = fixture.nativeElement as HTMLElement;
    expect(compiled.querySelector('p-button')).not.toBeNull();
  });

  it('pageTitle() should return "Matérias" for /subjects', async () => {
    const fixture = TestBed.createComponent(HeaderComponent);
    const router = TestBed.inject(Router);
    await router.navigateByUrl('/subjects');
    fixture.detectChanges();
    expect(fixture.componentInstance.pageTitle()).toBe('Matérias');
  });

  it('pageTitle() should return "Agenda" for /agenda', async () => {
    const fixture = TestBed.createComponent(HeaderComponent);
    const router = TestBed.inject(Router);
    await router.navigateByUrl('/agenda');
    fixture.detectChanges();
    expect(fixture.componentInstance.pageTitle()).toBe('Agenda');
  });

  it('pageTitle() should return "Metas" for /goals', async () => {
    const fixture = TestBed.createComponent(HeaderComponent);
    const router = TestBed.inject(Router);
    await router.navigateByUrl('/goals');
    fixture.detectChanges();
    expect(fixture.componentInstance.pageTitle()).toBe('Metas');
  });

  it('should call clearSession() if logout() fails', () => {
    authServiceMock.logout.mockReturnValue(throwError(() => new Error('Network error')));
    const fixture = TestBed.createComponent(HeaderComponent);
    fixture.componentInstance.logout();
    expect(authServiceMock.clearSession).toHaveBeenCalled();
  });
});
