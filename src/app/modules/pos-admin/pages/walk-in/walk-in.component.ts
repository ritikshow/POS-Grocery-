import { Component, OnInit, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '@core/services/auth/auth.service';
import { AlertService } from '@core/services/common/alert.service';
import { PosSharedService } from '@core/services/common/pos-shared.service';
import { PosDataService } from '@core/services/pos-system/pos-data.service';
import { ModalDismissReasons, NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { DataTableDirective } from 'angular-datatables';
import { NgxUiLoaderService } from 'ngx-ui-loader';
import { Subject } from 'rxjs';
import { first } from 'rxjs/operators';
import { RunningOrderViewModifierComponent } from '../running-order/running-order-view-modifier/running-order-view-modifier.component';
import { CommonService } from '@core/services/common/common.service';
import { PrintVeiwComponent } from '../print-design-veiw/print-veiw/print-veiw.component';

@Component({
  selector: 'app-walk-in',
  templateUrl: './walk-in.component.html',
  styleUrls: ['./walk-in.component.css']
})
export class WalkInComponent implements OnInit {
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
  orderType = "Walk-in";
  orderData: any;
  orderReady = [];
  orderBeing = [];
  finalOrder: any[] = [];
  outletName: string;
  closeResult: string;
  costomerData: any;
  keyword: any;
  searchInputItem: any;
  searchInput: any;
  tempcostomerData: any;
  userData: any;
  isCompanyAdmin: boolean = false;
  voidPassword: any;
  Enteredpassword: any;
  deleteOrder: any;
  indexOfOrder = 0;
  idForVoid: any;
  userId: any;
  isCorrectPass = true;
  showCustomerExport = false;
  customer: Array<{ SrNo: any, customerName: any, phoneNumber: any, address: any }> = [];
  getCustomerDataByEventId: any;

  constructor(
    private ngxLoader: NgxUiLoaderService,
    private router: Router,
    private formBuilder: FormBuilder,
    private alertService: AlertService,
    private posSharedService: PosSharedService,
    private modalService: NgbModal,
    private posDataService: PosDataService,
    private authservice: AuthService,
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
    this.outletId = sessionStorage.getItem('activeOutletId');
    this.customerForm = this.formBuilder.group({
      cusName: [''],
      phone: [''],
      address: ['']
    });
    this.userData = JSON.parse(sessionStorage.getItem('userCredential'));
    this.userId = this.userData.userId;
    this.voidPassword = this.userData.voidPassword;
    this.isCompanyAdmin = this.userData.roleName == 'Company Admin' ? true : false;
    this.viewOrders(new Date(new Date().setDate(new Date().getDate() - 7)).toISOString(), new Date().toISOString());
    let features = JSON.parse(sessionStorage.getItem('RestaurantFeatures'));
    this.showCustomerExport = features?.find(x => x.key == 'exportCustomerData')?.value;
    // if (this.showCustomerExport)
    this.getAllCustomers();


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


  patchCustomerData() {
    this.customerForm.patchValue({
      cusName: this.getCustomerDataByEventId.customerName,
      phone: this.getCustomerDataByEventId.phoneNumber,
      address: this.getCustomerDataByEventId.address
    });
  }

  addCustomer() {

    let data = {
      customerId: '',
      customerName: this.customerForm.get('cusName').value,
      address: this.customerForm.get('address').value,
      phoneNumber: this.customerForm.get('phone').value,
      outletId: this.outletId,
      orderType: this.orderType,
      totalPoints: 0,
      convertedAmount: 0,
    }

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
        data.convertedAmount = this.getCustomerDataByEventId.convertedAmount;
        this.posDataService.updateCustomerDetails(this.getCustomerDataByEventId.customerId, data).subscribe((res: any) => {
          let msg = res['message'];
          let status = res['success'];
          if (status) {
            sessionStorage.setItem('customerData', JSON.stringify(this.getCustomerDataByEventId));
            sessionStorage.setItem('orderType', 'Walk-in');
            sessionStorage.setItem('tableOrder', 'new');
            sessionStorage.setItem('page', 'Walk-in');
            this.router.navigate(['/pos-dashboard/walk-in/order']);
          } else {
            this.alertService.showError(msg);
          }
        });
      } else {

        this.posDataService.postCustomerDetails(data).subscribe((res: any) => {

          let Data = res['data'];
          let msg = res['message'];
          let status = res['success'];
          if (status) {
            //Here we are storing the Add Order Data to the session Storage.
            sessionStorage.setItem('customerData', JSON.stringify(Data));
            this.alertService.showSuccess(msg);
            sessionStorage.setItem('orderType', 'Walk-in');
            sessionStorage.setItem('tableOrder', 'new');
            sessionStorage.setItem('page', 'Walk-in');
            this.router.navigate(['/pos-dashboard/walk-in/order']);
          } else {
            this.alertService.showError(msg);
          }
        });
      }
    } else {
      sessionStorage.setItem('orderType', 'Walk-in');
      sessionStorage.setItem('tableOrder', 'new');
      sessionStorage.setItem('page', 'Walk-in');
      sessionStorage.removeItem("customerData");
      this.router.navigate(['/pos-dashboard/walk-in/order']);
    }
  }

   isOrderCompleted(data: any): boolean {
 
  return data.items?.every((i: any) => i.itemStatus === 'Prepared');
}
  viewOrders(StartDate, EndDate) {
    this.finalOrder = [];
    this.orderData = null;
    ;
    this.isDataLoaded = false;
    let jsonData: any = {};
    jsonData.OrderStatus = "Running";
    jsonData.OrderType = this.orderType;
    jsonData.OutletId = this.outletId;
    jsonData.RestaurantId = null;
    jsonData.Startdate = StartDate;
    jsonData.Enddate = EndDate;
    this.posDataService.getOrdersAllOrdersAboveRestTime(jsonData).subscribe((res: any) => {
      ;
      this.orderData = res['data'];
      this.dtTrigger.next();
      this.finalOrder = [];
      for (let i = 0; i < this.orderData?.length; i++) {
        if (this.orderData[i].orderItemsStatus == 'Ready') {
          this.orderData[i].createdOn = this.orderData[i].createdOn.split('T')[0] + ' ' + this.orderData[i].createdOn.split('T')[1].substring(0, 5);
          this.orderReady.push(this.orderData[i]);
        } else {
          this.orderData[i].createdOn = this.orderData[i].createdOn.split('T')[0] + ' ' + this.orderData[i].createdOn.split('T')[1].substring(0, 5);
          this.orderBeing.push(this.orderData[i]);
        }
      }
      this.finalOrder = this.orderReady.concat(this.orderBeing);
      this.tableListRecord.total = this.finalOrder.length;
      this.isDataLoaded = true;
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

  orderDetails(id: string, isPayNow: boolean) {
    if (isPayNow)
      sessionStorage.setItem('PayNowFromWalkIn', 'payNow');
    sessionStorage.setItem('orderId', id);
    sessionStorage.setItem('page', 'Walk-in');
    this.router.navigate(['/pos-dashboard/walk-in/order']);
  }

  completeOrder() {
    this.router.navigate(['/pos-dashboard/walk-in/completed-order']);
  }

  onDelete(id, i) {
    this.ngxLoader.startLoader('loader-01');
    this.posDataService.deleteRunningOrder(id).subscribe((res) => {
      this.ngxLoader.stopLoader('loader-01');
      console.log(res);
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
        let status = 'Completed'
        this.ngxLoader.startLoader('loader-01');
        this.posDataService.changeOrderStatus(id, status).subscribe((res: any) => {
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

  getAllCustomers() {
    this.ngxLoader.startLoader('loader-01')
    this.posDataService.getAllCustomers(this.outletId, 'Walk-in').subscribe((response) => {
      this.ngxLoader.stopLoader('loader-01');
      console.log("getAllCustomers", response);
      this.tempcostomerData = response['data'];
      this.costomerData = response['data'];
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
        return res.customerName?.toLocaleLowerCase()?.match(input?.toLocaleLowerCase());
      });


    }
  }
  closeAction() {
    if (this.modalService.hasOpenModals) {
      this.modalService.dismissAll();
    }
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
      this.Enteredpassword = event.target.value
    }
  }
  //export customer data
  downloadFile() {
    let i = 1;
    this.costomerData.forEach(e => {
      this.customer.push({
        "SrNo": i,
        "customerName": e.customerName != null ? e.customerName : null,
        "phoneNumber": e.phoneNumber != null ? e.phoneNumber : null,
        "address": e.address != null ? e.address : null,
      });
      i++;
    });

    const replacer = (key, value) => value === null ? '' : value; // specify how you want to handle null values here
    const header = Object.keys(this.customer[0]);
    let csv = this.customer.map(row => header.map(fieldName => JSON.stringify(row[fieldName], replacer)).join(','));
    csv.unshift(header.join(','));
    let csvArray = csv.join('\r\n');
    let blob = new Blob([csvArray], { type: 'text/csv' })
    const a = document.createElement('a');
    const url = window.URL.createObjectURL(blob);
    a.href = url;
    a.download = 'CustomerData.csv';
    a.click();
    window.URL.revokeObjectURL(url);
    a.remove();
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
