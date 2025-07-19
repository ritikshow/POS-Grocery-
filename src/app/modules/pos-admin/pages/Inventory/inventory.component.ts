import { Component, OnInit, ViewChild } from '@angular/core';
import { NgbModal, ModalDismissReasons } from '@ng-bootstrap/ng-bootstrap';
import { PosDataService } from '@core/services/pos-system/pos-data.service';
import { DataTableDirective } from 'angular-datatables';
import { Subject } from 'rxjs';
import { AddInventoryComponent } from './add-inventory/add-inventory.component';
import { ReconcileStockComponent } from './reconcile-stock/reconcile-stock.component';
import { AlertService } from '@core/services/common/alert.service';
import { CommonService } from '@core/services/common/common.service';

@Component({
  selector: 'app-inventory',
  templateUrl: './inventory.component.html',
  styleUrls: ['./inventory.component.css']
})
export class InventoryComponent implements OnInit {
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

  AllMasterData: any;
  outletId: any;
  outletName: string;
  RestaurantId: string;
  closeResult: any;
  parameterArray = [];

  Stock: Array<{ SrNo: any, productName: any, supplierName: any, price: any, unit: any, quantity: any, actualQuantity: any, criticalQuantity: any, orderQuantity: any, }> = [];
  InventoryStock = ["ProductName", "SupplierName", "Price", "Unit", "Quantity", "ActualQuantity", "CriticalQuantity", "OrderQuantity"];
  constructor(
    private modalService: NgbModal,
    private posDataService: PosDataService,
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
    let restData = JSON.parse(sessionStorage.getItem('restaurantData'));
    if (sessionStorage.getItem('activeRestaurantId') !== null && sessionStorage.getItem('activeRestaurantId') !== undefined) {
      this.RestaurantId = sessionStorage.getItem('activeRestaurantId');
    } else {
      this.RestaurantId = restData.restaurantId;
    }
    this.outletName = sessionStorage.getItem('activeOutletname');
    this.outletId = sessionStorage.getItem('activeOutletId');
    this.GetAllInventory();
  }
  openForm(isnew, Id) {
    sessionStorage.setItem('isNewOrder', isnew);
    if (isnew == 'false') {
      sessionStorage.setItem('editId', Id);
    }
    this.modalService.open(AddInventoryComponent, { backdrop: 'static', windowClass: 'main_add_popup', keyboard: true, centered: true }).result.then((result) => {
      this.closeResult = `Closed with: ${result}`;
      this.GetAllInventory();
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

  Delete(Id) {
    this.posDataService.DeleteProductSupplierMaster(Id).subscribe((res: any) => {
      this.GetAllInventory();
    });
  }
  GetAllInventory() {
    this.dataLoaded = false;
    this.posDataService.GetAllPsMaster(this.outletId).subscribe((res: any) => {
      this.AllMasterData = res['data'];
      let success = res['success'];
      let msg = res['message'];
      if (success) {
        this.dataLoaded = true;
        this.dtTrigger.next();
        this.tableListRecord.total = this.AllMasterData.length;
      } else {
        this.dataLoaded = true;
        this.alertService.showError(msg);
      }
    });
  }
  //export option function
  downloadFile() {
    let array = [];
    this.CreateObjectForExcel(array);

    const replacer = (key, value) => value === null ? '' : value; // specify how you want to handle null values here
    const header = Object.keys(array[0]);
    let csv = array.map(row => header.map(fieldName => JSON.stringify(row[fieldName], replacer)).join(','));
    csv.unshift(header.join(','));
    let csvArray = csv.join('\r\n');
    let blob = new Blob([csvArray], { type: 'text/csv' })
    const a = document.createElement('a');
    const url = window.URL.createObjectURL(blob);
    a.href = url;
    a.download = 'inventory_report.csv';
    a.click();
    window.URL.revokeObjectURL(url);
    a.remove();
  }

  private CreateObjectForExcel(array: any[]) {
    let i = 1;
    this.AllMasterData.forEach(e => {
      let obj: any = {};
      obj.SrNo = i;
      this.FirstFourConditions(obj, e);
      this.SecondFourConditions(obj, e);
      i++;
      array.push(obj);
    });
    return i;
  }

  private SecondFourConditions(obj: any, e: any) {
    if (this.parameterArray.includes('Quantity'))
      obj.quantity = e.quantity ? e.quantity : null;
    if (this.parameterArray.includes('ActualQuantity'))
      obj.actualQuantity = e.actualQuantity ? e.actualQuantity : null;
    if (this.parameterArray.includes('CriticalQuantity'))
      obj.criticalQuantity = e.criticalQuantity ? e.criticalQuantity : null;
    if (this.parameterArray.includes('OrderQuantity'))
      obj.orderQuantity = e.orderQuantity ? e.orderQuantity : null;
  }

  private FirstFourConditions(obj: any, e: any) {
    if (this.parameterArray.includes('ProductName'))
      obj.productName = e.productName ? e.productName : null;
    if (this.parameterArray.includes('SupplierName'))
      obj.supplierName = e.supplierName ? e.supplierName : null;
    if (this.parameterArray.includes('Price'))
      obj.price = e.price ? e.price : 0;
    if (this.parameterArray.includes('Unit'))
      obj.unit = e.unit ? e.unit : null;
  }

  openReconsilePopUp() {
    this.modalService.open(ReconcileStockComponent, { backdrop: 'static', keyboard: true, centered: true, windowClass: 'main_add_popup ' }).result.then((result) => {
      this.closeResult = `Closed with: ${result}`;
      if (result) {
        this.GetAllInventory();
      }
    }, (reason) => {
      this.closeResult = `Dismissed ${this.getDismissReason(reason)}`;
    });
  }
  closeAction() {
    if (this.modalService.hasOpenModals) {
      this.modalService.dismissAll();
    }
  }
  exportPopUp(content) {
    this.parameterArray = [];
    this.modalService.open(content, { ariaLabelledBy: 'modal-basic-title', centered: true, keyboard: false, backdrop: 'static', windowClass: 'main_add_popup ' }).result.then((result) => {
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
    //console.log(this.parameterArray);
  }

}
