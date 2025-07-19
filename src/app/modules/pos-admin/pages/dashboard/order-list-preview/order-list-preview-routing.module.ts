import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { OrderListPreviewComponent } from './order-list-preview.component';

const routes: Routes = [{ path: '', component: OrderListPreviewComponent }];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class OrderListPreviewRoutingModule { }
