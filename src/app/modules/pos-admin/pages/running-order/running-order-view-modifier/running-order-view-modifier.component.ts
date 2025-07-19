import { Component, OnInit } from '@angular/core';
import { PosSharedService } from '@core/services/common/pos-shared.service';
import { PosDataService } from '@core/services/pos-system/pos-data.service';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';
import { NgxUiLoaderService } from 'ngx-ui-loader';
import { AlertService } from '@core/services/common/alert.service';

@Component({
  selector: 'app-running-order-view-modifier',
  templateUrl: './running-order-view-modifier.component.html',
  styleUrls: ['./running-order-view-modifier.component.css']
})
export class RunningOrderViewModifierComponent implements OnInit {
  id: any;
  orderData: any;
  invoiceData: any;

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
      let success = res['success'];
      let msg = res['message'];
      if (!success) {
        this.alertService.showError(msg);
      }
    });
  }


  closeModal() {
    this.activeModal.close();
  }
}
