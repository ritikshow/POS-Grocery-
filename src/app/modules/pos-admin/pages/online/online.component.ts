import { Component, OnInit, ViewChild } from '@angular/core';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { AlertService } from '@core/services/common/alert.service';
import { PosSharedService } from '@core/services/common/pos-shared.service';
import { PosDataService } from '@core/services/pos-system/pos-data.service';
import { NgbModal, ModalDismissReasons } from '@ng-bootstrap/ng-bootstrap';
import { DataTableDirective } from 'angular-datatables';
import { Subject } from 'rxjs';
import { NgxUiLoaderService } from 'ngx-ui-loader';
import { CompleteOrderViewComponent } from '../complete-order/complete-order-view/complete-order-view.component';
import { AuthService } from '@core/services/auth/auth.service';
import { first } from 'rxjs/operators';
import { PosApiService } from '@core/services/pos-system/pipes/pos-api-service';
import { CommonService } from '@core/services/common/common.service';
import { PrintVeiwComponent } from '../print-design-veiw/print-veiw/print-veiw.component';


@Component({
  selector: 'app-online',
  templateUrl: './online.component.html',
  styleUrls: ['./online.component.css']
})
export class OnlineComponent implements OnInit {
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

  customerForm: any = FormGroup;
  viewDiv = true;
  outletId: any;
  closeResult: string;
  orderType = "Online";
  orderStatus = "Running";
  orderData: any;
  orderReady = [];
  orderBeing = [];
  finalOrder: any;
  outletName: string;
  CurrentUser: string;
  CurrentUserRole: string;
  userData: any;
  isCompanyAdmin: boolean = false;
  voidPassword: any;
  Enteredpassword: any;
  deleteOrder: any;
  indexOfOrder = 0;
  idForVoid: any;
  userId: any;
  isCorrectPass = true;
  isAction = false;
  dataForAction: any;
  isOrderId: any;
  prepareTimings: any;
  searchInputItem: any;
  searchInput: any;
  costomerData: any;
  tempcostomerData: any;
  getCustomerDataByEventId: any;


  constructor(
    private ngxLoader: NgxUiLoaderService,
    private router: Router,
    private formBuilder: FormBuilder,
    private alertService: AlertService,
    private posDataService: PosDataService,
    private modalService: NgbModal,
    private posSharedService: PosSharedService,
    private authservice: AuthService,
    private posApiService: PosApiService,
    public commonService: CommonService

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
    sessionStorage.removeItem('orderId');
    sessionStorage.removeItem('tab');
    this.userData = JSON.parse(sessionStorage.getItem('userCredential'));
    this.userId = this.userData.userId;
    this.voidPassword = this.userData.voidPassword;
    this.isCompanyAdmin = this.userData.roleName == 'Company Admin' ? true : false;
    this.outletId = sessionStorage.getItem('activeOutletId');
    this.CurrentUserRole = sessionStorage.getItem('loggedInUserRole');
    this.customerForm = this.formBuilder.group({
      cusName: [''],
      orderNumber: [''],
      phone: [''],
      address: [''],
      platformName: ['']
    });
    this.viewOrders(new Date(new Date().setDate(new Date().getDate() - 7)).toISOString(), new Date().toISOString());
    this.getAllCustomers();
  }



