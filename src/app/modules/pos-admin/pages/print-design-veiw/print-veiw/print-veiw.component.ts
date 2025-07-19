import { DatePipe } from '@angular/common';
import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { CommonService } from '@core/services/common/common.service';
import { PosDataService } from '@core/services/pos-system/pos-data.service';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';
import { NgxUiLoaderService } from 'ngx-ui-loader';

@Component({
  selector: 'app-print-veiw',
  templateUrl: './print-veiw.component.html',
  styleUrls: ['./print-veiw.component.css']
})
export class PrintVeiwComponent implements OnInit {
  @ViewChild("printfunc") printfunc!: ElementRef;
  orderId: any;
  orderData: any;
  designData: any;
  invoiceData: any;
  cols = 1;
  date: any;
  time: any;
  outletId: any;
  calPercentage: any;
  menuItemList = [];
  isSubtract: any;
  subTotalTax = 0;
  ReturnAmount: any;
  discount = 0;
  currentTime: any;
  OrderDiscount: any;

  constructor(
    private activeModal: NgbActiveModal,
    private posDataService: PosDataService,
    private datePipe: DatePipe,
    public commonService: CommonService,
  ) {
  }

  ngOnInit(): void {
    this.orderId = sessionStorage.getItem('orderId');
    this.isSubtract = sessionStorage.getItem('isSubtracted' + this.orderId);
    this.outletId = sessionStorage.getItem('activeOutletId');
    this.getPrintDesignData();
    //this.getCurrentTime();
  }

  // async getCurrentTime() {
  //   let restaurantId = sessionStorage.getItem('activeRestaurantId');

  //   this.posDataService.getRestaurantCurrentTime(restaurantId).subscribe((res: any) => {

  //     let timeData = res.currentTime;
  //     let splitedDateTime = timeData.split(' ');
  //     this.date = splitedDateTime[0];
  //     this.currentTime = splitedDateTime[1];
  //   });
  // }

  FilterDate(printDate) {
    printDate = printDate?.slice(0, 10);
    return this.datePipe.transform(printDate, 'dd-MM-yyyy');
  }

  vatPercentage() {
    if (this.isSubtract !== "true") {
      this.calPercentage = (Number(this.invoiceData?.isItemIncludeTaxPercentage) / 100 * Number(this.invoiceData?.subTotal)).toFixed(2);
    } else {
      this.calPercentage = (Number(this.invoiceData?.isItemIncludeTaxPercentage) / 100 * Number(this.orderData?.subTotal)).toFixed(2);
      this.subTotalTax = this.orderData.subTotal - this.calPercentage;
    }
  }

  getPrintDesignData() {
    this.posDataService.getInvoicePrintDesignDataByOutlet(this.outletId).subscribe((res: any) => {
      let data = res['data'];
      console.log("data = ", data);
      console.log("res['data'] = ", res['data']);
      for (let i = 0; i < data.length; i++) {
        if (data[i].activeStatus) {
          this.designData = data[i];
        }
      }
      console.log("designData = ", this.designData);
      if (this.designData.printItemHeaderSettings.discount !== "") {
        this.cols = 2;
      } else {
        this.cols = 1;
      }
      this.getOrderDataById();
    });
  }

  getOrderDataById() {
    this.posDataService.getOrderById(this.orderId).subscribe((res: any) => {
      this.orderData = res['data'];
      this.subTotalTax = this.orderData?.subTotal
      let list = [];
      this.OrderDiscount = this.orderData?.orderDiscounts?.reduce((sum, item) => sum + item.discountedAmount, 0);
      list = this.orderData.items;
      this.menuItemList = list;

    });
  }



  closeModal() {
    this.activeModal.close(true);
  }
}
