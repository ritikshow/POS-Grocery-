import { Component, OnInit, ViewChild } from '@angular/core';
import { Router } from '@angular/router';
import { PosSharedService } from '@core/services/common/pos-shared.service';
import { PosDataService } from '@core/services/pos-system/pos-data.service';
import { NgxUiLoaderService } from 'ngx-ui-loader';
import { AlertService } from '@core/services/common/alert.service';
import { NgbModal, ModalDismissReasons } from '@ng-bootstrap/ng-bootstrap';
import { RunningOrderViewModifierComponent } from './running-order-view-modifier/running-order-view-modifier.component';
import { DataTableDirective } from 'angular-datatables';
import { Subject } from 'rxjs';
import { AuthService } from '@core/services/auth/auth.service';
import { first } from 'rxjs/operators';
import { MakePaymentComponent } from '../make-payment/make-payment.component';
import { CommonService } from '@core/services/common/common.service';

@Component({
  selector: 'app-running-order',
  templateUrl: './running-order.component.html',
  styleUrls: ['./running-order.component.css']
})
export class RunningOrderComponent implements OnInit {
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
  userId: any;
  changedLength(event) {
    this.datatableElement.dtInstance.then((dtInstance: DataTables.Api) => {
      dtInstance.page.len(parseInt(event.target.value)).draw();
    });
  }

  @ViewChild(DataTableDirective, { static: false }) datatableElement: DataTableDirective;
  dtElement: DataTableDirective;
  dtTrigger: Subject<any> = new Subject();

  orders = [];
  orderReady = [];
  orderBeing = [];
  finalOrder: any;
  runningOrders: any;
  status: any;
  outletId: any;
  orderType = 'Dine-in'
  outletName: string;
  closeResult: string;
  finalorderFilter = [];
  userData: any;
  isCompanyAdmin: boolean = false;
  voidPassword: any;
  Enteredpassword: any;
  deleteOrder: any;
  indexOfOrder = 0;
  idForVoid: any;
  isCorrectPass = true;

  constructor(
    private alertService: AlertService,
    private posDataService: PosDataService,
    private modalService: NgbModal,
    private posSharedService: PosSharedService,
    private authservice: AuthService,
    private router: Router,
    private ngxLoader: NgxUiLoaderService,
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
    sessionStorage.removeItem('PayNowFromRunning');
    sessionStorage.removeItem('orderId');
    this.outletId = sessionStorage.getItem('activeOutletId');
    this.userData = JSON.parse(sessionStorage.getItem('userCredential'));
    this.userId = this.userData.userId;
    this.voidPassword = this.userData.voidPassword;
    this.isCompanyAdmin = this.userData.roleName == 'Super Admin' ? false : true;
    this.getAllOrders(new Date(new Date().setDate(new Date().getDate() - 7)).toISOString(), new Date().toISOString());
  }

