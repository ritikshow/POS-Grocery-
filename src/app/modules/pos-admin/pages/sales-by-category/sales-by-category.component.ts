import { Component, OnInit, ViewChild } from '@angular/core';
import { PosDataService } from '@core/services/pos-system/pos-data.service';
import { DataTableDirective } from 'angular-datatables';
import { Subject } from 'rxjs';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { AlertService } from '@core/services/common/alert.service';
import { CommonService } from '@core/services/common/common.service';

@Component({
  selector: 'app-sales-by-category',
  templateUrl: './sales-by-category.component.html',
  styleUrls: ['./sales-by-category.component.css']
})
export class SalesByCategoryComponent implements OnInit {
  tableListRecord: any = [];
  dataLoaded = false;
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
  CategoryData: any;
  filterForm: FormGroup;
  outletId: any;
  outletName: string;
  RestaurantId: string;
  SalesByCatagoryList: Array<{ SrNo: any, categoryName: any, quantity: any, amount: any, orderType: any }> = [];
  constructor(
    private posDataService: PosDataService,
    private formBuilder: FormBuilder,
    private alertService: AlertService,
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
    this.getAllCategory();
  }
  getAllCategory() {
    this.dataLoaded = false;
    let toDate = this.filterForm.get('toDate').value ? this.filterForm.get('toDate').value : new Date();
    let fromDate = this.filterForm.get('fromDate').value ? this.filterForm.get('fromDate').value : new Date();

    let startDate = this.formatDate(new Date(fromDate));
    let endDate = this.formatDate(new Date(toDate));

    let values = { outletId: this.outletId, toDate: endDate, fromDate: startDate };
    this.posDataService.GetCategoryDetail(values).subscribe((response: any) => {
      console.log(response);
      this.CategoryData = response['data'];
      this.dataLoaded = true;
      this.dtTrigger.next();
      this.tableListRecord.total = this.CategoryData.length;
    });
  }  
  downloadFile() {
    let i = 1;
    this.CategoryData.forEach(e => {
      this.SalesByCatagoryList.push({
        "SrNo": i,
        "categoryName": e.categoryName ? e.categoryName : null,
        "quantity": e.quantity ? e.quantity : null,
        "amount": e.amount ? e.amount : null,
        "orderType": e.orderType ? e.orderType : null
      });
      i++;
    });

    const replacer = (key, value) => value === null ? '' : value; // specify how you want to handle null values here
    const header = Object.keys(this.SalesByCatagoryList[0]);
    let csv = this.SalesByCatagoryList.map(row => header.map(fieldName => JSON.stringify(row[fieldName], replacer)).join(','));
    csv.unshift(header.join(','));
    let csvArray = csv.join('\r\n');
    let blob = new Blob([csvArray], { type: 'text/csv' })
    const a = document.createElement('a');
    const url = window.URL.createObjectURL(blob);
    a.href = url;
    a.download = 'Sales_By_Category.csv';
    a.click();
    window.URL.revokeObjectURL(url);
    a.remove();
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
    }
    else {
      this.getAllCategory();
    }
  }
  formatDate(date) {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');

    return `${year}-${month}-${day}`;
  }
  resetPage(){
    this.filterForm.patchValue({
      toDate : '',
      fromDate : ''
    })
    this.getAllCategory();
    this.CategoryData = null;
    this.filterForm.reset();
  }
}
