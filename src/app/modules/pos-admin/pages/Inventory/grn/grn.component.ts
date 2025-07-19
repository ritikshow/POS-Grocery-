import { Component, OnInit } from '@angular/core';
import { PosDataService } from '@core/services/pos-system/pos-data.service';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';
import { NgxUiLoaderService } from 'ngx-ui-loader';
import { AlertService } from '@core/services/common/alert.service';

@Component({
  selector: 'app-grn',
  templateUrl: './grn.component.html',
  styleUrls: ['./grn.component.css']
})
export class GRNComponent implements OnInit {
  id: any;
  orderData: any;
  items: any;
  isError = false;
  closeResult: string;
  gRNData: any;
  isEditable = false;
  grnItems = [];
  remarks: any;
  grnList: any = {};
  SelectedGrnList: Array<{
    productName: any, unit: any, price: any, quantity: any,
    receivedQuantity: any, receivedDate: any }> = [];

  constructor(
    private ngxLoader: NgxUiLoaderService,
    private activeModal: NgbActiveModal,
    private posDataService: PosDataService,
    private alertService: AlertService,
  ) { }

  ngOnInit(): void {
    this.id = sessionStorage.getItem("SOrderId");
    this.getGRNById();
    this.getOrderDataById();
  }
  getGRNById() {
    this.ngxLoader.startLoader('loader-01');
    this.posDataService.getGRNById(this.id).subscribe((res: any) => {
      this.ngxLoader.stopLoader('loader-01');
      this.gRNData = res['data'];
      let success = res['success'];
      let msg = res['message'];
      if (success) {       
        this.gRNData.forEach(element => {
          element.receivedSupplierOrder.items.forEach(itemOnly => {
            itemOnly.itemReceivedDate = element.receivedDate;
            itemOnly.grnId = element._id;
          });
          this.grnItems.push(...element.receivedSupplierOrder.items);
        });
      }
      else {
        this.alertService.showError(msg);
      }
    });
  }
  Remarks(event) {
    this.remarks = event.target.value;
    this.isError = !this.remarks || this.remarks.trim() === '';
  }
  ChangedValue(event, item) {
    let indx = this.grnItems.map(function (x) { return x.grnId; }).indexOf(item.grnId);
    this.grnItems[indx].quantity = event.target.value;
  }
  Edit() {
    this.isEditable = true;
  }
  Save(item) {
    if (this.remarks == undefined) {
      this.isError = true;
    }
    else {
      let finalData = this.gRNData.find(x => x._id == item.grnId);
      finalData.remarks = this.remarks;
      this.posDataService.UpdateGrn(finalData._id, finalData).subscribe((res: any) => {
        let success = res['success'];
        let msg = res['message'];
        if (success) {
          this.alertService.showSuccess(msg);
        }
        else {
          this.alertService.showError(msg);
        }
      });
    }
  }
  downloadFile() {
    this.items.forEach(e => {
      e.receivedItems.forEach(r => {
        this.SelectedGrnList.push({
          "productName": e.productName ? e.productName : null,
          "unit": e.unit ? e.unit : null,
          "price": e.price ? e.price : null,
          "quantity": e.quantity ? e.quantity : null,
          "receivedQuantity": r.quantity ? r.quantity : null,
          "receivedDate": r.itemReceivedDate ? r.itemReceivedDate : null
        });
      });
    });
    let data = this.SelectedGrnList;
    const replacer = (key, value) => value === null ? '' : value; // specify how you want to handle null values here
    const header = Object.keys(data[0]);
    let csv = data.map(row => header.map(fieldName => JSON.stringify(row[fieldName], replacer)).join(','));
    csv.unshift(header.join(','));
    let csvArray = csv.join('\r\n');
    let blob = new Blob([csvArray], { type: 'text/csv' })
    const a = document.createElement('a');
    const url = window.URL.createObjectURL(blob);
    a.href = url;
    a.download = 'SuplierOrder_report.csv';
    a.click();
    window.URL.revokeObjectURL(url);
    a.remove();
  }
  getOrderDataById() {
    this.ngxLoader.startLoader('loader-01');
    this.posDataService.getSupplierOrderById(this.id).subscribe((res: any) => {
      this.ngxLoader.stopLoader('loader-01');
      this.orderData = res['data'];
      let success = res['success'];
      let msg = res['message'];
      if (success) {
        this.items = this.orderData.items;
        this.items.forEach(itm => {
          itm.receivedItems = this.grnItems.filter(x => x.rangeId == itm.rangeId);
        });
      }
      else {
        this.alertService.showError(msg);
      }
    });
  }
  closeModal() {
    this.activeModal.close();
  }

}
