import { Component, OnInit, ViewChild } from '@angular/core';
import { NgbModal, ModalDismissReasons } from '@ng-bootstrap/ng-bootstrap';
import { PosSharedService } from '@core/services/common/pos-shared.service';
import { PosDataService } from '@core/services/pos-system/pos-data.service';
import { DataTableDirective } from 'angular-datatables';
import { Subject } from 'rxjs';
import { PrintVeiwComponent } from '../print-design-veiw/print-veiw/print-veiw.component';
import { CompleteOrderViewComponent } from '../complete-order/complete-order-view/complete-order-view.component';
import { AlertService } from '@core/services/common/alert.service';
import { CommonService } from '@core/services/common/common.service';
@Component({
  selector: 'app-order-history',
  templateUrl: './order-history.component.html',
  styleUrls: ['./order-history.component.css']
})
export class OrderHistoryComponent implements OnInit {
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
  finalorderFilter: any;
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
    this.getAllOrders(new Date(new Date().setDate(new Date().getDate() - 7)).toISOString(),new Date().toISOString());
  }
  CompareDates(requestDate: Date) {
    let date1 = new Date();
    date1.setDate(date1.getDate() - 7);
    let date = new Date(requestDate);
    let CurrentDate = new Date();
    CurrentDate.setDate(CurrentDate.getDate() -1);
    if (date >= date1 && date <= CurrentDate)
      return true;
    else
      return false;
  }

  getAllOrders(StartDate,EndDate) {
    this.isDataLoaded = false;
    let jsonData:any={};
    jsonData.OrderStatus = "Completed";
    jsonData.OrderType = this.orderType;
    jsonData.OutletId = this.outletId;
    jsonData.RestaurantId = this.RestaurantId;
    jsonData.Startdate = StartDate;
    jsonData.Enddate = EndDate;
    this.posDataService.getOrdersAllOrdersAboveRestTime(jsonData).subscribe((res: any) => {
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
        this.isDataLoaded = true;
        this.alertService.showError(msg);
      }
    });
  }

  orderDetails(id) {
    this.posSharedService.setOrderDataId(id);
    this.modalService.open(CompleteOrderViewComponent, { backdrop: 'static', windowClass:'main_add_popup', keyboard: true, centered: true }).result.then((result) => {
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
  onKeypressEvent(event: any) {
    let searchValue = event.target.value;
    if (searchValue && searchValue.trim() != '') {
      this.orders = this.finalorderFilter.filter((val) => {
        let subtotal; let itemstatus; let tableno; let orderNo;
        ({ subtotal, itemstatus, tableno, orderNo } = this.CheckAllConditions(val, subtotal, searchValue, itemstatus, tableno, orderNo));
        return (subtotal || itemstatus || tableno || orderNo);
      })
    } else {
      this.orders = this.finalorderFilter;
    }
  }

  private CheckAllConditions(val: any, subtotal: any, searchValue: any, itemstatus: any, tableno: any, orderNo: any) {
    if (val.subTotal != null) {
      let subval = val.subTotal;
      subtotal = subval.toString().indexOf(searchValue) > -1;
    }
    if (val.orderItemsStatus != null) {
      itemstatus = val.orderItemsStatus.toLowerCase().indexOf(searchValue.toLowerCase()) > -1;
    }
    if (val.items[0].tableNo != -1) {
      tableno = val.items[0].tableNo.toString().indexOf(searchValue) > -1;
    }
    if (val.orderNo != -1) {
      orderNo = val.orderNo.toString().indexOf(searchValue) > -1;
    }
    return { subtotal, itemstatus, tableno, orderNo };
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
