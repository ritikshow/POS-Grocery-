import { Component, OnInit } from '@angular/core';
import { AddItemService } from '@core/services/common/add-item.service';
import { AlertService } from '@core/services/common/alert.service';
import { PosDataService } from '@core/services/pos-system/pos-data.service';
import { NgbActiveModal, NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { NgxUiLoaderService } from 'ngx-ui-loader';


@Component({
  selector: 'app-view-admin-table-details',
  templateUrl: './view-admin-table-details.component.html',
  styleUrls: ['./view-admin-table-details.component.css']
})
export class ViewAdminTableDetailsComponent implements OnInit {

  id: any;
  tableData: any;
  tableId: any;

  constructor(
    private ngxLoader: NgxUiLoaderService,
    private activeModal: NgbActiveModal,
    private modalService: NgbModal,
    private alertService: AlertService,
    private posDataService: PosDataService,
    private addItems: AddItemService
  ) { }

  ngOnInit(): void {
    this.id = this.addItems.getIdForTableDetailsView();
    this.getTableMasterDataById();
  }


  getTableMasterDataById() {
    this.ngxLoader.startLoader('loader-01');
    this.posDataService.getTableMasterById(this.id).subscribe((res: any) => {
      this.ngxLoader.stopLoader('loader-01');
      this.tableData = res['data'];
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
