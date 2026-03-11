import { Routes } from '@angular/router';

export const routes: Routes = [
  {
    path: '',
    loadComponent: () =>
      import('./features/home/home/home').then(m => m.Home)
  },
  {
    path: 'subjects',
    loadComponent: () =>
      import('./features/subjects/subjects/subjects').then(m => m.Subjects)
  },
  {
    path: 'agenda',
    loadComponent: () =>
      import('./features/agenda/agenda/agenda').then(m => m.Agenda)
  },
  {
    path: 'goals',
    loadComponent: () =>
      import('./features/goals/goals/goals').then(m => m.Goals)
  },
  {
    path: 'auth/login',
    loadComponent: () =>
      import('./features/auth/login/login/login').then(m => m.Login)
  },
  { path: '**', redirectTo: '' }
];
