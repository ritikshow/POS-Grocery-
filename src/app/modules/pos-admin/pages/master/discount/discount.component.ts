import { Component, OnInit, ViewChild } from '@angular/core';
import { AlertService } from '@core/services/common/alert.service';
import { PosDataService } from '@core/services/pos-system/pos-data.service';
import { PosViewService } from '@core/services/pos-system/pos-view.service';
import { NgbModal, ModalDismissReasons } from '@ng-bootstrap/ng-bootstrap';
import { DiscountFormComponent } from './discount-form/discount-form.component';
import { DiscountViewComponent } from './discount-view/discount-view.component';
import { PosEditService } from '@core/services/pos-system/pos-edit.service';
import { NgxUiLoaderService } from 'ngx-ui-loader';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { DataTableDirective } from 'angular-datatables';
import { Subject } from 'rxjs';
import { CommonService } from '@core/services/common/common.service';
@Component({
  selector: 'app-discount',
  templateUrl: './discount.component.html',
  styleUrls: ['./discount.component.css']
})
export class DiscountComponent implements OnInit {
  discountData: any;
  closeResult: string;
  outletId: any;
  outletName: string;
  discountForm: any = FormGroup;
  id: any;
  isDataLoaded = false;
  tableListRecord: any = [];
  dtOptions: DataTables.Settings = {
    order: [[1, 'desc']],
    lengthChange: false,
    pageLength: 10,
    infoCallback: (settings: DataTables.SettingsLegacy, start: number, end: number, mnax: number, total: number, pre: string) => {
      this.tableListRecord.total = total;
    }
  };
@ViewChild(DataTableDirective, { static: false }) datatableElement: DataTableDirective;
  dtElement: DataTableDirective;
  dtTrigger: Subject<any> = new Subject();
  constructor(
    private ngxLoader: NgxUiLoaderService,
    private modalService: NgbModal,
    private alertService: AlertService,
    private posDataService: PosDataService,
    private posViewService: PosViewService,
    private posEditService: PosEditService,
    public commonService : CommonService
  ) { }


  getAllDiscountData() {
    this.isDataLoaded = false;
    this.ngxLoader.startLoader('loader-01');
    let obj = {
      outletId: this.outletId,
      isAllItem: true,
    }
    this.posDataService.getAllDiscountByOutletId(obj).subscribe((res: any) => {
      this.ngxLoader.stopLoader('loader-01');
      this.discountData = res['data'];
      let success = res['success'];
      let msg = res['message'];
      if (success) {
        this.isDataLoaded = true;
        this.dtTrigger.next();
      this.tableListRecord.total = this.discountData?.length;
      this.isDataLoaded = true;

      }
      else{
        this.alertService.showError(msg);
        this.isDataLoaded = true;
      }
    });
  }

  ngOnInit(): void {
    this.outletName = sessionStorage.getItem('activeOutletname');
    this.outletId = sessionStorage.getItem('activeOutletId');
    this.getAllDiscountData();
  }

  openForm() {
    this.modalService.open(DiscountFormComponent, { backdrop: 'static', windowClass: 'main_add_popup', keyboard: true, centered: true }).result.then((result) => {
      this.closeResult = `Closed with: ${result}`;
      if (result) {
        this.getAllDiscountData();
      }

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
    this.posViewService.setDiscountViewId(id);
    this.modalService.open(DiscountViewComponent, { backdrop: 'static', windowClass: 'main_add_popup', keyboard: true, centered: true }).result.then((result) => {
      this.closeResult = `Closed with: ${result}`;
    }, (reason) => {
      this.closeResult = `Dismissed ${this.getDismissReason(reason)}`;
    });
  }
  edit(id) {
    sessionStorage.setItem('isNewDiscount', 'false');
    sessionStorage.setItem('editDiscount', id);
    this.posEditService.setDiscountEditId(id);
    this.modalService.open(DiscountFormComponent, { backdrop: 'static', windowClass: 'main_add_popup', keyboard: true, centered: true }).result.then((result) => {
      this.closeResult = `Closed with: ${result}`;
      if (result) {
        this.getAllDiscountData();
      }
    }, (reason) => {
      this.closeResult = `Dismissed ${this.getDismissReason(reason)}`;
    });
  }

  onDelete(id) {
    this.ngxLoader.startLoader('loader-01');
    this.posDataService.deleteDiscountRow(id).subscribe((res) => {
      this.ngxLoader.stopLoader('loader-01');
      console.log(res);
      let success = res['success'];
      let msg = res['message'];
      if (success) {
        this.alertService.showSuccess('Deleted Successfully');
        this.getAllDiscountData();
      }
      else {
        this.alertService.showError(msg);
      }
    });
  }

  changeDiscountStatus(id) {
    this.ngxLoader.startLoader('loader-01');
    this.posDataService.getDiscountByID(id).subscribe((res: any) => {
      this.ngxLoader.stopLoader('loader-01');
      let receivedData = res['data'];
      let changeStatusTo = false;
       receivedData.activeStatus = !receivedData.activeStatus;
      if (receivedData.discountId !== undefined) {
        this.ngxLoader.startLoader('loader-01');
        this.posDataService.upDateDiscountData(this.id, receivedData).subscribe((res: any) => {
          this.ngxLoader.stopLoader('loader-01');
          let status = res['success'];
          let msg = res['message'];
          if (status) {
            this.alertService.showSuccess(msg);
          } else {
            this.alertService.showError(msg);
          }
        });
      } else {
        this.alertService.showSuccess("ID not Found");
      }
    });
  }
}
