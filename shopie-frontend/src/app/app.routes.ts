import { Routes } from '@angular/router';

export const routes: Routes = [
  { path: '', redirectTo: 'auth/register', pathMatch: 'full' },
  {
    path: 'auth',
    loadChildren: () => import('./auth/auth.module').then((m) => m.AuthModule),
  },
{
  path: 'admin',
  loadChildren: () =>
    import('./admin/admin.module').then((m) => m.AdminModule),
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
},
{
  path: 'cart',
  loadComponent: () =>
    import('./shop/cart/cart.component').then((m) => m.CartComponent),
}

];
