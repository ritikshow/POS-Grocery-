import { Component, OnInit } from '@angular/core';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { AlertService } from '@core/services/common/alert.service';
import { PosDataService } from '@core/services/pos-system/pos-data.service';
import { PosEditService } from '@core/services/pos-system/pos-edit.service';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';
import { NgxUiLoaderService } from 'ngx-ui-loader';

@Component({
  selector: 'app-table-type-form',
  templateUrl: './table-type-form.component.html',
  styleUrls: ['./table-type-form.component.css']
})
export class TableTypeFormComponent implements OnInit {
  tableForm: any = FormGroup;
  tableTypeData: any;
  id: any;
  resId: any;
  resData: any;
  isActiveOutlet: any;
  isUpdate = false;

  constructor(
    private ngxLoader: NgxUiLoaderService,
    private activeModal: NgbActiveModal,
    private formBuilder: FormBuilder,
    private alertService: AlertService,
    private posDataService: PosDataService,
    private posEditService: PosEditService
  ) { }

  ngOnInit(): void {
    let restData = JSON.parse(sessionStorage.getItem('restaurantData'));
    if (sessionStorage.getItem('activeRestaurantId') !== null && sessionStorage.getItem('activeRestaurantId') !== undefined) {
      this.resId = sessionStorage.getItem('activeRestaurantId');
    } else {
      this.resId = restData.restaurantId;
    }
    this.tableForm = this.formBuilder.group({
      tableTypeName: ['', Validators.required],
      description: [''],
      outletId: ['', Validators.required],
    });

    this.getRestaurantById();
    this.id = this.posEditService.getTableTypeEditId();
    let isNew = sessionStorage.getItem('isNewResturantSection');
    if (isNew == 'false') {
      this.id = sessionStorage.getItem('editResturantSection');
      this.isUpdate = true;
      sessionStorage.removeItem('isNewResturantSection');
      sessionStorage.removeItem('editResturantSection');
      this.getTableTypeDataById();
    }
  }

  getRestaurantById() {
    this.ngxLoader.startLoader('loader-01');
    this.posDataService.getRestaurantById(this.resId).subscribe((res: any) => {
      this.ngxLoader.stopLoader('loader-01');
      this.resData = res['data'];
      let success = res['success'];
      let msg = res['message'];
      if (success) {
        let activeOutlet = sessionStorage.getItem('activeOutletId');
        if (activeOutlet !== null || activeOutlet !== undefined) {
          this.isActiveOutlet = true;
          this.tableForm.patchValue({
            outletId: activeOutlet
          });
        }
      }
      else {
        this.alertService.showError(msg);
      }
    });
  }
  getTableTypeDataById() {
    this.ngxLoader.startLoader('loader-01');
    this.posDataService.getTableTypeDataById(this.id).subscribe((res: any) => {
      this.ngxLoader.stopLoader('loader-01');
      this.tableTypeData = res['data'];
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
    this.tableForm.patchValue({
      tableTypeName: this.tableTypeData.tableTypeName,
      description: this.tableTypeData.description,
      outletId: this.tableTypeData.outletId
    });
  }

  closeModal() {
    this.activeModal.close();
  }

  addTableType(data: any) {
    console.log(data)
    if (this.tableForm.invalid) {
      this.alertService.showError("Field should not be empty");
    } else {
      data.ActiveStatus = true;
      this.ngxLoader.startLoader('loader-01');
      this.posDataService.postTableTypeData(data).subscribe((result) => {
        this.ngxLoader.stopLoader('loader-01');
        let status = result['success'];
        if (status) {
          this.alertService.showSuccess("Restaurant Section added successfully");
          this.activeModal.close();
        } else {
          this.alertService.showError(result.message);
          this.activeModal.close();
        }
      });
    }
  }

  updateTableType(data: any) {
    if (this.tableForm.invalid) {
      this.alertService.showError("Field should not be empty");
    } else {
      let editData = {
        tableTypeId: this.id,
        tableTypeName: this.tableForm.get('tableTypeName').value ,
        description: this.tableForm.get('description').value ?? '' ,
        outletId: this.tableForm.get('outletId').value,
        ActiveStatus : this.tableTypeData.activeStatus
      }
      this.ngxLoader.startLoader('loader-01');
      this.posDataService.upDateTableTypeData(this.id, editData).subscribe((res: any) => {
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
