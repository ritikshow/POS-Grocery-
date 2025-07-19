import { Component, OnInit } from '@angular/core';
import { PosDataService } from '@core/services/pos-system/pos-data.service';
import { ModalDismissReasons, NgbActiveModal, NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { NgxUiLoaderService } from 'ngx-ui-loader';
import { EditOrderComponent } from './editorder/edit-order.component';
import { AlertService } from '@core/services/common/alert.service';

@Component({
  selector: 'app-order-view',
  templateUrl: './order-view.component.html',
  styleUrls: ['./order-view.component.css']
})
export class OrderViewComponent implements OnInit {
  id: any;
  orderData: any;
  items: any;
  closeResult: string;
  liveData = [];
  liveItems = [];
  remarks: any;
  remarksIMP = false;

  constructor(
    private modalService: NgbModal,
    private ngxLoader: NgxUiLoaderService,
    private activeModal: NgbActiveModal,
    private posDataService: PosDataService,
    private alertService: AlertService,
  ) { }

  ngOnInit(): void {
    this.id = sessionStorage.getItem("SOrderId");
    this.getOrderDataById();
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
      }
      else {
        this.alertService.showError(msg);
      }
    });
  }
  editDetails(data) {
    if (data.rangeId != null)
      sessionStorage.setItem("rangeId", data.rangeId);
    else
      sessionStorage.setItem("productId", data.productID);
    this.closeModal(false);
    this.modalService.open(EditOrderComponent, { backdrop: 'static', windowClass: 'main_add_popup', keyboard: true, centered: true }).result.then((result) => {
      this.closeResult = `Closed with: ${result}`;
      sessionStorage.removeItem('rangeId')
      sessionStorage.removeItem('productId')
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
  Remarks(event) {
    this.remarks = event.target.value;
  }

  remove(i) {
    this.items.splice(i, 1);
    this.orderData.items = this.items;
    this.posDataService.UpdateSupplierOrder(this.orderData._id, this.orderData).subscribe((res: any) => {
      this.orderData = res['data'];
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
  liveEvent(event, i) {
    let newdata = this.items[i];
    if (!this.liveData.map(x => x.rangeId).includes(newdata.rangeId)) {
      newdata.quantity = event.target.value;
      this.liveData.push(newdata);
    } else {
      let indx = this.liveData.map(function (x) { return x.rangeId; }).indexOf(newdata.rangeId);
      this.liveData[indx].quantity = event.target.value;
    }
  }

  MarkReceive(event, data) {
    if (event.currentTarget.checked) {
      if (!this.liveData.map(x => x.rangeId).includes(data.rangeId)) {
        let indx = this.items.map(function (x) { return x.rangeId; }).indexOf(data.rangeId);
        this.liveItems.push(this.items[indx]);
      }
      else {
        let ind = this.liveData.map(function (x) { return x.rangeId; }).indexOf(data.rangeId);
        this.liveItems.push(this.liveData[ind]);
      }
    } else {
      let indx1 = this.liveItems.map(function (x) { return x.rangeId; }).indexOf(data.rangeId);
      this.liveItems.splice(this.liveItems[indx1], 1);
    }
  }
  SaveGRN() {
    if (this.remarks == undefined) {
      this.remarksIMP = true;
    } else {
      this.remarksIMP = false;
      this.orderData.items = this.liveItems;
      let obj = {
        receivedSupplierOrder: this.orderData,
        remarks: this.remarks,
      };
      this.posDataService.InsertGRN(obj).subscribe((res: any) => {
        this.orderData = res['data'];
        let success = res['success'];
        let msg = res['message'];
        if (success) {
          this.closeModal(true);
          this.alertService.showSuccess(msg);
        }
        else {
          this.alertService.showError(msg);
        }
      });
    }
  }
  closeModal(val) {
    this.activeModal.close(val);
  }

}
