import { Component, OnInit } from '@angular/core';
import { FormArray, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { AlertService } from '@core/services/common/alert.service';
import { PosDataService } from '@core/services/pos-system/pos-data.service';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';
import { NgxUiLoaderService } from 'ngx-ui-loader';

@Component({
  selector: 'app-tax-view-setup-edit',
  templateUrl: './tax-view-setup-edit.component.html',
})
export class TaxViewSetupEditComponent implements OnInit {
  taxSetupForm: any = FormGroup;
  restaurantId: any;
  resData: any;
  outletArray = [];
  taxItems: any;
  isActiveOutlet: any;
  id: any;
  allResData: any;
  taxId: any;
  percentDataList: any;

  constructor(
    private ngxLoader: NgxUiLoaderService,
    private activeModal: NgbActiveModal,
    private formBuilder: FormBuilder,
    private alertService: AlertService,
    private posDataService: PosDataService
  ) { }

  ngOnInit(): void {

    let restData = JSON.parse(sessionStorage.getItem('restaurantData'));
    let taxData = JSON.parse(sessionStorage.getItem('editTaxSetupData'));
    this.taxId = taxData.taxId;
    this.id = taxData.taxSetupId;
    this.percentDataList = taxData.taxPercent;
    if (sessionStorage.getItem('activeRestaurantId') !== null && sessionStorage.getItem('activeRestaurantId') !== undefined) {
      this.restaurantId = sessionStorage.getItem('activeRestaurantId');
    } else {
      this.restaurantId = restData.restaurantId;
    }
    this.taxSetupForm = this.formBuilder.group({
      isItemIncludeTax: [true, Validators.required],
      //outletId: ['', Validators.required],
      percentage: ['', Validators.required],
      isSubtractFromSubTotal: [false, Validators.required]
    });
    this.getRestaurantDataById();

  }
  getRestaurantDataById() {
    this.posDataService.getRestaurantById(this.restaurantId).subscribe((res: any) => {
      this.allResData = res['data'];
      let success = res['success'];
      let msg = res['message'];
      if (!success) {
        this.alertService.showError(msg);
      }
    });
  }
  patchValuesToForm() {

    this.taxSetupForm.patchValue({
      restaurantId: this.resData.restaurantId,
      isItemIncludeTax: this.resData.isItemIncludeTax,
      outletId: this.resData.outletId,
      percentage: this.resData.percentage,
      isSubtractFromSubTotal: this.resData.isSubtractFromSubTotal

    });
    if (this.taxSetupForm.get('isSubtractFromSubTotal').value) {
      this.checkSubtractCheckBox();
    }
  }
  checkHeaderCheckBox() {
    const ele = document.getElementById('isItemIncludeTax') as HTMLInputElement;
    if (ele !== undefined && ele !== null) {
      ele.checked = true;
    }
  }

  checkSubtractCheckBox() {
    const ele = document.getElementById('subtractCheck') as HTMLInputElement;
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
  editTaxSetup() {

    if (this.taxSetupForm.invalid) {
      this.alertService.showError('Fields are empty');
    } else {
      let data = {
        id: this.id,
        restaurantId: this.restaurantId,
        isItemIncludeTax: this.taxSetupForm.get('isItemIncludeTax').value,
        outletId: sessionStorage.getItem('activeOutletId'),
        isSubtractFromSubTotal: this.taxSetupForm.get('isSubtractFromSubTotal').value,
        percentage: this.taxSetupForm.get('percentage').value,
        taxId: this.taxId,
        ActiveStatus : this.resData.activeStatus
      }
      this.ngxLoader.startLoader('loader-01');
      this.posDataService.updateTaxConditionData(this.id, data).subscribe((res: any) => {
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
