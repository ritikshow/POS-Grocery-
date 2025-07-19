import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { IsLoggedInGuard } from '@core/guards';
import { ForgotPasswordComponent } from './pages/forgot-password/forgot-password.component';
import { PosLoginComponent } from './pages/pos-login/pos-login.component';
import { ResetPasswordComponent } from './pages/reset-password/reset-password.component';

const routes: Routes = [
  {
    path: '',
    redirectTo: '/home',
    pathMatch: 'full'
    
  },
  {
    path: '',
    children: [
      {
        path: 'login',
        component: PosLoginComponent,
        canActivate: [IsLoggedInGuard]
      },
      {
        path: 'forgotPassword',
        component: ForgotPasswordComponent
      },
      {
        path: 'reset-password',
        component: ResetPasswordComponent
      }
    ]
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class AuthRoutingModule { }
