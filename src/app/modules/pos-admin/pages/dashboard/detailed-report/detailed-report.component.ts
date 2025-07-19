import { Component, OnInit } from '@angular/core';
import { AlertService } from '@core/services/common/alert.service';
import { PosDataService } from '@core/services/pos-system/pos-data.service';
import { ModalDismissReasons, NgbActiveModal, NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { NgxUiLoaderService } from 'ngx-ui-loader';

@Component({
  selector: 'app-detailed-report',
  templateUrl: './detailed-report.component.html',
  styleUrls: ['./detailed-report.component.css']
})
export class DetailedReportComponent implements OnInit {
  date: Date;
  dashBoardData: any;
  outletName: string;
  restaurantView: boolean;
  outletId: any;
  closeResult: string;
  PrintDate: any;
  getDetailedReportDate: any;
  getAllCategoryData: any;
  totalAmount: any;
  totalQuantity: any;
  getPrintData: any;
  getDashboardData: any;
  taxName: any;
  taxAmount: any;
  OrdertaxDetails = [];
  stafWiseOrder = [];

  constructor(
    private posDataService: PosDataService,
    private alertService: AlertService,
    private modalService: NgbModal,
    private ngxLoader: NgxUiLoaderService,
    private activeModal: NgbActiveModal,
  ) { }

  ngOnInit(): void {
    this.outletName = sessionStorage.getItem('activeOutletname');
    this.outletId = sessionStorage.getItem('activeOutletId');
    this.PrintDate = sessionStorage.getItem('PrintDate');
    this.getDetailedReportDate = JSON.parse(sessionStorage.getItem('DatesForDetailedReport'));
  
    this.getPrintData = JSON.parse(sessionStorage.getItem('GetPrintByDateData'));

    this.getDashboardData = JSON.parse(sessionStorage.getItem('GetDashboarddata'));

    sessionStorage.removeItem('PrintDate');
    if (sessionStorage.getItem('Role') == 'Super Admin') {
      this.restaurantView = true;
    }
    this.date = new Date();
    this.GetCategoryDetailAPICall();
  }

  addEvent(content) {
    this.modalService.open(content, { ariaLabelledBy: 'modal-basic-title', keyboard: false, backdrop: 'static', windowClass: 'add_item_popup' }).result.then((result) => {
    }, (reason) => {
      console.log(reason);
    });
  }


  GetCategoryDetailAPICall() {
    this.ngxLoader.startLoader('loader-01');
    this.posDataService.GetCategoryDetail(this.getDetailedReportDate).subscribe((response: any) => {
      this.ngxLoader.stopLoader('loader-01');
      this.getAllCategoryData = response['data'];
      let status = response['success'];
      let msg = response['message'];
      this.CheckSuccessResponse(status, msg);
    });
  }

  private CheckSuccessResponse(status: any, msg: any) {
    if (status) {
      this.totalAmount = this.getAllCategoryData.reduce((sum, value) => sum + value.amount, 0);
      this.totalQuantity = this.getAllCategoryData.reduce((sum, value) => sum + value.quantity, 0);
      for (let i = 0; i < this.getAllCategoryData.length; i++) {
        this.getAllCategoryData[i].amountPercentage = this.getAllCategoryData[i].amount / this.totalAmount * 100;
        this.getAllCategoryData[i].quantityPercentage = this.getAllCategoryData[i].quantity / this.totalQuantity * 100;
      }
      this.StafWiseFilter();
    } else {
      this.alertService.showError(msg);
    }
  }

  private StafWiseFilter() {
    let allStafName = this.getDashboardData.todayCompletedOrderList.map(x => x.createdByName);
    let staffName = [...new Set(allStafName)];
    let totalOfAllOrder = this.getDashboardData.todayCompletedOrderList.reduce((sum, value) => sum + value.total, 0);
    staffName.forEach(eleName => {
      let orders = this.getDashboardData.todayCompletedOrderList.filter(x => x.createdByName == eleName);
      if (orders != null && orders.length != 0) {
        orders.forEach(odr => {
          this.CheckTaxDetails(odr);

          this.StafWiseOrder(eleName, odr, totalOfAllOrder);

          this.CheckItemWiseTax(odr);
        });
      }
    });
  }

  private CheckTaxDetails(odr: any) {
    if (odr.taxDetails != null && odr.taxDetails.length > 0) {
      odr.taxDetails.forEach(ele => {
        if (this.OrdertaxDetails.length > 0 && this.OrdertaxDetails.map(x => x.name).includes(ele.taxName)) {
          let indx = this.OrdertaxDetails.map(function (x) { return x.name; }).indexOf(ele.taxName);
          this.OrdertaxDetails[indx].value = Number(this.OrdertaxDetails[indx].value) + Number(ele.taxAmount);
        } else {
          let data = {
            name: ele.taxName,
            value: Number(ele.taxAmount)
          };
          this.OrdertaxDetails.push(data);
        }
      });
    }
  }

  private StafWiseOrder(eleName: unknown, odr: any, totalOfAllOrder: any) {
    if (this.stafWiseOrder.length > 0 && this.stafWiseOrder.map(x => x.staffName).includes(eleName)) {
      let indx = this.stafWiseOrder.map(function (x) { return x.staffName; }).indexOf(eleName);
      this.stafWiseOrder[indx].totalValue = Number(this.stafWiseOrder[indx].totalValue) + Number(odr.total);
      this.stafWiseOrder[indx].staffOrderPercentage = this.stafWiseOrder[indx].totalValue / totalOfAllOrder * 100;
      this.stafWiseOrder[indx].numOfOrder += 1;
    } else {
      let data = {
        staffName: eleName,
        numOfOrder: 1,
        staffOrderPercentage: Number(odr.total) / totalOfAllOrder * 100,
        totalValue: Number(odr.total)
      };
      this.stafWiseOrder.push(data);
    }
  }

  private CheckItemWiseTax(odr: any) {
    if (odr.itemWiseTax != null && odr.itemWiseTax.length > 0) {
      odr.itemWiseTax.forEach(ele => {
        if (this.OrdertaxDetails.length > 0 && this.OrdertaxDetails.map(x => x.name).includes(ele.taxName)) {
          let indx = this.OrdertaxDetails.map(function (x) { return x.name; }).indexOf(ele.taxName);
          this.OrdertaxDetails[indx].value = Number(this.OrdertaxDetails[indx].value) + Number(ele.taxAmount);
        } else {
          let data = {
            name: ele.taxName,
            value: Number(ele.taxAmount)
          };
          this.OrdertaxDetails.push(data);
        }
      });
    }
  }

  formatDate(date) {
    return [
      date.getFullYear(),
      this.padTo2Digits(date.getMonth() + 1),
      this.padTo2Digits(date.getDate()),
    ].join('-');
  }

  padTo2Digits(num) {
    return num.toString().padStart(2, '0');
  }
  closeModal() {
    this.activeModal.close(0);
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

  // getData() {
  //   const data = JSON.parse(sessionStorage.getItem('GetPrintByDateData'));
  //   console.log("Print Data",data);
  //   const totalOrderTaxSum = data.allOrders.reduce((sum, order) => {
  //     return sum + (order.totalOrderTax || 0);
  //   }, 0);
  //   const totalOrderDiscountSum = data.allOrders.reduce((sum, order) => {
  //     return sum + (order.totalDiscount || 0);
  //   }, 0);
  //   data.totalTax = totalOrderTaxSum;
  //   data.totalDiscount = totalOrderDiscountSum
  //   this.getPrintData = data;
  //   console.log("Details report", this.getPrintData.allOrders)
  // }



}
