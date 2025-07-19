import { Component, OnInit, ViewChild } from '@angular/core';
import { NgbModal, ModalDismissReasons } from '@ng-bootstrap/ng-bootstrap';
import { PosDataService } from '@core/services/pos-system/pos-data.service';
import { DataTableDirective } from 'angular-datatables';
import { Subject } from 'rxjs';
import { AddSupplierComponent } from './add-supplier/add-supplier.component';
import { AlertService } from '@core/services/common/alert.service';
import { CommonService } from '@core/services/common/common.service';


@Component({
  selector: 'app-supplier',
  templateUrl: './supplier.component.html',
  styleUrls: ['./supplier.component.css']
})
export class SupplierComponent implements OnInit {  
  tableListRecord: any = [];
  dataLoaded = false;

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

  allSupplier: any;
  outletId: any;
  outletName: string;
  RestaurantId: string;
  closeResult: any;
  constructor(
    private modalService: NgbModal,
    private posDataService: PosDataService,
    private alertService: AlertService,
    public commonService : CommonService

  ) { }

  ngOnInit(): void {
    this.dtOptions = {
      order: [[1, 'desc']],
      lengthChange: false,
      pageLength: 10,
      infoCallback: (settings: DataTables.SettingsLegacy, start: number, end: number, mnax: number, total: number, pre: string) => {
        this.tableListRecord.total = total;
      }
    }
    let restData = JSON.parse(sessionStorage.getItem('restaurantData'));
    if (sessionStorage.getItem('activeRestaurantId') !== null && sessionStorage.getItem('activeRestaurantId') !== undefined) {
      this.RestaurantId = sessionStorage.getItem('activeRestaurantId');
    } else {
      this.RestaurantId = restData.restaurantId;
    }
    this.outletName = sessionStorage.getItem('activeOutletname');
    this.outletId = sessionStorage.getItem('activeOutletId');
    this.GetAllSupplier();
  }
  openForm(isnew, Id) {
    sessionStorage.setItem('isNewOrder', isnew);
    if (isnew == 'false') {
      sessionStorage.setItem('editId', Id);
    }
    this.modalService.open(AddSupplierComponent, { backdrop: 'static', keyboard: true, centered: true,windowClass: 'main_add_popup ' }).result.then((result) => {      
      this.closeResult = `Closed with: ${result}`;
      this.GetAllSupplier();
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

  Delete(Id) {
    this.posDataService.DeleteSupplier(Id).subscribe((res: any) => {
      let success = res['success'];
      let msg = res['message'];
      if (success) {
        this.alertService.showSuccess("Successfully Deleted");
        this.GetAllSupplier();
      }
      else {
        this.alertService.showError(msg);
      }
    });
  }
  GetAllSupplier() {
    this.dataLoaded = false;
    this.posDataService.GetAllSupplier(this.outletId).subscribe((res: any) => {
      this.allSupplier = res['data'];
      let success = res['success'];
      let msg = res['message'];
      if (success) {
        sessionStorage.setItem("SupplierList", JSON.stringify(this.allSupplier));
        this.dataLoaded = true;
        this.dtTrigger.next();
        this.tableListRecord.total = this.allSupplier.length;
      }
      else {
        this.dataLoaded = true;
        this.alertService.showError(msg);
      }
    });
  }
}
