import { Component, OnInit, ViewChild } from '@angular/core';
import { AlertService } from '@core/services/common/alert.service';
import { PosDataService } from '@core/services/pos-system/pos-data.service';
import { PosEditService } from '@core/services/pos-system/pos-edit.service';
import { PosViewService } from '@core/services/pos-system/pos-view.service';
import { NgbModal, ModalDismissReasons } from '@ng-bootstrap/ng-bootstrap';
import { NgxUiLoaderService } from 'ngx-ui-loader';
import { TaxFormComponent } from './tax-form/tax-form.component';
import { DataTableDirective } from 'angular-datatables';
import { Subject } from 'rxjs';
import { CommonService } from '@core/services/common/common.service';
@Component({
  selector: 'app-tax',
  templateUrl: './tax.component.html',
  styleUrls: ['./tax.component.css']
})
export class TaxComponent implements OnInit {
  taxData: any;
  isDataLoaded = false;
  tableListRecord: any = [];
  closeResult: string;
  outletId: any;
  outletName: string;
  restaurantId: any;
  resData: any;
  addBtn: boolean;
  showResData: any;
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
    public commonService: CommonService
  ) { }

  ngOnInit(): void {
    this.outletName = sessionStorage.getItem('activeOutletname');
    this.outletId = sessionStorage.getItem('activeOutletId');
    this.getAllTaxData();
    //this.getAllTaxViewData();
  }

  getAllTaxData() {
    this.isDataLoaded = false;
    this.posDataService.getTaxByOutletId(this.outletId,true).subscribe((res: any) => {
      let success = res['success'];
      if(success){
      this.taxData = res['data'];
      this.dtTrigger.next();
      this.tableListRecord.total = this.taxData?.length;
      this.isDataLoaded = true;
      }
    });
  }
  // getAllTaxViewData() {
  //   this.ngxLoader.startLoader('loader-01');
  //   this.posDataService.getAllTaxConditionByOutletId(this.outletId).subscribe((res: any) => {
  //     this.ngxLoader.stopLoader('loader-01');
  //     this.resData = res['data'];
  //     let success = res['success'];
  //     let msg = res['message'];
  //     if (success) {
  //       this.showResData = this.resData;
  //       if (this.showResData.length === 0) {
  //         this.addBtn = false;
  //       }
  //       else {
  //         this.addBtn = true;
  //       }
  //     }
  //     else {
  //       this.alertService.showError(msg);
  //     }
  //   });
  // }
  openForm() {
    this.modalService.open(TaxFormComponent, { backdrop: 'static', windowClass: 'main_add_popup', keyboard: true, centered: true }).result.then((result) => {
      this.closeResult = `Closed with: ${result}`;
      if (result) {
        this.getAllTaxData();
      }
    }, (reason) => {
      this.closeResult = `Dismissed ${this.getDismissReason(reason)}`;
    });
  }

 

  // viewSetupForm() {
  //   this.modalService.open(TaxViewSetupComponent, { backdrop: 'static', windowClass: 'main_add_popup', keyboard: true, centered: true }).result.then((result) => {
  //     this.closeResult = `Closed with: ${result}`;
  //     if (result) {
  //       this.getAllTaxData();
  //     }
  //   }, (reason) => {
  //     this.closeResult = `Dismissed ${this.getDismissReason(reason)}`;
  //   });
  // }
  private getDismissReason(reason: any): string {
    if (reason === ModalDismissReasons.ESC) {
      return 'by pressing ESC';
    } else if (reason === ModalDismissReasons.BACKDROP_CLICK) {
      return 'by clicking on a backdrop';
    } else {
      return `with: ${reason}`;
    }
  }


  edit(id) {
    sessionStorage.setItem('isNewTax', 'false');
      sessionStorage.setItem('editTax', id);
    this.posEditService.setTaxEditId(id);
    this.modalService.open(TaxFormComponent, { backdrop: 'static', windowClass: 'main_add_popup', keyboard: true, centered: true }).result.then((result) => {
      this.closeResult = `Closed with: ${result}`;
      if (result) {
        this.getAllTaxData();
      }
    }, (reason) => {

      this.closeResult = `Dismissed ${this.getDismissReason(reason)}`;
    });
  }

  onDelete(id) {
    this.ngxLoader.startLoader('loader-01');
    this.posDataService.deleteTaxRow(id).subscribe((res) => {
      this.ngxLoader.stopLoader('loader-01');
      console.log(res);
      let success = res['success'];
      let msg = res['message'];
      if (success) {
        this.getAllTaxData();
        this.alertService.showSuccess('Deleted Successfully');
      }
      else {
        this.alertService.showError(msg);
      }
    });
  }

  // updateTaxSetup(data){

  //   sessionStorage.setItem('editTaxSetupData', JSON.stringify(data));
  //   this.modalService.open(TaxViewSetupEditComponent, { backdrop: 'static', windowClass: 'main_add_popup', keyboard: true, centered: true }).result.then((result) => {
  //     this.closeResult = `Closed with: ${result}`;
  //     if (result) {
  //       this.getAllTaxData();
  //     }
  //   }, (reason) => {

  //     this.closeResult = `Dismissed ${this.getDismissReason(reason)}`;
  //   });
  // }
  changeTaxStatus(id,status){
        this.posDataService.changeTaxStatus(id,!status).subscribe((res: any) => {
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
