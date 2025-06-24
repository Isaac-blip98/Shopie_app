import { Routes } from '@angular/router';

export const routes: Routes = [
  { path: '', redirectTo: 'auth/register', pathMatch: 'full' },
  {
    path: 'auth',
    loadChildren: () => import('./auth/auth.module').then((m) => m.AuthModule),
  },
  {
    path: 'admin',
    loadComponent: () =>
      import('./admin/admin.component').then((m) => m.AdminDashboardComponent),
  },
  {
  path: 'shop',
  loadComponent: () =>
    import('./shop/shop.component').then((m) => m.ShopComponent),
},
{
  path: 'reset-password',
  loadComponent: () =>
    import('./auth/reset-password/reset-password.component').then(
      (m) => m.ResetPasswordComponent
    ),
}


];
