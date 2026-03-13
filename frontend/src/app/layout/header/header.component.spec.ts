import { TestBed } from '@angular/core/testing';
import { HeaderComponent } from './header.component';
import { provideRouter } from '@angular/router';
import { provideHttpClient } from '@angular/common/http';
import { AuthService } from '../../core/services/auth.service';
import { of } from 'rxjs';
import { vi } from 'vitest';

describe('HeaderComponent', () => {
  const authServiceMock = {
    logout: vi.fn().mockReturnValue(of({ message: 'Logged out' }))
  };

  beforeEach(async () => {
    vi.clearAllMocks();

    await TestBed.configureTestingModule({
      imports: [HeaderComponent],
      providers: [
        provideRouter([]),
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
    const component = fixture.componentInstance;
    expect(component.pageTitle()).toBe('EduTrack');
  });

  it('should call AuthService.logout() on logout()', () => {
    const fixture = TestBed.createComponent(HeaderComponent);
    const component = fixture.componentInstance;
    component.logout();
    expect(authServiceMock.logout).toHaveBeenCalled();
  });

  it('should render a logout button', () => {
    const fixture = TestBed.createComponent(HeaderComponent);
    fixture.detectChanges();
    const compiled = fixture.nativeElement as HTMLElement;
    const button = compiled.querySelector('p-button');
    expect(button).not.toBeNull();
  });
});
