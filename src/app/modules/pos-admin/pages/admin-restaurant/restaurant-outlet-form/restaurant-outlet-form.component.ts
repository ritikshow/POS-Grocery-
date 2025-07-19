import { Component, OnInit } from '@angular/core';
import { FormGroup, FormBuilder, Validators, FormArray } from '@angular/forms';
import { AlertService } from '@core/services/common/alert.service';
import { PosDataService } from '@core/services/pos-system/pos-data.service';
import { PosDataShareService } from '@core/services/pos-system/posDataShare.service';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';
import { NgxUiLoaderService } from 'ngx-ui-loader';

@Component({
  selector: 'app-restaurant-outlet-form',
  templateUrl: './restaurant-outlet-form.component.html',
  styleUrls: ['./restaurant-outlet-form.component.css']
})
export class RestaurantOutletFormComponent implements OnInit {
  outletForm: any = FormGroup;
  id: any;
  outletItems: any;
  resData: any;

  constructor(
    private ngxLoader: NgxUiLoaderService,
    private activeModal: NgbActiveModal,
    private formBuilder: FormBuilder,
    private alertService: AlertService,
    private posDataService: PosDataService,
    private posDataSharedService: PosDataShareService
  ) { }

  ngOnInit(): void {
    this.id = this.posDataSharedService.getIdForResOutlet();
    this.getResDataById();
    this.outletForm = this.formBuilder.group({
      outlets: this.formBuilder.array([this.createAddress()])
    });
  }

  getResDataById() {
    this.ngxLoader.startLoader('loader-01');
    this.posDataService.getRestaurantById(this.id).subscribe((res: any) => {
      this.ngxLoader.stopLoader('loader-01');
      this.resData = res['data'];
      let success = res['success'];
      let msg = res['message'];
      if (!success) {
        this.alertService.showError(msg);
      }
    });
  }

  createAddress(): FormGroup {
    return this.formBuilder.group({
      outletName: ['', Validators.required],
      outletManager: ['', Validators.required],
      outletAddress: ['', Validators.required],
      outletId: ['']
    });
  }

  get modItemsControls() {
    return this.outletForm.get('outlets')['controls'];
  }

  addMod(): void {
    this.outletItems = this.outletForm.get('outlets') as FormArray;
    this.outletItems.push(this.createAddress());
  }

  removeMod(i) {
    this.outletItems.removeAt(i);
  }

  closeModal() {
    this.activeModal.close();
  }

  addResOutlets() {
    if (this.outletForm.invalid) {
      this.alertService.showError('Fields are empty');
    } else {
      let userId = JSON.parse(sessionStorage.getItem("userCredential")).userId;
      let outletsData = this.outletForm.get('outlets').value;
      let CloneOutletId = outletsData[0].outletId || null
      if (this.resData.outlets == null || this.resData.outlets == undefined || this.resData.outlets.length == 0)
        this.resData.outlets = [];
      for (let i = 0; i < outletsData.length; i++) {
        outletsData[i].outletId = "";
        this.resData.outlets.push(outletsData[i]);
      }
      let data = {
        restaurant: this.resData,
      }
      this.posDataService.addOutlet(CloneOutletId,userId,data).subscribe((res: any) => {
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