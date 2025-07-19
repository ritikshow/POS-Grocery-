import { FormAccessViewComponent } from './form-access-view/form-access-view.component';
import { PosViewService } from '@core/services/pos-system/pos-view.service';
import { FormAccessEditComponent } from './form-access-edit/form-access-edit.component';
import { PosEditService } from '@core/services/pos-system/pos-edit.service';
import { PosDataService } from '@core/services/pos-system/pos-data.service';
import { Component, OnInit } from '@angular/core';
import { NgbModal, ModalDismissReasons } from '@ng-bootstrap/ng-bootstrap';
import { FormAccessFormComponent } from './form-access-form/form-access-form.component';
import { AlertService } from '@core/services/common/alert.service';
import { NgxUiLoaderService } from 'ngx-ui-loader';

@Component({
  selector: 'app-form-access',
  templateUrl: './form-access.component.html',
  styleUrls: ['./form-access.component.css']
})
export class FormAccessComponent implements OnInit {
  closeResult: string;
  formAccessData: any;
  outletId: any;
  outletName: string;
  userData: any;
  userId: any;
  selectedLevel: any;
  RestaurantId: any;
  resId: any;
  editBtn = false;

  constructor(
    private ngxLoader: NgxUiLoaderService,
    private alertService: AlertService,
    private modalService: NgbModal,
    private posDataService: PosDataService,
    private posEditService: PosEditService,
    private posViewService: PosViewService
  ) { }

  ngOnInit(): void {

    this.userData = JSON.parse(sessionStorage.getItem('userCredential'));
    this.userId = this.userData.userId;
    let restData = JSON.parse(sessionStorage.getItem('restaurantData'));
    if (sessionStorage.getItem('activeRestaurantId') !== null && sessionStorage.getItem('activeRestaurantId') !== undefined) {
      this.resId = sessionStorage.getItem('activeRestaurantId');
    } else {
      this.resId = restData.restaurantId;
    }
    this.outletName = sessionStorage.getItem('activeOutletname');
    this.outletId = sessionStorage.getItem('activeOutletId');
    this.getAllUserRegData();
    this.getAllFormAccessData();

  }
  getAllFormAccessData() {
    this.posDataService.getFormAccessByUserId(this.userId).subscribe((res: any) => {
      this.formAccessData = res['data'];
      let success = res['success'];
      let msg = res['message'];
      if (success) {
        this.editBtn = true;
      }
      else {
        this.alertService.showError(msg);
      }
    });
  }

  getAllUserRegData() {
    this.ngxLoader.startLoader('loader-01');
    this.posDataService.getAllUserRegDataByRestaurantId(this.resId).subscribe((res: any) => {
      this.ngxLoader.stopLoader('loader-01');
      this.userData = res['data'];
      let success = res['success'];
      let msg = res['message'];
      if (!success) {
        this.alertService.showError(msg);
      }
    });
  }
  onChange(event) {
    console.log("event.targetddddd", event.target);
    console.log("event.12333", event.target[5].label);
    sessionStorage.setItem("editFormAccessUserName", event.target.label);
    sessionStorage.setItem("editFormAccessUserName", event.target.label);

    this.selectedLevel = event;
    console.log(event);
    this.userId = this.selectedLevel;
    this.getAllFormAccessData();
  }
  openForm() {
    this.modalService.open(FormAccessFormComponent, { backdrop: 'static', size: 'lg', keyboard: true, centered: true }).result.then((result) => {
      this.closeResult = `Closed with: ${result}`;
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
  view(id) {
    this.posViewService.setFormAccessViewId(id);
    this.modalService.open(FormAccessViewComponent, { backdrop: 'static', size: 'md', keyboard: true, centered: true }).result.then((result) => {
      this.closeResult = `Closed with: ${result}`;
    }, (reason) => {
      this.closeResult = `Dismissed ${this.getDismissReason(reason)}`;
    });
  }

  edit() {
    let uId = this.userId;
    sessionStorage.setItem("editFormAccessUserId", uId);
    this.posEditService.setFormAccessEditId(uId);
    this.modalService.open(FormAccessEditComponent, { backdrop: 'static', size: 'lg', keyboard: true, centered: true }).result.then((result) => {
      this.closeResult = `Closed with: ${result}`;
      if (result) {
        this.getAllFormAccessData();
      }
    }, (reason) => {
      this.closeResult = `Dismissed ${this.getDismissReason(reason)}`;
    });
  }


  onDelete() {
    let id = this.userId;
    this.ngxLoader.startLoader('loader-01');
    this.posDataService.deleteFormAccessRow(id).subscribe((res) => {
      this.ngxLoader.stopLoader('loader-01');
      console.log(res);
      let success = res['success'];
      let msg = res['message'];
      if (success) {
        this.getAllFormAccessData();
        this.alertService.showSuccess('Deleted Successfully');
      }
      else {
        this.alertService.showError(msg);
      }
    });
  }
}
