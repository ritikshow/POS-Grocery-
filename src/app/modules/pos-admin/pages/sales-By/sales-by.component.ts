import { Component, OnInit, ViewChild } from '@angular/core';
import { PosDataService } from '@core/services/pos-system/pos-data.service';
import { DataTableDirective } from 'angular-datatables';
import { Subject } from 'rxjs';
import { FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { AlertService } from '@core/services/common/alert.service';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { CommonService } from '@core/services/common/common.service';

@Component({
  selector: 'app-sales-by',
  templateUrl: './sales-by.component.html',
  styleUrls: ['./sales-by.component.css']
})
export class SalesByComponent implements OnInit {
  tableListRecord: any = [];
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

  errorHighlightFrom: string;
  errorHighlightTo: string;
  AllData: any;
  filterForm: FormGroup;
  outletId: any;
  outletName: string;
  RestaurantId: string;
  isDataLoaded = false;
  parameterArray = [];
  SalesColumnArray = ["CreatedOn", "OrderType", "OrderNo", "PaymentMode", "TotalPayableAmount", "AmountWithoutVAT", "VATAmount"]; //, "InvoiceNo" => removed from this list

  constructor(
    private posDataService: PosDataService,
    private formBuilder: FormBuilder,
    private alertService: AlertService,
    private modalService: NgbModal,
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
    this.filterForm = this.formBuilder.group({
      fromDate: ['', Validators.required],
      toDate: ['', Validators.required]
    });

    let restData = JSON.parse(sessionStorage.getItem('restaurantData'));
    if (sessionStorage.getItem('activeRestaurantId') !== null && sessionStorage.getItem('activeRestaurantId') !== undefined) {
      this.RestaurantId = sessionStorage.getItem('activeRestaurantId');
    } else {
      this.RestaurantId = restData.restaurantId;
    }
    this.outletName = sessionStorage.getItem('activeOutletname');
    this.outletId = sessionStorage.getItem('activeOutletId');
    this.getAllOrdersByCount();
  }

  getAllOrdersByCount() {
    let toDate = this.filterForm.get('toDate').value ? this.filterForm.get('toDate').value : new Date();
    let fromDate = this.filterForm.get('fromDate').value ? this.filterForm.get('fromDate').value : new Date();

    let startDate = this.formatDate(new Date(fromDate));
    let endDate = this.formatDate(new Date(toDate));

    let values = { outletId: this.outletId, toDate: endDate, fromDate: startDate, userId: null };
    this.isDataLoaded = false;
    this.posDataService.getFilterOrdersByCount(values).subscribe((response: any) => {
      let data = response['data'];
      this.AllData = [...data?.todayTakeAwaySalesList, ...data?.todayOnlineSalesList, ...data?.todayDineInSalesList];
      this.AllData = this.AllData.filter(x => x.orderStatus == 'Completed');
      this.dtTrigger.next();
      this.CalculateAllTax();
    });
    this.tableListRecord.total = this.AllData?.length;
  }
  private CalculateAllTax() {
    this.AllData.forEach((value) => {
      if (value.orderNo == null) {
        let indx = this.AllData.map(function (x) { return x.orderId; }).indexOf(value.orderId);
        this.AllData.splice(indx, 1);
      } else {
        this.CalculateTotalTaxCollections(value);
      }
      this.isDataLoaded = true;
    });
  }

  private CalculateTotalTaxCollections(value: any) {
    value.taxAmount = 0;
    value.createdOn = value.createdOn.split('T')[0] + ' ' + value.createdOn.split('T')[1].substring(0, 5);
    if (value.taxDetails != null && value.taxDetails.length > 0) {
      value.taxDetails.forEach(element => {
        value.taxAmount = Number(value.taxAmount) + Number(element.taxAmount);
      });
    }
    if (value.itemWiseTax != null && value.itemWiseTax.length > 0) {
      value.itemWiseTax.forEach(element1 => {
        value.taxAmount = Number(value.taxAmount) + Number(element1.taxAmount);
      });
    }
    //value.total = Number(value.total) - value.taxAmount;
  }

  downloadFile() {
    let i = 1;
    let array = [];
    let csvArray;
    ({ csvArray, i } = this.FilterDataAndFixHeader(i, array));
    let blob = new Blob([csvArray], { type: 'text/csv' })
    const a = document.createElement('a');
    const url = window.URL.createObjectURL(blob);
    a.href = url;
    a.download = 'orderWise_report.csv';
    a.click();
    window.URL.revokeObjectURL(url);
    a.remove();
  }
  private FilterDataAndFixHeader(i: number, array: any[]) {
    i = this.FilterDataForDownload(i, array);
    const replacer = (key, value) => value === null ? '' : value; // specify how you want to handle null values here
    const header = Object.keys(array[0]);
    let csv = array.map(row => header.map(fieldName => JSON.stringify(row[fieldName], replacer)).join(','));
    csv.unshift(header.join(','));
    let csvArray = csv.join('\r\n');
    return { csvArray, i };
  }

  private FilterDataForDownload(i: number, array: any[]) {
    this.AllData.forEach(e => {
      let obj: any = {};
      obj.SrNo = i;
      this.CheckAllParameters(obj, e);
      i++;
      array.push(obj);
    });
    return i;
  }

  private CheckAllParameters(obj: any, e: any) {
    this.SplitedConditions(obj, e);
    if (this.parameterArray.includes('PaymentMode'))
      obj.paymentMode = e.paymentBreakage[0]?.paymentMode ? e.paymentBreakage[0]?.paymentMode : null;
    if (this.parameterArray.includes('TotalPayableAmount'))
      obj.TotalPayableAmount = e.total ? e.total : null;
    if (this.parameterArray.includes('AmountWithoutVAT'))
      obj.AmountWithoutVAT = e.subTotal ? e.subTotal : null;
    if (this.parameterArray.includes('VATAmount'))
      obj.VATAmount = e.taxAmount.toFixed(2) ? e.taxAmount.toFixed(2) : null;
  }

  private SplitedConditions(obj: any, e: any) {
    if (this.parameterArray.includes('CreatedOn'))
      obj.createdOn = e.createdOn ? e.createdOn : null;
    if (this.parameterArray.includes('InvoiceNo'))
      obj.invoiceNo = e.invoiceNo ? e.invoiceNo : null;
    if (this.parameterArray.includes('OrderType'))
      obj.orderType = e.orderType ? e.orderType : null;
    if (this.parameterArray.includes('OrderNo'))
      obj.orderNo = e.orderNo ? e.orderNo : null;
  }

  getDashboardData() {
    let toDate = this.filterForm.get('toDate').value ? this.filterForm.get('toDate').value : null;
    let fromDate = this.filterForm.get('fromDate').value ? this.filterForm.get('fromDate').value : null;
    this.errorHighlightFrom = "";
    this.errorHighlightTo = "";
    if (toDate == null || fromDate == null || this.filterForm.invalid) {
      if (fromDate == null) {
        this.errorHighlightFrom = "border : 1px solid red";
        this.errorHighlightTo = "";
      } else {
        this.errorHighlightTo = "border : 1px solid red";
        this.errorHighlightFrom = "";
      }
      this.alertService.showError('Fields are empty');
    } else {
      this.getAllOrdersByCount();
    }
  }
  closeAction() {
    if (this.modalService.hasOpenModals) {
      this.modalService.dismissAll();
    }
  }
  exportPopUp(content) {
    this.modalService.open(content, { ariaLabelledBy: 'modal-basic-title', keyboard: false, centered: true, backdrop: 'static', windowClass: 'main_add_popup ' }).result.then((result) => {

    }, (reason) => {
      console.log(reason);
    });
  }
  onCheckboxChange(event) {
    if (this.parameterArray.includes(event.target.value)) {
      this.parameterArray.splice(this.parameterArray.indexOf(event.target.value));

    } else {
      this.parameterArray.push(event.target.value);
    }
    console.log(this.parameterArray);
  }
  formatDate(date) {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');

    return `${year}-${month}-${day}`;
  }
  resetPage() {
    this.AllData = null;
    this.filterForm.reset();
    this.filterForm.patchValue({
      toDate : null,
      fromDate:null
    })
    this.getAllOrdersByCount();
  }

}