  getAllOrders(StartDate, EndDate) {
    this.orderReady = [];
    this.isDataLoaded = false;
    this.ngxLoader.startLoader("loader-01");
    let jsonData: any = {};
    jsonData.OrderStatus = "Running";
    jsonData.OrderType = this.orderType;
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
        for (let i = 0; i < this.orders.length; i++) {
          if (this.orders[i].orderItemsStatus == 'Ready') {

            //this.orders[i].createdOn = this.orders[i].createdOn.split('T')[0] + ' ' + this.orders[i].createdOn.split('T')[1].substring(0, 5);
            this.orderReady.push(this.orders[i]);
          } else {
            //this.orders[i].createdOn = this.orders[i].createdOn.split('T')[0] + ' ' + this.orders[i].createdOn.split('T')[1].substring(0, 5);
            this.orderBeing.push(this.orders[i]);
          }
        }
        this.finalOrder = this.orderReady.concat(this.orderBeing);
        this.tableListRecord.total = this.finalOrder.length;
        console.log(this.finalOrder);
      }
      else {
        this.isDataLoaded = true;
        this.alertService.showError(msg);
      }
    });
  }
  isOrderCompleted(data: any): boolean {
 
  return data.items?.every((i: any) => i.itemStatus === 'Prepared');
}

  onKeypressEvent(event: any) {
    let searchValue = event.target.value;
    if (searchValue && searchValue.trim() != '') {
      this.finalOrder = this.finalorderFilter.filter((val) => {
        let subtotal; let itemstatus; let tableno; let orderNo;
        ({ subtotal, itemstatus, tableno, orderNo } = this.CheckValidation(val, subtotal, searchValue, itemstatus, tableno, orderNo));
        return (subtotal || itemstatus || tableno || orderNo);
      })
      console.log("cccccc", this.finalOrder)
    } else {
      this.finalOrder = this.finalorderFilter;
    }
  }
  private CheckValidation(val: any, subtotal: any, searchValue: any, itemstatus: any, tableno: any, orderNo: any) {
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

  voidOrder() {
    if (this.Enteredpassword != this.voidPassword) {
      this.isCorrectPass = false;
      this.alertService.showError("Password is Incorrect");
    } else {
      let data = { userId: this.userId, OrderId: this.idForVoid, VoidPassword: this.Enteredpassword };
      this.authservice.checkVoidOrder(this.userId, data).pipe(first()).subscribe(
        response => {
          if (response['success']) {
            this.alertService.showSuccess("Voided Successfully");
            this.finalOrder.splice(this.indexOfOrder, 1);
            this.closeAction();
          } else {
            this.alertService.showError(response['message']);
          }
        }, error => {
          this.alertService.showError(error.message);
        });
    }
  }
  orderDetails(order) {
    order.tableNo = order.items[0].tableNo
    sessionStorage.setItem('selectedTable', JSON.stringify(order));
    // console.log("ID",id)
    sessionStorage.setItem('orderId', order.orderId);
    sessionStorage.setItem('page', 'Running');
    this.router.navigate(['/pos-dashboard/dine-in/order']);
  }

  orderDetailsView(id) {
    this.posSharedService.setOrderDataId(id);
    this.modalService.open(RunningOrderViewModifierComponent, { backdrop: 'static', windowClass: 'main_add_popup', keyboard: true, centered: true }).result.then((result) => {
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

  onDelete(id, i) {
    this.posDataService.deleteRunningOrder(id).subscribe((res) => {
      this.deleteOrder = res['id'];
      let success = res['success'];
      let msg = res['message'];
      if (success) {
        this.alertService.showSuccess('Deleted Successfully');
        this.finalOrder.splice(i, 1);
      }
      else {
        this.alertService.showError(msg);
      }
    });
  }

  async changeItemStatus(id) {
    let itemIds = [];
    let predata = this.orders.filter((res: any) => {
      return res.orderId == id;
    });
    let data = predata[0];
    for (let j = 0; j < data.items.length; j++) {
      if (data.items[j].id) {
        itemIds.push(data.items[j].id);
      }
    }
    console.log(itemIds);

    let status = "Prepared";
    (await this.posDataService.changeMultipleItemStatus(id, itemIds, status)).subscribe((res: any) => {
      let msg = res['message'];
      let success = res['success'];
      if (success) {
        this.alertService.showSuccess(msg);
        this.getAllOrders(new Date(new Date().setDate(new Date().getDate() - 7)).toISOString(), new Date().toISOString());
      } else {
        this.alertService.showError(msg);
      }
    });
  }

  payNow(order, id) {
    sessionStorage.setItem('orderId', id);
    sessionStorage.setItem('page', 'running');
    const makePaymentModalRef = this.modalService.open(MakePaymentComponent, { backdrop: 'static', windowClass: 'main_add_popup', keyboard: true, centered: true });
    makePaymentModalRef.componentInstance.PrimaryOrder = order;

    //Make item tax list
    let itemTaxList = [];
    let itemDiscountList = [];
    for (let i = 0; i < order.items.length; i++) {
      for (let j = 0; j < order.items[i].itemWiseTax.length; j++) {
        itemTaxList.push(order.items[i].itemWiseTax[j]);
      }

      //Make itemDiscountList
      for (let k = 0; k < order.items[i].discount.length; k++) {
        itemTaxList.push(order.items[i].discount[k]);
      }
    }
    makePaymentModalRef.componentInstance.itemTaxList = itemTaxList;
    makePaymentModalRef.componentInstance.itemDiscountList = itemDiscountList;
    //makePaymentModalRef.componentInstance.customerData = this.customerDetails;
  }

  addEvent(content, id, i) {
    this.indexOfOrder = i;
    this.idForVoid = id;
    this.modalService.open(content, { ariaLabelledBy: 'modal-basic-title', keyboard: false, backdrop: 'static', windowClass: 'main_add_popup', }).result.then((result) => {
    }, (reason) => {
      console.log(reason);
    });
  }
  closeAction() {
    if (this.modalService.hasOpenModals) {
      this.modalService.dismissAll();
    }
  }
  Password(event) {
    if (this.voidPassword === null || this.voidPassword == undefined) {
      this.alertService.showError("Please Set your void password first");
    } else {
      this.Enteredpassword = event.target.value;
    }
  }
}