  addCustomer() {
    if (this.customerForm.invalid) {
      return this.alertService.showError('Field Are Empty');
    }
    let data = this.CreateCustomerObject();

    const cusName = this.customerForm.get('cusName')?.value?.trim();
    const phone = this.customerForm.get('phone')?.value?.trim();

    // If cusName is filled, but phone is empty → block and show toast
    if (cusName && !phone) {
      this.alertService.showWarning("Enter the phone number")
      return;
    }

    function isValid(value) {
      return value !== null && value !== undefined && value !== '';
    }
    if (isValid(data.customerName) && isValid(data.phoneNumber)) {

      if (this.getCustomerDataByEventId != undefined && data.phoneNumber == this.getCustomerDataByEventId.phoneNumber) {
        data.customerId = this.getCustomerDataByEventId.customerId;
        data.totalPoints = this.getCustomerDataByEventId.totalPoints;
        data.tierList = this.getCustomerDataByEventId?.tierList;
        data.totalSpent = this.getCustomerDataByEventId?.totalSpent
        data.convertedAmount = this.getCustomerDataByEventId.convertedAmount;
        this.UpdateCustomerAPICall(data);
      } else {
        this.CreateNewCustomerAPICall(data);
      }
    }
    else {
      sessionStorage.setItem('orderType', 'Online');
      sessionStorage.setItem('tableOrder', 'new');
      sessionStorage.setItem('page', 'Online');
      sessionStorage.removeItem("customerData");
      this.router.navigate(['/pos-dashboard/online/order']);
    }

  }

  private CreateNewCustomerAPICall(data: { customerId: string; customerName: any; channelOrderNo: any; address: any; phoneNumber: any; outletId: any; orderType: string; totalPoints: number; convertedAmount: number; }) {
    this.posDataService.postCustomerDetails(data).subscribe((res: any) => {
      let Data = res['data'];
      let msg = res['message'];
      let status = res['success'];
      if (status) {
        sessionStorage.setItem('customerData', JSON.stringify(Data));
        this.alertService.showSuccess(msg);
        sessionStorage.setItem('orderType', 'Online');
        sessionStorage.setItem('tableOrder', 'new');
        sessionStorage.setItem('page', 'Online');
        this.router.navigate(['/pos-dashboard/online/order']);
      } else {
        this.alertService.showError(msg);
      }
    });
  }

  private UpdateCustomerAPICall(data: { customerId: string; customerName: any; channelOrderNo: any; address: any; phoneNumber: any; outletId: any; orderType: string; totalPoints: number; convertedAmount: number; }) {
    this.posDataService.updateCustomerDetails(this.getCustomerDataByEventId.customerId, data).subscribe((res: any) => {
      let msg = res['message'];
      let status = res['success'];
      if (status) {
        sessionStorage.setItem('customerData', JSON.stringify(this.getCustomerDataByEventId));
        this.alertService.showSuccess(msg);
        sessionStorage.setItem('orderType', 'Online');
        sessionStorage.setItem('tableOrder', 'new');
        sessionStorage.setItem('page', 'Online');
        this.router.navigate(['/pos-dashboard/online/order']);
      } else {
        this.alertService.showError(msg);
      }
    });
  }

  private CreateCustomerObject() {
    return {
      customerId: '',
      customerName: this.customerForm.get('cusName').value,
      platformName: this.customerForm.get('platformName').value,
      channelOrderNo: this.customerForm.get('orderNumber').value,
      address: this.customerForm.get('address').value,
      PlatformName: this.customerForm.get('platformName').value,
      phoneNumber: this.customerForm.get('phone').value,
      outletId: this.outletId,
      orderType: this.orderType,
      totalPoints: 0,
      convertedAmount: 0,
      tierList: {},
      totalSpent: 0
    };
  }

