import { Component, OnInit, ViewChild } from '@angular/core';
import { Router } from '@angular/router';
import { NgbModal, ModalDismissReasons } from '@ng-bootstrap/ng-bootstrap';
import { PosSharedService } from '@core/services/common/pos-shared.service';
import { PosDataService } from '@core/services/pos-system/pos-data.service';
import { CompleteOrderViewComponent } from './complete-order-view/complete-order-view.component';
import { DataTableDirective } from 'angular-datatables';
import { PrintVeiwComponent } from '../print-design-veiw/print-veiw/print-veiw.component';
import { Subject } from 'rxjs';
import { AlertService } from '@core/services/common/alert.service';
import { AuthService } from '@core/services/auth/auth.service';
import { first } from 'rxjs/operators';
import { CommonService } from '@core/services/common/common.service';
// import { EditPaymentComponent } from '../edit-payment/edit-payment.component';

@Component({
  selector: 'app-complete-order',
  templateUrl: './complete-order.component.html',
  styleUrls: ['./complete-order.component.css']
})
export class CompleteOrderComponent implements OnInit {
  tableListRecord: any = [];
  TotalPayableAmount: any;
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
  date: Date;
  data: any;
  userData: any;
  isCompanyAdmin: boolean = false;
  voidPassword: any;
  Enteredpassword: any;
  deleteOrder: any;
  indexOfOrder = 0;
  idForVoid: any;
  isCorrectPass = true;
  userId: any;
  finalOrder: any;
  StartDate : any;
  EndDate : any;
  Currentdate:string='';
  constructor(
    private modalService: NgbModal,
    private posDataService: PosDataService,
    private alertService: AlertService,
    private posSharedService: PosSharedService,
    private router: Router,
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

    this.date = new Date();
    this.date.setDate(this.date.getDate() - 10);
    let restData = JSON.parse(sessionStorage.getItem('restaurantData'));
    if (sessionStorage.getItem('activeRestaurantId') !== null && sessionStorage.getItem('activeRestaurantId') !== undefined) {
      this.RestaurantId = sessionStorage.getItem('activeRestaurantId');
    } else {
      this.RestaurantId = restData.restaurantId;
    }
    this.userData = JSON.parse(sessionStorage.getItem('userCredential'));
    this.userId = this.userData.userId;
    this.voidPassword = this.userData.voidPassword;
    this.isCompanyAdmin = this.userData.roleName == 'Super Admin' ? false : true;
    this.outletName = sessionStorage.getItem('activeOutletname');
    this.outletId = sessionStorage.getItem('activeOutletId');
    this .StartDate = new Date(new Date().setDate(new Date().getDate() - 7)).toISOString().split('T')[0];
    this.EndDate = new Date().toISOString().split('T')[0];
    this.Currentdate = new Date().toISOString().split('T')[0];
    this.getAllOrders(new Date(new Date().setDate(new Date().getDate() - 7)).toISOString(),new Date().toISOString());

  }
  CompareDate(requestDate: Date) {
    let date1 = new Date();
    date1.setDate(date1.getDate() - 1);
    let date = new Date(requestDate);
    if (date >= date1)
      return true;
    else
      return false;
  }

  //start edit payment
  closeAction() {
    if (this.modalService.hasOpenModals) {
      this.modalService.dismissAll();
    }
  }

  // EditPaymentFunc(data) {

  //   //Data will load at first click only
  //   sessionStorage.setItem('orderIdForEditPayment', data.orderId);
  //   this.modalService.open(EditPaymentComponent, { backdrop: 'static', windowClass: 'main_add_popup', keyboard: true, centered: true }).result.then((result) => {
  //     this.closeResult = `Closed with: ${result}`;
  //   }, (reason) => {
  //     this.closeResult = `Dismissed ${this.getDismissReason(reason)}`;
  //   });

  // }

  getAllOrders(startDate, EndDate) {
    this.isDataLoaded = false;
    let jsonData:any={};
    jsonData.OrderStatus = "Completed";
    jsonData.OrderType = this.orderType;
    jsonData.OutletId = this.outletId;
    jsonData.RestaurantId = this.RestaurantId;
    jsonData.Startdate = startDate;
    jsonData.Enddate = EndDate;
    this.posDataService.getOrdersAllOrdersAboveRestTime(jsonData).subscribe((res: any) => {
      this.orders = res['data'];
      this.isDataLoaded = true;
      this.dtTrigger.next();
      // this.orders.forEach((order) => {
      //   if (!this.CompareDate(order.createdOn)) {
      //     //remove order by id
      //     this.orders = this.orders.filter(({ orderId }) => orderId !== order.orderId);
      //   } else {
      //     let indx = this.orders.map(function (x) { return x.orderId; }).indexOf(order.orderId);
      //     this.orders[indx].createdOn = this.orders[indx].createdOn.split('T')[0] + ' ' + this.orders[indx].createdOn.split('T')[1].substring(0, 5);
      //     this.count += Number(order.total);
      //     this.tableListRecord.total += 1;
      //   }
      // });
    });
  }
  hasOverPreparedItems(data: any): boolean {
    return data.items?.some(item => item.preparedQuantity > item.orderQuantity);
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
            this.closeAction();
            this.finalOrder.splice(this.indexOfOrder, 1);
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
    this.modalService.open(CompleteOrderViewComponent, { backdrop: 'static', windowClass: 'main_add_popup', keyboard: true, centered: true }).result.then((result) => {
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

  runningOrder() {
    sessionStorage.setItem('tab', 'Running');
    this.router.navigate(['/pos-dashboard/dine-in/running-order']);
  }

  print(id) {
    sessionStorage.setItem("orderId", id);
    this.modalService.open(PrintVeiwComponent, { backdrop: 'static', windowClass: 'main_add_popup detailed_report_popup', keyboard: true, centered: true }).result.then((result) => {
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
    });
  }

  Password(event) {
    if (this.voidPassword === null || this.voidPassword == undefined) {
      this.alertService.showError("Please Set your void password first");
    } else {
      this.Enteredpassword = event.target.value;
    }
  }
  OnClickFilter(){
    this.getAllOrders(new Date(this.StartDate).toISOString(),new Date(this.EndDate).toISOString())
  }
  OnRefresh(){
    this .StartDate = new Date(new Date().setDate(new Date().getDate() - 7)).toISOString().split('T')[0]
    this.EndDate = new Date().toISOString().split('T')[0]
    this.getAllOrders(new Date(new Date().setDate(new Date().getDate() - 7)).toISOString(),new Date().toISOString());
  }
}
