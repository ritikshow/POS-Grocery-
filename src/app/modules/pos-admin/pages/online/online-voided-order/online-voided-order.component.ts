import { Component, OnInit, ViewChild } from '@angular/core';
import { NgbModal, ModalDismissReasons } from '@ng-bootstrap/ng-bootstrap';
import { PosSharedService } from '@core/services/common/pos-shared.service';
import { PosDataService } from '@core/services/pos-system/pos-data.service';
import { DataTableDirective } from 'angular-datatables';
import { Subject } from 'rxjs';
import { PrintVeiwComponent } from '../../print-design-veiw/print-veiw/print-veiw.component';
import { CompleteOrderViewComponent } from '../../complete-order/complete-order-view/complete-order-view.component';
import { AlertService } from '@core/services/common/alert.service';
import { CommonService } from '@core/services/common/common.service';

@Component({
  selector: 'app-online-voided-order',
  templateUrl: './online-voided-order.component.html',
  styleUrls: ['./online-voided-order.component.css']
})
export class OnlineVoidedOrderComponent implements OnInit {
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

  orders: any;
  runningOrders: any;
  status: any;
  closeResult: string;
  outletId: any;
  orderType = 'Dine-in'
  count = 0;
  outletName: string;
  RestaurantId: string;
  orderfilter: any;
  constructor(
    private modalService: NgbModal,
    private posDataService: PosDataService,
    private posSharedService: PosSharedService,
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
    let restData = JSON.parse(sessionStorage.getItem('restaurantData'))
    if (sessionStorage.getItem('activeRestaurantId') !== null && sessionStorage.getItem('activeRestaurantId') !== undefined) {
      this.RestaurantId = sessionStorage.getItem('activeRestaurantId');
    } else {
      this.RestaurantId = restData.restaurantId;
    }

    this.outletName = sessionStorage.getItem('activeOutletname');
    this.outletId = sessionStorage.getItem('activeOutletId');
    this.getAllOrders();
  }

  getAllOrders() {
    this.isDataLoaded = false;
    this.posDataService.GetAllVoidedOrder(this.outletId, 'Online').subscribe((res: any) => {
      this.orders = res['data'];
      let success = res['success'];
      let msg = res['message'];
      if (success) {
        this.isDataLoaded = true;
        this.dtTrigger.next();
        this.orders.forEach((order) => {
          this.count += Number(order.total);
          this.tableListRecord.total += 1;
        });
      }
      else {
        this.alertService.showError(msg);
      }
    });
  }

  orderDetails(id) {
    this.posSharedService.setOrderDataId(id);
    this.modalService.open(CompleteOrderViewComponent, { backdrop: 'static', size: 'lg', keyboard: true, centered: true }).result.then((result) => {
      this.closeResult = `Closed with: ${result}`;
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

  print(id) {
    sessionStorage.setItem("orderId", id);
    this.modalService.open(PrintVeiwComponent, { backdrop: 'static', size: 'md', keyboard: true, centered: true }).result.then((result) => {
      this.closeResult = `Closed with: ${result}`;
    }, (reason) => {
      this.closeResult = `Dismissed ${this.getDismissReason(reason)}`;
    });
  }
}
