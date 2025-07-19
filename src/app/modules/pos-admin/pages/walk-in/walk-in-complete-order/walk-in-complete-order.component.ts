import { Component, OnInit, ViewChild } from '@angular/core';
import { Router } from '@angular/router';
import { PosSharedService } from '@core/services/common/pos-shared.service';
import { PosDataService } from '@core/services/pos-system/pos-data.service';
import { PosDataShareService } from '@core/services/pos-system/posDataShare.service';
import { NgbModal, ModalDismissReasons } from '@ng-bootstrap/ng-bootstrap';
import { NgxUiLoaderService } from 'ngx-ui-loader';
import { CompleteOrderViewComponent } from '../../complete-order/complete-order-view/complete-order-view.component';
import { DataTableDirective } from 'angular-datatables';
import { Subject } from 'rxjs';
import { PrintVeiwComponent } from '../../print-design-veiw/print-veiw/print-veiw.component';
import { AlertService } from '@core/services/common/alert.service';
import { AuthService } from '@core/services/auth/auth.service';
import { first } from 'rxjs/operators';
import { CommonService } from '@core/services/common/common.service';
// import { EditPaymentComponent } from '../../edit-payment/edit-payment.component';

@Component({
  selector: 'app-walk-in-complete-order',
  templateUrl: './walk-in-complete-order.component.html',
  styleUrls: ['./walk-in-complete-order.component.css']
})
export class WalkInCompleteOrderComponent implements OnInit {
  tableListRecord: any = [];
  isDataLoaded = false;
  userData: any;
  isCompanyAdmin: boolean = false;
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
  count = 0;
  closeResult: string;
  outletId: any;
  outletName: string;
  cardDetails = false;
  cashDetails = false;
  invoiceData: any;
  totalReceived = 0;
  singleData: any;
  TotalPayableAmount: any;
  voidPassword: any;
  Enteredpassword: any;
  deleteOrder: any;
  indexOfOrder = 0;
  idForVoid: any;
  isCorrectPass = true;
  userId: any;
  finalOrder: any;
  isOther: any;
  StartDate: any;
  EndDate: any;
  Currentdate: string = '';

  constructor(
    private ngxLoader: NgxUiLoaderService,
    private modalService: NgbModal,
    private posDataService: PosDataService,
    private posSharedService: PosSharedService,
    private router: Router,
    private alertService: AlertService,
    private posDataSharedService: PosDataShareService,
    private authservice: AuthService,
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

    this.userData = JSON.parse(sessionStorage.getItem('userCredential'));
    this.userId = this.userData.userId;
    this.voidPassword = this.userData.voidPassword;
    this.isCompanyAdmin = this.userData.roleName == 'Super Admin' ? false : true;
    this.outletId = sessionStorage.getItem('activeOutletId');
    this.StartDate = new Date(new Date().setDate(new Date().getDate() - 7)).toISOString().split('T')[0];
    this.EndDate = new Date().toISOString().split('T')[0];
    this.Currentdate = new Date().toISOString().split('T')[0];
    this.getAllOrders(new Date(new Date().setDate(new Date().getDate() - 7)).toISOString(), new Date().toISOString());
  }
  CompareDate(requestDate: Date) {
    let date1 = new Date();
    date1.setDate(date1.getDate() - 7);
    let date = new Date(requestDate);
    if (date >= date1)
      return true;
    else
      return false;
  }

  closeAction() {
    if (this.modalService.hasOpenModals) {
      this.modalService.dismissAll();
    }
  }


  // EditPaymentFunc(data) {


  //   sessionStorage.setItem('orderIdForEditPayment', data.orderId);
  //   this.modalService.open(EditPaymentComponent, { backdrop: 'static', size: 'lg', keyboard: true, centered: true }).result.then((result) => {
  //     this.closeResult = `Closed with: ${result}`;
  //   }, (reason) => {
  //     this.closeResult = `Dismissed ${this.getDismissReason(reason)}`;
  //   });

  // }


  getAllOrders(StartDate, EndDate) {
    this.outletName = sessionStorage.getItem('activeOutletname');
    this.ngxLoader.startLoader('loader-01')
    //let orderType = "Walk-in";
    this.isDataLoaded = false;
    let jsonData: any = {};
    jsonData.OrderStatus = "Completed";
    jsonData.OrderType = "Walk-in";
    jsonData.OutletId = this.outletId;
    jsonData.RestaurantId = null;
    jsonData.Startdate = StartDate;
    jsonData.Enddate = EndDate;
    this.posDataService.getOrdersAllOrdersAboveRestTime(jsonData).subscribe((res: any) => {

      this.ngxLoader.stopLoader('loader-01');
      this.orders = res['data'];
      this.dtTrigger.next();
      // this.orders.forEach((order) => {
      //   if (!this.CompareDate(order.createdOn)) {

      //     this.orders = this.orders.filter(({ orderId }) => orderId !== order.orderId);
      //   } else {
      //     let indx = this.orders.map(function (x) { return x.orderId; }).indexOf(order.orderId);
      //     this.orders[indx].createdOn = this.orders[indx].createdOn.split('T')[0] + ' ' + this.orders[indx].createdOn.split('T')[1].substring(0, 5);
      //     this.count += Number(order.total);
      //     this.tableListRecord.total += 1;
      //   }
      // });
      this.tableListRecord.total = this.orders.length;
      this.isDataLoaded = true;
    });
  }
  RepeatOrderfun(orderId) {
    this.ngxLoader.startLoader('loader-01');
    this.posDataService.repeatOrder(orderId).subscribe((res: any) => {
      this.ngxLoader.stopLoader('loader-01');
      let status = res['success'];
      let data = res['data'];
      let msg = res['message'];
      if (status) {
        this.alertService.showSuccess(msg);
        sessionStorage.setItem('orderId', data.orderId);
        sessionStorage.setItem('page', 'Walk-in');
        this.router.navigate(['/pos-dashboard/walk-in/order']);
      } else {
        this.alertService.showError(msg);
      }
    });
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
    this.modalService.open(PrintVeiwComponent, { backdrop: 'static', windowClass: 'detailed_report_popup main_add_popup', keyboard: true, centered: true }).result.then((result) => {
      this.closeResult = `Closed with: ${result}`;
    }, (reason) => {
      this.closeResult = `Dismissed ${this.getDismissReason(reason)}`;
    });
  }

  addEvent(content, id, i) {
    this.indexOfOrder = i;
    this.idForVoid = id;
    this.modalService.open(content, { ariaLabelledBy: 'modal-basic-title', keyboard: false, backdrop: 'static', windowClass: 'add_item_popup' }).result.then((result) => {
    }, (reason) => {
      console.log(reason);
    });
  }

  Password(event) {
    if (this.voidPassword === null || this.voidPassword == undefined) {
      this.alertService.showError("Please Set your void password first");
    } else {
      this.Enteredpassword = event.target.value;
    }
  }
  OnClickFilter() {
    this.getAllOrders(new Date(this.StartDate).toISOString(), new Date(this.EndDate).toISOString())
  }
  OnRefresh() {
    this.StartDate = new Date(new Date().setDate(new Date().getDate() - 7)).toISOString().split('T')[0]
    this.EndDate = new Date().toISOString().split('T')[0]
    this.getAllOrders(new Date(new Date().setDate(new Date().getDate() - 7)).toISOString(), new Date().toISOString());
  }
}
