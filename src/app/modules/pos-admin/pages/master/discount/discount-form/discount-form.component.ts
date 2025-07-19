import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { AddItemService } from '@core/services/common/add-item.service';
import { AlertService } from '@core/services/common/alert.service';
import { PosDataService } from '@core/services/pos-system/pos-data.service';
import { PosEditService } from '@core/services/pos-system/pos-edit.service';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';
import { NgxUiLoaderService } from 'ngx-ui-loader';

@Component({
  selector: 'app-discount-form',
  templateUrl: './discount-form.component.html',
  styleUrls: ['./discount-form.component.css']
})
export class DiscountFormComponent implements OnInit {
  discountForm: any = FormGroup;
  discData: any;
  id: any;
  outletId: any;
  isUpdate = false;
  constructor(
    private ngxLoader: NgxUiLoaderService,
    private activeModal: NgbActiveModal,
    private formBuilder: FormBuilder,
    private addItems: AddItemService,
    private alertService: AlertService,
    private posDataService: PosDataService,
    private posEditService: PosEditService
  ) { }

  ngOnInit(): void {
    this.discountForm = this.formBuilder.group({
      discountName: ['', Validators.required],
      discountType: ['', Validators.required],
      discountValue: ['', Validators.required],
      discoutNotes: ['', Validators.required],
      discountDineIn: [false],
      discountTakeAway: [false],
      discountEOrder: [false],
      discountOnTotal: [false],
      //discountStatus: [false]
    });
    this.outletId = sessionStorage.getItem('activeOutletId');
    let isNew = sessionStorage.getItem('isNewDiscount');
    if (isNew == 'false') {
      this.id = sessionStorage.getItem('editDiscount');
      this.isUpdate = true;
      sessionStorage.removeItem('isNewDiscount');
      sessionStorage.removeItem('editDiscount');
      this.getDiscountDataById();
    }
  }

  getDiscountDataById() {
    this.ngxLoader.startLoader('loader-01');
    this.posDataService.getDiscountByID(this.id).subscribe((res: any) => {
      this.ngxLoader.stopLoader('loader-01');
      this.discData = res['data'];
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
    this.discountForm.patchValue({
      discountName: this.discData.discountName,
      discountType: this.discData.discountType,
      discountValue: this.discData.discountValue,
      discoutNotes: this.discData.discoutNotes,
      discountDineIn: this.discData.discountOnDineIn,
      discountTakeAway: this.discData.discountOnTakeAway,
      discountEOrder: this.discData.discountOnOnline,
      discountOnTotal: this.discData.discountOnTotal,
      discountStatus: this.discData.discountStatus,
    });
  }


  closeModal() {
    this.activeModal.close();
  }

  addDiscount() {
    if (this.discountForm.invalid) {
      this.alertService.showError("Field should not be empty");
    }
    else {
      let data = {
        outletId: this.outletId,
        discountName: this.discountForm.get('discountName').value,
        discountType: this.discountForm.get('discountType').value,
        discountValue: this.discountForm.get('discountValue').value,
        discoutNotes: this.discountForm.get('discoutNotes').value ?? '',
        DiscountOnDineIn: this.discountForm.get('discountDineIn').value,
        DiscountOnTakeAway: this.discountForm.get('discountTakeAway').value,
        //discountEOrder: this.discountForm.get('discountEOrder').value,
        DiscountOnTotal: this.discountForm.get('discountOnTotal').value,
        DiscountOnOnline: this.discountForm.get('discountEOrder').value,
        //discountStatus: true
        activeStatus:true
      }
      console.log(data);
      this.ngxLoader.startLoader('loader-01');
      this.posDataService.postDiscountData(data).subscribe((result) => {
        this.ngxLoader.stopLoader('loader-01');
        console.log(result);
        let success = result['success'];
        let msg = result['message'];
        if (success) {
          this.alertService.showSuccess("Discount added successfully");
          this.activeModal.close(true);
        } else {
          this.alertService.showError(msg);
        }
      });
    }
  }

  updateDiscount(data: any) {
    console.log(data)
    if (this.discountForm.invalid) {
      this.alertService.showError("Field should not be empty");
    } else if (this.id !== undefined) {
      let editData = {
        discountId: this.id,
        outletId: this.outletId,
        discountName: this.discountForm.get('discountName').value,
        discountType: this.discountForm.get('discountType').value,
        discountValue: this.discountForm.get('discountValue').value,
        discoutNotes: this.discountForm.get('discoutNotes').value ?? '',
        DiscountOnDineIn: this.discountForm.get('discountDineIn').value,
        DiscountOnTakeAway: this.discountForm.get('discountTakeAway').value,
        DiscountOnOnline: this.discountForm.get('discountEOrder').value,
        DiscountOnTotal: this.discountForm.get('discountOnTotal').value,
        //discountStatus: this.discData.discountStatus
        activeStatus: this.discData.activeStatus
      }
      console.log(editData);
      this.ngxLoader.startLoader('loader-01');
      this.posDataService.upDateDiscountData(this.id, editData).subscribe((res: any) => {
        this.ngxLoader.stopLoader('loader-01');
        let status = res['success'];
        let msg = res['message'];
        if (status) {
          this.alertService.showSuccess(msg);
          this.activeModal.close(true);
        } else {
          this.alertService.showError(msg);
        }
      });
    }
  }
}
