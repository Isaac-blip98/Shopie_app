import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { AdminDashboardComponent } from './admin.component';
import { OverviewComponent } from './overview/overview.component';
import { ProductPreviewComponent } from './products/product-preview.component';
import { CustomerListComponent } from './customers/customer-list.component';

const routes: Routes = [
  {
    path: '',
    component: AdminDashboardComponent,
    children: [
      { path: '', redirectTo: 'overview', pathMatch: 'full' },
      { path: 'overview', component: OverviewComponent },
      { path: 'products', component: ProductPreviewComponent },
      { path: 'customers', component: CustomerListComponent },
    ],
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class AdminRoutingModule {}
