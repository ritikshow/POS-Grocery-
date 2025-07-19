import { Component, OnInit, ViewChild } from '@angular/core';
import { AlertService } from '@core/services/common/alert.service';
import { PosSharedService } from '@core/services/common/pos-shared.service';
import { PosDataService } from '@core/services/pos-system/pos-data.service';
import { ModalDismissReasons, NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { DataTableDirective } from 'angular-datatables';
import { NgxUiLoaderService } from 'ngx-ui-loader';
import { Subject } from 'rxjs';
import { CompleteOrderViewComponent } from '../../complete-order/complete-order-view/complete-order-view.component';
import { PrintVeiwComponent } from '../../print-design-veiw/print-veiw/print-veiw.component';
import { CommonService } from '@core/services/common/common.service';

@Component({
  selector: 'app-online-order-history',
  templateUrl: './online-order-history.component.html',
  styleUrls: ['./online-order-history.component.css']
})
export class OnlineOrderHistoryComponent implements OnInit {
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
  count = 0;
  outletName: string;
  finalorderFilter: any;
  constructor(
    private ngxLoader: NgxUiLoaderService,
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
    this.outletName = sessionStorage.getItem('activeOutletname');
    this.outletId = sessionStorage.getItem('activeOutletId');
    this.getAllOrders(new Date(new Date().setDate(new Date().getDate() - 7)).toISOString(),new Date().toISOString());
  }
  CompareDates(requestDate: Date) {
    let date1 = new Date();
    date1.setDate(date1.getDate() - 7);
    let date = new Date(requestDate);
    if (date <= date1)
      return true;
    else
      return false;
  }
  getAllOrders(StartDate, EndDate) {
    let orderType = "Online";
    this.ngxLoader.startLoader('loader-01');
    this.isDataLoaded = false;
    let jsonData:any={};
    jsonData.OrderStatus = "Completed";
    jsonData.OrderType = "Online";
    jsonData.OutletId = this.outletId;
    jsonData.RestaurantId = null;
    jsonData.Startdate = StartDate;
    jsonData.Enddate = EndDate;
    this.posDataService.getOrdersAllOrdersAboveRestTime(jsonData).subscribe((res: any) => {
      this.ngxLoader.stopLoader('loader-01');
      this.orders = res['data'];
      this.finalorderFilter = res['data'];
      let success = res['success'];
      let msg = res['message'];
      if (success) {
        this.isDataLoaded = true;
        this.dtTrigger.next();
        // this.orders.forEach((order) => {
        //   if (!this.CompareDates(order.createdOn)) {
        //     //remove order by id
        //     this.orders = this.orders.filter(({ orderId }) => orderId !== order.orderId);
        //   } else {
        //     let indx = this.orders.map(function (x) { return x.orderId; }).indexOf(order.orderId);
        //     this.orders[indx].createdOn = this.orders[indx].createdOn.split('T')[0] + ' ' + this.orders[indx].createdOn.split('T')[1].substring(0, 5);
        //     this.count += Number(order.total);
        //     this.tableListRecord.total += 1;
        //   }
        // });
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
