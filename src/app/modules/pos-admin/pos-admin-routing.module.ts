import { TaxSetupComponent } from './pages/master/tax-setup/tax-setup.component';
import { PrintDesignTableComponent } from './pages/print-design-veiw/print-design-table/print-design-table.component';
import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
//import { AddAdminCategoryComponent } from './pages/admin-category/add-admin-category/add-admin-category.component';
//import { AdminCategoryComponent } from './pages/admin-category/admin-category.component';
import { MenuComponent } from './pages/menu/menu.component';

import { OrderComponent } from './pages/order/order.component';
//import { ModifierGroupComponent } from './pages/master/modifier-group/modifier-group.component';
import { DiscountComponent } from './pages/master/discount/discount.component';
import { TableTypeComponent } from './pages/master/table-type/table-type.component';
import { OutletComponent } from './pages/master/outlet/outlet.component';
import { TaxComponent } from './pages/master/tax/tax.component';
import { PrintVeiwComponent } from './pages/print-design-veiw/print-veiw/print-veiw.component';
import { AdminRestaurantComponent } from './pages/admin-restaurant/admin-restaurant.component';
import { UserRegistrationComponent } from './pages/user-registration/user-registration.component';
import { AdminRoleComponent } from './pages/admin-role/admin-role.component';
import { FormAccessComponent } from './pages/master/form-access/form-access.component';
import { DashboardComponent } from './pages/dashboard/dashboard.component';


import { PrintDesignViewViewComponent } from './pages/print-design-veiw/print-design-view-view/print-design-view-view.component';
import { FormGroupComponent } from './pages/master/form-group/form-group.component';
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
import { RestaurantPermissionComponent } from './pages/admin-restaurant/restaurant-permission/restaurant-permission.component';
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
    path: 'masters-table-type',
    component: TableTypeComponent,
    canActivate: [POSAuthGuard]
  },
  {
    path: 'masters-outlet',
    component: OutletComponent
  },
  {
    path: 'masters-tax',
    component: TaxComponent,
    canActivate: [POSAuthGuard]
  },
  {
    path: 'tax-setup',
    component: TaxSetupComponent
  },
  {
    path: 'print',
    component: PrintDesignTableComponent
  },
  {
    path: 'print-preveiw',
    component: PrintVeiwComponent
  },
  {
    path: 'print-design',
    component: PrintDesignViewViewComponent
  },
  {
    path: 'admin-restaurant',
    component: AdminRestaurantComponent
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
    path: 'form-access',
    component: FormAccessComponent
  },
  {
    path: 'form-group',
    component: FormGroupComponent
  },
 

 


  
 

  {
    path: 'dashboard/detailed-report',
    component: DetailedReportComponent,
    canActivate: [POSAuthGuard]
  },
  {
    path: 'admin-restaurant/restaurant-permission',
    component: RestaurantPermissionComponent
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
