import { Component, Input, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { AlertService } from '@core/services/common/alert.service';
import { PosDataService } from '@core/services/pos-system/pos-data.service';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';
import { NgxUiLoaderService } from 'ngx-ui-loader';

@Component({
  selector: 'app-add-supplier',
  templateUrl: './add-supplier.component.html',
  styleUrls: ['./add-supplier.component.css']
})
export class AddSupplierComponent implements OnInit {
  addSupplierForm: any = FormGroup;
  editMod = false;
  id: any;
  outletId: any;
  AmountVisible = false;
  isNew: any;
  supplierData: any;
  WPSupplierData: any;
  countOnly = 0;
  keyWord: any;
  page = 1;
  userData: any;
  auth: any;
  SupplierList: any;
  constructor(
    private ngxLoader: NgxUiLoaderService,
    private activeModal: NgbActiveModal,
    private formBuilder: FormBuilder,
    private alertService: AlertService,
    private posDataService: PosDataService,
  ) { }

  ngOnInit(): void {

    this.SupplierList = JSON.parse(sessionStorage.getItem("SupplierList"));
    this.isNew = sessionStorage.getItem('isNewOrder');
    if (this.isNew == 'false') {
      this.id = sessionStorage.getItem('editId');
      this.getSupplierById();
      this.editMod = true;
    }
    this.userData = JSON.parse(sessionStorage.getItem('userCredential'));
    this.auth = btoa(btoa("WatermelonPOSOrder") + btoa(this.userData.emailId));
    this.outletId = sessionStorage.getItem('activeOutletId');
    this.addSupplierForm = this.formBuilder.group({
      supplierName: ['', Validators.required],
      address: ['', Validators.required],
      contactNumber: ['', Validators.required],
    });
  }
  search() {
    let obj = {
      page: this.page,
      keyword: this.keyWord,
    }
    this.ngxLoader.startLoader('loader-01');
    this.posDataService.getWBSupplierByKeyword(obj, this.auth).subscribe((res: any) => {
      this.ngxLoader.stopLoader('loader-01');
      this.WPSupplierData = res['data'];
      let success = res['success'];
      let msg = res['message'];
      if (success) {
        //Check if supplier is already exists or not to block the ADD button
        for (let i = 0; i < this.WPSupplierData.length; i++) {

          //unblock Add button by default
          this.WPSupplierData[i].isBlock = false;
          if (this.SupplierList.some(el => el.wMsupplierId == this.WPSupplierData[i]._id)) {
            this.WPSupplierData[i].isBlock = true;
          }
        }
        this.countOnly = this.WPSupplierData.length;
      }
      else {
        this.alertService.showError(msg);
      }
    });
    this.page++;
  }
  previous() {
    this.page -= 2;
    let obj = {
      page: this.page,
      keyWord: this.keyWord,
    }
    this.ngxLoader.startLoader('loader-01');
    this.posDataService.getWBSupplierByKeyword(obj, this.auth).subscribe((res: any) => {
      this.ngxLoader.stopLoader('loader-01');
      this.WPSupplierData = res['data'];
      let success = res['success'];
      let msg = res['message'];
      if (!success) {
        this.alertService.showError(msg);
      }else{
        //Check if supplier is already exists or not to block the ADD button
        for (let i = 0; i < this.WPSupplierData.length; i++) {

          //unblock Add button by default
          this.WPSupplierData[i].isBlock = false;
          if (this.SupplierList.some(el => el.wMsupplierId == this.WPSupplierData[i]._id)) {
            this.WPSupplierData[i].isBlock = true;
          }
        }
      }
    });
    this.page++;
  }
  GetVal(event: any) {
    this.keyWord = event.target.value;
  }
  getSupplierById() {
    this.ngxLoader.startLoader('loader-01');
    this.posDataService.GetSupplierById(this.id).subscribe((res: any) => {
      this.ngxLoader.stopLoader('loader-01');
      this.supplierData = res['data'];
      let success = res['success'];
      let msg = res['message'];
      if (success) {
        this.patchValuesToForm();
        this.AmountVisible = true;
      }
      else {
        this.alertService.showError(msg);
      }
    });
  }

  patchValuesToForm() {

    this.addSupplierForm.patchValue({
      supplierName: this.supplierData.supplierName,
      address: this.supplierData.address,
      contactNumber: this.supplierData.contactNumber,
    });
  }

  closeModal() {
    this.activeModal.close(0);
  }
  Add(id, indx) {
    let WMSupplier = this.WPSupplierData.find(x => x._id == id);
    let obj = {
      supplierName: WMSupplier.company_name,
      WMSupplierId: id,
      isOffline: WMSupplier.is_offline,
      address: WMSupplier.address,
      contactNumber: WMSupplier.mobile_no,
      OutletId: this.outletId,
    }
    this.ngxLoader.startLoader('loader-01');
    this.posDataService.InsertSupplier(obj).subscribe((res: any) => {
      this.ngxLoader.stopLoader('loader-01');
      let status = res['success'];
      let msg = res['message'];
      if (status) {
        //Make Add button block.
        this.WPSupplierData[indx].isBlock = true;
        this.alertService.showSuccess('Supplier added succesfully');
      } else {
        this.alertService.showError(msg);
      }
    });
  }
  addSupplierOrder() {
    let obj;
    if (this.addSupplierForm.invalid) {
      this.alertService.showWarning("Fields are empty");
    } else if (sessionStorage.getItem('isNewOrder') !== 'true') {
      obj = {
        supplierName: this.addSupplierForm.get('supplierName').value,
        address: this.addSupplierForm.get('address').value,
        contactNumber: this.addSupplierForm.get('contactNumber').value,
        OutletId: this.outletId,
      }
      this.ngxLoader.startLoader('loader-01');
      this.posDataService.UpdateSupplier(this.id, obj).subscribe((res: any) => {
        this.ngxLoader.stopLoader('loader-01');
        let status = res['success'];
        let msg = res['message'];
        if (status) {
          sessionStorage.removeItem('editId');
          this.activeModal.close(status);
          this.alertService.showSuccess(msg);
        } else {
          this.alertService.showError(msg);
        }
      });
    } else {
      obj = {
        supplierName: this.addSupplierForm.get('supplierName').value,
        address: this.addSupplierForm.get('address').value,
        contactNumber: this.addSupplierForm.get('contactNumber').value,
        OutletId: this.outletId,
        isOffline: true //If manually added the supplier.
      }
      this.ngxLoader.startLoader('loader-01');
      this.posDataService.InsertSupplier(obj).subscribe((res: any) => {
        this.ngxLoader.stopLoader('loader-01');
        let status = res['success'];
        let msg = res['message'];
        if (status) {
          sessionStorage.removeItem('isNewOrder');
          this.activeModal.close(status);
          this.alertService.showSuccess('Supplier added succesfully');
        } else {
          this.alertService.showError(msg);
        }
      });
    }
  }
}
