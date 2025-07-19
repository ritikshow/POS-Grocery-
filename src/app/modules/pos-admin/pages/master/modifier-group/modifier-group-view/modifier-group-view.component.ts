import { Component, OnInit } from '@angular/core';
import { PosDataService } from '@core/services/pos-system/pos-data.service';
import { PosViewService } from '@core/services/pos-system/pos-view.service';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';
import { NgxUiLoaderService } from 'ngx-ui-loader';
import { AlertService } from '@core/services/common/alert.service';

@Component({
  selector: 'app-modifier-group-view',
  templateUrl: './modifier-group-view.component.html',
  styleUrls: ['./modifier-group-view.component.css']
})
export class ModifierGroupViewComponent implements OnInit {
  id: any;
  modData: any;

  constructor(
    private ngxLoader: NgxUiLoaderService,
    private activeModal: NgbActiveModal,
    private posDataService: PosDataService,
    private posViewService: PosViewService,
    private alertService: AlertService,
  ) { }

  ngOnInit(): void {
    this.id = this.posViewService.getModifierViewId();
    this.getModDataById();
  }

  getModDataById(){
    this.ngxLoader.startLoader('loader-01');
    this.posDataService.getmodifierById(this.id).subscribe((res: any)=>{
      this.ngxLoader.stopLoader('loader-01');
      this.modData = res['data'];
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
