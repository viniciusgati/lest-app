import { Routes } from '@angular/router';
import { authGuard } from './core/guards/auth.guard';

export const routes: Routes = [
  {
    path: '',
    pathMatch: 'full',
    canActivate: [authGuard],
    loadComponent: () =>
      import('./features/home/home/home').then(m => m.Home)
  },
  {
    path: 'subjects',
    canActivate: [authGuard],
    loadComponent: () =>
      import('./features/subjects/subjects/subjects').then(m => m.Subjects)
  },
  {
    path: 'agenda',
    canActivate: [authGuard],
    loadComponent: () =>
      import('./features/agenda/agenda/agenda').then(m => m.Agenda)
  },
  {
    path: 'goals',
    canActivate: [authGuard],
    loadComponent: () =>
      import('./features/goals/goals/goals').then(m => m.Goals)
  },
  {
    path: 'auth/login',
    loadComponent: () =>
      import('./features/auth/login/login').then(m => m.Login)
  },
  {
    path: 'auth/signup',
    loadComponent: () =>
      import('./features/auth/signup/signup.component').then(m => m.SignupComponent)
  },
  { path: '**', redirectTo: '' }
];
