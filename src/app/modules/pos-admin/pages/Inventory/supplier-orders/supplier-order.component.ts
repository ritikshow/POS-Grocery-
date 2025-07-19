import { Component, OnInit, ViewChild } from '@angular/core';
import { NgbModal, ModalDismissReasons } from '@ng-bootstrap/ng-bootstrap';
import { PosDataService } from '@core/services/pos-system/pos-data.service';
import { DataTableDirective } from 'angular-datatables';
import { Subject } from 'rxjs';
import { AddSupplierOrderComponent } from './add-supplier-order/add-supplier-order.component';
import { OrderViewComponent } from './order-view/order-view.component';
import { GRNComponent } from '../grn/grn.component';
import { AlertService } from '@core/services/common/alert.service';
import { CommonService } from '@core/services/common/common.service';

@Component({
  selector: 'app-supplier-order',
  templateUrl: './supplier-order.component.html',
  styleUrls: ['./supplier-order.component.css']
})
export class SupplierOrderComponent implements OnInit {
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

  closeResult: string;
  allSupplierOrder: any;
  outletId: any;
  outletName: string;
  RestaurantId: string;
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
    this.GetAllSupplierOrder();
  }

  GetAllSupplierOrder() {
    this.dataLoaded = false;
    this.posDataService.GetAllSupplierOrder(this.outletId).subscribe((res: any) => {
      this.allSupplierOrder = res['data'];
      let success = res['success'];
      let msg = res['message'];
      if (success) {
        this.dataLoaded = true;
        this.dtTrigger.next();
        this.tableListRecord.total = this.allSupplierOrder.length;
      }
      else {
        this.dataLoaded = true;
        this.alertService.showError(msg);
      }
    });
  }
  openForm(isnew, Id) {
    sessionStorage.setItem('isNewOrder', isnew);
    if (isnew == 'false') {
      sessionStorage.setItem('editId', Id);
    }
    this.modalService.open(AddSupplierOrderComponent, { backdrop: 'static', windowClass:'main_add_popup', keyboard: true, centered: true }).result.then((result) => {
      this.closeResult = `Closed with: ${result}`;
      if (result) {
        this.GetAllSupplierOrder();
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
  orderDetails(id){
    sessionStorage.setItem("SOrderId",id);
    this.modalService.open(OrderViewComponent, { backdrop: 'static', windowClass:'main_add_popup', keyboard: true, centered: true }).result.then((result) => {
      this.closeResult = `Closed with: ${result}`;
    }, (reason) => {
      this.closeResult = `Dismissed ${this.getDismissReason(reason)}`;
    });
  }
  Delete(Id) {
    this.posDataService.DeleteSupplierOrder(Id).subscribe((res: any) => {
      if (res.success) {
        this.alertService.showSuccess(res.message);
        this.GetAllSupplierOrder();
      } else {
        this.alertService.showError(res.message);
      }
    });
  }

  Confirm(id, status) {
    this.posDataService.ChangeSupplierOrderStatus(id, status,this.outletId).subscribe((res: any) => {
      this.GetAllSupplierOrder();
    });
  }
  GRN(id) {
    sessionStorage.setItem("SOrderId",id);
    this.modalService.open(GRNComponent, { backdrop: 'static', keyboard: true, centered: true, windowClass:'main_add_popup' }).result.then((result) => {
      this.closeResult = `Closed with: ${result}`;
      this.GetAllSupplierOrder();
    }, (reason) => {
      this.closeResult = `Dismissed ${this.getDismissReason(reason)}`;
    });
  }

  Received(id) {
    sessionStorage.setItem("SOrderId",id);
    this.modalService.open(OrderViewComponent, { backdrop: 'static', keyboard: true, centered: true, windowClass:'main_add_popup'}).result.then((result) => {
      this.GetAllSupplierOrder();
      this.closeResult = `Closed with: ${result}`;
    }, (reason) => {
      this.closeResult = `Dismissed ${this.getDismissReason(reason)}`;
    });
  }
}
