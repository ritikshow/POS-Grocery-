import { Component, OnInit } from '@angular/core';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { AlertService } from '@core/services/common/alert.service';
import { PosDataService } from '@core/services/pos-system/pos-data.service';
import { PosEditService } from '@core/services/pos-system/pos-edit.service';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';
import { NgxUiLoaderService } from 'ngx-ui-loader';


@Component({
  selector: 'app-outlet-edit',
  templateUrl: './outlet-edit.component.html',
})
export class OutletEditComponent implements OnInit {

  outletForm: any = FormGroup;
  outletData: any;
  id: any;
  countryData: any;

  constructor(
    private ngxLoader: NgxUiLoaderService,
    private activeModal: NgbActiveModal,
    private formBuilder: FormBuilder,
    private alertService: AlertService,
    private posDataService: PosDataService,
    private posEditService: PosEditService
  ) { }

  ngOnInit(): void {
    this.outletForm = this.formBuilder.group({
      outletName: ['', Validators.required],
      address: ['', Validators.required],
      country: ['', Validators.required]
    });
    this.getAllCountry();
    this.id = this.posEditService.getOutletEditId();
    if (this.id !== undefined) {
      this.getOutletDataById();
    }
  }

  getOutletDataById() {
    this.ngxLoader.startLoader('loader-01');
    this.posDataService.getOutletByID(this.id).subscribe((res: any) => {
      this.ngxLoader.stopLoader('loader-01');
      this.outletData = res['data'];
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

  getAllCountry() {
    this.ngxLoader.startLoader('loader-01');
    this.posDataService.getAllCountryData().subscribe((res: any) => {
      this.ngxLoader.stopLoader('loader-01');
      this.countryData = res['data'];
      let success = res['success'];
      let msg = res['message'];
      if (!success) {
        this.alertService.showError(msg);
      }
    });
  }

  patchValuesToForm() {
    this.outletForm.patchValue({
      outletName: this.outletData.outletName,
      address: this.outletData.address,
      country: this.outletData.country
    });
  }

  closeModal() {
    this.activeModal.close();
  }


  addOutlet(data: any) {
    console.log(data)
    if (this.outletData.invalid) {
      this.alertService.showError("Fields are empty");
    } else if (this.id !== undefined) {
      let editData = {
        outletId: this.id,
        outletName: this.outletForm.get('outletName').value,
        address: this.outletForm.get('address').value,
        country: this.outletForm.get('country').value
      }
      this.ngxLoader.startLoader('loader-01');
      this.posDataService.upDateOutletData(this.id, editData).subscribe((res: any) => {
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
    } else {
      this.ngxLoader.startLoader('loader-01');
      this.posDataService.postOutletData(this.outletForm.value).subscribe((res: any) => {
        this.ngxLoader.stopLoader('loader-01');
        console.log(res);
        let msg = res['message'];
        if (res.success) {
          this.alertService.showSuccess("Outlet Added Successfully!");
          this.activeModal.close(res.success);
        }
        else {
          this.alertService.showError(msg);
        }
      });
    }
  }
}