  addOrder() {
    if (sessionStorage.getItem('customerData') !== null && sessionStorage.getItem('customerData') !== undefined) {
      sessionStorage.setItem('orderType', 'Online');
      sessionStorage.setItem('tableOrder', 'new');
      sessionStorage.setItem('page', 'Online');
      this.router.navigate(['/pos-dashboard/online/order']);
    } else {
      this.alertService.showError('First Add Customer Details');
    }
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

  orderDetailss(id) {
    this.posSharedService.setOrderDataId(id);

    sessionStorage.setItem('orderId', id);
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
  patchCustomerData() {
    this.customerForm.patchValue({
      cusName: this.getCustomerDataByEventId.customerName,
      orderNumber: this.getCustomerDataByEventId.channelOrderNo,
      phone: this.getCustomerDataByEventId.phoneNumber,
      address: this.getCustomerDataByEventId.address,
      platformName: this.getCustomerDataByEventId.platformName
    });
  }


  viewOrders(StartDate, EndDate) {
    this.isDataLoaded = false;
    let jsonData: any = {};
    jsonData.OrderStatus = this.orderStatus;
    jsonData.OrderType = this.orderType;
    jsonData.OutletId = this.outletId;
    //jsonData.RestaurantId = this.RestaurantId;
    jsonData.Startdate = StartDate;
    jsonData.Enddate = EndDate;
    this.posDataService.getOrdersAllOrdersAboveRestTime(jsonData).subscribe((res: any) => {
      this.orderData = res['data'];
      let success = res['success'];
      let msg = res['message'];
      if (success) {
        this.orderBeing = [];
        this.orderReady = [];
        this.finalOrder = [];
        this.isDataLoaded = true;
        this.dtTrigger.next();
        for (let i = 0; i < this.orderData.length; i++) {
          if (this.orderData[i].orderItemsStatus == 'Ready') {
            this.orderData[i].createdOn = this.orderData[i].createdOn.split('T')[0] + ' ' + this.orderData[i].createdOn.split('T')[1].substring(0, 5);
            this.orderReady.push(this.orderData[i]);
          } else {
            this.orderData[i].createdOn = this.orderData[i].createdOn.split('T')[0] + ' ' + this.orderData[i].createdOn.split('T')[1].substring(0, 5);
            this.orderBeing.push(this.orderData[i]);
          }
          this.tableListRecord.total += 1;
        }
        this.finalOrder = this.orderReady.concat(this.orderBeing);
      }
      else {
        // this.alertService.showError(msg);
      }
    });
  }

  orderDetails(id: string, isPayNow: boolean) {
    if (isPayNow)
      sessionStorage.setItem('PayNowFromOnline', 'payNow');
    sessionStorage.setItem('orderId', id);
    sessionStorage.setItem('page', 'Online');
    this.router.navigate(['/pos-dashboard/online/order']);
  }

  completeOrder() {
    this.router.navigate(['/pos-dashboard/online/completed-order']);
  }


  onDelete(id) {
    this.ngxLoader.startLoader('loader-01');
    this.posDataService.deleteRunningOrder(id).subscribe((res) => {
      this.ngxLoader.stopLoader('loader-01');
      console.log(res);
      let success = res['success'];
      let msg = res['message'];
      if (success) {
        this.alertService.showSuccess('Deleted Successfully');
        this.viewOrders(new Date(new Date().setDate(new Date().getDate() - 7)).toISOString(), new Date().toISOString());
      }
      else {
        this.alertService.showError(msg);
      }
    });
  }

  async changeItemStatus(id, index) {
    let itemIds = [];
    let predata = this.orderData.filter((res: any) => {
      return res.orderId == id;
    });
    let data = predata[0];
    for (let j = 0; j < data.items.length; j++) {
      if (data.items[j].id) {
        itemIds.push(data.items[j].id);
      }
    }
    let status = "Prepared";
    (await this.posDataService.changeMultipleItemStatus(id, itemIds, status)).subscribe((res: any) => {
      let msg = res['message'];
      let success = res['success'];
      if (success) {
        this.ngxLoader.startLoader('loader-01');
        this.posDataService.changeOrderStatus(id, "Completed").subscribe((res: any) => {
          this.ngxLoader.stopLoader('loader-01');
          let status = res['success'];
          let msg = res['message'];
          if (status) {
            this.alertService.showSuccess('Order Completed');
            this.finalOrder.splice(index, 1);
          } else {
            this.alertService.showError(msg);
          }
        });
      } else {
        this.alertService.showError(msg);
      }
    });
  }

  orderDetailsView(id) {
    this.posSharedService.setOrderDataId(id);
    this.modalService.open(CompleteOrderViewComponent, { backdrop: 'static', windowClass: 'main_add_popup', keyboard: true, centered: true }).result.then((result) => {
      this.closeResult = `Closed with: ${result}`;
    }, (reason) => {
      this.closeResult = `Dismissed ${this.getDismissReason(reason)}`;
    });
  }
  closeAction() {
    if (this.modalService.hasOpenModals) {
      this.modalService.dismissAll();
    }
  }
  RejectOrder(content, id) {
    this.indexOfOrder = this.orderData.map(function (x) { return x.orderId; }).indexOf(id);
    this.idForVoid = id;
    this.modalService.open(content, { ariaLabelledBy: 'modal-basic-title', keyboard: false, backdrop: 'static', windowClass: 'add_item_popup' }).result.then((result) => {
    }, (reason) => {
      console.log(reason);
    });
  }
  addEvent1(content, data) {
    this.dataForAction = data;
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


  async Accept(deliverectOrderId) {
    let indx = this.finalOrder.map(function (x) { return x.orderId; }).indexOf(this.dataForAction.orderId);
    this.isAction = false;
    this.posDataService.UpdateDeliverectOrderStatus(this.finalOrder[indx].orderId, 20).subscribe(async (res: any) => {
      let msgs = res['message'];
      if (res['success']) {
        let itemIds = [];
        itemIds = this.dataForAction.items.map(x => x.id);
        (await this.posDataService.changeMultipleItemStatus(this.finalOrder[indx].orderId, itemIds, "Order")).subscribe((res: any) => {

          let msg = res['message'];
          let success = res['success'];
          if (success) {
            this.finalOrder[indx].orderItemsStatus = 'Being Prepared';
            this.alertService.showSuccess(msg);
            this.closeAction();
          } else {
            this.alertService.showError(msg);
          }
        });
      } else {
        this.alertService.showError(msgs);
      }
    });
  }
  prepareTime(event) {
    this.prepareTimings = event.target.value;
  }
  async saveOrderPreparationTime(deliverectOrderId) {
    if (this.prepareTimings == null || this.prepareTimings == '') {
      this.alertService.showWarning("Please enter timings to prepare an order..!!");
    }
    else {
      let orderPrepareTime = {
        order: deliverectOrderId,
        minutes: this.prepareTimings
      }
      let url = `https://api.staging.deliverect.com/updatePreparationTime`;
      await this.posApiService.postAPICallwithToken(url, orderPrepareTime, null).then(async result => {

      });
    }
  }
  isOrderCompleted(data: any): boolean {
 
  return data.items?.every((i: any) => i.itemStatus === 'Prepared');
}
  getAllCustomers() {
    this.ngxLoader.startLoader('loader-01')
    this.posDataService.getAllCustomers(this.outletId, 'Online').subscribe((response) => {
      this.ngxLoader.stopLoader('loader-01');
      this.tempcostomerData = response['data'];
      this.costomerData = response['data'];
      let success = response['success'];
      let msg = response['message'];
      if (!success) {
        // this.alertService.showError(msg);
      }
    })
  }

  search(): void {

    let input = this.searchInput;
    console.log(input)
    if (input == '') {
      this.costomerData = this.getAllCustomers;
    } else {
      this.costomerData = this.getAllCustomers
    }
  }
  searchItem(): void {
    let input = this.searchInputItem;

    if (input == '') {
      this.costomerData = this.tempcostomerData;
    } else {

      this.costomerData = this.tempcostomerData?.filter((res: any) => {
        return res.customerName.toLocaleLowerCase().match(input.toLocaleLowerCase());
      });


    }
  }
  getCustomer(event): void {
    let custId = event.option.value;
    this.getCustomerDataByEventId = this.tempcostomerData.find(x => x.customerId == custId);
    this.patchCustomerData();
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
