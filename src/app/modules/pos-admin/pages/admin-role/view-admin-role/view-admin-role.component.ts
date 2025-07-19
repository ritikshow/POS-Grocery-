import { Component, OnInit } from '@angular/core';
import { AddItemService } from '@core/services/common/add-item.service';
import { AlertService } from '@core/services/common/alert.service';
import { PosDataService } from '@core/services/pos-system/pos-data.service';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';
import { NgxUiLoaderService } from 'ngx-ui-loader';

@Component({
  selector: 'app-view-admin-role',
  templateUrl: './view-admin-role.component.html',
  styleUrls: ['./view-admin-role.component.css']
})
export class ViewAdminRoleComponent implements OnInit {

  id: any;
  roleData: any;
  roleId: any;

  constructor(
    private ngxLoader: NgxUiLoaderService,
    private activeModal: NgbActiveModal,
    private alertService: AlertService,
    private posDataService: PosDataService,
    private addItems: AddItemService
  ) { }

  ngOnInit(): void {
    this.id = this.addItems.getIdForRoleView();
    this.getRoleDataById();
  }

  getRoleDataById() {
    this.ngxLoader.startLoader('loader-01');
    this.posDataService.getRoleByID(this.id).subscribe((res: any) => {
      this.ngxLoader.stopLoader('loader-01');
      this.roleData = res['data'];
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
