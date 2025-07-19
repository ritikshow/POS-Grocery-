import { Component, OnInit , ViewChild } from '@angular/core';
import { AlertService } from '@core/services/common/alert.service';
import { PosDataService } from '@core/services/pos-system/pos-data.service';
import { PosEditService } from '@core/services/pos-system/pos-edit.service';
import { PosViewService } from '@core/services/pos-system/pos-view.service';
import { NgbModal, ModalDismissReasons } from '@ng-bootstrap/ng-bootstrap';
import { NgxUiLoaderService } from 'ngx-ui-loader';
import { OutletSelectionComponent } from '../../dines-in/outlet-selection/outlet-selection.component';
import { RestaurantSelectionComponent } from '../../dines-in/restaurant-selection/restaurant-selection.component';
import { TableTypeFormComponent } from './table-type-form/table-type-form.component';
import { TableTypeViewComponent } from './table-type-view/table-type-view.component';
import { DataTableDirective } from 'angular-datatables';
import { Subject } from 'rxjs';
import { CommonService } from '@core/services/common/common.service';
@Component({
  selector: 'app-table-type',
  templateUrl: './table-type.component.html',
  styleUrls: ['./table-type.component.css']
})
export class TableTypeComponent implements OnInit {
  closeResult: string;
  tableTypeData: any;
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
    private posDataService: PosDataService,
    private posViewService: PosViewService,
    private posEditService: PosEditService,
    public commonService: CommonService
  ) { }

  ngOnInit(): void {
    this.outletName = sessionStorage.getItem('activeOutletname');
    this.outletId = sessionStorage.getItem('activeOutletId');
    if (sessionStorage.getItem('Role') == 'Super Admin') {
      if (sessionStorage.getItem('activeRestaurantId') == null || sessionStorage.getItem('activeRestaurantId') == undefined) {
        this.getRestaurantModalView();
      } else {
        if (sessionStorage.getItem('activeOutletId') == null || sessionStorage.getItem('activeOutletId') == undefined) {
          this.getOutletModalView();
        }
      }
    } else {
      if (sessionStorage.getItem('activeOutletId') == null || sessionStorage.getItem('activeOutletId') == undefined) {
        this.getOutletModalView();
      }
    }
    this.getAllTableTypesData();
  }

  getRestaurantModalView() {
    this.modalService.open(RestaurantSelectionComponent, { backdrop: 'static', size: 'md', keyboard: true, centered: true }).result.then((result) => {
      this.closeResult = `Closed with: ${result}`;
      if (result) {
        this.getOutletModalView();
      }
    }, (reason) => {
      this.closeResult = `Dismissed ${this.getDismissReason(reason)}`;
    });
  }

  getOutletModalView() {
    this.modalService.open(OutletSelectionComponent, { backdrop: 'static', size: 'md', keyboard: true, centered: true }).result.then((result) => {
      this.closeResult = `Closed with: ${result}`;
      if (result) {
        this.outletId = sessionStorage.getItem('activeOutletId');
        this.getAllTableTypesData();
      }
    }, (reason) => {
      this.closeResult = `Dismissed ${this.getDismissReason(reason)}`;
    });
  }

  getAllTableTypesData() {
    this.isDataLoaded = false;
    this.ngxLoader.startLoader('loader-01');
    this.posDataService.getTableTypeDataByOutletId(this.outletId,true).subscribe((res: any) => {
      this.ngxLoader.stopLoader('loader-01');
      this.tableTypeData = res['data'];
      let success = res['success'];
      let msg = res['message'];
      if(success){
        this.dtTrigger.next();
        this.tableListRecord.total = this.tableTypeData?.length;
        this.isDataLoaded = true;

      }
      else{
 this.alertService.showError(msg);
      }

    });
  }

  openForm() {
    this.modalService.open(TableTypeFormComponent, { backdrop: 'static', windowClass: 'main_add_popup', keyboard: true, centered: true }).result.then((result) => {
      this.closeResult = `Closed with: ${result}`;

      this.getAllTableTypesData();

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
    this.posViewService.setTableTypeViewId(id);
    this.modalService.open(TableTypeViewComponent, { backdrop: 'static', windowClass: 'main_add_popup',  keyboard: true, centered: true }).result.then((result) => {
      this.closeResult = `Closed with: ${result}`;
    }, (reason) => {
      this.closeResult = `Dismissed ${this.getDismissReason(reason)}`;
    });
  }

  edit(id) {
    sessionStorage.setItem('isNewResturantSection', 'false');
      sessionStorage.setItem('editResturantSection', id);
    this.posEditService.setTableTypeEditId(id);
    this.modalService.open(TableTypeFormComponent, { backdrop: 'static', windowClass: 'main_add_popup',  keyboard: true, centered: true }).result.then((result) => {
      this.closeResult = `Closed with: ${result}`;
      if (result) {
        this.getAllTableTypesData();
      }
    }, (reason) => {

      this.closeResult = `Dismissed ${this.getDismissReason(reason)}`;
    });
  }
  onDelete(id) {
    this.ngxLoader.startLoader('loader-01');
    this.posDataService.deleteTableTypeRow(id).subscribe((res) => {
      this.ngxLoader.stopLoader('loader-01');
      console.log(res);
      let success = res['success'];
      let msg = res['message'];
      if (success) {
        this.getAllTableTypesData();
        this.alertService.showSuccess('Deleted Successfully');
      }
      else {
        this.alertService.showError(msg);
      }
    });
  }
  changeCategoryStatus(id,status){
        this.posDataService.UpdateRestorantSectionStatus(id,!status).subscribe((res: any) => {
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
