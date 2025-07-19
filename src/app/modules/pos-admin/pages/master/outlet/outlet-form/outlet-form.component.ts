import { Component, OnInit } from '@angular/core';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { AlertService } from '@core/services/common/alert.service';
import { PosDataService } from '@core/services/pos-system/pos-data.service';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';
import { NgxUiLoaderService } from 'ngx-ui-loader';

@Component({
  selector: 'app-outlet-form',
  templateUrl: './outlet-form.component.html',
  styleUrls: ['./outlet-form.component.css']
})
export class OutletFormComponent implements OnInit {
  outletForm: any = FormGroup;
  countryData: any;

  constructor(
    private ngxLoader: NgxUiLoaderService,
    private activeModal: NgbActiveModal,
    private formBuilder: FormBuilder,
    private alertService: AlertService,
    private posDataService: PosDataService
  ) { }

  ngOnInit(): void {
    this.getAllCountry();
    this.outletForm = this.formBuilder.group({
      outletName: ['', Validators.required],
      address: ['', Validators.required],
      country: ['', Validators.required]
    });
  }

  closeModal() {
    this.activeModal.close();
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

  addOutlet() {
    if (this.outletForm.invalid) {
      this.alertService.showError('Fields are empty');
    } else {
      this.ngxLoader.startLoader('loader-01');
      this.posDataService.postOutletData(this.outletForm.value).subscribe((res: any) => {
        this.ngxLoader.stopLoader('loader-01');
        let status = res['success'];
        let msg = res['message'];
        if (status) {
          this.activeModal.close(status);
          this.alertService.showSuccess('Outlet Added Successfully!');
        } else {
          this.alertService.showError(msg);
        }
      });
    }
  }
}
