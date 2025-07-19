import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { AlertService } from '@core/services/common/alert.service';
import { PosDataService } from '@core/services/pos-system/pos-data.service';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';
import { NgxUiLoaderService } from 'ngx-ui-loader';

@Component({
  selector: 'app-add-supplier-order',
  templateUrl: './add-supplier-order.component.html',
  styleUrls: ['./add-supplier-order.component.css']
})
export class AddSupplierOrderComponent implements OnInit {
  orderForm: any = FormGroup;
  editMod = false;
  id: any;
  supplierOrderData: any;
  outletId: any;
  productForDropDown: any;
  quantity: any;
  isNew: any;
  AllSupplier: any;
  AllProduct: any;
  supplierNotInWm: any;
  showDropDown = false;
  supplierName: any;
  SelectedSupplier: any;
  constructor(
    private ngxLoader: NgxUiLoaderService,
    private activeModal: NgbActiveModal,
    private formBuilder: FormBuilder,
    private alertService: AlertService,
    private posDataService: PosDataService,
  ) { }

  ngOnInit(): void {

    this.isNew = sessionStorage.getItem('isNewOrder');
    if (this.isNew == 'false') {
      this.id = sessionStorage.getItem('editId');
      this.getOrderDataById();
      this.editMod = true;
    }
    this.outletId = sessionStorage.getItem('activeOutletId');
    this.orderForm = this.formBuilder.group({
      productId: ['', Validators.required],
      supplierId: ['', Validators.required],
      quantity: ['', Validators.required],
      price: [''],
      unit: [''],
    });
    this.GetAllProduct();
    this.GetAllSupplier();
  }
  GetAllProduct() {

    this.ngxLoader.startLoader('loader-01');
    this.posDataService.GetAllProduct(this.outletId).subscribe((res: any) => {
      this.ngxLoader.stopLoader('loader-01');
      this.AllProduct = res['data'];
    });
  }

  GetAllSupplier() {

    this.ngxLoader.startLoader('loader-01');
    this.posDataService.GetAllSupplier(this.outletId).subscribe((res: any) => {
      this.ngxLoader.stopLoader('loader-01');
      this.AllSupplier = res['data'];
      let success = res['success'];
      let msg = res['message'];
      if (success) {
        this.supplierNotInWm = this.AllSupplier.filter(x => !x.isInWatermelon);
      }
      else {
        this.alertService.showError(msg);
      }
    });
  }

  selectItem(event) {
    this.productForDropDown = this.AllProduct.find(x => x.productId == event.target.value);
    if (this.productForDropDown.wMData != null && this.productForDropDown.wMData != undefined) {
      let supId = this.AllProduct.find(x => x.productId == event.target.value).wMData.wmSupplierId;
      this.SelectedSupplier = this.AllSupplier.find(x => x.wMsupplierId == supId);
      this.orderForm.patchValue({
        supplierId: this.SelectedSupplier.supplierId,
        price: this.productForDropDown.pricingRange.list_price,
        unit: this.productForDropDown.unit
      });
      this.supplierName =( this.productForDropDown.wMData.wMSupplierName ||this.productForDropDown.supplierName)
      this.showDropDown = false;
    } else {
      this.orderForm.patchValue({
        supplierId: this.productForDropDown.supplierName,
        unit: this.productForDropDown.unit,
        price: 0,
      });
      this.showDropDown = true;
    }
  }

  getOrderDataById() {
    this.ngxLoader.startLoader('loader-01');
    this.posDataService.getSupplierOrderById(this.id).subscribe((res: any) => {
      this.ngxLoader.stopLoader('loader-01');
      this.supplierOrderData = res['data'];
      let success = res['success'];
      let msg = res['message'];
      if (success) {
        this.patchValuesToForm();
      }
      else {
        this.alertService.showError(msg);
      }
    });
  }
  getWMSupplierByKeyword(word: any) {
    this.ngxLoader.startLoader('loader-01');
    this.posDataService.getSupplierOrderById(word).subscribe((res: any) => {
      this.ngxLoader.stopLoader('loader-01');
      this.supplierOrderData = res['data'];
      let success = res['success'];
      let msg = res['message'];
      if (success) {
        this.patchValuesToForm();
      }
      else {
        this.alertService.showError(msg);
      }
    });
  }
  patchValuesToForm() {

    this.orderForm.patchValue({
      productId: this.supplierOrderData.productID,
      supplierId: this.supplierOrderData.supplierID,
      price: this.supplierOrderData.price,
      quantity: this.supplierOrderData.quantity,
      unit: this.supplierOrderData.unit,
    });
  }

  closeModal(val) {
    this.activeModal.close(val);
  }

  addSupplierOrder() {
    let obj;
    if (this.orderForm.invalid) {
      this.alertService.showWarning("Fields are empty");
    } else if (sessionStorage.getItem('isNewOrder') !== 'true') {
      obj = {
        Items: this.productForDropDown.items,
        supplierId: this.productForDropDown.supplierId,
        productId: this.orderForm.get('productId').value,
        price: this.orderForm.get('price').value,
        unit: this.orderForm.get('unit').value,
        quantity: this.orderForm.get('quantity').value,
        OutletId: this.outletId,
      }
      this.ngxLoader.startLoader('loader-01');
      this.posDataService.UpdateSupplierOrder(this.id, obj).subscribe((res: any) => {
        this.ngxLoader.stopLoader('loader-01');
        let status = res['success'];
        let msg = res['message'];
        if (status) {
          sessionStorage.removeItem('editId');
          this.alertService.showSuccess(msg);
          this.closeModal(true);
        } else {
          this.alertService.showError(msg);
        }
      });
    } else {
      obj = {
        supplierId: this.productForDropDown.supplierId,
        productId: this.orderForm.get('productId').value,
        price: this.orderForm.get('price').value,
        unit: this.orderForm.get('unit').value,
        quantity: this.orderForm.get('quantity').value,
        OutletId: this.outletId,
      }
      this.ngxLoader.startLoader('loader-01');
      this.posDataService.InsertSupplierOrder(obj).subscribe((res: any) => {
        this.ngxLoader.stopLoader('loader-01');
        let status = res['success'];
        let msg = res['message'];
        if (status) {
          sessionStorage.removeItem('isNewOrder');
          this.closeModal(true);
          this.alertService.showSuccess('Order Added Succesfully');
        } else {
          this.alertService.showError(msg);
        }
      });
    }
  }
}
