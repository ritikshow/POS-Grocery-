import { Component, OnInit } from '@angular/core';
import { PosDataService } from '@core/services/pos-system/pos-data.service';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';
import { NgxUiLoaderService } from 'ngx-ui-loader';
import { AlertService } from '@core/services/common/alert.service';

@Component({
  selector: 'app-view-mod',
  templateUrl: './view-mod.component.html',
  styleUrls: ['./view-mod.component.css']
})
export class ViewModComponent implements OnInit {
  closeResult: string;
  id: any;
  modData: any;

  constructor(
    private ngxLoader: NgxUiLoaderService,
    private activeModal: NgbActiveModal,
    private posDataService: PosDataService,
    private alertService: AlertService,
  ) { }

  ngOnInit(): void {
    this.id = sessionStorage.getItem('modId');
    this.getModDataById();
  }

  getModDataById() {
    this.ngxLoader.startLoader('loader-01');
    this.posDataService.getmodifierById(this.id).subscribe((res: any) => {
      this.ngxLoader.stopLoader('loader-01');
      this.modData = res['data'];
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
