import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { AlertService } from '@core/services/common/alert.service';
import { PosDataService } from '@core/services/pos-system/pos-data.service';
import { PosEditService } from '@core/services/pos-system/pos-edit.service';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';
import { NgxUiLoaderService } from 'ngx-ui-loader';

@Component({
  selector: 'app-user-reg-restaurant',
  templateUrl: './user-reg-restaurant.component.html',
  styleUrls: ['./user-reg-restaurant.component.css']
})
export class UserRegRestaurantComponent implements OnInit {
  resForm: any = FormGroup;
  AllRestaurant: any;
  resDatabyId: any;
  outletArray = [];
  userId: any;
  resLinkData: any;
  id: any;
  arr: any[];
  isShow: boolean = false;
  resName: any;
  restroId: string;
  userName: string;
  restroDataBytId: any;
  isdisabled: boolean = true;
  resLink: boolean;
  userrestData: any;
  restData: any;
  constructor(
    private ngxLoader: NgxUiLoaderService,
    private activeModal: NgbActiveModal,
    private formBuilder: FormBuilder,
    private alertService: AlertService,
    private posDataService: PosDataService,
    private posEditService: PosEditService,
  ) { }

  ngOnInit(): void {
    this.restroId = sessionStorage.getItem('activeRestaurantId');

    this.userId = this.posEditService.getUserRegEditId();
    let restData = JSON.parse(sessionStorage.getItem('restaurantData'));
    if (sessionStorage.getItem('activeRestaurantId') === null || sessionStorage.getItem('activeRestaurantId') === undefined) {
      this.userId = restData.userId;
    }
    this.userName = sessionStorage.getItem("userNameForLinkRestaurant");
    this.resForm = this.formBuilder.group({
      restaurantId: ['', Validators.required]
    });
    this.getRestaurantData();
    this.GetUserRestaurantsById();
    this.getRestaurantLinkDataByuserId();
  }

  getRestaurantData() {

    this.ngxLoader.startLoader('loader-01');
    this.posDataService.getAllRestaurants(false).subscribe((res: any) => {
      this.ngxLoader.stopLoader('loader-01');
      this.AllRestaurant = res['data'];
    });
  }

  onSelect(event) {
    this.forFilter(event.target.value);
  }
  forFilter(restaurantId) {
    this.resDatabyId = this.AllRestaurant.find(x => x.restaurantId == restaurantId);
    if (this.resLinkData != null && this.resLinkData.length > 0) {
      let linkedRes = this.resLinkData.find(x => x.restaurantId == restaurantId);
      if (linkedRes != null && linkedRes != undefined) {
        this.EnableUserMappedOutlets(linkedRes);
      } else {
        this.CreateNewLinkOfUser(restaurantId);
      }
    } else {
      this.CreateNewLinkOfUser(restaurantId);
    }
  }
  private CreateNewLinkOfUser(restaurantId: any) {
    if (this.resLinkData == null)
      this.resLinkData = [];
    let obj = {
      "userId": this.userId,
      "restaurantId": restaurantId,
      "outlets": [],
      "activeStatus": true
    };
    this.resLinkData.push(obj);
  }

  private EnableUserMappedOutlets(linkedRes: any) {
    setTimeout(() => {
      for (let i = 0; i < linkedRes.outlets.length; i++) {
        const ele = document.getElementById(linkedRes.outlets[i]) as HTMLInputElement;
        if (ele !== undefined && ele !== null) {
          ele.checked = true;
        }
      }
    }, 1000);
  }

  GetUserRestaurantsById() {
    this.ngxLoader.startLoader('loader-01');
    this.posDataService.getUserRegDataById(this.userId).subscribe((res: any) => {
      this.ngxLoader.stopLoader('loader-01');
      this.userrestData = res['data'];
      console.log("single userres", this.userrestData);
    });
  }
  onDelete(id, restid, index) {
    this.ngxLoader.startLoader('loader-01');
    this.posDataService.deleteUserRestaurantLink(id, restid).subscribe((res) => {
      this.ngxLoader.stopLoader('loader-01');
      console.log(res);
      let success = res['success'];
      let msg = res['message'];
      if (success) {
        this.userrestData.splice(index, 1);
        let indx = this.resLinkData.map(function (x) { return x.restaurantId; }).indexOf(restid);
        this.resLinkData.splice(indx, 1);
        this.alertService.showSuccess('Deleted Successfully');
      }
      else {
        this.alertService.showError(msg);
      }
    });
  }
  getRestaurantLinkDataByuserId() {
    this.ngxLoader.startLoader('loader-01');
    this.posDataService.getRestaurantByUserId(this.userId).subscribe((res: any) => {
      this.ngxLoader.stopLoader('loader-01');
      this.resLinkData = res['data'];
    });
  }
  onSelectAllboxChange(e) {
    let outletIds = this.resDatabyId.outlets.map(c => c.outletId);
    let index = this.resLinkData.map(function (x) { return x.restaurantId; }).indexOf(this.resDatabyId.restaurantId);
    this.outletArray = [];
    if (e.target.checked) {
      this.resLinkData[index].outlets = outletIds;
      for (let i = 0; i < outletIds.length; i++) {
        const ele = document.getElementById(outletIds[i]) as HTMLInputElement;
        if (ele !== undefined && ele !== null) {
          ele.checked = true;
        }
      }
    } else {
      this.resLinkData[index].outlets = [];
      for (let i = 0; i < outletIds.length; i++) {
        const ele = document.getElementById(outletIds[i]) as HTMLInputElement;
        if (ele !== undefined && ele !== null) {
          ele.checked = false;
        }
      }
    }
    console.log(this.outletArray);
  }

  onCheckboxChange(event) {

    let id = event.target.value;
    let index = this.resLinkData.map(function (x) { return x.restaurantId; }).indexOf(this.resDatabyId.restaurantId);
    if (event.target.checked) {
      if (!this.resLinkData[index].outlets.includes(id)) {
        this.resLinkData[index].outlets.push(id);
       }
    } else {
      if (this.resLinkData[index].outlets.includes(id)) {
        let inx = this.resLinkData[index].outlets.indexOf(id);
        this.resLinkData[index].outlets.splice(inx, 1);
      }
      const ele = document.getElementById('selectAll') as HTMLInputElement;
      if (ele !== undefined && ele !== null) {
        ele.checked = false;
      }
    }
  }

  closeModal() {
    this.activeModal.close();
  }

  addRes() {
    for (let i = 0; i < this.resLinkData.length; i++) {
      if (this.resLinkData[i].outlets.length !== 0) {
        this.ngxLoader.startLoader('loader-01');
        this.posDataService.updateUserRestaurantLinkData(this.resLinkData[i]).subscribe((res: any) => {
          this.ngxLoader.stopLoader('loader-01');
          let msg = res['message'];
          let status = res['success'];
          if (status) {
            this.activeModal.close(status);
          } else {
            this.alertService.showError(msg);
          }
        });
      }
    }
    this.alertService.showSuccess("Success");
  }
}
