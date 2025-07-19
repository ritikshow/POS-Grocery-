import { Component, OnInit } from '@angular/core';
import { AlertService } from '@core/services/common/alert.service';
import { PosDataService } from '@core/services/pos-system/pos-data.service';
import { PosDataShareService } from '@core/services/pos-system/posDataShare.service';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';

@Component({
  selector: 'app-online-order-print',
  templateUrl: './online-order-print.component.html',
  styleUrls: ['./online-order-print.component.css']
})
export class OnlineOrderPrintComponent implements OnInit {
  date: Date;
  time: Date;
  orderDataById: any;
  orderId: any;
  constructor(
    private posDataSharedService: PosDataShareService,
    private alertService: AlertService,
    private posDataService: PosDataService,
    private activeModal: NgbActiveModal,
  ) { }

  ngOnInit(): void {
    this.orderId = this.posDataSharedService.getIdForOrderId();
    this.getOrderData();
    //this.getCurrentTime();
  }
  closeModal() {
    this.activeModal.close(0);    
  }
  currentTime: any;
  // async getCurrentTime() {
  //   let restaurantId = sessionStorage.getItem('activeRestaurantId');
  //   this.posDataService.getRestaurantCurrentTime(restaurantId).subscribe((res: any) => {
  //     let timeData = res.currentTime;
  //     let splitedDateTime = timeData.split(' ');
  //     this.date = splitedDateTime[0];
  //     this.currentTime = splitedDateTime[1];
  //   });
  // }

  getOrderData(){
    this.posDataService.getOrderById(this.orderId).subscribe((res: any)=>{
      this.orderDataById = res['data'];
      let success = res['success'];
      let msg = res['message'];
      if (!success) {       
        this.alertService.showError(msg);
      } 
    });
  }
}
