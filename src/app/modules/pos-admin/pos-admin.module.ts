import { NgModule } from '@angular/core';
import { CommonModule, DatePipe } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { OrderComponent } from './pages/order/order.component';
import { PosAdminRoutingModule } from './pos-admin-routing.module';
import { SingleItemComponent } from './pages/single-item/single-item.component';
import { MenuComponent } from './pages/menu/menu.component';
import { CategoryComponent } from './pages/category/category.component';


import { ModifierPopUpComponent } from './pages/order/modifier-pop-up/modifier-pop-up.component';
import { CompleteOrderComponent } from './pages/complete-order/complete-order.component';
import { OrderHistoryComponent } from './pages/order-history/order-history.component';
import { ItemDiscountComponent } from './pages/order/item-discount/item-discount.component';
import { MakePaymentComponent } from './pages/make-payment/make-payment.component';
import { AdminTableDetailsComponent } from './pages/admin-table-details/admin-table-details.component';
//import { AdminCategoryComponent } from './pages/admin-category/admin-category.component';
//import { AddAdminCategoryComponent } from './pages/admin-category/add-admin-category/add-admin-category.component';
import { AddAdminTabledetailsComponent } from './pages/admin-table-details/add-admin-tabledetails/add-admin-tabledetails.component';
import { PrintTableQrComponent } from './pages/admin-table-details/print-table-qr/print-table-qr.component';
import { MastersPromoCodeComponent } from './pages/masters-promo-code/masters-promo-code.component';
import { AddMasterPromoCodeComponent } from './pages/masters-promo-code/add-master-promo-code/add-master-promo-code.component';
//import { AddModifierComponent } from './pages/item-master/add-modifier/add-modifier.component';
import { AddDiscountComponent } from './pages/item-master/add-discount/add-discount.component';
import { ViewModComponent } from './pages/item-master/add-modifier/view-mod/view-mod.component';
import { DineInCustomerComponent } from './pages/order/add-customer-to-dinein/dinein-customer.component';

import { MatExpansionModule } from '@angular/material/expansion';
import { MatTabsModule } from '@angular/material/tabs';
import { MatInputModule } from '@angular/material/input';
import { MatAutocompleteModule } from '@angular/material/autocomplete';

import { ItemViewComponent } from './pages/item-master/item-view/item-view.component';

import { DiscountComponent } from './pages/master/discount/discount.component';
import { DiscountFormComponent } from './pages/master/discount/discount-form/discount-form.component';
import { TableTypeComponent } from './pages/master/table-type/table-type.component';
import { TableTypeFormComponent } from './pages/master/table-type/table-type-form/table-type-form.component';
import { OutletComponent } from './pages/master/outlet/outlet.component';
import { OutletFormComponent } from './pages/master/outlet/outlet-form/outlet-form.component';
import { DiscountViewComponent } from './pages/master/discount/discount-view/discount-view.component';

import { TableTypeViewComponent } from './pages/master/table-type/table-type-view/table-type-view.component';
import { OutletViewComponent } from './pages/master/outlet/outlet-view/outlet-view.component';
import { TaxComponent } from './pages/master/tax/tax.component';
import { TaxFormComponent } from './pages/master/tax/tax-form/tax-form.component';
import { TaxViewComponent } from './pages/master/tax/tax-view/tax-view.component';
import { PrintDesignVeiwComponent } from './pages/print-design-veiw/print-design-veiw.component';
import { AngularEditorModule } from '@kolkov/angular-editor';
import { PrintVeiwComponent } from './pages/print-design-veiw/print-veiw/print-veiw.component';
import { MainPipe } from '../../core/services/pos-system/pipes/main-pipe.module';
import { NgxPrintModule } from 'ngx-print';
import { AdminRestaurantComponent } from './pages/admin-restaurant/admin-restaurant.component';
import { RestaurantFormComponent } from './pages/admin-restaurant/restaurant-form/restaurant-form.component';
import { RestaurantOutletFormComponent } from './pages/admin-restaurant/restaurant-outlet-form/restaurant-outlet-form.component';
import { RestaurantViewComponent } from './pages/admin-restaurant/restaurant-view/restaurant-view.component';
import { TaxSetupFormComponent } from './pages/master/tax/tax-setup-form/tax-setup-form.component';
import { UserRegistrationComponent } from './pages/user-registration/user-registration.component';
import { UserRegFormComponent } from './pages/user-registration/user-reg-form/user-reg-form.component';
import { UserRegViewComponent } from './pages/user-registration/user-reg-view/user-reg-view.component';
import { AdminRoleComponent } from './pages/admin-role/admin-role.component';
import { AddAdminRoleComponent } from './pages/admin-role/add-admin-role/add-admin-role.component';
import { ViewAdminRoleComponent } from './pages/admin-role/view-admin-role/view-admin-role.component';
import { CompleteOrderViewComponent } from './pages/complete-order/complete-order-view/complete-order-view.component';
import { OutletSelectionComponent } from './pages/dines-in/outlet-selection/outlet-selection.component';
import { UserRegRestaurantComponent } from './pages/user-registration/user-reg-restaurant/user-reg-restaurant.component';
import { ViewAdminTableDetailsComponent } from './pages/admin-table-details/view-admin-table-details/view-admin-table-details.component';
import { ViewMastersPromoCodeComponent } from './pages/masters-promo-code/view-masters-promo-code/view-masters-promo-code.component';

