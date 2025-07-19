import { Component, OnInit } from '@angular/core';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { AlertService } from '@core/services/common/alert.service';
import { PosDataService } from '@core/services/pos-system/pos-data.service';
import { PosEditService } from '@core/services/pos-system/pos-edit.service';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';

@Component({
  selector: 'app-restaurant-outlet-edit-form',
  templateUrl: './restaurant-outlet-edit-form.component.html',
  styleUrls: ['./restaurant-outlet-edit-form.component.css']
})
export class RestaurantOutletEditFormComponent implements OnInit {
  ids: any;
  resData: any;
  outletData: any;
  outletForm: any = FormGroup;

  constructor(
    private activeModal: NgbActiveModal,
    private alertService: AlertService,
    private posEditService: PosEditService,
    private formBuilder: FormBuilder,
    private posDataService: PosDataService
  ) { }

  ngOnInit(): void {
    this.ids = this.posEditService.getResOutletEditId();
    this.outletForm = this.formBuilder.group({
      outletName: ['', Validators.required],
      outletManager: ['', Validators.required],
      outletAddress: ['', Validators.required]
    });
    this.getResDataById();
  }

  getResDataById() {
    this.posDataService.getRestaurantById(this.ids.resId).subscribe((res: any) => {
      this.resData = res['data'];
      let success = res['success'];
      let msg = res['message'];
      if (success) {
        this.getOutletDataById();
      }
      else {
        this.alertService.showError(msg);
      }
    });
  }

  getOutletDataById() {
    let outlet = this.resData.outlets.filter((res: any) => {
      return res.outletId == this.ids.outletId;
    });
    this.outletData = outlet[0];
    if (this.outletData) {
      this.patchFormData();
    }
  }

  patchFormData() {
    this.outletForm.patchValue({
      outletName: this.outletData.outletName,
      outletManager: this.outletData.outletManager,
      outletAddress: this.outletData.outletAddress
    });
  }

  closeModal() {
    this.activeModal.close();
  }

  addOutlets() {
    if (this.outletForm.invalid) {
      this.alertService.showError('Fields are empty');
    } else {
      let outlet = {
        outletId: this.ids.outletId,
        outletName: this.outletForm.get('outletName').value,
        outletManager: this.outletForm.get('outletManager').value,
        outletAddress: this.outletForm.get('outletAddress').value
      };
      for (let i = 0; i < this.resData.outlets.length; i++) {
        if (this.resData.outlets[i].outletId == this.ids.outletId) {
          this.resData.outlets.splice(i, 1, outlet);
        }
      }
      let data = {
        restaurant: {
          restaurantId: this.resData.restaurantId,
          restaurantName: this.resData.restaurantName,
          restaurantRegistrationNo: this.resData.restaurantRegistrationNo,
          wareHouse_Lable: this.resData.wareHouse_Lable,
          country: this.resData.country,
          outlets: this.resData.outlets,
          logoName: this.resData.logoName,
          logoExtension: this.resData.logoExtension,
          logoPath:this.resData.logoPath,
          tradeLicenseName: this.resData.tradeLicenseName,
          tradeLicenseExtension: this.resData.tradeLicenseExtension,
          tradeLicensePath:this.resData.tradeLicensePath,
          trnNo: this.resData.trnNo,
          trnCertificateName: this.resData.trnCertificateName,
          trnCertificatePath:this.resData.trnCertificatePath,
          trnCertificateExtension: this.resData.trnCertificateExtension,
          firstName: this.resData.firstName,
          middleName: this.resData.middleName,
          lastName: this.resData.lastName,
          address: this.resData.address,
          city: this.resData.city,
          poBox: this.resData.poBox,
          typeOfBussines: this.resData.typeOfBussines,
          typeOfCusine: this.resData.typeOfCusine,
          specialFeatures: this.resData.specialFeatures,
          email: this.resData.email,
          phone: this.resData.phone,
          isThemAgreed: this.resData.isThemAgreed,
          reset: this.resData.reset,
          password:this.resData.password,
          restaurantType:this.resData.restaurantType,
          permission:this.resData.permission,
          activeStatus:this.resData.activeStatus,
         

        },
        tradeLicense: this.resData.tradeLicense,
        logo: this.resData.logo,
        trnCertificate: this.resData.trnCertificate,
      }
      this.posDataService.updateRestaurantData(this.ids.resId, data).subscribe((res: any) => {
        let status = res['success'];
        let msg = res['message'];
        if (status) {
          this.activeModal.close(status);
          this.alertService.showSuccess(msg);
        } else {
          this.alertService.showError(msg);
        }
      });
    }
  }
}
