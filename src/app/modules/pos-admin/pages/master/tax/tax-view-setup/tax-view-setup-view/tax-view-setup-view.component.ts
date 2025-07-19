import { Component, OnInit } from '@angular/core';
import { AlertService } from '@core/services/common/alert.service';
import { PosDataService } from '@core/services/pos-system/pos-data.service';
import { PosViewService } from '@core/services/pos-system/pos-view.service';
import { NgbActiveModal, NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { NgxUiLoaderService } from 'ngx-ui-loader';

@Component({
  selector: 'app-tax-view-setup-view',
  templateUrl: './tax-view-setup-view.component.html',
  styleUrls: ['./tax-view-setup-view.component.css']
})
export class TaxViewSetupViewComponent implements OnInit {
  outletId: any;
  taxData: any;
  id: any;

  constructor(
    private activeModal: NgbActiveModal,
    private ngxLoader: NgxUiLoaderService,
    private modalService: NgbModal,
    private alertService: AlertService,
    private posDataService: PosDataService,
    private posViewService: PosViewService
  ) { }

  ngOnInit(): void {
    this.id = this.posViewService.getTaxSetupViewId();
   
  }
  closeModal() {
    this.activeModal.close();
  }
 
}
