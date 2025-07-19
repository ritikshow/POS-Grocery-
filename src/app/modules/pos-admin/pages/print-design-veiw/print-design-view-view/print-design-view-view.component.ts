import { Component, OnInit } from '@angular/core';
import { FormBuilder } from '@angular/forms';
import { AlertService } from '@core/services/common/alert.service';
import { PosDataService } from '@core/services/pos-system/pos-data.service';
import { PosViewService } from '@core/services/pos-system/pos-view.service';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';
import { NgxUiLoaderService } from 'ngx-ui-loader';

@Component({
  selector: 'app-print-design-view-view',
  templateUrl: './print-design-view-view.component.html',
  styleUrls: ['./print-design-view-view.component.css']
})
export class PrintDesignViewViewComponent implements OnInit {
  previewData: any;
  id: any;

  constructor(
    private ngxLoader: NgxUiLoaderService,
    private posViewService: PosViewService,
    private activeModal: NgbActiveModal,
    private formBuilder: FormBuilder,
    private alertService: AlertService,
    private posDataService: PosDataService
  ) { }

  ngOnInit(): void {
    this.id = this.posViewService.getNotificationViewId();
    this.printData();
  }
  closeModal() {
    this.activeModal.close();
  }
  printData() {
    this.ngxLoader.startLoader('loader-01');
    this.posDataService.getAllPrintDesignById(this.id).subscribe((res: any) => {
      this.ngxLoader.stopLoader('loader-01');
      this.previewData = res['data'];
      let success = res['success'];
      let msg = res['message'];
      if (!success) {
        this.alertService.showError(msg);
      }
    });
  }
}
