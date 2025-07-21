import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { AuthLayoutComponent } from './layouts';
import { PosComponent } from './layouts/pos/pos.component';
import { PosLoginComponent } from '@module/auth/pages/pos-login/pos-login.component';
//import { TableOrderByQRScanComponent } from './table-order-by-qr-scan/table-order-by-qr-scan.component';
//import { TableOrderCartComponent } from './table-order-cart/table-order-cart.component';
import { ResetPasswordComponent } from '@module/auth/pages/reset-password/reset-password.component';

const routes: Routes = [
  {
    path: '',
    redirectTo: '/',
    pathMatch: 'full'
  },
  // {
  //   path: 'myorder/:outletId/:tableId/:outletName',
  //   data: { breadcrumb: 'TableOrder' },
  //   component: TableOrderByQRScanComponent
  // },
  // {
  //   path: 'myordercart',
  //   data: { breadcrumb: 'TableOrdercart' },
  //   component: TableOrderCartComponent,
  // },
  {
    path: '',
    data: { breadcrumb: 'Login' },
    component: PosLoginComponent,
  },
  {
    path: 'pos-dashboard/reset-password',
    component: ResetPasswordComponent // Standalone without sidebar
  },
  {
    path: '',
    component: AuthLayoutComponent,
    loadChildren: () => import('./modules/auth/auth.module').then(m => m.AuthModule)
  },
  {
    path: 'pos-dashboard',
    component: PosComponent,
    loadChildren: () => import('./modules/pos-admin/pos-admin.module').then(m => m.PosAdminModule)
  },
  { path: 'modules/pos-admin/pages/dashboard/order-list-preview', loadChildren: () => import('./modules/pos-admin/pages/dashboard/order-list-preview/order-list-preview.module').then(m => m.OrderListPreviewModule) },
  //Fallback when no prior routes is matched
  { path: '**', redirectTo: '/', pathMatch: 'full' }
];

@NgModule({
  imports: [RouterModule.forRoot(routes, { useHash: true })],
  exports: [RouterModule]
})
export class AppRoutingModule { }
