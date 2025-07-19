import { Component, OnInit, ViewChild } from '@angular/core';
import { NgbModal, ModalDismissReasons, NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';
import { AlertService } from '@core/services/common/alert.service';
import { AddItemService } from '../../../../core/services/common/add-item.service';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { NgxUiLoaderService } from 'ngx-ui-loader';
import { CommonService } from '@core/services/common/common.service';

@Component({
  selector: 'app-general-settings',
  templateUrl: './general-settings.component.html',
  styleUrls: ['./general-settings.component.css']
})
export class GeneralSettingsComponent implements OnInit {
  outletId: any;
  generalSettings: any = FormGroup;
  edit = false;

  constructor(
    private ngxLoader: NgxUiLoaderService,
    private alertService: AlertService,
    private addItems: AddItemService,
    private formBuilder: FormBuilder,
    private activeModal: NgbActiveModal,
    // private commonService : CommonService,
    public commonService: CommonService

  ) { }

  getGeneralSettingsByOutlet() {
    this.addItems.getGeneralSettingsByOutletID(this.outletId).subscribe((res: any) => {
      if (res.success == true) {
        this.ngxLoader.stopLoader('loader-01');
        this.PatchGeneralSettings(res.data);
      }
      else {
        this.ngxLoader.stopLoader('loader-01');
      }
    });
  }
  PatchGeneralSettings(data) {
    this.generalSettings.patchValue({
      generalSettingsId: data.generalSettingsId,
      outletId: data.outletId,
      currency: data.currency,
      directPlaceOrder: data.directPlaceOrder,
      kitchenName: data.kitchenName,
      barName: data.barName,
    });
  }

  ngOnInit(): void {
    this.outletId = sessionStorage.getItem('activeOutletId');
    this.generalSettings = this.formBuilder.group({
      generalSettingsId: [''],
      outletId: this.outletId,
      // Place order directly from the QR Sacned table by customer.
      directPlaceOrder: false,
      currency: [{ value: '', disabled: true }],
      // isZomattoEnabled: [''],
      kitchenName: [{ value: '', disabled: true }],
      barName: [{ value: '', disabled: true }],
    });
    this.getGeneralSettingsByOutlet();
  }
  // changeDirectOderPlaceStatus(event) {
  //   this.generalSettings.patchValue({
  //     directPlaceOrder: event.target.checked
  //   });
  // }

  closeModal() {
    this.activeModal.close();
  }
  saveGeneralSettings() {
    if (!this.generalSettings.value.generalSettingsId || this.generalSettings.value.generalSettingsId == null || this.generalSettings.value.generalSettingsId == '') {
      this.InsertGeneralSettings();
    }
    else {
      this.UpdateGeneralSettings();
    }
  }
  InsertGeneralSettings() {
    const data = {
      outletId: this.outletId,
      currency: this.generalSettings.value.currency,
      directPlaceOrder: this.generalSettings.value.directPlaceOrder,
      kitchenName: this.generalSettings.value.kitchenName,
      barName: this.generalSettings.value.barName,
      CreatedBy : JSON.parse(sessionStorage.getItem("userCredential")).userName
    };
    this.addItems.insertGeneralSettings(data).subscribe((result) => {
      if (result.success) {
        this.PatchGeneralSettings(result.data);
        this.alertService.showSuccess("General settings added successfully");
        sessionStorage.setItem("GeneralSetting",JSON.stringify(result.data))
        this.commonService.SetGeneralSetting();
        this.activeModal.close();
      } else {
        this.alertService.showError(result.message);
        this.activeModal.close();
      }
    });
  }

  UpdateGeneralSettings() {
    const data = {
      generalSettingsId: this.generalSettings.value.generalSettingsId,
      outletId: this.outletId,
      currency: this.generalSettings.value.currency,
      directPlaceOrder: this.generalSettings.value.directPlaceOrder,
      kitchenName: this.generalSettings.value.kitchenName,
      barName: this.generalSettings.value.barName,
      LastModifiedBy : JSON.parse(sessionStorage.getItem("userCredential")).userName
    };
    this.addItems.updateGeneralSettings(data).subscribe((result) => {
      if (result.success) {
        this.alertService.showSuccess("General settings updated successfully");
        this.edit = false;
        this.activeModal.close();
        sessionStorage.setItem("GeneralSetting",JSON.stringify(result.data))
        this.commonService.SetGeneralSetting();
        this.toggleFormControls(false);
      } else {
        this.alertService.showError(result.message);
        this.activeModal.close();
      }
    });
  //   this.edit = false;
  //  this.toggleFormControls(false);
  }

  onClickEdit() {
    this.edit = !this.edit;
    this.toggleFormControls(this.edit);
  }

  toggleFormControls(state: boolean) {
    if (state) {
      this.generalSettings.get('currency')?.enable();
      this.generalSettings.get('kitchenName')?.enable();
      this.generalSettings.get('barName')?.enable();
    } else {
      this.generalSettings.get('currency')?.disable();
      this.generalSettings.get('kitchenName')?.disable();
      this.generalSettings.get('barName')?.disable();
    }
  }
  
}
