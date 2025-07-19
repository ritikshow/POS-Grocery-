import { Component, OnInit } from '@angular/core';
import { PosDataService } from '@core/services/pos-system/pos-data.service';
import { PosViewService } from '@core/services/pos-system/pos-view.service';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';
import { NgxUiLoaderService } from 'ngx-ui-loader';
import { AlertService } from '@core/services/common/alert.service';
import { environment } from 'src/environments/environment';

@Component({
  selector: 'app-user-reg-view',
  templateUrl: './user-reg-view.component.html',
  styleUrls: ['./user-reg-view.component.css']
})
export class UserRegViewComponent implements OnInit {
  id: any;
  userId: any;
  userData: any;
  resLinkData: any;
  outletData: any;
  outletId: any;
  itemData: any;
  outlets: any;
  resLinkDatas = [];
  arr: any;
  userMappedRestaurantList = [];
  restId: any;
  BaseUrl: any;
  profileImage: any;


  constructor(
    private ngxLoader: NgxUiLoaderService,
    private activeModal: NgbActiveModal,
    private posDataService: PosDataService,
    private alertService: AlertService,
    private posViewService: PosViewService
  ) { }

  ngOnInit(): void {
    this.userId = this.posViewService.getUserRegViewId();
    this.outletId = sessionStorage.getItem('activeRestaurantId');
    this.BaseUrl = environment.apiUrl.replace(/^(.*:\/\/[^\/]+\/).*$/, '$1');
    this.getRestaurantDataByuserId();
    this.getUserRegDataById();
  }
  getUserRegDataById(){
    this.ngxLoader.startLoader('loader-01');
    this.posDataService.getUSerRegDataById(this.userId).subscribe((res: any)=>{
      this.ngxLoader.stopLoader('loader-01');
      this.userData = res['data'];
      //imagePath
      this.profileImage = this.userData.imagePath?.match(/Uploads.*/)[0];

    });
  }

  getRestaurantDataByuserId() {
    this.ngxLoader.startLoader('loader-01');
    this.posDataService.getRestaurantByUserId(this.userId).subscribe((res: any) => {
      this.ngxLoader.stopLoader('loader-01');
      this.resLinkData = res['data'];



      if(this.resLinkData == null && this.resLinkData.length >0){
        this.alertService.showError("Data is not available")
      }else{
        for( let i=0; i< this.resLinkData.length; i++){
          this.restId = this.resLinkData[i].restaurantId;
          let outlets = this.resLinkData[i].outlets;
          this.getRestaurantDataById(this.restId, outlets);
        }
      }
    });
  }
  getRestaurantDataById(restaurantId, outletIds) {

    this.ngxLoader.startLoader('loader-01');
    this.posDataService.getRestaurantById(restaurantId).subscribe((res: any) => {
      this.ngxLoader.stopLoader('loader-01');
      let data = res['data'];

      this.compareArray(data, outletIds)
    });
  }

  compareArray(resData,outletIds) {

    resData.userMappedOutlets = [];

    for (let i = 0; i < resData.outlets.length; i++) {
      for (let j = 0; j < outletIds.length; j++) {
        if (resData.outlets[i].outletId === outletIds[j]) {
          resData.userMappedOutlets.push(resData.outlets[i]);
        }
      }
    }
    this.userMappedRestaurantList.push(resData) ;

  }

  closeModal() {
    this.activeModal.close();
  }
}
