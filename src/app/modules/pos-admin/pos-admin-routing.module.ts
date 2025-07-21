import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { MenuComponent } from './pages/menu/menu.component';

import { OrderComponent } from './pages/order/order.component';
import { DiscountComponent } from './pages/master/discount/discount.component';
import { TaxComponent } from './pages/master/tax/tax.component';
import { UserRegistrationComponent } from './pages/user-registration/user-registration.component';
import { AdminRoleComponent } from './pages/admin-role/admin-role.component';
import { DashboardComponent } from './pages/dashboard/dashboard.component';


import { SettingsComponent } from './pages/settings/settings.component';
import { UserViewComponent } from './pages/user-view/user-view.component';
import { SalesByCategoryComponent } from './pages/sales-by-category/sales-by-category.component';
import { SalesByItemComponent } from './pages/sales-by-item/sales-by-item.component';
import { SalesByComponent } from './pages/sales-by/sales-by.component';
import { InventoryComponent } from './pages/Inventory/inventory.component';
import { SupplierComponent } from './pages/Inventory/supplier/supplier.component';
import { ProductComponent } from './pages/Inventory/product/product.component';
import { SupplierOrderComponent } from './pages/Inventory/supplier-orders/supplier-order.component';
import { AddSupplierOrderComponent } from './pages/Inventory/supplier-orders/add-supplier-order/add-supplier-order.component';
import { AddSupplierComponent } from './pages/Inventory/supplier/add-supplier/add-supplier.component';
import { AddProductComponent } from './pages/Inventory/product/add-product/add-product.component';
import { AddInventoryComponent } from './pages/Inventory/add-inventory/add-inventory.component';
import { ShiftTimingComponent } from './pages/shifttiming/shifttiming.component';

import { DetailedReportComponent } from './pages/dashboard/detailed-report/detailed-report.component';
import { ReconcileStockComponent } from './pages/Inventory/reconcile-stock/reconcile-stock.component';
import { POSAuthGuard } from '@module/auth-guard/posauth.guard';
import { GeneralSettingsComponent } from './pages/general-settings/general-settings.component';
import { PettyCashComponent } from './pages/pettycash/pettycash.component';


const routes: Routes = [
  {
    path: 'dashboard',
    component: DashboardComponent,
    canActivate: [POSAuthGuard]
  },
  {
    path: 'supplier/add-supplier',
    component: AddSupplierComponent
  },
  {
    path: 'product/add-product',
    component: AddProductComponent
  },
  {
    path: 'sales-by',
    component: SalesByComponent
  },
  {
    path: 'inventory/add-inventory',
    component: AddInventoryComponent
  },
  {
    path: 'supplier-orders/add-supplier-order',
    component: AddSupplierOrderComponent
  },
  {
    path: 'dine-in/order',
    component: OrderComponent
  },
  {
    path: 'item-master',
    component: MenuComponent
  },
  
  {
    path: 'sales-by-category',
    component: SalesByCategoryComponent
  },
  {
    path: 'sales-by-item',
    component: SalesByItemComponent
  },

  {
    path: 'shifttiming',
    component: ShiftTimingComponent
  },
 
  {
    path: 'Inventory/product',
    component: ProductComponent
  },
  {
    path: 'Inventory/supplier',
    component: SupplierComponent
  },
  {
    path: 'Inventory',
    component: InventoryComponent,
    canActivate: [POSAuthGuard]
  },
  {
    path: 'Inventory/supplier-order',
    component: SupplierOrderComponent
  },
  
  {
    path: 'settings',
    component: SettingsComponent
  },
  {
    path: 'user-view',
    component: UserViewComponent
  },
 
 
  

           
  

  {
    path: 'masters-discount',
    component: DiscountComponent
  },
  

  {
    path: 'masters-tax',
    component: TaxComponent,
    canActivate: [POSAuthGuard]
  },
 
  
  {
    path: 'master-user-registration',
    component: UserRegistrationComponent,
    canActivate: [POSAuthGuard]
  },
  {
    path: 'role',
    component: AdminRoleComponent
  },
  
 
 

 


  
 

  {
    path: 'dashboard/detailed-report',
    component: DetailedReportComponent,
    canActivate: [POSAuthGuard]
  },
  
  {
    path: 'Inventory/reconcile-stock',
    component: ReconcileStockComponent
  },

  
  {
    path: 'general-settings',
    component: GeneralSettingsComponent
  },
 
  {
    path: 'pettycash',
    component: PettyCashComponent
  },

 
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})

export class PosAdminRoutingModule { }
