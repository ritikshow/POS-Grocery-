import { Component, OnInit, ViewChild } from '@angular/core';
import { PosDataService } from '@core/services/pos-system/pos-data.service';
import { DataTableDirective } from 'angular-datatables';
import { Subject } from 'rxjs';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { AlertService } from '@core/services/common/alert.service';
import { CommonService } from '@core/services/common/common.service';

@Component({
  selector: 'app-sales-by-item',
  templateUrl: './sales-by-item.component.html',
  styleUrls: ['./sales-by-item.component.css']
})
export class SalesByItemComponent implements OnInit {
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
  itemData: any = [];
  filterItemForm: FormGroup;
  outletId: any;
  outletName: string;
  RestaurantId: string;
  SalesBycategoryList: Array<{ SrNo: any, itemName: any, quantity: any, amount: any, orderType: any }> = [];
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
    this.filterItemForm = this.formBuilder.group({
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
    this.getAllItem();

  }
  getAllItem() {
    this.itemData = [];
    let toDate = this.filterItemForm.get('toDate').value ? this.filterItemForm.get('toDate').value : new Date();
    let fromDate = this.filterItemForm.get('fromDate').value ? this.filterItemForm.get('fromDate').value : new Date();

    let startDate = this.formatDate(new Date(fromDate));
    let endDate = this.formatDate(new Date(toDate));

    let values = { outletId: this.outletId, toDate: endDate, fromDate: startDate };
    this.posDataService.GetCategoryDetail(values).subscribe((response: any) => {
      let CategoryData = response['data'];
      CategoryData.forEach((category) => {
        category.items.forEach((item) => {
          this.itemData.push(item);
        });
      });
    });
  }

  downloadFile() {
    let i = 1;
    this.itemData.forEach(e => {
      this.SalesBycategoryList.push({
        "SrNo": i,
        "itemName": e.itemName ? e.itemName : null,
        "quantity": e.quantity ? e.quantity : null,
        "amount": e.amount ? e.amount : null,
        "orderType": e.orderType ? e.orderType : null
      });
      i++;
    });

    const replacer = (key, value) => value === null ? '' : value; // specify how you want to handle null values here
    const header = Object.keys(this.SalesBycategoryList[0]);
    let csv = this.SalesBycategoryList.map(row => header.map(fieldName => JSON.stringify(row[fieldName], replacer)).join(','));
    csv.unshift(header.join(','));
    let csvArray = csv.join('\r\n');
    let blob = new Blob([csvArray], { type: 'text/csv' })
    const a = document.createElement('a');
    const url = window.URL.createObjectURL(blob);
    a.href = url;
    a.download = 'SalesBy_Item.csv';
    a.click();
    window.URL.revokeObjectURL(url);
    a.remove();
  }
  getDashboardData() {
    let toDate = this.filterItemForm.get('toDate').value ? this.filterItemForm.get('toDate').value : null;
    let fromDate = this.filterItemForm.get('fromDate').value ? this.filterItemForm.get('fromDate').value : null;
    this.errorHighlightFrom = "";
    this.errorHighlightTo = "";
    if (toDate == null || fromDate == null || this.filterItemForm.invalid) {
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
      this.getAllItem();
    }
  }
  formatDate(date) {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');

    return `${year}-${month}-${day}`;
  }
  resetPage(){
    this.filterItemForm.patchValue({
      toDate : null,
      fromDate : null
    })
    this.getAllItem();
    //this.itemData = [];
    this.filterItemForm.reset();
  }
}
