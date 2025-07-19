import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { AlertService } from '@core/services/common/alert.service';
import { PosSharedService } from '@core/services/common/pos-shared.service';
import { PosDataService } from '@core/services/pos-system/pos-data.service';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';

@Component({
  selector: 'app-edit-order',
  templateUrl: './edit-order.component.html',
  styleUrls: ['./edit-order.component.css']
})
export class EditOrderComponent implements OnInit {
  editOrderForm: any = FormGroup;
  id: any;
  orderData: any;
  items: any;
  outletId: any;
  AllSupplier: any;
  rangeId: any;
  rangeData: any;
  productId: any;
  constructor(
    private activeModal: NgbActiveModal,
    private posSharedService: PosSharedService,
    private formBuilder: FormBuilder,
    private alertService: AlertService,
    private posDataService: PosDataService,
  ) { }

  ngOnInit(): void {
    this.outletId = sessionStorage.getItem('activeOutletId');
    this.rangeId = sessionStorage.getItem("rangeId");
    this.productId = sessionStorage.getItem("productId");
    this.id = sessionStorage.getItem("SOrderId");
    this.getOrderDataById();
    this.editOrderForm = this.formBuilder.group({
      productName: ['', Validators.required],
      supplierName: ['', Validators.required],
      quantity: ['', Validators.required],
    });
  }


  getOrderDataById() {
    debugger;
    this.posDataService.getSupplierOrderById(this.id).subscribe((res: any) => {
      this.orderData = res['data'];
      let success = res['success'];
      let msg = res['message'];
      if (success) {
        if (this.rangeId != null && this.rangeId != 'null' && this.rangeId != undefined && this.rangeId != "undefined")
          this.rangeData = this.orderData.items.find(x => x.rangeId == this.rangeId);
        else
          this.rangeData = this.orderData.items.find(x => x.productID == this.productId);
        this.patchValuesToForm();
      }
      else {
        this.alertService.showError(msg);
      }
    });
  }
  closeModal() {
    this.activeModal.close();
  }
  patchValuesToForm() {

    this.editOrderForm.patchValue({
      productName: this.rangeData.productName,
      supplierName: this.orderData.supplierName,
      price: this.rangeData.price,
      unit: this.rangeData.unit,
      quantity: this.rangeData.quantity,
    });
  }
  addCategoryFormData() {

    if (this.editOrderForm.invalid) {
      this.alertService.showError("Field should not be empty");
    } else {
      let indx;
      if (this.rangeId != null && this.rangeId != 'null' && this.rangeId != undefined && this.rangeId != "undefined")
        indx = this.orderData.items.map(function (x) { return x.rangeId; }).indexOf(this.rangeId);
      else
        indx = this.orderData.items.map(function (x) { return x.productID; }).indexOf(this.productId);
      this.orderData.items[indx].quantity = this.editOrderForm.get('quantity').value;
      this.orderData.lastModifiedBy = JSON.parse(sessionStorage.getItem("userCredential")).userId
      this.posDataService.UpdateSupplierOrder(this.orderData._id, this.orderData).subscribe((res: any) => {
        this.orderData = res['data'];
        let success = res['success'];
        let msg = res['message'];
       this.closeModal();
        if (success) {
          this.alertService.showSuccess(msg);
        }
        else {
          this.alertService.showError(msg);
        }
      });
    }
  }
}
