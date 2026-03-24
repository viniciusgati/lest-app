import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, Validators, AbstractControl, ValidationErrors } from '@angular/forms';
import { ButtonModule } from 'primeng/button';
import { CardModule } from 'primeng/card';
import { ToastModule } from 'primeng/toast';
import { InputTextModule } from 'primeng/inputtext';
import { PasswordModule } from 'primeng/password';
import { MessageService } from 'primeng/api';
import { ProfileService } from '../../core/services/profile.service';

function passwordMatchValidator(group: AbstractControl): ValidationErrors | null {
  const pw = group.get('password')?.value;
  const confirm = group.get('passwordConfirmation')?.value;
  if (pw && confirm && pw !== confirm) {
    return { passwordMismatch: true };
  }
  return null;
}

@Component({
  selector: 'app-profile',
  standalone: true,
  imports: [
    CommonModule, ReactiveFormsModule,
    ButtonModule, CardModule, ToastModule, InputTextModule, PasswordModule
  ],
  providers: [MessageService],
  templateUrl: './profile.html'
})
export class Profile implements OnInit {
  loading = false;
  saving = false;

  form = inject(FormBuilder).group({
    name: ['', [Validators.required, Validators.maxLength(100)]],
    currentPassword: [''],
    password: [''],
    passwordConfirmation: ['']
  }, { validators: passwordMatchValidator });

  private profileService = inject(ProfileService);
  private messageService = inject(MessageService);

  get passwordMismatch(): boolean {
    return !!this.form.errors?.['passwordMismatch'] && !!this.form.get('passwordConfirmation')?.dirty;
  }

  ngOnInit(): void {
    this.loading = true;
    this.profileService.getProfile().subscribe({
      next: (profile) => {
        this.form.patchValue({ name: profile.name });
        this.loading = false;
      },
      error: () => { this.loading = false; }
    });
  }

  submit(): void {
    if (this.form.invalid || this.saving) return;
    this.saving = true;

    const { name, currentPassword, password, passwordConfirmation } = this.form.value;
    const payload: Record<string, string> = {};

    if (name) payload['name'] = name;

    if (currentPassword && password) {
      payload['current_password'] = currentPassword;
      payload['password'] = password;
      if (passwordConfirmation) payload['password_confirmation'] = passwordConfirmation;
    }

    this.profileService.updateProfile(payload).subscribe({
      next: () => {
        this.saving = false;
        this.messageService.add({ severity: 'success', summary: 'Sucesso', detail: 'Perfil atualizado com sucesso' });
        this.form.patchValue({ currentPassword: '', password: '', passwordConfirmation: '' });
        this.form.get('currentPassword')?.markAsPristine();
        this.form.get('password')?.markAsPristine();
        this.form.get('passwordConfirmation')?.markAsPristine();
      },
      error: (err) => {
        this.saving = false;
        const msg = err.error?.errors?.[0] ?? 'Erro ao atualizar perfil';
        this.messageService.add({ severity: 'error', summary: 'Erro', detail: msg });
      }
    });
  }
}
