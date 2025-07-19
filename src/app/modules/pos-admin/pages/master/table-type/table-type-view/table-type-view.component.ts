import { Component, OnInit } from '@angular/core';
import { PosDataService } from '@core/services/pos-system/pos-data.service';
import { PosViewService } from '@core/services/pos-system/pos-view.service';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';
import { NgxUiLoaderService } from 'ngx-ui-loader';
import { AlertService } from '@core/services/common/alert.service';

@Component({
  selector: 'app-table-type-view',
  templateUrl: './table-type-view.component.html',
  styleUrls: ['./table-type-view.component.css']
})
export class TableTypeViewComponent implements OnInit {
  id: any;
  tableData: any;

  constructor(
    private ngxLoader: NgxUiLoaderService,
    private activeModal: NgbActiveModal,
    private posDataService: PosDataService,
    private posViewService: PosViewService,
    private alertService: AlertService,
  ) { }

  ngOnInit(): void {
    this.id = this.posViewService.getTableTypeViewId();
    this.getTableDataById();
  }

  getTableDataById(){
    this.ngxLoader.startLoader('loader-01');
    this.posDataService.getTableTypeDataById(this.id).subscribe((res: any)=>{
      this.ngxLoader.stopLoader('loader-01');
      this.tableData = res['data'];
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
