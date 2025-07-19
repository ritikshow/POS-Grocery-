import { Component, OnInit } from '@angular/core';
import { AddItemService } from '@core/services/common/add-item.service';
import { PosDataService } from '@core/services/pos-system/pos-data.service';
import { PosViewService } from '@core/services/pos-system/pos-view.service';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';
import { NgxUiLoaderService } from 'ngx-ui-loader';
import { AlertService } from '@core/services/common/alert.service';

@Component({
  selector: 'app-view-masters-promo-code',
  templateUrl: './view-masters-promo-code.component.html',
  styleUrls: ['./view-masters-promo-code.component.css']
})
export class ViewMastersPromoCodeComponent implements OnInit {

  id: any;
  promocodeData: any;

  constructor(
    private ngxLoader: NgxUiLoaderService,
    private activeModal: NgbActiveModal,
    private posDataService: PosDataService,
    private posViewService: PosViewService,
    private addItems:AddItemService,
    private alertService: AlertService
  ) { }

  ngOnInit(): void {
    this.id = this.addItems.getPromocodeViewId();
    this.getPromocodeDataById();
  }

  getPromocodeDataById(){
    this.ngxLoader.startLoader('loader-01');
    this.posDataService.getPromocodeByID(this.id).subscribe((res: any)=>{
      this.ngxLoader.stopLoader('loader-01');
      this.promocodeData = res['data'];
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