import { OutletEditComponent } from './pages/master/outlet/outlet-edit/outlet-edit.component';
import { FormAccessComponent } from './pages/master/form-access/form-access.component';
import { FormAccessFormComponent } from './pages/master/form-access/form-access-form/form-access-form.component';
import { FormAccessEditComponent } from './pages/master/form-access/form-access-edit/form-access-edit.component';
import { FormAccessViewComponent } from './pages/master/form-access/form-access-view/form-access-view.component';
import { NgbModule } from '@ng-bootstrap/ng-bootstrap';
import { RestaurantSelectionComponent } from './pages/dines-in/restaurant-selection/restaurant-selection.component';
import { DashboardComponent } from './pages/dashboard/dashboard.component';
import { PrintDesignTableComponent } from './pages/print-design-veiw/print-design-table/print-design-table.component';
import { PrintDesignVeiwEditComponent } from './pages/print-design-veiw/print-design-veiw-edit/print-design-veiw-edit.component';

import { PrintDesignViewViewComponent } from './pages/print-design-veiw/print-design-view-view/print-design-view-view.component';
import { PreparedItemComponent } from './pages/prepared-item/prepared-item.component';
import { RestaurantOutletEditFormComponent } from './pages/admin-restaurant/restaurant-outlet-edit-form/restaurant-outlet-edit-form.component';
import { TaxViewSetupComponent } from './pages/master/tax/tax-view-setup/tax-view-setup.component';
import { TaxViewSetupEditComponent } from './pages/master/tax/tax-view-setup/tax-view-setup-edit/tax-view-setup-edit.component';
import { TaxViewSetupViewComponent } from './pages/master/tax/tax-view-setup/tax-view-setup-view/tax-view-setup-view.component';
import { TaxSetupComponent } from './pages/master/tax-setup/tax-setup.component';
import { SalesReceiptComponent } from './pages/dashboard/sales-receipt/sales-receipt.component';
import { DataTablesModule } from 'angular-datatables';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
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
import { OrderViewComponent } from './pages/Inventory/supplier-orders/order-view/order-view.component';
import { EditOrderComponent } from './pages/Inventory/supplier-orders/order-view/editorder/edit-order.component';
import { GRNComponent } from './pages/Inventory/grn/grn.component';
import { ShiftTimingComponent } from './pages/shifttiming/shifttiming.component';
import { VoidedOrderComponent } from './pages/dines-in/voided-order/voided-order.component';
import { AngularDraggableModule } from 'angular2-draggable';
import { DeliverectComponent } from './pages/deliverect/deliverect.component';
import { ShiftTableComponent } from './pages/order/shift-table/shift-table.component';

import { DetailedReportComponent } from './pages/dashboard/detailed-report/detailed-report.component';
import { RestaurantPermissionComponent } from './pages/admin-restaurant/restaurant-permission/restaurant-permission.component';
import { ReconcileStockComponent } from './pages/Inventory/reconcile-stock/reconcile-stock.component';

