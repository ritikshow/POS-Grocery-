import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { AlertService } from '@core/services/common/alert.service';
import { PosDataService } from '@core/services/pos-system/pos-data.service';
import { PosDataShareService } from '@core/services/pos-system/posDataShare.service';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';
import { DatePipe } from '@angular/common'
import { NgxUiLoaderService } from 'ngx-ui-loader';

@Component({
  selector: 'app-kitchen-item',
  templateUrl: './kitchen-item.component.html',
  styleUrls: ['./kitchen-item.component.css']
})
export class KitchenItemComponent implements OnInit {
  orderId: any;
  orderDataById: any;
  date: any;
  time: any;

  constructor(
    private ngxLoader: NgxUiLoaderService,
    private posDataSharedService: PosDataShareService,
    private alertService: AlertService,
    private router: Router,
    private posDataService: PosDataService,
    private activeModal: NgbActiveModal,
    private datePipe: DatePipe
  ) { }

  ngOnInit(): void {
    this.orderId = this.posDataSharedService.getIdForOrderId();
    this.getOrderData();
    //this.getCurrentTime();
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

  getOrderData() {
    this.ngxLoader.startLoader('loader-01')
    this.posDataService.getOrderById(this.orderId).subscribe(async (res: any) => {
      this.ngxLoader.stopLoader('loader-01')
      this.orderDataById = res['data'];
      let success = res['success'];
      let msg = res['message'];
      if (success) {
        let copiedItems = this.orderDataById.items.filter(x => x.itemStatus == 'Ordered');
        let kitchenData = this.orderDataById.items.filter(x => x.itemStatus == 'Ordered' && !x.isPrinted && x.itemLocation === 'Kitchen');
        if (kitchenData == null || kitchenData == undefined || kitchenData.length == 0) {
          this.orderDataById.items = copiedItems;
        } else {
          this.orderDataById.items = this.orderDataById.items.filter(x => x.itemStatus == 'Ordered' && !x.isPrinted);
          let ids = kitchenData.map(x => x.id);
          (await this.posDataService.MarkAsPrinted(this.orderId, ids)).subscribe((res: any) => {
          });
        }        
      }
      else {
        this.alertService.showError(msg);
      }
    });
  }

  closeModal() {
    this.activeModal.close(0);
  }

  
}
