import { Routes } from '@angular/router';
import { authGuard } from './core/guards/auth.guard';

export const routes: Routes = [
  // Rotas públicas (sem shell)
  {
    path: 'auth',
    children: [
      {
        path: 'login',
        loadComponent: () =>
          import('./features/auth/login/login').then(m => m.Login)
      },
      {
        path: 'signup',
        loadComponent: () =>
          import('./features/auth/signup/signup.component').then(m => m.SignupComponent)
      }
    ]
  },

  // Rotas privadas (com shell)
  {
    path: '',
    loadComponent: () =>
      import('./layout/shell/shell.component').then(m => m.ShellComponent),
    canActivate: [authGuard],
    children: [
      {
        path: '',
        pathMatch: 'full',
        loadComponent: () =>
          import('./features/home/home/home').then(m => m.Home)
      },
      {
        path: 'subjects',
        children: [
          {
            path: '',
            loadComponent: () =>
              import('./features/subjects/subjects/subjects').then(m => m.Subjects)
          },
          {
            path: ':id',
            loadComponent: () =>
              import('./features/subjects/subject-detail/subject-detail').then(m => m.SubjectDetail)
          },
          {
            path: ':subjectId/topics/:id',
            loadComponent: () =>
              import('./features/subjects/topic-detail/topic-detail').then(m => m.TopicDetail)
          }
        ]
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
      }
    ]
  },

  { path: '**', redirectTo: '' }
];
