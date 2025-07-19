import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { AlertService } from '@core/services/common/alert.service';
import { PosDataService } from '@core/services/pos-system/pos-data.service';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';
import { NgxUiLoaderService } from 'ngx-ui-loader';

@Component({
  selector: 'app-add-inventory',
  templateUrl: './add-inventory.component.html',
  styleUrls: ['./add-inventory.component.css']
})
export class AddInventoryComponent implements OnInit {
  addInventoryForm: any = FormGroup;
  AllProduct: any;
  editMod = false;
  id: any;
  unit: any;
  price: any;
  PSMasterData: any;
  outletId: any;
  AmountVisible = false;
  AllSupplier: any;
  quantity: any;
  isNew: any;
  showDropDown = false;
  supplierName: any;
  editAmount = false;
  supplierNotInWm: any;
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
      sessionStorage.removeItem('editId');
      sessionStorage.removeItem('isNewOrder');
      this.getMasterDataById();
      this.editMod = true;
    }
    this.outletId = sessionStorage.getItem('activeOutletId');
    this.addInventoryForm = this.formBuilder.group({
      productId: ['', Validators.required],
      supplierId: [''],
      quantity: ['', Validators.required],
      criticalQuantity: ['', Validators.required],
      orderQuantity: ['', Validators.required],
      actualQuantity: ['', Validators.required],
      price: ['0'],
      unit:['']
    });
    this.GetAllProduct();
    this.GetAllSupplier();
  }
  GetAllProduct() {

    this.ngxLoader.startLoader('loader-01');
    this.posDataService.GetAllProduct(this.outletId).subscribe((res: any) => {
      this.ngxLoader.stopLoader('loader-01');
      this.AllProduct = res['data'];
      let success = res['success'];
      let msg = res['message'];
      if (!success) {
        this.alertService.showError(msg);
      }
    });
  }
  addPrice(event) {
    this.price = event.target.value;
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
    debugger
    let productId = event.target.value;
    this.unit = this.AllProduct.find(x => x.productId == productId).unit;
    this.price = this.AllProduct.find(x => x.productId == productId).pricingRange.list_price;
    if (this.AllProduct.find(x => x.productId == productId).wMData.wmSupplierId != null) {
      let supId = (this.AllProduct.find(x => x.productId == productId).wMData.wmSupplierId );
      this.SelectedSupplier = this.AllSupplier.find(x => x.wMsupplierId == supId);
      this.supplierName = (this.AllProduct.find(x => x.productId == productId).wMData.wMSupplierName );
      this.AmountVisible = true;
      this.showDropDown = false;
      this.editAmount = false;
    } else {
      this.showDropDown = true;
      this.editAmount = true;
      this.SelectedSupplier = undefined;
    }
  }
  getMasterDataById() {
    this.ngxLoader.startLoader('loader-01');
    this.posDataService.GetProductSupplierMasterById(this.id).subscribe((res: any) => {
      this.ngxLoader.stopLoader('loader-01');
      this.PSMasterData = res['data'];
      let success = res['success'];
      let msg = res['message'];
      if (success) {
        this.supplierName = this.PSMasterData.supplierName;
        this.patchValuesToForm();
        this.AmountVisible = true;
      }
      else {
        this.alertService.showError(msg);
      }
    });
  }

  patchValuesToForm() {

    this.addInventoryForm.patchValue({
      productId: this.PSMasterData.productId,
      supplierId: this.PSMasterData.supplierId,
      price: this.PSMasterData.price,
      unit: this.PSMasterData.unit,
      quantity: this.PSMasterData.quantity,
      criticalQuantity: this.PSMasterData.criticalQuantity,
      orderQuantity: this.PSMasterData.orderQuantity,
      actualQuantity: this.PSMasterData.actualQuantity,
    });
  }

  closeModal() {
    this.activeModal.close(0);
  }

  addStock() {

    let supplierId;
    if (this.SelectedSupplier != undefined) {
      supplierId = this.SelectedSupplier.supplierId;
    } else {
      supplierId = this.addInventoryForm.get('supplierId').value;
    }
    let obj;
    if (this.addInventoryForm.invalid) {
      this.alertService.showWarning("Fields are empty");
    } else if (sessionStorage.getItem('isNewOrder') !== 'true') {
      obj = {
        supplierId: supplierId,
        productId: this.addInventoryForm.get('productId').value,
        price:  this.addInventoryForm.get('price').value,
        unit: this.unit,
        quantity: this.addInventoryForm.get('quantity').value,
        criticalQuantity: this.addInventoryForm.get('criticalQuantity').value,
        orderQuantity: this.addInventoryForm.get('orderQuantity').value,
        OutletId: this.outletId,
        actualQuantity: this.addInventoryForm.get('actualQuantity').value,
        createdOn: this.PSMasterData.createdOn,
        lastReconcileBy: this.PSMasterData.lastReconcileBy
      }
      this.ngxLoader.startLoader('loader-01');
      this.posDataService.UpdateProductSupplierMaster(this.id, obj).subscribe((res: any) => {
        this.ngxLoader.stopLoader('loader-01');
        let status = res['success'];
        let msg = res['message'];
        if (status) {
          sessionStorage.removeItem('editId');
          this.activeModal.close(status);
          this.alertService.showSuccess(msg);
        } else {
          this.alertService.showError(msg);
        }
      });
    } else {
      obj = {
        supplierId: supplierId,
        productId: this.addInventoryForm.get('productId').value,
        price: this.price,
        unit: this.unit,
        quantity: this.addInventoryForm.get('quantity').value,
        criticalQuantity: this.addInventoryForm.get('criticalQuantity').value,
        orderQuantity: this.addInventoryForm.get('orderQuantity').value,
        OutletId: this.outletId,
        actualQuantity: this.addInventoryForm.get('actualQuantity').value,
        lastReconcileBy: ''
      }
      this.ngxLoader.startLoader('loader-01');
      this.posDataService.InsertProductSupplierMaster(obj).subscribe((res: any) => {
        this.ngxLoader.stopLoader('loader-01');
        let status = res['success'];
        let msg = res['message'];
        if (status) {
          sessionStorage.removeItem('isNewOrder');
          this.activeModal.close(status);
          this.alertService.showSuccess('Order Added Succesfully');
        } else {
          this.alertService.showError(msg);
        }
      });
    }
  }
}
