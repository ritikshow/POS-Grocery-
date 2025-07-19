import { PosEditService } from '@core/services/pos-system/pos-edit.service';
import { PosDataService } from '@core/services/pos-system/pos-data.service';
import { Component, OnInit } from '@angular/core';
import { NgbModal, ModalDismissReasons } from '@ng-bootstrap/ng-bootstrap';
import { AlertService } from '@core/services/common/alert.service';
import { NgxUiLoaderService } from 'ngx-ui-loader';
import { FormGroupEditComponent } from './form-group-edit/form-group-edit.component';
@Component({
  selector: 'app-form-group',
  templateUrl: './form-group.component.html',
})
export class FormGroupComponent implements OnInit {
  closeResult: string;
  outletName: string;
  userData: any;
  userId: any;
  selectedLevel: any;
  RestaurantId: any;
  resId: any;
  formGroupData: any;
  editBtn: any;
  constructor(
    private ngxLoader: NgxUiLoaderService,
    private alertService: AlertService,
    private modalService: NgbModal,
    private posDataService: PosDataService,
    private posEditService: PosEditService,
  ) { }

  ngOnInit(): void {
    let restData = JSON.parse(sessionStorage.getItem('restaurantData'));
    if (sessionStorage.getItem('activeRestaurantId') !== null && sessionStorage.getItem('activeRestaurantId') !== undefined) {
      this.resId = sessionStorage.getItem('activeRestaurantId');
    } else {
      this.resId = restData.restaurantId;
      this.userId = restData.userId;
    }
    this.outletName = sessionStorage.getItem('activeOutletname');
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
  edit() {

    let uId = this.userId;
    sessionStorage.setItem("editFormAccessUserId", uId);
    this.posEditService.setFormAccessEditId(uId);
    this.modalService.open(FormGroupEditComponent, { backdrop: 'static', size: 'lg', keyboard: true, centered: true }).result.then((result) => {
      this.closeResult = `Closed with: ${result}`;
      if (result) {
        this.getAllFormAccessData();
      }

    }, (reason) => {

      this.closeResult = `Dismissed ${this.getDismissReason(reason)}`;
    });
  }
  getAllFormAccessData() {
    this.posDataService.getFormAccessByUserId(this.userId).subscribe((res: any) => {
      this.formGroupData = res['data'];
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
  private getDismissReason(reason: any): string {
    if (reason === ModalDismissReasons.ESC) {
      return 'by pressing ESC';
    } else if (reason === ModalDismissReasons.BACKDROP_CLICK) {
      return 'by clicking on a backdrop';
    } else {
      return `with: ${reason}`;
    }
  }
}
