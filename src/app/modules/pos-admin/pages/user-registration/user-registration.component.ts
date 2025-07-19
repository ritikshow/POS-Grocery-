import { Component, OnInit, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { AlertService } from '@core/services/common/alert.service';
import { PosDataService } from '@core/services/pos-system/pos-data.service';
import { PosEditService } from '@core/services/pos-system/pos-edit.service';
import { PosViewService } from '@core/services/pos-system/pos-view.service';
import { ResetPasswordComponent } from '@module/auth/pages/reset-password/reset-password.component';
import { NgbModal, ModalDismissReasons } from '@ng-bootstrap/ng-bootstrap';
import { NgxUiLoaderService } from 'ngx-ui-loader';
import { UserRegFormComponent } from './user-reg-form/user-reg-form.component';
import { UserRegRestaurantComponent } from './user-reg-restaurant/user-reg-restaurant.component';
import { UserRegViewComponent } from './user-reg-view/user-reg-view.component';
import { Subject } from 'rxjs';
import { DataTableDirective } from 'angular-datatables';
import { CommonService } from '@core/services/common/common.service';

@Component({
  selector: 'app-user-registration',
  templateUrl: './user-registration.component.html',
  styleUrls: ['./user-registration.component.css']
})
export class UserRegistrationComponent implements OnInit {
  tableListRecord: any = [];
  isDataLoaded = false;
  dtOptions: DataTables.Settings = {
    order: [[1, 'desc']],
    lengthChange: false,
    pageLength: 10,
    infoCallback: (settings: DataTables.SettingsLegacy, start: number, end: number, mnax: number, total: number, pre: string) => {
      this.tableListRecord.total = total;
    }
  };
  changedLength(event) {
    this.datatableElement.dtInstance.then((dtInstance: DataTables.Api) => {
      dtInstance.page.len(parseInt(event.target.value)).draw();
    });
  }

  @ViewChild(DataTableDirective, { static: false }) datatableElement: DataTableDirective;
  dtElement: DataTableDirective;
  dtTrigger: Subject<any> = new Subject();

  closeResult: string;
  userRegData: any;
  userData: any;
  resId: any;
  outletName: string;
  finaluserRegData: any;
  restaurantData: any;
  restaurantForm: any = FormGroup;
  tempUserList: any;
  constructor(
    private ngxLoader: NgxUiLoaderService,
    private modalService: NgbModal,
    private alertService: AlertService,
    private posDataService: PosDataService,
    private posViewService: PosViewService,
    private posEditService: PosEditService,
    private formBuilder: FormBuilder,
    public commonService: CommonService

  ) { }

  ngOnInit(): void {
    this.outletName = sessionStorage.getItem('activeOutletname');
    this.resId = sessionStorage.getItem('activeRestaurantId');
    let json = sessionStorage.getItem('userCredential');
    this.userData = JSON.parse(json);
    sessionStorage.removeItem("userNameForLinkRestaurant");
    this.restaurantForm = this.formBuilder.group({
      RestaurantIdList: ['']
    });
    this.getAllUserRegData();
    this.getAllRestaurantData();
  }

  getAllUserRegData() {
    this.isDataLoaded = false;
    if (this.userData.roleName == 'Super Admin') {
      this.ngxLoader.startLoader('loader-01');
      this.posDataService.getAllUserRegData().subscribe((res: any) => {
        this.ngxLoader.stopLoader('loader-01');
        this.userRegData = res['data'];
        this.tempUserList = this.userRegData;
        this.isDataLoaded = true;
        this.dtTrigger.next();
        this.tableListRecord.total = this.userRegData.length;
      });
    } else {
      this.isDataLoaded = false;
      this.ngxLoader.startLoader('loader-01');
      this.posDataService.getAllUserRegDataByRestaurantId(this.resId).subscribe((res: any) => {
        this.ngxLoader.stopLoader('loader-01');

        this.userRegData = res['data'];
        this.tempUserList = this.userRegData;
        this.isDataLoaded = true;
        this.dtTrigger.next();
        this.tableListRecord.total = this.userRegData.length;
      });
    }
  }

  openForm() {
    this.modalService.open(UserRegFormComponent, { backdrop: 'static', windowClass:'main_add_popup', keyboard: true, centered: true }).result.then((result) => {
      this.closeResult = `Closed with: ${result}`;
      if (result) {
        this.getAllUserRegData();
      }
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

  view(data) {
    this.posViewService.setUserRegViewId(data.userId);
    this.modalService.open(UserRegViewComponent, { backdrop: 'static', windowClass:'main_add_popup', keyboard: true, centered: true }).result.then((result) => {
      this.closeResult = `Closed with: ${result}`;
    }, (reason) => {
      this.closeResult = `Dismissed ${this.getDismissReason(reason)}`;
    });
  }
  onKeypressEvent(event: any) {
    let searchValue = event.target.value;
    if (searchValue && searchValue.trim() != '') {
      this.userRegData = this.tempUserList.filter((val) => {
        let userName; let restaurantName; let country;
        if (val.userName != null) {
          let subval = val.userName;
          userName = subval.toString().indexOf(searchValue) > -1;
        }
        if (val.restaurantName != null) {
          restaurantName = val.orderItemsStatus.toLowerCase().indexOf(searchValue.toLowerCase()) > -1;
        }
        if (val.country != null) {
          country = val.country.toLowerCase().indexOf(searchValue.toLowerCase()) > -1;
        }
        return (userName || restaurantName || country);
      })
    } else {
      this.userRegData = this.tempUserList;
    }
  }
  edit(id) {
    sessionStorage.setItem('isNewUser', 'false');
    sessionStorage.setItem('editUserId', id);
    this.modalService.open(UserRegFormComponent, { backdrop: 'static', windowClass:'main_add_popup', keyboard: true, centered: true }).result.then((result) => {
      this.closeResult = `Closed with: ${result}`;
      if (result) {
        this.getAllUserRegData();
      }
    }, (reason) => {
      this.closeResult = `Dismissed ${this.getDismissReason(reason)}`;
    });
  }
  onDelete(id) {
    this.ngxLoader.startLoader('loader-01');
    this.posDataService.deleteMasterUserRegRow(id).subscribe((res) => {
      this.ngxLoader.stopLoader('loader-01');
      console.log(res);
      let success = res['success'];
      let msg = res['message'];
      if (success) {
        this.getAllUserRegData();
        this.alertService.showSuccess('Deleted Successfully');
      }
      else {
        this.alertService.showError(msg);
      }
    });
  }

  addRes(data) {
    this.posEditService.setUserRegEditId(data.userId);
    sessionStorage.setItem("userNameForLinkRestaurant", data.userName);
    this.modalService.open(UserRegRestaurantComponent, { backdrop: 'static', windowClass:'main_add_popup', keyboard: true, centered: true }).result.then((result) => {
      this.closeResult = `Closed with: ${result}`;
      if (result) {
        this.getAllUserRegData();
      }
    }, (reason) => {
      this.closeResult = `Dismissed ${this.getDismissReason(reason)}`;
    });
  }

  resetPassword(userId) {
    sessionStorage.setItem("voidOrderId", null);
    sessionStorage.setItem("userIdForResetPassword", userId);
    this.modalService.open(ResetPasswordComponent, { backdrop: 'static', windowClass:'main_add_popup', keyboard: true, centered: true }).result.then((result) => {
      this.closeResult = `Closed with: ${result}`;
      if (result) {
        this.getAllUserRegData();
      }
    }, (reason) => {
      this.closeResult = `Dismissed ${this.getDismissReason(reason)}`;
    });
  }

  getAllRestaurantData() {
    this.ngxLoader.startLoader('loader-01');
    this.posDataService.getAllRestaurants(false).subscribe((res: any) => {
      this.ngxLoader.startLoader('loader-01');
      console.log(res);
      this.restaurantData = res['data'];
    });
  }
  changeUserStatus(id,status){
    let jsonData : any={};
    jsonData.UserId = id;
    jsonData.ActiveStatus = !status

        this.posDataService.changeUserStatus(id,!status).subscribe((res: any) => {
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
