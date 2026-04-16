import { Routes } from '@angular/router';
import { Layout } from './layout/layout';

export const routes: Routes = [
  {
    path: 'login',
    loadComponent: () => import('./features/auth/login/login').then((m) => m.Login),
    data: { title: 'Sign In' },
  },
  {
    path: 'signup',
    loadComponent: () => import('./features/auth/signup/signup').then((m) => m.Signup),
    data: { title: 'Sign Up' },
  },
  {
    path: '',
    component: Layout,
    children: [
      { path: '', redirectTo: 'moments', pathMatch: 'full' },
      {
        path: 'profile',
        loadComponent: () =>
          import('./features/moments/add-moment/add-moment').then((m) => m.AddMoment),
        data: { title: 'Profile' },
      },
      {
        path: 'moments',
        children: [
          {
            path: '',
            loadComponent: () =>
              import('./features/moments/moment-list/moment-list').then((m) => m.MomentList),
            data: { title: 'Moments' },
          },
          {
            path: 'add',
            loadComponent: () =>
              import('./features/moments/add-moment/add-moment').then((m) => m.AddMoment),
            data: { title: 'Add new moment' },
          },
        ],
      },
    ],
  },
];
