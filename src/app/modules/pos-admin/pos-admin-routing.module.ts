import { TaxSetupComponent } from './pages/master/tax-setup/tax-setup.component';
import { PrintDesignTableComponent } from './pages/print-design-veiw/print-design-table/print-design-table.component';
import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
//import { AddAdminCategoryComponent } from './pages/admin-category/add-admin-category/add-admin-category.component';
//import { AdminCategoryComponent } from './pages/admin-category/admin-category.component';
import { AdminTableDetailsComponent } from './pages/admin-table-details/admin-table-details.component';
import { MenuComponent } from './pages/menu/menu.component';
import { CompleteOrderComponent } from './pages/complete-order/complete-order.component';
import { DinesInComponent } from './pages/dines-in/dines-in.component';
import { KitchenItemComponent } from './pages/kitchen/kitchen-item/kitchen-item.component';
import { KitchenComponent } from './pages/kitchen/kitchen.component';
import { OrderComponent } from './pages/order/order.component';
import { RunningOrderComponent } from './pages/running-order/running-order.component';
import { ModifierGroupComponent } from './pages/master/modifier-group/modifier-group.component';
import { DiscountComponent } from './pages/master/discount/discount.component';
import { TableTypeComponent } from './pages/master/table-type/table-type.component';
import { OutletComponent } from './pages/master/outlet/outlet.component';
import { TaxComponent } from './pages/master/tax/tax.component';
import { PrintVeiwComponent } from './pages/print-design-veiw/print-veiw/print-veiw.component';
import { AdminRestaurantComponent } from './pages/admin-restaurant/admin-restaurant.component';
import { UserRegistrationComponent } from './pages/user-registration/user-registration.component';
import { AdminRoleComponent } from './pages/admin-role/admin-role.component';
import { MastersPromoCodeComponent } from './pages/masters-promo-code/masters-promo-code.component';
import { FormAccessComponent } from './pages/master/form-access/form-access.component';
import { DashboardComponent } from './pages/dashboard/dashboard.component';
import { WalkInComponent } from './pages/walk-in/walk-in.component';
import { WalkInOrderComponent } from './pages/walk-in/walk-in-order/walk-in-order.component';
import { WalkInCompleteOrderComponent } from './pages/walk-in/walk-in-complete-order/walk-in-complete-order.component';
import { WarehouseComponent } from './pages/warehouse/warehouse.component';
import { PrintDesignViewViewComponent } from './pages/print-design-veiw/print-design-view-view/print-design-view-view.component';
import { OnlineComponent } from './pages/online/online.component';
import { OnlineOrderComponent } from './pages/online/online-order/online-order.component';
import { OnlineCompleteOrderComponent } from './pages/online/online-complete-order/online-complete-order.component';
import { FormGroupComponent } from './pages/master/form-group/form-group.component';
import { OrderHistoryComponent } from './pages/order-history/order-history.component';
import { SettingsComponent } from './pages/settings/settings.component';
import { UserViewComponent } from './pages/user-view/user-view.component';
import { WalkInOrderHistoryComponent } from './pages/walk-in/walk-in-order-history/walk-in-order-history.component';
import { OnlineOrderHistoryComponent } from './pages/online/online-order-history/online-order-history.component';
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
import { VoidedOrderComponent } from './pages/dines-in/voided-order/voided-order.component';
import { OnlineVoidedOrderComponent } from './pages/online/online-voided-order/online-voided-order.component';
import { WalkInVoidedOrderComponent } from './pages/walk-in/walk-in-voided-order/walk-in-voided-order.component';
import { DeliverectComponent } from './pages/deliverect/deliverect.component';
import { ShiftTableComponent } from './pages/order/shift-table/shift-table.component';
import { MergeTableComponent } from './pages/order/merge-table/merge-table.component';
import { DetailedReportComponent } from './pages/dashboard/detailed-report/detailed-report.component';
import { RestaurantPermissionComponent } from './pages/admin-restaurant/restaurant-permission/restaurant-permission.component';
import { ReconcileStockComponent } from './pages/Inventory/reconcile-stock/reconcile-stock.component';
import { BatchItemComponent } from './pages/Inventory/batch-item/batch-item.component';
import { AddBatchItemComponent } from './pages/Inventory/batch-item/add-batch-item/add-batch-item.component';
import { LoyalityPointsComponent } from './pages/loyality-points/loyality-points.component';
import { POSAuthGuard } from '@module/auth-guard/posauth.guard';
import { GeneralSettingsComponent } from './pages/general-settings/general-settings.component';
import { PettyCashComponent } from './pages/pettycash/pettycash.component';
import { PaymentModeComponent } from './pages/paymentmode/paymentmode.component';
import { AddPaymentModeComponent } from './pages/paymentmode/add-paymentmode/add-paymentmode.component';
import { LoyalitySettingsComponent } from './pages/loyality-settings/loyality-settings.component';


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
    path: 'dine-in',
    component: DinesInComponent
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
    path: 'dine-in/running-order',
    component: RunningOrderComponent
  },
  {
    path: 'shifttiming',
    component: ShiftTimingComponent
  },
  {
    path: 'dine-in/completed-order',
    component: CompleteOrderComponent
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
    path: 'dine-in/order-history',
    component: OrderHistoryComponent
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
    path: 'kitchen',
    component: KitchenComponent,
    canActivate: [POSAuthGuard]
  },
  {
    path: 'kitchen/items',
    component: KitchenItemComponent
  },
  {
    path: 'walk-in/walk-in-voided-order',
    component: WalkInVoidedOrderComponent
  },
  {
    path: 'online/online-voided-order',
    component: OnlineVoidedOrderComponent
  },
  {
    path: 'dine-in/voided-order',
    component: VoidedOrderComponent
  },
  // {
  //   path: 'admin-category',
  //   component: AdminCategoryComponent
  // },
  {
    path: 'admin-table-details',
    component: AdminTableDetailsComponent,
    canActivate: [POSAuthGuard]
  },
  // {
  //   path: 'admin-category/add-admin-category',
  //   component: AddAdminCategoryComponent,
  //   canActivate: [POSAuthGuard]
  // },
  {
    path: 'masters-modifiers',
    component: ModifierGroupComponent
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
    path: 'promo-code',
    component: MastersPromoCodeComponent
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
    path: 'walk-in',
    component: WalkInComponent,
    canActivate: [POSAuthGuard]
  },
  {
    path: 'walk-in/order',
    component: WalkInOrderComponent
  },
  {
    path: 'walk-in/completed-order',
    component: WalkInCompleteOrderComponent
  },
  {
    path: 'walk-in/order-history',
    component: WalkInOrderHistoryComponent
  },
  {
    path: 'online/online-order-history',
    component: OnlineOrderHistoryComponent
  },
  {
    path: 'online',
    component: OnlineComponent,
    canActivate: [POSAuthGuard]
  },
  {
    path: 'online/order',
    component: OnlineOrderComponent
  },
  {
    path: 'online/completed-order',
    component: OnlineCompleteOrderComponent
  },
  {
    path: 'warehouse',
    component: WarehouseComponent,
    canActivate: [POSAuthGuard]
  },
  {
    path: 'deliverect',
    component: DeliverectComponent,
    canActivate: [POSAuthGuard]
  },
  {
    path: 'order/shift-table',
    component: ShiftTableComponent
  },
  {
    path: 'order/merge-table',
    component: MergeTableComponent
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
    path: 'Inventory/batch-item',
    component: BatchItemComponent
  },
  {
    path: 'batch-item/add-batch-item',
    component: AddBatchItemComponent
  },
  {
    path: 'loyality-points',
    component: LoyalityPointsComponent,
    canActivate: [POSAuthGuard]
  },
  {
    path: 'general-settings',
    component: GeneralSettingsComponent
  },
  {
    path: 'loyality-settings',
    component: LoyalitySettingsComponent
  },
  {
    path: 'pettycash',
    component: PettyCashComponent
  },
  {
    path: 'paymentmode',
    component: PaymentModeComponent
  },
  {
    path: 'add-paymentmode',
    component: AddPaymentModeComponent
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})

export class PosAdminRoutingModule { }
