import { Component, OnInit } from '@angular/core';
import { FormArray, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { AlertService } from '@core/services/common/alert.service';
import { PosDataService } from '@core/services/pos-system/pos-data.service';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';
import { NgxUiLoaderService } from 'ngx-ui-loader';

@Component({
  selector: 'app-add-paymentmode',
  templateUrl: './add-paymentmode.component.html',
  styleUrls: ['./add-paymentmode.component.css']
})
export class AddPaymentModeComponent implements OnInit {

  paymentModeForm: any = FormGroup;
  paymentModeEditData: any;
  isActiveOutlet = false;
  outletId: any;
  isUpdate = false;
  id: any;
  modItems: any;

  constructor(
    private ngxLoader: NgxUiLoaderService,
    private activeModal: NgbActiveModal,
    private formBuilder: FormBuilder,
    private alertService: AlertService,
    private posDataService: PosDataService,
  ) { }

  ngOnInit(): void {
    this.paymentModeForm = this.formBuilder.group({
      paymentMode: ['', Validators.required],
      paymentSubMode: this.formBuilder.array([this.createSubModes()]),
    });
    this.outletId = sessionStorage.getItem('activeOutletId');

    this.paymentModeEditData = JSON.parse(sessionStorage.getItem("editPaymentMode"));
    if (this.paymentModeEditData != null || this.paymentModeEditData != undefined) {
      this.isUpdate = true;
      this.patchValuesToForm();
    }
  }

  closeModal() {
    this.activeModal.close();
  }

  addPaymentModeFormData(data: any) {
    if (this.paymentModeForm.invalid) {
      this.alertService.showError("Field should not be empty");
    }
    else {
      const subModeStrings: string[] = this.paymentModeForm.get('paymentSubMode').value.map(item => item.subMode);
      let obj = {
        PaymentModeName: this.paymentModeForm.get('paymentMode').value,
        SubPaymentModes: subModeStrings,
        ActiveStatus: true,
        OutletId: this.outletId
      }

      this.posDataService.CreatePaymentMode(obj).subscribe((result) => {
        if (result.success) {
          this.alertService.showSuccess("Payment Mode added successfully");
          this.activeModal.close();
        } else {
          this.alertService.showError(result.message);
          this.activeModal.close();
        }
      });
    }
  }

  patchValuesToForm() {
    this.paymentModeForm.patchValue({
      paymentMode: this.paymentModeEditData.paymentModeName,
    });

    if (this.paymentModeEditData.subPaymentModes.length != 0)
      for (let j = 0; j < this.paymentModeEditData.subPaymentModes?.length; j++) {
        this.LoopNumberAndSetToForm(j);
      }
  }

  updatePaymentModeFormData(data: any) {
    if (this.paymentModeForm.invalid) {
      this.alertService.showError("Field should not be empty");
    } else {

      const subModeStrings: string[] = this.paymentModeForm.get('paymentSubMode').value.map(item => item.subMode);
      let obj = {
        PaymentModeId: this.paymentModeEditData.paymentModeId,
        PaymentModeName: this.paymentModeForm.get('paymentMode').value,
        SubPaymentModes: subModeStrings,
        ActiveStatus: true,
        OutletId: this.outletId,
        CreatedOn : this.paymentModeEditData.createdOn,
        CreatedBy : this.paymentModeEditData.CreatedBy,
      }

      this.ngxLoader.startLoader('loader-01');
      this.posDataService.updatePaymentMode(obj, this.paymentModeEditData.paymentModeId).subscribe((res: any) => {
        this.ngxLoader.stopLoader('loader-01');
        let status = res['success'];
        let msg = res['message'];
        if (status) {
          this.alertService.showSuccess(msg);
          this.activeModal.close(status);
        } else {
          this.alertService.showError(msg);
        }
      });
    }
  }
  get modItemsControls() {
    return this.paymentModeForm.get('paymentSubMode')['controls'];
  }

  private LoopNumberAndSetToForm(j: number) {
    if (j == 0) {
      (<FormGroup>this.modItemsControls.at(j)).patchValue({
        subMode: this.paymentModeEditData.subPaymentModes[j]
      });
    } else {
      this.modItems = this.paymentModeForm.get('paymentSubMode') as FormArray;
      this.modItems.push(this.createSubModes());
      (<FormGroup>this.modItemsControls.at(j)).patchValue({
        subMode: this.paymentModeEditData.subPaymentModes[j]
      });
    }
  }

  createSubModes(): FormGroup {
    return this.formBuilder.group({
      subMode: ['']
    });
  }
  addMod(): void {
    this.modItems = this.paymentModeForm.get('paymentSubMode') as FormArray;
    this.modItems.push(this.createSubModes());
  }

  removeMod(i) {
    this.modItems.removeAt(i);
  }

}