import { LoyalityPointsComponent } from './pages/loyality-points/loyality-points.component';
import { GeneralSettingsComponent } from './pages/general-settings/general-settings.component';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatNativeDateModule } from "@angular/material/core";
import { PettyCashComponent } from './pages/pettycash/pettycash.component';
import { PaymentModeComponent } from './pages/paymentmode/paymentmode.component';
import { AddPaymentModeComponent } from './pages/paymentmode/add-paymentmode/add-paymentmode.component';
import { LoyalitySettingsComponent } from './pages/loyality-settings/loyality-settings.component';

@NgModule({
  declarations: [
    OrderComponent,
    SingleItemComponent,
    MenuComponent,
    CategoryComponent,
   

    ModifierPopUpComponent,
    CompleteOrderComponent,
    OrderHistoryComponent,
    ItemDiscountComponent,
    MakePaymentComponent,
    AdminTableDetailsComponent,

    AddAdminTabledetailsComponent,
    PrintTableQrComponent,
    MastersPromoCodeComponent,
    AddMasterPromoCodeComponent,

    AddDiscountComponent,
    ViewModComponent,
    ItemViewComponent,

    DiscountComponent,
    DiscountFormComponent,
    TableTypeComponent,
    TableTypeFormComponent,
    OutletComponent,
    OutletFormComponent,
    DiscountViewComponent,

    TableTypeViewComponent,
    OutletViewComponent,
    TaxComponent,
    TaxFormComponent,
    TaxViewComponent,
    PrintDesignVeiwComponent,
    PrintVeiwComponent,
    AdminRestaurantComponent,
    RestaurantFormComponent,
    RestaurantOutletFormComponent,
    RestaurantViewComponent,
    TaxSetupFormComponent,
    UserRegistrationComponent,
    UserRegFormComponent,
    UserRegViewComponent,
    AdminRoleComponent,
    AddAdminRoleComponent,
    ViewAdminRoleComponent,
    CompleteOrderViewComponent,
    OutletSelectionComponent,
    UserRegRestaurantComponent,
    ViewAdminTableDetailsComponent,
    ViewMastersPromoCodeComponent,

    OutletEditComponent,
    FormAccessComponent,
    FormAccessFormComponent,
    FormAccessEditComponent,
    FormAccessViewComponent,
    RestaurantSelectionComponent,
    DashboardComponent,
    PrintDesignTableComponent,
    PrintDesignVeiwEditComponent,
   
    

    PrintDesignViewViewComponent,
    PreparedItemComponent,
    RestaurantOutletEditFormComponent,
    TaxViewSetupComponent,
    TaxViewSetupEditComponent,
    TaxViewSetupViewComponent,
    TaxSetupComponent,
    SalesReceiptComponent,
    SettingsComponent,
    UserViewComponent,
    SalesByCategoryComponent,
    SalesByItemComponent,
    SalesByComponent,
    InventoryComponent,
    SupplierComponent,
    ProductComponent,
    SupplierOrderComponent,
    AddSupplierOrderComponent,
    AddSupplierComponent,
    AddInventoryComponent,
    AddProductComponent,
    OrderViewComponent,
    EditOrderComponent,
    GRNComponent,
    ShiftTimingComponent,
    VoidedOrderComponent,
    DeliverectComponent,
    ShiftTableComponent,
    DetailedReportComponent,
    RestaurantPermissionComponent,
    ReconcileStockComponent,
    LoyalityPointsComponent,
    DineInCustomerComponent,
    GeneralSettingsComponent,
    PettyCashComponent,
    PaymentModeComponent,
    AddPaymentModeComponent,
    LoyalitySettingsComponent
   
  ],

  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    PosAdminRoutingModule,
    MatExpansionModule,
    MatTabsModule,
    MatInputModule,
    MatAutocompleteModule,
    AngularEditorModule,
    MainPipe,
    NgxPrintModule,
    NgbModule,
    DataTablesModule,
    MatSlideToggleModule,
    AngularDraggableModule,
    MatDatepickerModule,
    MatNativeDateModule,
    MatFormFieldModule,
    MatInputModule,
  ],
  exports: [MatSlideToggleModule],
  providers: [DatePipe]
})
export class PosAdminModule { }
