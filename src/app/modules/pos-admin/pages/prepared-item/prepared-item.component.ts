import { Component, OnInit } from '@angular/core';
import { FormBuilder } from '@angular/forms';
import { AlertService } from '@core/services/common/alert.service';
import { PosDataService } from '@core/services/pos-system/pos-data.service';
import { PosViewService } from '@core/services/pos-system/pos-view.service';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';
import { NgxUiLoaderService } from 'ngx-ui-loader';

@Component({
  selector: 'app-prepared-item',
  templateUrl: './prepared-item.component.html',
  styleUrls: ['./prepared-item.component.css']
})
export class PreparedItemComponent implements OnInit {
  orderData: any;
  resData: any;
  outlets: any;
  id: any;

  constructor(
    private ngxLoader: NgxUiLoaderService,
    private posViewService: PosViewService,
    private activeModal: NgbActiveModal,
    private alertService: AlertService,
    private formBuilder: FormBuilder,
    private posDataService: PosDataService,
  ) { }

  ngOnInit(): void {

    this.id = this.posViewService.getPreparedViewId();
    this.getOrderDataById();
  }

  getOrderDataById(){
    this.ngxLoader.startLoader('loader-01');

    this.posDataService.getOrderById(this.id).subscribe((res: any)=>{
      this.ngxLoader.stopLoader('loader-01');
      this.orderData = res['data'];
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
