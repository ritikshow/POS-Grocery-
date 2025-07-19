import { PosDataService } from '@core/services/pos-system/pos-data.service';
import { Component, OnInit } from '@angular/core';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';
import { PosViewService } from '@core/services/pos-system/pos-view.service';
import { NgxUiLoaderService } from 'ngx-ui-loader';
import { AlertService } from '@core/services/common/alert.service';

@Component({
  selector: 'app-form-access-view',
  templateUrl: './form-access-view.component.html',
  styleUrls: ['./form-access-view.component.css']
})
export class FormAccessViewComponent implements OnInit {
  formData: any;
  id: any;
  constructor(
    private ngxLoader: NgxUiLoaderService,
    private activeModal: NgbActiveModal,
    private posDataService: PosDataService,
    private posViewService: PosViewService,
    private alertService: AlertService,
  ) { }

  ngOnInit(): void {
    this.id = this.posViewService.getFormAccessViewId();
    this.getFormAccessById();
  }
  getFormAccessById() {
    this.ngxLoader.startLoader('loader-01');
    this.posDataService.getAllFormAccessById(this.id).subscribe((res: any) => {
      this.ngxLoader.stopLoader('loader-01');
      this.formData = res['data'];
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
