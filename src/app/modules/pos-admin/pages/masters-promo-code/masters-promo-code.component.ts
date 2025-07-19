import { Component, OnInit,ViewChild } from '@angular/core';
import { NgbModal, ModalDismissReasons } from '@ng-bootstrap/ng-bootstrap';
import { AlertService } from '@core/services/common/alert.service';
import { AddItemService } from '../../../../core/services/common/add-item.service';
import { PosEditService } from '@core/services/pos-system/pos-edit.service';
import { PosDataService } from '@core/services/pos-system/pos-data.service';
import { AddMasterPromoCodeComponent } from './add-master-promo-code/add-master-promo-code.component';
import { ViewMastersPromoCodeComponent } from './view-masters-promo-code/view-masters-promo-code.component';
import { NgxUiLoaderService } from 'ngx-ui-loader';
import { DataTableDirective } from 'angular-datatables';
import { Subject } from 'rxjs';
import { CommonService } from '@core/services/common/common.service';
@Component({
  selector: 'app-masters-promo-code',
  templateUrl: './masters-promo-code.component.html',
  styleUrls: ['./masters-promo-code.component.css']
})
export class MastersPromoCodeComponent implements OnInit {

  closeResult: string;

  users: any;
  allItems: any;
  promocodeData: any;
  outletId: any;
  outletName: string;
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
    private addItems: AddItemService,
    private posEditService: PosEditService,
    private posDataService: PosDataService,
    public commonService : CommonService
  ) { }

  addPromocodeFormData(data: any) {
    console.log(data)
    this.addItems.addPromoCodeData(data).subscribe((result) => {
      console.log(result)
      this.getLatestMastersPromocode();
    })

  }

  getLatestMastersPromocode() {
    this.isDataLoaded = false;
    this.ngxLoader.startLoader('loader-01');
     let jsonData : any={};
    jsonData.outletId = sessionStorage.getItem('activeOutletId');
    jsonData.isAllItem = true;
    this.posDataService.getAllPromocodeByOutletId(jsonData).subscribe((response) => {
      this.ngxLoader.stopLoader('loader-01');
      console.log(response);
      this.promocodeData = response['data'];
      let success = response['success'];
      let msg = response['message'];
      if (success) {
        this.dtTrigger.next();
      this.tableListRecord.total = this.promocodeData?.length;
      this.isDataLoaded = true;
      }
      else{
        this.alertService.showError(msg);
        this.isDataLoaded = true;
      }
    })
  }

  ngOnInit(): void {
    this.outletName = sessionStorage.getItem('activeOutletname');
    this.outletId = sessionStorage.getItem('activeOutletId');
    this.getLatestMastersPromocode();
  }

  openForm() {
    this.modalService.open(AddMasterPromoCodeComponent, { backdrop: 'static', windowClass: 'main_add_popup', keyboard: true, centered: true }).result.then((result) => {
      this.closeResult = `Closed with: ${result}`;
      if (result) {
        this.getLatestMastersPromocode();
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
    this.addItems.setPromocodeViewId(id);
    this.modalService.open(ViewMastersPromoCodeComponent, { backdrop: 'static', windowClass: 'main_add_popup', keyboard: true, centered: true }).result.then((result) => {
      this.closeResult = `Closed with: ${result}`;
    }, (reason) => {

      this.closeResult = `Dismissed ${this.getDismissReason(reason)}`;
    });
  }

  edit(id) {
    sessionStorage.setItem('isNewPromoCode', 'false');
    sessionStorage.setItem('editPromoCode', id);
    this.posEditService.setPromocodeEditId(id);
    this.modalService.open(AddMasterPromoCodeComponent, { backdrop: 'static', windowClass: 'main_add_popup', keyboard: true, centered: true }).result.then((result) => {
      this.closeResult = `Closed with: ${result}`;
      if (result) {
        this.getLatestMastersPromocode();
      }
    }, (reason) => {

      this.closeResult = `Dismissed ${this.getDismissReason(reason)}`;
    });
  }
  onDelete(id) {
    this.ngxLoader.startLoader('loader-01');
    this.posDataService.deleteMasterPomoCodeRow(id).subscribe((res) => {
      this.ngxLoader.stopLoader('loader-01');
      console.log(res);
      let success = res['success'];
      let msg = res['message'];
      if (success) {
        this.getLatestMastersPromocode();
        this.alertService.showSuccess('Deleted Successfully');
      }
      else {
        this.alertService.showError(msg);
      }
    });
  }
  changePromoCodeStatus(id,status){
    let jsonData : any={};
    jsonData.PromocodeId = id;
    jsonData.ActiveStatus = !status

        this.posDataService.changePromoCodeStatus(id,!status).subscribe((res: any) => {
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
