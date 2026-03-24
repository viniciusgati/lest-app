import { ComponentFixture, TestBed } from '@angular/core/testing';
import { vi } from 'vitest';
import { of, throwError } from 'rxjs';
import { provideRouter } from '@angular/router';
import { provideAnimationsAsync } from '@angular/platform-browser/animations/async';
import { Profile } from './profile';
import { ProfileService } from '../../core/services/profile.service';

const MOCK_PROFILE = { id: 1, name: 'Usuário Teste', email: 'test@test.com', created_at: '2026-01-01' };

describe('Profile', () => {
  let fixture: ComponentFixture<Profile>;
  let component: Profile;
  let mockProfileService: { getProfile: ReturnType<typeof vi.fn>; updateProfile: ReturnType<typeof vi.fn> };

  beforeEach(async () => {
    mockProfileService = {
      getProfile: vi.fn().mockReturnValue(of(MOCK_PROFILE)),
      updateProfile: vi.fn().mockReturnValue(of(MOCK_PROFILE))
    };

    await TestBed.configureTestingModule({
      imports: [Profile],
      providers: [
        provideRouter([]),
        provideAnimationsAsync(),
        { provide: ProfileService, useValue: mockProfileService }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(Profile);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('deve ser criado', () => {
    expect(component).toBeTruthy();
  });

  describe('ngOnInit', () => {
    it('carrega o perfil do usuário', () => {
      expect(mockProfileService.getProfile).toHaveBeenCalled();
    });

    it('preenche o campo name com o dado do perfil', () => {
      expect(component.form.get('name')?.value).toBe('Usuário Teste');
    });

    it('define loading=false após carregar', () => {
      expect(component.loading).toBe(false);
    });

    it('define loading=false em caso de erro', () => {
      mockProfileService.getProfile.mockReturnValue(throwError(() => new Error()));
      component.ngOnInit();
      expect(component.loading).toBe(false);
    });
  });

  describe('submit()', () => {
    it('não chama updateProfile se form inválido (nome vazio)', () => {
      component.form.patchValue({ name: '' });
      component.submit();
      expect(mockProfileService.updateProfile).not.toHaveBeenCalled();
    });

    it('chama updateProfile com payload contendo name', () => {
      component.form.patchValue({ name: 'Novo Nome' });
      component.submit();
      expect(mockProfileService.updateProfile).toHaveBeenCalledWith(
        expect.objectContaining({ name: 'Novo Nome' })
      );
    });

    it('inclui campos de senha no payload quando currentPassword e password preenchidos', () => {
      component.form.patchValue({
        name: 'Novo Nome',
        currentPassword: 'senhaAtual',
        password: 'novaSenha123',
        passwordConfirmation: 'novaSenha123'
      });
      component.submit();
      expect(mockProfileService.updateProfile).toHaveBeenCalledWith(
        expect.objectContaining({
          current_password: 'senhaAtual',
          password: 'novaSenha123',
          password_confirmation: 'novaSenha123'
        })
      );
    });

    it('não inclui campos de senha quando currentPassword ausente', () => {
      component.form.patchValue({ name: 'Nome', currentPassword: '', password: '' });
      component.submit();
      const payload = mockProfileService.updateProfile.mock.calls[0][0];
      expect(payload).not.toHaveProperty('current_password');
      expect(payload).not.toHaveProperty('password');
    });

    it('define saving=false após sucesso', () => {
      component.form.patchValue({ name: 'Nome' });
      component.submit();
      expect(component.saving).toBe(false);
    });

    it('define saving=false em caso de erro', () => {
      mockProfileService.updateProfile.mockReturnValue(
        throwError(() => ({ error: { errors: ['Senha incorreta'] } }))
      );
      component.form.patchValue({ name: 'Nome' });
      component.submit();
      expect(component.saving).toBe(false);
    });
  });

  describe('passwordMismatch', () => {
    it('retorna false quando campos de confirmação estão em branco', () => {
      expect(component.passwordMismatch).toBe(false);
    });

    it('retorna true quando senhas não coincidem e campo está dirty', () => {
      component.form.patchValue({ password: 'abc123', passwordConfirmation: 'diferente' });
      component.form.get('passwordConfirmation')?.markAsDirty();
      expect(component.passwordMismatch).toBe(true);
    });

    it('retorna false quando senhas coincidem', () => {
      component.form.patchValue({ password: 'abc123', passwordConfirmation: 'abc123' });
      component.form.get('passwordConfirmation')?.markAsDirty();
      expect(component.passwordMismatch).toBe(false);
    });
  });
});
