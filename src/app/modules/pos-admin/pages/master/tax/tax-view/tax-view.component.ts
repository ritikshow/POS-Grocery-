import { Component, OnInit } from '@angular/core';
import { PosDataService } from '@core/services/pos-system/pos-data.service';
import { PosViewService } from '@core/services/pos-system/pos-view.service';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';
import { NgxUiLoaderService } from 'ngx-ui-loader';
import { AlertService } from '@core/services/common/alert.service';

@Component({
  selector: 'app-tax-view',
  templateUrl: './tax-view.component.html',
  styleUrls: ['./tax-view.component.css']
})
export class TaxViewComponent implements OnInit {

  id: any;
  taxData: any;
  taxId: any;
  taxSetupId: any;
  taxConditionData: any;

  constructor(
    private ngxLoader: NgxUiLoaderService,
    private activeModal: NgbActiveModal,
    private posDataService: PosDataService,
    private posViewService: PosViewService,
    private alertService: AlertService,
  ) { }

  ngOnInit(): void {
    this.id = this.posViewService.getTaxViewId();
    this.getTaxDataById();

  }

  getTaxDataById() {
    this.ngxLoader.startLoader('loader-01');
    this.posDataService.getTaxById(this.id).subscribe((res: any) => {
      this.ngxLoader.stopLoader('loader-01');
      this.taxData = res['data'];
      let success = res['success'];
      let msg = res['message'];
      if (success) {
        this.taxSetupId = this.taxData.taxSetupId;
      
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
