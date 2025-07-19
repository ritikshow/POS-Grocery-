import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { AlertService } from '@core/services/common/alert.service';
import { PosSharedService } from '@core/services/common/pos-shared.service';
import { PosDataService } from '@core/services/pos-system/pos-data.service';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';
import { NgxUiLoaderService } from 'ngx-ui-loader';

@Component({
  selector: 'app-outlet-selection',
  templateUrl: './outlet-selection.component.html',
  styleUrls: ['./outlet-selection.component.css']
})
export class OutletSelectionComponent implements OnInit {
  outletForm: any = FormGroup;
  resId: any;
  resData: any;
  userId: any;
  isActiveOutlet = false;
  outletName: any;
  closeView = false;
  resultData: any;
  restaurantUserLink: any;

  constructor(
    private ngxLoader: NgxUiLoaderService,
    private posDataService: PosDataService,
    private posSharedService: PosSharedService,
    private alertService: AlertService,
    private formBuilder: FormBuilder,
    private activeModal: NgbActiveModal,
  ) { }

  ngOnInit(): void {
    let userData = JSON.parse(sessionStorage.getItem('userCredential'));
    this.restaurantUserLink = JSON.parse(sessionStorage.getItem('restaurantData'));
    this.userId = userData.userId;
    if (sessionStorage.getItem('activeRestaurantId') !== null && sessionStorage.getItem('activeRestaurantId') !== undefined) {
      this.resId = sessionStorage.getItem('activeRestaurantId');
    } else {
      this.resId = this.restaurantUserLink[0].restaurantId;
    }
    this.outletForm = this.formBuilder.group({
      outlet: ['', Validators.required],
    });
    if (this.resId != null && this.resId != undefined)
      this.getRestaurantDataById();
    if (sessionStorage.getItem('dash') == 'dashboard') {
      this.closeView = true;
    }
  }

  getRestaurantDataById() {
    this.ngxLoader.startLoader('loader-01');
    this.posDataService.getRestaurantById(this.resId).subscribe((res: any) => {
      this.ngxLoader.stopLoader('loader-01');
      this.resData = res['data'];
      let success = res['success'];
      let msg = res['message'];
      if (success) {
        let outlets = [];
        this.FilterOutlets(outlets);
      } else {
        this.alertService.showError(msg);
      }
    });
  }

  private FilterOutlets(outlets: any[]) {
    if (this.restaurantUserLink !== null && this.restaurantUserLink !== undefined) {
      let userOutlets = this.restaurantUserLink.find(x => x.restaurantId == this.resId).outlets;
      this.LoopAndRemoveOutlet(userOutlets, outlets);
    }
    if (outlets != null && outlets != undefined && outlets.length > 0)
      this.resData.outlets = outlets;
    sessionStorage.setItem('RestaurantFeatures', JSON.stringify(this.resData.permission));
    let activeOutlet = sessionStorage.getItem('DefaultOutlet');
    if (activeOutlet !== null && activeOutlet !== undefined) {
      this.isActiveOutlet = false; //outlets can be selected by all roles
      this.outletForm.patchValue({
        outlet: activeOutlet
      });
    }
  }

  private LoopAndRemoveOutlet(userOutlets: any, outlets: any[]) {
    userOutlets.forEach(element => {
      if (element != undefined && element != null && element != '')
        outlets.push(this.resData.outlets.find(x => x.outletId == element));
    });
  }

  select() {
    let OutletId = (<HTMLInputElement>document.getElementById("outlet")).value;
    this.outletName = this.resData?.outlets.find(x => x.outletId == OutletId).outletName;
  }

  closeModal() {
    this.activeModal.close();
  }

  addOutlet() {
    if (this.outletForm.invalid) {
      this.alertService.showSuccess('Please Select Outlet');
    } else {
      let outletId = this.outletForm.get('outlet').value;
      let outlet = this.resData?.outlets.find(x => x.outletId == outletId);
      sessionStorage.setItem('activeOutlet', JSON.stringify(outlet));
      sessionStorage.setItem('activeOutletId', outletId);
      sessionStorage.setItem('activeOutletname', this.outletName);
      sessionStorage.setItem('activeRestaurantId', this.resId);
      this.posSharedService.onSelectNotify(outletId);
      this.alertService.showSuccess('Outlet Selected Successfully');
      this.activeModal.close(true);
      window.location.reload();
    }
  }
}
