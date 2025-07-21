import { Component, OnInit, ViewChild } from '@angular/core';
import { NgbModal, ModalDismissReasons } from '@ng-bootstrap/ng-bootstrap';
import { AlertService } from '@core/services/common/alert.service';
import { AddItemService } from '../../../../core/services/common/add-item.service';
import { PosEditService } from '@core/services/pos-system/pos-edit.service';
import { AddAdminRoleComponent } from './add-admin-role/add-admin-role.component';
import { PosDataService } from '@core/services/pos-system/pos-data.service';
import { NgxUiLoaderService } from 'ngx-ui-loader';
import { FormAccessEditComponent } from '../master/form-access/form-access-edit/form-access-edit.component';
import { DataTableDirective } from 'angular-datatables';
import { Subject } from 'rxjs';
import { CommonService } from '@core/services/common/common.service';
@Component({
  selector: 'app-admin-role',
  templateUrl: './admin-role.component.html',
  styleUrls: ['./admin-role.component.css']
})
export class AdminRoleComponent implements OnInit {

  closeResult: string;
  outletId: any;
  users: any;
  allItems: any;
  roleData: any;
  outletName: string;
  isAddPermission: boolean = true;
  isSuperAdmin = false;
  userData: any;
  isDataLoaded = false;
  tableListRecord: any = [];
  dtOptions: DataTables.Settings = {
    order: [[1, 'desc']],
    lengthChange: false,
    pageLength: 10,
    infoCallback: (settings: DataTables.SettingsLegacy, start: number, end: number, mnax: number, total: number, pre: string) => {
      this.tableListRecord.total = total;
    }
  };
  @ViewChild(DataTableDirective, { static: false }) datatableElement: DataTableDirective;
  dtElement: DataTableDirective;
  dtTrigger: Subject<any> = new Subject();
  constructor(
    private ngxLoader: NgxUiLoaderService,
    private modalService: NgbModal,
    private alertService: AlertService,
    private addItems: AddItemService,
    private posEditService: PosEditService,
    private posDataService: PosDataService,
    public commonService: CommonService
  ) { }

  ngOnInit(): void {
    this.outletId = sessionStorage.getItem('activeOutletId');
    this.outletName = sessionStorage.getItem('activeOutletname');
    let json = sessionStorage.getItem('userCredential');
    this.userData = JSON.parse(json);
    if (this.userData.roleName.toLowerCase() == 'super admin')
      this.isSuperAdmin = true;
    this.getLatestAdminRole();
  }
  addRoleFormData(data: any) {
    this.ngxLoader.startLoader('loader-01');
    data.ActiveStatus = true;
    this.posDataService.postRoleData(data).subscribe((result) => {
      this.ngxLoader.stopLoader('loader-01');
      this.getLatestAdminRole();
    });
  }

  getLatestAdminRole() {
    this.ngxLoader.startLoader('loader-01');
    let obj = {
      outletId: this.outletId,
      isAllItem: true,
    };
    this.posDataService.getAllRole(obj).subscribe((response) => {
      this.ngxLoader.stopLoader('loader-01');
      this.roleData = response['data'];
      this.dtTrigger.next();
      this.tableListRecord.total = this.roleData?.length;
      this.isDataLoaded = true;
    })
  }


  openForm() {
    this.modalService.open(AddAdminRoleComponent, { backdrop: 'static', windowClass: 'main_add_popup', keyboard: true, centered: true }).result.then((result) => {
      this.closeResult = `Closed with: ${result}`;
      this.getLatestAdminRole();
    }, (reason) => {
      this.closeResult = `Dismissed ${this.getDismissReason(reason)}`;
    });
  }

  private getDismissReason(reason: any): string {
    if (reason === ModalDismissReasons.ESC) {
      return 'by pressing ESC';
    } else if (reason === ModalDismissReasons.BACKDROP_CLICK) {
      return 'by clicking on a backdrop';
    } else {
      return `with: ${reason}`;
    }
  }

  

  edit(id) {
    sessionStorage.setItem('isNewUserType', 'false');
    sessionStorage.setItem('editUserType', id);
    this.posEditService.setRoleEditId(id);
    this.modalService.open(AddAdminRoleComponent, { backdrop: 'static', windowClass: 'main_add_popup', keyboard: true, centered: true }).result.then((result) => {
      this.closeResult = `Closed with: ${result}`;
      if (result) {
        this.getLatestAdminRole();
      }
    }, (reason) => {
      this.closeResult = `Dismissed ${this.getDismissReason(reason)}`;
    });
  }

  onDelete(id) {
    this.ngxLoader.startLoader('loader-01');
    this.posDataService.deleteRoleRow(id).subscribe((res: any) => {
      this.ngxLoader.stopLoader('loader-01');
      let success = res['success'];
      let msg = res['message'];
      if (success) {
        this.getLatestAdminRole();
        this.alertService.showSuccess('Deleted Successfully');
      } else {
        this.alertService.showError(msg);
      }
    });
  }


  editPermission(roleDetails) {
    sessionStorage.setItem("isAddRolePermission", String(this.isAddPermission));
    sessionStorage.setItem("newlyAddedRoleId", roleDetails.roleId);
    sessionStorage.setItem("newlyAddedRoleName", roleDetails.roleName);
    sessionStorage.setItem(roleDetails.userRoleId, "new")
    this.modalService.open(FormAccessEditComponent, { backdrop: 'static', windowClass: 'main_add_popup admin_role_popup', keyboard: true, centered: true }).result.then((result) => {
      this.closeResult = `Closed with: ${result}`;
    }, (reason) => {
      this.closeResult = `Dismissed ${this.getDismissReason(reason)}`;
    });
  }
  changeRoleStatus(id, status) {
    let jsonData: any = {};
    jsonData.RoleId = id;
    jsonData.ActiveStatus = !status

    this.posDataService.changeRoleStatus(id, !status).subscribe((res: any) => {
      this.ngxLoader.stopLoader('loader-01');
      let status = res['success'];
      let msg = res['message'];
      if (status) {
        this.alertService.showSuccess(msg);
      } else {
        this.alertService.showError(msg);
      }
    });
  }
}
