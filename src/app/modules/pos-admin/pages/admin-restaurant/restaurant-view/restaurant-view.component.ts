import { Component, OnInit } from '@angular/core';
import { AlertService } from '@core/services/common/alert.service';
import { PosDataService } from '@core/services/pos-system/pos-data.service';
import { PosEditService } from '@core/services/pos-system/pos-edit.service';
import { PosDataShareService } from '@core/services/pos-system/posDataShare.service';
import { NgbActiveModal, NgbModal, ModalDismissReasons } from '@ng-bootstrap/ng-bootstrap';
import { NgxUiLoaderService } from 'ngx-ui-loader';
import { RestaurantOutletEditFormComponent } from '../restaurant-outlet-edit-form/restaurant-outlet-edit-form.component';

@Component({
  selector: 'app-restaurant-view',
  templateUrl: './restaurant-view.component.html',
  styleUrls: ['./restaurant-view.component.css']
})
export class RestaurantViewComponent implements OnInit {
  id: any;
  resData: any;
  closeResult: string;

  constructor(
    private ngxLoader: NgxUiLoaderService,
    private activeModal: NgbActiveModal,
    private modalService: NgbModal,
    private alertService: AlertService,
    private posEditService: PosEditService,
    private posDataService: PosDataService,
    private posDataSharedService: PosDataShareService,
  ) { }

  ngOnInit(): void {
    this.id = this.posDataSharedService.getIdForResOutlet();
    this.getResDataById();
  }

  getResDataById() {
    this.posDataService.getRestaurantById(this.id).subscribe((res: any) => {
      this.resData = res['data'];
      console.log(this.resData);
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

  editOutlet(rId, oId) {
    let obj = {
      resId: rId,
      outletId: oId
    }
    this.posEditService.setResOutletEditId(obj);
    this.modalService.open(RestaurantOutletEditFormComponent, { backdrop: 'static', size: 'md', keyboard: true, centered: true, windowClass: 'main_add_popup' }).result.then((result) => {
      this.closeResult = `Closed with: ${result}`;
      if (result) {
        this.getResDataById();
      }
    }, (reason) => {
      this.closeResult = `Dismissed ${this.getDismissReason(reason)}`;
    });
  }

  onDelete(rId, oId) {
    for (let i = 0; i < this.resData.outlets.length; i++) {
      if (this.resData.outlets[i].outletId == oId) {
        this.resData.outlets.splice(i, 1);
      }
    }
    let data = {
      restaurant: {
        restaurantId: this.resData.restaurantId,
        restaurantName: this.resData.restaurantName,
        restaurantRegistrationNo: this.resData.restaurantRegistrationNo,
        country: this.resData.country,
        outlets: this.resData.outlets,
        logoName: this.resData.logoName,
        logoPath:this.resData.logoPath,
        logoExtension: this.resData.logoExtension,
        tradeLicenseName: this.resData.tradeLicenseName,
        tradeLicenseExtension: this.resData.tradeLicenseExtension,
        tradeLicensePath:this.resData.tradeLicensePath,
        trnNo: this.resData.trnNo,
        trnCertificateName: this.resData.trnCertificateName,
        trnCertificateExtension: this.resData.trnCertificateExtension,
        trnCertificatePath:this.resData.trnCertificatePath,
        firstName: this.resData.firstName,
        middleName: this.resData.middleName,
        lastName: this.resData.lastName,
        address: this.resData.address,
        city: this.resData.city,
        poBox: this.resData.poBox,
        typeOfBussines: this.resData.typeOfBussines,
        typeOfCusine: this.resData.typeOfCusine,
        specialFeatures: this.resData.specialFeatures,
        email: this.resData.email,
        phone: this.resData.phone,
        isThemAgreed: this.resData.isThemAgreed,
        reset: this.resData.reset,
        password:this.resData.password,
        restaurantType:this.resData.restaurantType,
        permission:this.resData.permission,
        wareHouse_Lable: this.resData.wareHouse_Lable,
        activeStatus:this.resData.activeStatus,
      },
      tradeLicense: this.resData.tradeLicense,
      logo: this.resData.logo,
      trnCertificate: this.resData.trnCertificate,
    }
    this.posDataService.updateRestaurantData(rId, data).subscribe((res: any) => {
      let status = res['success'];
      let msg = res['message'];
      if (status) {
        this.activeModal.close(status);
        this.alertService.showSuccess('Outlet Deleted');
      } else {
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
