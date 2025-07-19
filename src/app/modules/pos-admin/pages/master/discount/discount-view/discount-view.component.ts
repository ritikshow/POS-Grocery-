import { Component, OnInit } from '@angular/core';
import { PosDataService } from '@core/services/pos-system/pos-data.service';
import { PosViewService } from '@core/services/pos-system/pos-view.service';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';
import { NgxUiLoaderService } from 'ngx-ui-loader';
import { AlertService } from '@core/services/common/alert.service';

@Component({
  selector: 'app-discount-view',
  templateUrl: './discount-view.component.html',
  styleUrls: ['./discount-view.component.css']
})
export class DiscountViewComponent implements OnInit {
  id: any;
  discData: any;

  constructor(
    private ngxLoader: NgxUiLoaderService,
    private activeModal: NgbActiveModal,
    private posDataService: PosDataService,
    private posViewService: PosViewService,
    private alertService: AlertService,
  ) { }

  ngOnInit(): void {
    this.id = this.posViewService.getDiscountViewId();
    this.getDiscountDataById();
  }

  getDiscountDataById(){
    this.ngxLoader.startLoader('loader-01');
    this.posDataService.getDiscountByID(this.id).subscribe((res: any)=>{
      this.ngxLoader.stopLoader('loader-01');
      this.discData = res['data'];
      let success = res['success'];
      let msg = res['message'];
      if (!success) {      
        this.alertService.showError(msg);
      }
    });
  }

  closeModal(){
    this.activeModal.close();
  }
}
