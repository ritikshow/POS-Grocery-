import { Component, OnInit } from '@angular/core';
import { FormGroup, FormBuilder, Validators, FormArray } from '@angular/forms';
import { AlertService } from '@core/services/common/alert.service';
import { PosDataService } from '@core/services/pos-system/pos-data.service';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';
import { NgxUiLoaderService } from 'ngx-ui-loader';

@Component({
  selector: 'app-tax-setup-form',
  templateUrl: './tax-setup-form.component.html',
  styleUrls: ['./tax-setup-form.component.css']
})
export class TaxSetupFormComponent implements OnInit {
  taxSetupForm: any = FormGroup;
  restaurantId: any;
  resData: any;
  outletArray = [];
  taxItems: any;
  isActiveOutlet: any;
  isPercentData: boolean = false;
  percentDataList: any;
  taxId: string;
  constructor(
    private ngxLoader: NgxUiLoaderService,
    private activeModal: NgbActiveModal,
    private formBuilder: FormBuilder,
    private alertService: AlertService,
    private posDataService: PosDataService
  ) { }

  ngOnInit(): void {

    let restData = JSON.parse(sessionStorage.getItem('restaurantData'));
    this.taxId = sessionStorage.getItem('taxIdForTaxSetup');
    let taxPercentage = JSON.parse(sessionStorage.getItem('taxIdPercentForTaxSetup'));
    if (taxPercentage) {
      this.isPercentData = true;
      this.percentDataList = taxPercentage;
      this.isActiveOutlet = false
    }
    if (sessionStorage.getItem('activeRestaurantId') !== null && sessionStorage.getItem('activeRestaurantId') !== undefined) {
      this.restaurantId = sessionStorage.getItem('activeRestaurantId');
    } else {
      this.restaurantId = restData.restaurantId;
    }
    this.taxSetupForm = this.formBuilder.group({
      isItemIncludeTax: [true, Validators.required],
      percentage: ['', Validators.required],
      outletId: ['', Validators.required],
      isSubtractFromSubTotal: [false, Validators.required],
    });
    this.getRestaurantDataById();
    this.checkHeaderCheckBox();
  }


  getRestaurantDataById() {
    this.ngxLoader.startLoader('loader-01');
    this.posDataService.getRestaurantById(this.restaurantId).subscribe((res: any) => {
      this.ngxLoader.stopLoader('loader-01');
      this.resData = res['data'];
      let success = res['success'];
      let msg = res['message'];
      if (success) {
        let activeOutlet = sessionStorage.getItem('activeOutletId');
        if (activeOutlet !== null || activeOutlet !== undefined) {
          this.isActiveOutlet = false;
          this.taxSetupForm.patchValue({
            outletId: activeOutlet
          });
        }
      }
      else {
        this.alertService.showError(msg);
      }
    });
  }

  checkHeaderCheckBox() {
    const ele = document.getElementById('taxIncludeCheck') as HTMLInputElement;
    if (ele !== undefined && ele !== null) {
      ele.checked = true;
    }
  }

  onCheckboxChange(event) {
    if (event.target.checked) {
      this.taxSetupForm.patchValue({
        isItemIncludeTax: true
      });
    } else {
      this.taxSetupForm.patchValue({
        isItemIncludeTax: false
      });
    }
  }

  onSubtractCheckboxChange(event) {
    if (event.target.checked) {
      this.taxSetupForm.patchValue({
        isSubtractFromSubTotal: true
      });
    } else {
      this.taxSetupForm.patchValue({
        isSubtractFromSubTotal: false
      });
    }
  }

  closeModal() {
    this.activeModal.close();
  }

  addTaxSetup() {
    if (this.taxSetupForm.invalid) {
      this.alertService.showError('Fields are empty');
    } else {
      let data = {
        taxId: this.taxId,
        isItemIncludeTax: this.taxSetupForm.get('isItemIncludeTax').value,
        outletId: this.taxSetupForm.get('outletId').value,
        restaurantId: this.restaurantId,
        percentage: this.taxSetupForm.get('percentage').value,
        isSubtractFromSubTotal: this.taxSetupForm.get('isSubtractFromSubTotal').value
      }
      this.ngxLoader.startLoader('loader-01');
      this.posDataService.postTaxConditionData(data).subscribe((res: any) => {
        this.ngxLoader.stopLoader('loader-01');
        let status = res['success'];
        let msg = res['message'];
        if (status) {
          this.activeModal.close(status);
          this.alertService.showSuccess('Tax Setup Added Successfully!');
        } else {
          this.alertService.showError(msg);
        }
      });
    }
  }
}

