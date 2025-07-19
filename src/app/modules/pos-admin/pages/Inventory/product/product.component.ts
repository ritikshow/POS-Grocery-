import { Component, OnInit, ViewChild } from '@angular/core';
import { NgbModal, ModalDismissReasons } from '@ng-bootstrap/ng-bootstrap';
import { PosDataService } from '@core/services/pos-system/pos-data.service';
import { DataTableDirective } from 'angular-datatables';
import { Subject } from 'rxjs';
import { AddProductComponent } from './add-product/add-product.component';
import { AlertService } from '@core/services/common/alert.service';
import { CommonService } from '@core/services/common/common.service';

@Component({
  selector: 'app-product',
  templateUrl: './product.component.html',
  styleUrls: ['./product.component.css']
})
export class ProductComponent implements OnInit {
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

  AllProduct: any;
  outletId: any;
  closeResult: any;
  outletName: string;
  RestaurantId: string;

  productexport: Array<{ SrNo: any, productName: any, supplierName: any, unit: any, }> = [];
  constructor(
    private modalService: NgbModal,
    private posDataService: PosDataService,
    private alertService: AlertService,
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
    let restData = JSON.parse(sessionStorage.getItem('restaurantData'));
    if (sessionStorage.getItem('activeRestaurantId') !== null && sessionStorage.getItem('activeRestaurantId') !== undefined) {
      this.RestaurantId = sessionStorage.getItem('activeRestaurantId');
    } else {
      this.RestaurantId = restData.restaurantId;
    }
    this.outletName = sessionStorage.getItem('activeOutletname');
    this.outletId = sessionStorage.getItem('activeOutletId');
    this.GetAllProduct();
  }
  openForm(isnew, Id) {
    sessionStorage.setItem('isNewOrder', isnew);
    if (isnew == 'false') {
      sessionStorage.setItem('editId', Id);
    }
    this.modalService.open(AddProductComponent, { backdrop: 'static', keyboard: true, centered: true, windowClass: 'main_add_popup product_popup' }).result.then((result) => {
      this.closeResult = `Closed with: ${result}`;
      this.GetAllProduct();
    }, (reason) => {
      this.closeResult = `Dismissed ${this.getDismissReason(reason)}`;
    });
  }
  ShowResult(keyword) {
    sessionStorage.setItem('keyWord', keyword);
    sessionStorage.setItem('onlyPopUp', 'true');
    this.modalService.open(AddProductComponent, { backdrop: 'static', keyboard: true, centered: true, windowClass: 'main_add_popup product_popup' }).result.then((result) => {
      this.closeResult = `Closed with: ${result}`;
      this.GetAllProduct();
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

  Delete(Id, i) {
    this.posDataService.DeleteProduct(Id).subscribe((res: any) => {
      if (res.success) {
        this.alertService.showSuccess(res.message);
        this.AllProduct.splice(i, 1);
      } else {
        this.alertService.showError(res.message);
      }
    });
  }
  GetAllProduct() {
    this.dataLoaded = false;
    this.posDataService.GetAllProduct(this.outletId).subscribe((res: any) => {

      this.AllProduct = res['data'];
      let success = res['success'];
      let msg = res['message'];
      if (success) {
        sessionStorage.setItem("ProductList", JSON.stringify(this.AllProduct));
        this.dataLoaded = true;
        this.dtTrigger.next();
        this.tableListRecord.total = this.AllProduct.length;
      }
      else {
        this.dataLoaded = true;
        this.alertService.showError(msg);
      }
    });
  }
  downloadFile() {
    let i = 1;
    this.AllProduct.forEach(e => {
      this.productexport.push({
        "SrNo": i,
        "productName": e.productName ? e.productName : null,
        "supplierName": e.wMData?.wMSupplierName ? e.wMData?.wMSupplierName : null,
        "unit": e.unit ? e.unit : null,

      });
      i++;
    });

    const replacer = (key, value) => value === null ? '' : value; // specify how you want to handle null values here
    const header = Object.keys(this.productexport[0]);
    let csv = this.productexport.map(row => header.map(fieldName => JSON.stringify(row[fieldName], replacer)).join(','));
    csv.unshift(header.join(','));
    let csvArray = csv.join('\r\n');
    let blob = new Blob([csvArray], { type: 'text/csv' })
    const a = document.createElement('a');
    const url = window.URL.createObjectURL(blob);
    a.href = url;
    a.download = 'product_report.csv';
    a.click();
    window.URL.revokeObjectURL(url);
    a.remove();
    this.productexport =  [];
  }
}
