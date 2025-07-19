import { Component, OnInit, ViewChild } from '@angular/core';
import { NgbModal, ModalDismissReasons, NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';
import { AlertService } from '@core/services/common/alert.service';
import { AddItemService } from '../../../../core/services/common/add-item.service';
import { PosDataService } from '@core/services/pos-system/pos-data.service';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { PosEditService } from '@core/services/pos-system/pos-edit.service';
import { NgxUiLoaderService } from 'ngx-ui-loader';
import { Subject } from 'rxjs';
import { DataTableDirective } from 'angular-datatables';
import { CommonService } from '@core/services/common/common.service';
import { ViewAdminTableDetailsComponent } from '../admin-table-details/view-admin-table-details/view-admin-table-details.component';
import { AddPaymentModeComponent } from './add-paymentmode/add-paymentmode.component';

@Component({
  selector: 'app-paymentmode',
  templateUrl: './paymentmode.component.html',
  styleUrls: ['./paymentmode.component.css']
})
export class PaymentModeComponent implements OnInit {
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
  qrCodeUrl: any;
  changedLength(event) {
    this.datatableElement.dtInstance.then((dtInstance: DataTables.Api) => {
      dtInstance.page.len(parseInt(event.target.value)).draw();
    });
  }

  @ViewChild(DataTableDirective, { static: false }) datatableElement: DataTableDirective;
  dtElement: DataTableDirective;
  dtTrigger: Subject<any> = new Subject();
  closeResult: string;
  allPaymentModes: any;
  pager: any = {};
  pageNumber = 1;
  pageSize = 10;
  totalRows: number;
  outletId: any;
  outletName: string;

  constructor(
    private ngxLoader: NgxUiLoaderService,
    private modalService: NgbModal,
    private alertService: AlertService,
    private addItems: AddItemService,
    private posDataService: PosDataService,
    private formBuilder: FormBuilder,
    private activeModal: NgbActiveModal,
    private posEditService: PosEditService,
    public commonService: CommonService
  ) { }

  getPaymentModesByOutlet() {
    this.ngxLoader.startLoader('loader-01');
    this.isDataLoaded = false;
    this.posDataService.GetPaymentModesByOutlet(this.outletId, true).subscribe((res: any) => {
      this.isDataLoaded = true;
      this.ngxLoader.stopLoader('loader-01');
      this.allPaymentModes = res['data'];
      this.dtTrigger.next();
      this.tableListRecord.total = this.allPaymentModes.length;

      let getEditPaymentModeData = JSON.stringify(sessionStorage.getItem("editPaymentMode"));
      if (getEditPaymentModeData != null || getEditPaymentModeData != undefined)
        sessionStorage.removeItem("editPaymentMode");
    });
  }

  ngOnInit(): void {
    this.outletId = sessionStorage.getItem('activeOutletId');
    this.getPaymentModesByOutlet();
  }

  // getRestaurantModalView() {
  //   this.modalService.open(RestaurantSelectionComponent, { backdrop: 'static', size: 'md', keyboard: true, centered: true }).result.then((result) => {
  //     this.closeResult = `Closed with: ${result}`;
  //     if (result) {
  //       this.getOutletModalView();
  //     }
  //   }, (reason) => {
  //     this.closeResult = `Dismissed ${this.getDismissReason(reason)}`;
  //   });
  // }

  closeModal() {
    this.activeModal.close();
  }

  openForm() {
    let getEditPaymentModeData = JSON.stringify(sessionStorage.getItem("editPaymentMode"));
    if (getEditPaymentModeData != null || getEditPaymentModeData != undefined)
      sessionStorage.removeItem("editPaymentMode");
    this.modalService.open(AddPaymentModeComponent, { backdrop: 'static', windowClass: 'main_add_popup', keyboard: true, centered: true }).result.then((result) => {
      this.closeResult = `Closed with: ${result}`;
      this.getPaymentModesByOutlet();
    }, (reason) => {
      this.closeResult = `Dismissed ${this.getDismissReason(reason)}`;
    });
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

  view(id) {
    this.addItems.setIdForTableDetailsView(id);
    this.modalService.open(ViewAdminTableDetailsComponent, { backdrop: 'static', windowClass: 'main_add_popup', keyboard: true, centered: true }).result.then((result) => {
      this.closeResult = `Closed with: ${result}`;
    }, (reason) => {
      this.closeResult = `Dismissed ${this.getDismissReason(reason)}`;
    });
  }

  edit(data) {
    sessionStorage.setItem("editPaymentMode", JSON.stringify(data));
    this.modalService.open(AddPaymentModeComponent, { backdrop: 'static', windowClass: 'main_add_popup', keyboard: true, centered: true }).result.then((result) => {
      this.closeResult = `Closed with: ${result}`;
      if (result) {
        this.getPaymentModesByOutlet();
      }
    }, (reason) => {
      this.closeResult = `Dismissed ${this.getDismissReason(reason)}`;
    });
  }

  onDelete(id) {
    this.ngxLoader.startLoader('loader-01');
    this.posDataService.deletePaymentMode(id).subscribe((res) => {
      this.ngxLoader.stopLoader('loader-01');
      let success = res['success'];
      let msg = res['message'];
      if (success) {
        this.getPaymentModesByOutlet();
        this.alertService.showSuccess('Deleted Successfully');
      }
      else {
        this.alertService.showError(msg);
      }
    });
  }

  changeStatus(id, status) {
    this.posDataService.UpdatePaymentModeStatus(id, !status).subscribe((res: any) => {
      this.ngxLoader.stopLoader('loader-01');
      let status = res['success'];
      let msg = res['message'];
      if (status) {
        this.alertService.showSuccess(msg);
      } else {
        this.alertService.showError(msg);
      }
    });
  }

}
