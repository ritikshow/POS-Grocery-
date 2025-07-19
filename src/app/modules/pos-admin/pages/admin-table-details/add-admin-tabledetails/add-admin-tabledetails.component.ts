import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { AddItemService } from '@core/services/common/add-item.service';
import { AlertService } from '@core/services/common/alert.service';
import { PosDataService } from '@core/services/pos-system/pos-data.service';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';
import { NgxUiLoaderService } from 'ngx-ui-loader';

@Component({
  selector: 'app-add-admin-tabledetails',
  templateUrl: './add-admin-tabledetails.component.html',
  styleUrls: ['./add-admin-tabledetails.component.css']
})
export class AddAdminTabledetailsComponent implements OnInit {

  tableTypes: any;
  tableDetailForm: any = FormGroup;
  tableData: any;
  resId: any;
  resData: any;
  isActiveOutlet = false;
  outletId: any;
  isUpdate = false;
  id: any;
   
  tabledesignList = [
    { format: 'Square' },
    { format: 'Triangle' },
    { format: 'Circle' }
  ]

  constructor(
    private ngxLoader: NgxUiLoaderService,
    private activeModal: NgbActiveModal,
    private formBuilder: FormBuilder,
    private alertService: AlertService,
    private addItems: AddItemService,
    private posDataService: PosDataService,
  ) { }



  ngOnInit(): void {  
    let restData = JSON.parse(sessionStorage.getItem('restaurantData'));
    if (sessionStorage.getItem('activeRestaurantId') !== null && sessionStorage.getItem('activeRestaurantId') !== undefined) {
      this.resId = sessionStorage.getItem('activeRestaurantId');
    } else {
      this.resId = restData.restaurantId;
    }
    this.tableDetailForm = this.formBuilder.group({
      tableNo: ['', Validators.required],      
      pilot: ['', Validators.required],
      capacity: ['', Validators.required],
      tableType: ['', Validators.required],
      outletId: ['', Validators.required],
      restaurantId: [this.resId, Validators.required],
      tableDesign: ['', Validators.required]     
    });
    this.outletId = sessionStorage.getItem('activeOutletId');
    this.getRestaurantById();
    this.getTableTypeData();
    let isNew = sessionStorage.getItem('isNewTable');
    if (isNew == 'false') {
      this.id = sessionStorage.getItem('editTable');
      this.isUpdate = true;
      sessionStorage.removeItem('isNewTable');
      sessionStorage.removeItem('editTable');
      this.getTableMasterDataById();
    }
  }


  getTableTypeData() {
    this.ngxLoader.startLoader('loader-01');
    this.posDataService.getTableTypeDataByOutletId(this.outletId,false).subscribe((res: any) => {
      this.ngxLoader.stopLoader('loader-01');
      this.tableTypes = res['data'];
      let success = res['success'];
      let msg = res['message'];
      if (!success) {        
        this.alertService.showError(msg);
      }
    });
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
          this.tableDetailForm.patchValue({
            outletId: activeOutlet
          });
        }
      } else {
        this.alertService.showError(msg);
      }
    });
  }

  closeModal() {   
    this.activeModal.close();
  }
  getTableMasterDataById() {
    this.ngxLoader.startLoader('loader-01');
    this.posDataService.getTableMasterById(this.id).subscribe((res: any) => {
      this.ngxLoader.stopLoader('loader-01');
      this.tableData = res['data'];
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

  addTableDetailsFormData(data: any) {   
    if (this.tableDetailForm.invalid) {
      this.alertService.showError("Field should not be empty");
    }
    else {
      data.ActiveStatus = true;
      this.addItems.addTableDetailsData(data).subscribe((result) => {     
        if (result.success) {
          this.alertService.showSuccess("Table added successfully");
          this.activeModal.close();
        } else {
          this.alertService.showError(result.message);
          this.activeModal.close();
        }
      });
    }
  }
  patchValuesToForm() {
    this.tableDetailForm.patchValue({
      tableNo: this.tableData.tableNo,
      pilot: this.tableData.pilot,
      capacity: this.tableData.capacity,
      tableType: this.tableData.tableType,
      restaurantId: this.tableData.restaurantId,
      outletId: this.tableData.outletId,
      tableDesign: this.tableData.tableDesign
    });
  }

  updateTableDetailsFormData(data: any) {   
    if (this.tableDetailForm.invalid) {
      this.alertService.showError("Field should not be empty");
    } else {
      let editData = this.tableData;
          editData.tableNo = this.tableDetailForm.get('tableNo').value;
          editData.pilot= this.tableDetailForm.get('pilot').value;
          editData.capacity= this.tableDetailForm.get('capacity').value;
          editData.tableType= this.tableDetailForm.get('tableType').value;
          editData.restaurantId= this.tableDetailForm.get('restaurantId').value;
          editData.outletId= this.tableDetailForm.get('outletId').value;
          editData.tableDesign= this.tableDetailForm.get('tableDesign').value;
          //editData.ActiveStatus=this.tableData.activeStatus;
      // let editData = {
      //   tableId: this.id,
      //   tableNo: this.tableDetailForm.get('tableNo').value,
      //   pilot: this.tableDetailForm.get('pilot').value,
      //   capacity: this.tableDetailForm.get('capacity').value,
      //   tableType: this.tableDetailForm.get('tableType').value,
      //   restaurantId: this.tableDetailForm.get('restaurantId').value,
      //   outletId: this.tableDetailForm.get('outletId').value,
      //   tableDesign: this.tableDetailForm.get('tableDesign').value,
      //   ActiveStatus:this.tableData.activeStatus,
      //   TableStatus : this.tableData.tableStatus,
      //   orderId : this.tableData.orderId,
      //   x : this.tableData.x,
      //   y : this.tableData.y,
      //   pageY:this.tableData.y
      // }
      this.ngxLoader.startLoader('loader-01');
      this.posDataService.upDateTableMasterData(this.id, editData).subscribe((res: any) => {
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
