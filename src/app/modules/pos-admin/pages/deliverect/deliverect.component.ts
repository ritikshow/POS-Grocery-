import { Component, OnInit, ViewChild } from '@angular/core';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { AlertService } from '@core/services/common/alert.service';
import { PosDataService } from '@core/services/pos-system/pos-data.service';
import { NgbModal, NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';
import { DataTableDirective } from 'angular-datatables';
import { Subject } from 'rxjs';
import { NgxUiLoaderService } from 'ngx-ui-loader';

@Component({
  selector: 'app-deliverect',
  templateUrl: './deliverect.component.html',
  styleUrls: ['./deliverect.component.css']
})
export class DeliverectComponent implements OnInit {
  addDeliverect: any = FormGroup;
  tableListRecord: any = [];
  isDataLoaded = false;

  dtOptions: DataTables.Settings = {
    order: [[1, 'desc']],
    lengthChange: false,
    pageLength: 10,
    infoCallback: (settings: DataTables.SettingsLegacy, start: number, end: number, mnax: number, total: number, pre: string) => {
      this.tableListRecord.total = total;
    }
  };

  changedLength(event) {
    this.datatableElement.dtInstance.then((dtInstance: DataTables.Api) => {
      dtInstance.page.len(parseInt(event.target.value)).draw();
    });
  }

  @ViewChild(DataTableDirective, { static: false }) datatableElement: DataTableDirective;
  dtElement: DataTableDirective;
  dtTrigger: Subject<any> = new Subject();

  customerForm: any = FormGroup;
  viewDiv = true;
  outletId: any;
  closeResult: string;
  orderType = "Online";
  orderStatus = "Running";
  orderData: any;
  orderReady = [];
  orderBeing = [];
  finalOrder: any;
  outletName: string;
  CurrentUser: string;
  CurrentUserRole: string;
  userData: any;
  isCompanyAdmin: boolean = false;
  voidPassword: any;
  Enteredpassword: any;
  deleteOrder: any;
  indexOfOrder = 0;
  idForVoid: any;
  userId: any;
  isCorrectPass = true;
  allItems: any;
  credentialData: any;
  isUpdate = false;

  constructor(
    private ngxLoader: NgxUiLoaderService,
    private formBuilder: FormBuilder,
    private alertService: AlertService,
    private posDataService: PosDataService,
    private modalService: NgbModal,
    private activeModal: NgbActiveModal,

  ) { }

  async ngOnInit() {
    this.dtOptions = {
      order: [[1, 'desc']],
      lengthChange: false,
      pageLength: 10,
      infoCallback: (settings: DataTables.SettingsLegacy, start: number, end: number, mnax: number, total: number, pre: string) => {
        this.tableListRecord.total = total;
      }
    }
    this.outletName = sessionStorage.getItem('activeOutletname');
    sessionStorage.removeItem('orderId');
    sessionStorage.removeItem('tab');
    this.userData = JSON.parse(sessionStorage.getItem('userCredential'));
    this.userId = this.userData.userId;
    this.voidPassword = this.userData.voidPassword;
    this.isCompanyAdmin = this.userData.roleName == 'Company Admin' ? true : false;
    this.outletId = sessionStorage.getItem('activeOutletId');
    this.CurrentUserRole = sessionStorage.getItem('loggedInUserRole');
    await this.getAllitems();

    this.addDeliverect = this.formBuilder.group({
      client_id: ['', Validators.required],
      client_secret: ['', Validators.required],
      locationId: [''],
    });

  }

  async getAllitems() {
    this.isDataLoaded = false;
    this.ngxLoader.startLoader('loader-01');
    let data = { outletId: this.outletId, IsAllItem: true }
    this.posDataService.getAllItemsByOutletId(data).subscribe((res: any) => {
      this.ngxLoader.stopLoader('loader-01');
      this.allItems = res['data'];
      let success = res['success'];
      let msg = res['message'];
      if (success) {
        this.tableListRecord.total = this.allItems.length;
        this.isDataLoaded = true;
      }
      else {
        this.isDataLoaded = true;
        this.alertService.showError(msg);
      }
    });
  }
  getCredentials() {

    this.ngxLoader.startLoader('loader-01');
    this.posDataService.getCredentialsByOutletId(this.outletId).subscribe((res: any) => {
      this.ngxLoader.stopLoader('loader-01');
      let status = res['success'];
      let msg = res['message'];
      if (status) {
        this.isUpdate = true;
        this.credentialData = res['data'];
        this.patchValuesToForm();
      } else {
        this.isUpdate = false;
        this.alertService.showError(msg);
      }
    });


  }
  closeAction() {
    if (this.modalService.hasOpenModals) {
      this.modalService.dismissAll();
    }
  }
  addEvent(content) {
    this.getCredentials();
    this.modalService.open(content, { ariaLabelledBy: 'modal-basic-title', keyboard: false, backdrop: 'static', windowClass: 'add_item_popup' }).result.then((result) => {
    }, (reason) => {
      console.log(reason);
    });
  }
  addCredentials() {
    if (this.addDeliverect.invalid) {
      this.alertService.showError("Field should not be empty");
    }
    let obj = {
      client_id: this.addDeliverect.get('client_id').value,
      client_secret: this.addDeliverect.get('client_secret').value,
      locationId: this.addDeliverect.get('locationId').value,
      outletId: this.outletId
    }
    this.ngxLoader.startLoader('loader-01');
    this.posDataService.InsertCredentials(obj).subscribe((res: any) => {
      this.ngxLoader.stopLoader('loader-01');
      this.credentialData = res['data'];
      let status = res['success'];
      let msg = res['message'];
      if (status) {
        this.activeModal.close(status);
        this.alertService.showSuccess('Credentials added Succesfully');
      } else {
        this.alertService.showError(msg);
      }
    });

  }
  updateCredentials() {
    if (this.addDeliverect.invalid) {
      this.alertService.showError("Field should not be empty");
    }
    let obj = {
      id: this.credentialData.id,
      client_id: this.addDeliverect.get('client_id').value,
      client_secret: this.addDeliverect.get('client_secret').value,
      locationId: this.addDeliverect.get('locationId').value,
      outletId: this.outletId
    }
    this.ngxLoader.startLoader('loader-01');
    this.posDataService.UpdateCredentials(this.credentialData.id, obj).subscribe((res: any) => {
      this.ngxLoader.stopLoader('loader-01');
      let status = res['success'];
      let msg = res['message'];
      if (status) {
        this.activeModal.close(status);
        this.alertService.showSuccess('Credentials updated Succesfully');
      } else {
        this.alertService.showError(msg);
      }
    });
  }

  patchValuesToForm() {
    this.addDeliverect.patchValue({
      client_id: this.credentialData.client_id,
      client_secret: this.credentialData.client_secret,
      locationId: this.credentialData.locationId,
    });
  }
  verifyCredential() {
    this.ngxLoader.startLoader('loader-01');
    this.posDataService.UpdateCredentialsToken(this.credentialData.id).subscribe((res: any) => {
      this.ngxLoader.stopLoader('loader-01');
      let status = res['success'];
      if (status) {
        this.credentialData.isVerified = true;
        this.alertService.showSuccess('Verified');
      } else {
        this.alertService.showError("Not Verified");
      }
    });
  }
}
