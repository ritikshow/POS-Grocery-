import { NgModule } from '@angular/core';
import { CommonModule, DatePipe } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { OrderComponent } from './pages/order/order.component';
import { PosAdminRoutingModule } from './pos-admin-routing.module';
import { MenuComponent } from './pages/menu/menu.component';
import { CategoryComponent } from './pages/category/category.component';
import { MakePaymentComponent } from './pages/make-payment/make-payment.component';
import { MatExpansionModule } from '@angular/material/expansion';
import { MatTabsModule } from '@angular/material/tabs';
import { MatInputModule } from '@angular/material/input';
import { MatAutocompleteModule } from '@angular/material/autocomplete';
import { ItemViewComponent } from './pages/item-master/item-view/item-view.component';
import { DiscountComponent } from './pages/master/discount/discount.component';
import { DiscountFormComponent } from './pages/master/discount/discount-form/discount-form.component';
import { DiscountViewComponent } from './pages/master/discount/discount-view/discount-view.component';
import { TaxComponent } from './pages/master/tax/tax.component';
import { TaxFormComponent } from './pages/master/tax/tax-form/tax-form.component';
import { TaxViewComponent } from './pages/master/tax/tax-view/tax-view.component';
import { PrintDesignVeiwComponent } from './pages/print-design-veiw/print-design-veiw.component';
import { AngularEditorModule } from '@kolkov/angular-editor';
import { PrintVeiwComponent } from './pages/print-design-veiw/print-veiw/print-veiw.component';
import { MainPipe } from '../../core/services/pos-system/pipes/main-pipe.module';
import { NgxPrintModule } from 'ngx-print';
import { TaxSetupFormComponent } from './pages/master/tax/tax-setup-form/tax-setup-form.component';
import { UserRegistrationComponent } from './pages/user-registration/user-registration.component';
import { UserRegFormComponent } from './pages/user-registration/user-reg-form/user-reg-form.component';
import { UserRegViewComponent } from './pages/user-registration/user-reg-view/user-reg-view.component';
import { AdminRoleComponent } from './pages/admin-role/admin-role.component';
import { AddAdminRoleComponent } from './pages/admin-role/add-admin-role/add-admin-role.component';
import { OutletSelectionComponent } from './pages/dines-in/outlet-selection/outlet-selection.component';
import { UserRegRestaurantComponent } from './pages/user-registration/user-reg-restaurant/user-reg-restaurant.component';
import { FormAccessFormComponent } from './pages/master/form-access/form-access-form/form-access-form.component';
import { FormAccessEditComponent } from './pages/master/form-access/form-access-edit/form-access-edit.component';
import { NgbModule } from '@ng-bootstrap/ng-bootstrap';
import { RestaurantSelectionComponent } from './pages/dines-in/restaurant-selection/restaurant-selection.component';
import { DashboardComponent } from './pages/dashboard/dashboard.component';
import { PrintDesignTableComponent } from './pages/print-design-veiw/print-design-table/print-design-table.component';
import { PrintDesignVeiwEditComponent } from './pages/print-design-veiw/print-design-veiw-edit/print-design-veiw-edit.component';
import { PrintDesignViewViewComponent } from './pages/print-design-veiw/print-design-view-view/print-design-view-view.component';
import { TaxViewSetupComponent } from './pages/master/tax/tax-view-setup/tax-view-setup.component';
import { TaxViewSetupEditComponent } from './pages/master/tax/tax-view-setup/tax-view-setup-edit/tax-view-setup-edit.component';
import { TaxViewSetupViewComponent } from './pages/master/tax/tax-view-setup/tax-view-setup-view/tax-view-setup-view.component';
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
import { AngularDraggableModule } from 'angular2-draggable';
import { DetailedReportComponent } from './pages/dashboard/detailed-report/detailed-report.component';
import { ReconcileStockComponent } from './pages/Inventory/reconcile-stock/reconcile-stock.component';
import { GeneralSettingsComponent } from './pages/general-settings/general-settings.component';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatNativeDateModule } from "@angular/material/core";
import { PettyCashComponent } from './pages/pettycash/pettycash.component';

@NgModule({
  declarations: [
    OrderComponent,
    MenuComponent,
    CategoryComponent,
   

    MakePaymentComponent,
    ItemViewComponent,
    DiscountComponent,
    DiscountFormComponent,
    DiscountViewComponent,
    TaxComponent,
    TaxFormComponent,
    TaxViewComponent,
    PrintDesignVeiwComponent,
    PrintVeiwComponent,
    TaxSetupFormComponent,
    UserRegistrationComponent,
    UserRegFormComponent,
    UserRegViewComponent,
    AdminRoleComponent,
    AddAdminRoleComponent,
    OutletSelectionComponent,
    UserRegRestaurantComponent,
    FormAccessFormComponent,
    FormAccessEditComponent,
    RestaurantSelectionComponent,
    DashboardComponent,
    PrintDesignTableComponent,
    PrintDesignVeiwEditComponent,
    PrintDesignViewViewComponent,
    TaxViewSetupComponent,
    TaxViewSetupEditComponent,
    TaxViewSetupViewComponent,
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
    DetailedReportComponent,
    ReconcileStockComponent,
    GeneralSettingsComponent,
    PettyCashComponent,
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
