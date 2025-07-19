import { Component, OnInit } from '@angular/core';
import { PosDataService } from '@core/services/pos-system/pos-data.service';
import { PosViewService } from '@core/services/pos-system/pos-view.service';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';
import { NgxUiLoaderService } from 'ngx-ui-loader';
import { AlertService } from '@core/services/common/alert.service';

@Component({
  selector: 'app-outlet-view',
  templateUrl: './outlet-view.component.html',
  styleUrls: ['./outlet-view.component.css']
})
export class OutletViewComponent implements OnInit {
  id: any;
  outletData: any;

  constructor(
    private ngxLoader: NgxUiLoaderService,
    private activeModal: NgbActiveModal,
    private posDataService: PosDataService,
    private posViewService: PosViewService,
    private alertService: AlertService,
  ) { }

  ngOnInit(): void {
    this.id = this.posViewService.getOutletViewId();
    this.getOutletDataById();
  }

  getOutletDataById(){
    this.ngxLoader.startLoader('loader-01');
    this.posDataService.getOutletByID(this.id).subscribe((res: any)=>{
      this.ngxLoader.stopLoader('loader-01');
      this.outletData = res['data'];
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

