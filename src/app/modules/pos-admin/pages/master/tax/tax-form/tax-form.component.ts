import { Component, OnInit } from '@angular/core';
import { FormGroup, FormBuilder, Validators, FormArray } from '@angular/forms';
import { AlertService } from '@core/services/common/alert.service';
import { PosDataService } from '@core/services/pos-system/pos-data.service';
import { ModalDismissReasons, NgbActiveModal, NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { NgxUiLoaderService } from 'ngx-ui-loader';

@Component({
  selector: 'app-tax-form',
  templateUrl: './tax-form.component.html',
  styleUrls: ['./tax-form.component.css']
})
export class TaxFormComponent implements OnInit {
  taxForm: any = FormGroup;
  taxItems: any;
  outletId: any;
  restaurantId: string;
  resData: any;
  isActiveOutlet: boolean;
  taxData: any;
  isTaxSetupPercent: boolean = false;
  taxSetupPercentList: any;
  closeResult: string;
  id: any;
  isUpdate = false;

  constructor(
    private ngxLoader: NgxUiLoaderService,
    private activeModal: NgbActiveModal,
    private formBuilder: FormBuilder,
    private alertService: AlertService,
    private posDataService: PosDataService,
    private modalService: NgbModal

  ) { }

  ngOnInit(): void {
    this.outletId = sessionStorage.getItem('activeOutletId');
    let restData = JSON.parse(sessionStorage.getItem('restaurantData'));
    if (sessionStorage.getItem('activeRestaurantId') !== null && sessionStorage.getItem('activeRestaurantId') !== undefined) {
      this.restaurantId = sessionStorage.getItem('activeRestaurantId');
    } else {
      this.restaurantId = restData.restaurantId;
    }
    this.taxForm = this.formBuilder.group({
      taxName: ['', Validators.required],
      taxPercent: ['',Validators.required],
      isSubtractFromSubTotal : [{ value: false, disabled: true }],
      isItemIncludeTax : [false],
      isDefault : [false,Validators.required]
    });
    this.getRestaurantDataById();
    let isNew = sessionStorage.getItem('isNewTax');
    if (isNew == 'false') {
      this.id = sessionStorage.getItem('editTax');
      this.isUpdate = true;
      sessionStorage.removeItem('isNewTax');
      sessionStorage.removeItem('editTax');
      this.getTaxDataById();
    }

    this.taxForm.get('isItemIncludeTax')?.valueChanges.subscribe((value) => {
      // Enable or disable 'isSubtractFromSubTotal' based on 'isItemIncludeTax'
      if (value) {
        this.taxForm.get('isSubtractFromSubTotal')?.enable();
      } else {
        this.taxForm.get('isSubtractFromSubTotal')?.disable();
      }
    });
  }

  createAddress(): FormGroup {
    return this.formBuilder.group({
      taxPercent: ['', Validators.required],
      isDefault: [false, Validators.required]
    });
  }

  get taxItemsControls() {
    return this.taxForm.get('taxPercent')['controls'];
  }

  addMod(): void {
    this.taxItems = this.taxForm.get('taxPercent') as FormArray;
    this.taxItems.push(this.createAddress());
  }

  removeMod(i) {
    this.taxItems.removeAt(i);
  }
  getTaxDataById() {
    this.ngxLoader.startLoader('loader-01');
    this.posDataService.getTaxById(this.id).subscribe((res: any) => {
      this.ngxLoader.startLoader('loader-01');
      this.taxData = res['data'];
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
    this.taxForm.patchValue({
      taxName: this.taxData.taxName,
      isItemIncludeTax : this.taxData.isItemIncludeTax,
      isSubtractFromSubTotal : this.taxData.isSubtractFromSubTotal,
      taxPercent : this.taxData.taxPercentage,
      isDefault : this.taxData.isDefault
    });
    // for (let i = 0; i < this.taxData.taxPercent.length; i++) {
    //   if (i == 0) {
    //     (<FormGroup>this.taxItemsControls.at(i)).patchValue({
    //       taxPercent: this.taxData.taxPercent[i].taxPercent,
    //       isDefault: this.taxData.taxPercent[i].isDefault
    //     });
    //   } else {
    //     this.taxItems = this.taxForm.get('taxPercent') as FormArray;
    //     this.taxItems.push(this.createAddress());
    //     (<FormGroup>this.taxItemsControls.at(i)).patchValue({
    //       taxPercent: this.taxData.taxPercent[i].taxPercent,
    //       isDefault: this.taxData.taxPercent[i].isDefault
    //     });
    //   }
    // }
  }

  closeModal() {
    this.activeModal.close(true);
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
          this.isActiveOutlet = true;
          this.taxForm.patchValue({
            outletId: activeOutlet
          });
        }
      }
      else {
        this.alertService.showError(msg);
      }
    });
  }
  addModifier() {
    console.log(this.taxForm.value);
    if (this.taxForm.invalid) {
      this.alertService.showError('Fields are empty');
    } else {
      console.log(this.taxForm.value);
      let val = this.taxForm.value;
      let count = 0;
      for (let j = 0; j < val.taxPercent.length; j++) {
        if (val.taxPercent[j].isDefault) {
          count++;
        }
      }
      if (count > 1) {
        this.alertService.showWarning('Is Default should be true for 1 percentage only');
      } else {
        let data = {
          taxName: this.taxForm.get('taxName').value,
          TaxPercentage: this.taxForm.get('taxPercent').value,
          outletId: this.outletId,
          ActiveStatus : true,
          isSubtractFromSubTotal: this.taxForm.get('isSubtractFromSubTotal').value == true ? this.taxForm.get('isSubtractFromSubTotal').value : false,
        isItemIncludeTax: this.taxForm.get('isItemIncludeTax').value == true ? this.taxForm.get('isItemIncludeTax').value == true : false,
        isDefault : this.taxForm.get('isDefault').value
        }
        this.ngxLoader.startLoader('loader-01');
        this.posDataService.postTaxData(data).subscribe((res: any) => {
          this.ngxLoader.startLoader('loader-01');
          this.taxData = res['data'];
          this.isTaxSetupPercent = true;
          this.taxSetupPercentList = this.taxData.taxPercent;
          let status = res['success'];
          let msg = res['message'];
          if (status) {
            sessionStorage.setItem('taxIdForTaxSetup', this.taxData.taxId);
            sessionStorage.setItem('taxIdPercentForTaxSetup', JSON.stringify(this.taxData.taxPercent));
            this.activeModal.close(true);
            // this.modalService.open(TaxSetupFormComponent, { backdrop: 'static', size: 'md', keyboard: true, centered: true }).result.then((result) => {
            //   this.closeResult = `Closed with: ${result}`;
            // }, (reason) => {
            //   this.closeResult = `Dismissed ${this.getDismissReason(reason)}`;
            // });
          } else {
            this.alertService.showError(msg);
          }
        });

      }
    }
  }

  private getDismissReason(reason: any): string {
    if (reason === ModalDismissReasons.ESC) {
      return 'by pressing ESC';
    } else if (reason === ModalDismissReasons.BACKDROP_CLICK) {
      return 'by clicking on a backdrop';
    } else {
      return `with: ${reason}`;
    }
  }
  updateModifier() {

    console.log(this.taxForm.value);
    if (this.taxForm.invalid) {
      this.alertService.showError('Fields are empty');
    } else {
      let editData = {
        taxId: this.id,
        outletId: this.outletId,
        taxName: this.taxForm.get('taxName').value,
        TaxPercentage: this.taxForm.get('taxPercent').value,
        ActiveStatus : this.taxData.activeStatus,
        isSubtractFromSubTotal: this.taxForm.get('isSubtractFromSubTotal').value,
        isItemIncludeTax: this.taxForm.get('isItemIncludeTax').value,
        isDefault : this.taxForm.get('isDefault').value
      }
      this.ngxLoader.startLoader('loader-01');
      this.posDataService.upDateTaxData(this.id, editData).subscribe((res: any) => {
        this.ngxLoader.stopLoader('loader-01');
        let status = res['success'];
        let msg = res['message'];
        if (status) {
          this.alertService.showSuccess(msg);
          this.activeModal.close(true);
        } else {
          this.alertService.showError(msg);
        }
      });
    }
  }
  onCheckboxChange(event) {
    if (event.target.checked) {
      this.taxForm.patchValue({
        isItemIncludeTax: true
      });
    } else {
      this.taxForm.patchValue({
        isItemIncludeTax: false
      });
      }
      if (this.taxForm.get('isSubtractFromSubTotal')?.value) {
        this.taxForm.patchValue({
          isSubtractFromSubTotal: false
        });
  }}

  onSubtractCheckboxChange(event) {
    if (event.target.checked) {
      this.taxForm.patchValue({
        isSubtractFromSubTotal: true
      });
    } else {
      this.taxForm.patchValue({
        isSubtractFromSubTotal: false
      });
    }
  }
}
