import { Routes } from '@angular/router';

export const routes: Routes = [
  {
    path: 'dashboard',
    loadComponent: () => import('./dashboard/dashboard/dashboard.component'),

    children: [
      {
        path: 'works',
        loadComponent: () =>
          import('./works/pages/works-page/works-page.component'),
      },

      {
        path: 'enterprise',
        loadComponent: () =>
          import(
            './enterprises/pages/enterprise-page/enterprise-page.component'
          ),
      },

      {
        path: 'resorces',
        loadComponent: () =>
          import('./resources/pages/resources-page/resources-page.component'),
      },
      {
        path: 'dispatches',
        loadComponent: () =>
          import(
            './dispatches/pages/dispatches-page/dispatches-page.component'
          ),
      },

      {
        path: '**',
        redirectTo: 'works',
      },
    ],
  },
  {
    path: '**',
    redirectTo: 'dashboard',
  },
];
