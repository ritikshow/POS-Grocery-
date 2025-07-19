import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { OrderListPreviewRoutingModule } from './order-list-preview-routing.module';
import { OrderListPreviewComponent } from './order-list-preview.component';


@NgModule({
  declarations: [OrderListPreviewComponent],
  imports: [
    CommonModule,
    OrderListPreviewRoutingModule
  ]
})
export class OrderListPreviewModule { }
