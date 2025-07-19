import { AlertService } from '@core/services/common/alert.service';
import { PosDataService } from '@core/services/pos-system/pos-data.service';
import { PosDataShareService } from '@core/services/pos-system/posDataShare.service';
import { ModalDismissReasons, NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { RestaurantFormComponent } from './restaurant-form/restaurant-form.component';
import { RestaurantOutletFormComponent } from './restaurant-outlet-form/restaurant-outlet-form.component';
import { RestaurantViewComponent } from './restaurant-view/restaurant-view.component';
import { NgxUiLoaderService } from 'ngx-ui-loader';
import { RestaurantPermissionComponent } from './restaurant-permission/restaurant-permission.component';
import { Component, OnInit, ViewChild } from '@angular/core';
import { DataTableDirective } from 'angular-datatables';
import { Subject } from 'rxjs';
import { CommonService } from '@core/services/common/common.service';

@Component({
  selector: 'app-admin-restaurant',
  templateUrl: './admin-restaurant.component.html',
  styleUrls: ['./admin-restaurant.component.css']
})
export class AdminRestaurantComponent implements OnInit {
  tableListRecord: any = [];
  restaurantData: any;
  closeResult: string;
  outletName: string;
  isDataLoaded = false;
  isSuperAdmin : boolean = false
  //userrole: any;
  loginUser : any;
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

  constructor(
    private ngxLoader: NgxUiLoaderService,
    private modalService: NgbModal,
    private alertService: AlertService,
    private posDataService: PosDataService,
    private posDataSharedService: PosDataShareService,
    public commonService: CommonService
  ) { }

  ngOnInit(): void {
    this.outletName = sessionStorage.getItem('activeOutletname');
    this.getAllRestaurantData();
    //this.userrole = sessionStorage.getItem("Role");
    this.loginUser = JSON.parse(sessionStorage.getItem("userCredential"));
     if (this.loginUser.roleName.toLowerCase() == 'super admin')
      this.isSuperAdmin = true;
  }

  getAllRestaurantData() {
    this.isDataLoaded = false;
    this.ngxLoader.startLoader('loader-01');
    this.posDataService.getAllRestaurants(true).subscribe((res: any) => {
      this.ngxLoader.stopLoader('loader-01');
      this.restaurantData = res['data'];
      let success = res['success'];
      let msg = res['message'];
      if (success) {
        this.isDataLoaded = true;
        this.dtTrigger.next();
        this.tableListRecord.total = this.restaurantData.length;
        let resid = sessionStorage.getItem('activeRestaurantId');
        if (sessionStorage.getItem("Role") != "Super Admin") {
          this.restaurantData = this.restaurantData.filter(v => v.restaurantId == resid);
        }
      } else {
        this.isDataLoaded = true;
        this.alertService.showError(msg);
      }
    });
  }

  openForm() {
    this.modalService.open(RestaurantFormComponent, { backdrop: 'static', windowClass: 'main_add_popup', keyboard: true, centered: true }).result.then((result) => {
      this.closeResult = `Closed with: ${result}`;
      if (result) {
        this.getAllRestaurantData();
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

  edit(id) {
    sessionStorage.setItem('isNewResturant', 'false');
    sessionStorage.setItem('editResturant', id);
    this.posDataSharedService.setRestaurantEditId(id);
    this.modalService.open(RestaurantFormComponent, { backdrop: 'static', windowClass: 'main_add_popup', keyboard: true, centered: true }).result.then((result) => {
      this.closeResult = `Closed with: ${result}`;
      if (result) {
        this.getAllRestaurantData();
      }
    }, (reason) => {
      this.closeResult = `Dismissed ${this.getDismissReason(reason)}`;
    });
  }

  addOutlet(id) {
    this.posDataSharedService.setIdForResOutlet(id);
    this.modalService.open(RestaurantOutletFormComponent, { backdrop: 'static', windowClass: 'main_add_popup', keyboard: true, centered: true }).result.then((result) => {
      this.closeResult = `Closed with: ${result}`;
      if (result) {
        this.getAllRestaurantData();
      }
    }, (reason) => {
      this.closeResult = `Dismissed ${this.getDismissReason(reason)}`;
    });
  }

  view(id) {
    this.posDataSharedService.setIdForResOutlet(id);
    this.modalService.open(RestaurantViewComponent, { backdrop: 'static', windowClass: 'main_add_popup', keyboard: true, centered: true }).result.then((result) => {
      this.closeResult = `Closed with: ${result}`;
    }, (reason) => {
      this.closeResult = `Dismissed ${this.getDismissReason(reason)}`;
    });
  }
  onDelete(id) {
    this.ngxLoader.startLoader('loader-01');
    this.posDataService.deleteAdminRestaurentRow(id).subscribe((res) => {
      this.ngxLoader.stopLoader('loader-01');
      let success = res['success'];
      let msg = res['message'];
      if (success) {
        this.getAllRestaurantData();
        this.alertService.showSuccess('Deleted Successfully');
      }
      else {
        this.alertService.showError(msg);
      }
    });
  }
  openPermissionForm(data) {
    sessionStorage.setItem('restaurantDataToEdit', data);
    sessionStorage.setItem("EditRestPermission", "true");
    this.modalService.open(RestaurantPermissionComponent, { backdrop: 'static', windowClass: 'main_add_popup', keyboard: true, centered: true }).result.then((result) => {
      this.closeResult = `Closed with: ${result}`;
      if (result)
        window.location.reload();
    }, (reason) => {
      this.closeResult = `Dismissed ${this.getDismissReason(reason)}`;
    });
  }
  changeCategoryStatus(id,status){
        this.posDataService.UpdateRestaruntStatus(id,!status).subscribe((res: any) => {
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
