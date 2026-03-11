import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, Validators, AbstractControl, ValidationErrors } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '../../../core/services/auth.service';

// PrimeNG
import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import { PasswordModule } from 'primeng/password';
import { CardModule } from 'primeng/card';
import { MessageModule } from 'primeng/message';

function passwordMatchValidator(control: AbstractControl): ValidationErrors | null {
  const password = control.get('password');
  const confirmation = control.get('password_confirmation');
  if (password && confirmation && password.value !== confirmation.value) {
    return { passwordMismatch: true };
  }
  return null;
}

@Component({
  selector: 'app-signup',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    RouterLink,
    ButtonModule,
    InputTextModule,
    PasswordModule,
    CardModule,
    MessageModule,
  ],
  templateUrl: './signup.component.html',
  styleUrl: './signup.component.scss',
})
export class SignupComponent {
  private fb = inject(FormBuilder);
  private authService = inject(AuthService);
  private router = inject(Router);

  form = this.fb.group({
    name: ['', [Validators.required, Validators.minLength(2)]],
    email: ['', [Validators.required, Validators.email]],
    password: ['', [Validators.required, Validators.minLength(6)]],
    password_confirmation: ['', Validators.required],
  }, { validators: passwordMatchValidator });

  loading = false;
  errorMessage = '';

  onSubmit(): void {
    if (this.form.invalid) return;

    this.loading = true;
    this.errorMessage = '';

    const { name, email, password, password_confirmation } = this.form.value;

    this.authService.signup({
      user: {
        name: name!,
        email: email!,
        password: password!,
        password_confirmation: password_confirmation!
      }
    }).subscribe({
      next: () => {
        this.router.navigate(['/auth/login']);
      },
      error: (err) => {
        const errors = err?.error?.errors as string[] | undefined;
        this.errorMessage = errors?.join(', ') ?? 'Erro ao criar conta.';
        this.loading = false;
      }
    });
  }
}
