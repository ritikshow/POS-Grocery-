import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { AddItemService } from '@core/services/common/add-item.service';
import { AlertService } from '@core/services/common/alert.service';
import { PosDataService } from '@core/services/pos-system/pos-data.service';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';
import { NgxUiLoaderService } from 'ngx-ui-loader';

@Component({
  selector: 'app-add-master-promo-code',
  templateUrl: './add-master-promo-code.component.html',
  styleUrls: ['./add-master-promo-code.component.css']
})
export class AddMasterPromoCodeComponent implements OnInit {

  promocodeForm: any = FormGroup;
  id: any;
  promocodeData: any;
  promoItem: any;
  termsCondition: any;
  outletId: any;
  isUpdate = false;


  constructor(
    private ngxLoader: NgxUiLoaderService,
    private activeModal: NgbActiveModal,
    private formBuilder: FormBuilder,
    private alertService: AlertService,
    private addItems: AddItemService,
    private posDataService: PosDataService
  ) { }

  ngOnInit(): void {
    this.promocodeForm = this.formBuilder.group({
      promocodeName: ['', Validators.required],
      promocode: ['', Validators.required],
      promocodeType: ['', Validators.required],
      promocodeValue: ['', Validators.required],
      description: [''],
      validUpto: ['']
    });
    this.outletId = sessionStorage.getItem('activeOutletId');
    let isNew = sessionStorage.getItem('isNewPromoCode');
    if (isNew == 'false') {
      this.id = sessionStorage.getItem('editPromoCode');
      this.isUpdate = true;
      sessionStorage.removeItem('isNewPromoCode');
      sessionStorage.removeItem('editPromoCode');
      this.getPromocodeDataById();
    }
  }

  getPromocodeDataById() {
    this.ngxLoader.startLoader('loader-01');
    this.posDataService.getPromocodeByID(this.id).subscribe((res: any) => {
      this.ngxLoader.stopLoader('loader-01');
      this.promocodeData = res['data'];
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
    this.promocodeForm.patchValue({
      promocodeName: this.promocodeData.promocodeName,
      promocode: this.promocodeData.promocode,
      promocodeType: this.promocodeData.promocodeType,
      promocodeValue: this.promocodeData.promocodeValue,
      description: this.promocodeData.description,
      validUpto: this.promocodeData.validUpto.split('T')[0]
    });
  }
  closeModal() {
    this.activeModal.close();
  }


  addPromocodeFormData() {
    if (this.promocodeForm.invalid) {
      this.alertService.showError("Field should not be empty");
    }
    else {
      let data = {
        outletId: this.outletId,
        promocodeName: this.promocodeForm.get('promocodeName').value,
        promocode: this.promocodeForm.get('promocode').value,
        promocodeType: this.promocodeForm.get('promocodeType').value,
        promocodeValue: this.promocodeForm.get('promocodeValue').value,
        description: this.promocodeForm.get('description').value ?? '',
        validUpto: this.promocodeForm.get('validUpto').value,
        ActiveStatus : true
      }
      this.addItems.addPromoCodeData(data).subscribe((result) => {
        if (result.success) {
          this.alertService.showSuccess("Promocode Added Successfully");
          this.activeModal.close(result.success);
        }
      });
    }
  }
  updatePromocodeFormData(data: any) {
    console.log(data)
    if (this.promocodeForm.invalid) {
      this.alertService.showError("Field should not be empty");
    } else {
      let editData = {
        promocodeId: this.id,
        outletId: this.outletId,
        promocodeName: this.promocodeForm.get('promocodeName').value,
        promocode: this.promocodeForm.get('promocode').value,
        promocodeType: this.promocodeForm.get('promocodeType').value,
        promocodeValue: this.promocodeForm.get('promocodeValue').value,
        description: this.promocodeForm.get('description').value ?? '',
        validUpto: this.promocodeForm.get('validUpto').value,
        ActiveStatus: this.promocodeData.activeStatus
      }
      this.ngxLoader.startLoader('loader-01');
      this.posDataService.upDatePromocodeData(this.id, editData).subscribe((res: any) => {
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
}
