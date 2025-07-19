import { Component, OnInit } from '@angular/core';
import { PosSharedService } from '@core/services/common/pos-shared.service';
import { PosDataService } from '@core/services/pos-system/pos-data.service';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';
import { NgxUiLoaderService } from 'ngx-ui-loader';
import { AlertService } from '@core/services/common/alert.service';

@Component({
  selector: 'app-complete-order-view',
  templateUrl: './complete-order-view.component.html',
  styleUrls: ['./complete-order-view.component.css']
})
export class CompleteOrderViewComponent implements OnInit {
  id: any;
  orderData: any;
  invoiceData: any;
  tapAndGoData: any;
  deliverectOrderData: any;
  TotalTip:number
  constructor(
    private ngxLoader: NgxUiLoaderService,
    private activeModal: NgbActiveModal,
    private posDataService: PosDataService,
    private posSharedService: PosSharedService,
    private alertService: AlertService,
  ) { }

  ngOnInit(): void {
    this.id = this.posSharedService.getOrderDataId();
    this.getOrderDataById();
   
  }

  getOrderDataById() {
        this.ngxLoader.startLoader('loader-01');
    this.posDataService.getOrderById(this.id).subscribe((res: any) => {
      this.ngxLoader.stopLoader('loader-01');
      this.orderData = res['data'];
      this.TotalTip = this.orderData.paymentBreakage?.reduce((sum, item) => sum + item.tip, 0);
      let success = res['success'];
      let msg = res['message'];      
      if (success) {
        if (this.orderData.deliverectId != null && this.orderData.deliverectId != '') {
          this.posDataService.getDeliverectOrderById(this.orderData.deliverectId).subscribe((res: any) => {
            this.deliverectOrderData = res['data'].deliverectOrder;
            console.log(this.orderData);
          });
        }
      } else {
        this.alertService.showError(msg);
      }
    });
  }
  

  closeModal() {
    this.activeModal.close();
  }
}
