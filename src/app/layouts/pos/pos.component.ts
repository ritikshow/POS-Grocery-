import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from '@core/services/auth/auth.service';
import { AlertService } from '@core/services/common/alert.service';
import { PosSharedService } from '@core/services/common/pos-shared.service';
import { PosDataService } from '@core/services/pos-system/pos-data.service';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { NgxUiLoaderService } from 'ngx-ui-loader';
import { NoOuletsByResturantComponent } from './no-oulets-by-resturant/no-oulets-by-resturant.component';
import { environment } from 'src/environments/environment';
import Scrollbar from 'smooth-scrollbar';
import { AddItemService } from '@core/services/common/add-item.service';
import { CommonService } from '@core/services/common/common.service';

@Component({
  selector: 'app-pos',
  templateUrl: './pos.component.html',
  styleUrls: ['./pos.component.css']

})

export class PosComponent implements OnInit {
  status: boolean = false;
  resData: any;
  activeRestaurantId: string;
  activeOutletId: string;
  restaurantUserLink: any;
  validationNoOutletsForSelectedResturant: boolean = false;
  resDataByID: any;
  userCredential: any;
  profileImage: any;
  BaseUrl: string;
  activeOutletName: string = 'Select Outlet';
  activeRestaurantName: string = '';
  Notification: number = 0;
  showNotificationPopup: boolean = false;
  notifydata: any;
  intervalId: any;
  Notifactioncount: number = 0;




  constructor(
    private authService: AuthService,
    private ngxLoader: NgxUiLoaderService,
    private posDataService: PosDataService,
    private alertService: AlertService,
    private modalService: NgbModal,
    private router: Router,
    private posSharedService: PosSharedService,
    private itemService: AddItemService,
    private commonService: CommonService

  ) {
  }


  ngOnInit() {
    this.validationNoOutletsForSelectedResturant = sessionStorage.getItem('validationNoOutletsForSelectedResturant') === 'true';
    this.userCredential = JSON.parse(sessionStorage.getItem('userCredential'));
    this.BaseUrl = environment.apiUrl.replace(/^(.*:\/\/[^\/]+\/).*$/, '$1');
    if (this.validationNoOutletsForSelectedResturant) {
      this.modalService.open(NoOuletsByResturantComponent, { backdrop: 'static', windowClass: 'main_add_popup nooutlet_alert_popup', keyboard: true, centered: true }).result.then((result) => {
        if (result) {
        }
      }, (reason) => {
      });
    }
    this.activeRestaurantId = sessionStorage.getItem('activeRestaurantId');
    this.activeOutletId = sessionStorage.getItem('activeOutletId');
    this.activeOutletName = sessionStorage.getItem('activeOutletname');
    this.restaurantUserLink = JSON.parse(sessionStorage.getItem('restaurantData'));
    this.resData = JSON.parse(sessionStorage.getItem('restaurants'));
    this.resDataByID = JSON.parse(sessionStorage.getItem('ResturantByID'));

    const activeRestaurant = sessionStorage.getItem('activeRestaurant');
    if (activeRestaurant) {
      this.activeRestaurantName = JSON.parse(activeRestaurant).restaurantName;
    }

    if (this.userCredential?.imagePath && this.userCredential.imagePath !== 'null') {
      const match = this.userCredential.imagePath.match(/Uploads.*/);
      if (match) {
        this.profileImage = match[0];
      }
    }

    this.intervalId = setInterval(() => {
      this.Getnotification(false);
    }, 1000);
  }


  ngOnDestroy() {
    if (this.intervalId) {
      clearInterval(this.intervalId);
    }
  }

  display() {


  }

  clickEvent() {
    this.status = !this.status;
  }
  onLogout() {
    sessionStorage.clear();
    this.authService.logout();
    this.router.navigate(['/login']);
  }
  onSelectRestaurant(restaurant): void {
    debugger;
    let userCredential = JSON.parse(sessionStorage.getItem("userCredential"));
    const selectedRestaurantId = restaurant.restaurantId;
    const currentRestaurant = JSON.parse(sessionStorage.getItem('activeRestaurant'));
    if (currentRestaurant && currentRestaurant.restaurantName === restaurant.restaurantName) {

      return;

    }
    if (selectedRestaurantId) {
      // if (this.restaurantUserLink && this.restaurantUserLink[0].restaurantId) {
      //   this.activeRestaurantId = this.restaurantUserLink[0].restaurantId;
      // } else {
      //   this.activeRestaurantId = selectedRestaurantId;
      // }
      this.activeRestaurantId = selectedRestaurantId;
      if (restaurant.outlets.length != 0) {
        sessionStorage.setItem('activeRestaurant', JSON.stringify(restaurant));

        if (this.activeRestaurantId != null && this.activeRestaurantId != undefined)
          this.getRestaurantDataById();
      }
      else {
        sessionStorage.setItem('RestaurantWithNoOutlet', restaurant.restaurantName);
        this.modalService.open(NoOuletsByResturantComponent, { backdrop: 'static', windowClass: 'main_add_popup nooutlet_alert_popup', keyboard: true, centered: true }).result.then((result) => {
          if (result) {
          }
        }, (reason) => {
        });
      }
    }
    if (userCredential.permissions.some((data) => data.featureCode == "DINEIN_RUNNING_ORDERS") || userCredential.roleName.toLowerCase() == "super admin")
      this.router.navigateByUrl('/pos-dashboard/masters-tax');
    else {
      let path = this.commonService.NavigateUserBasedOnPermissions(true, []);
      this.router.navigate([path]);
    }
  }
  onSelectOutlet(outlet) {
    debugger;
    const selectedOutletId = outlet.outletId;
    const currentOutlet = JSON.parse(sessionStorage.getItem('activeOutlet'));
    if (currentOutlet && currentOutlet.outletName === outlet.outletName) {

      return;
    }

    if (selectedOutletId) {
      let userCredential = JSON.parse(sessionStorage.getItem("userCredential"));
      let outlet = this.resDataByID.outlets.find(x => x.outletId == selectedOutletId);
      sessionStorage.setItem('activeOutlet', JSON.stringify(outlet));
      sessionStorage.setItem('activeOutletId', selectedOutletId);
      sessionStorage.setItem('activeOutletname', outlet.outletName);
      sessionStorage.setItem('activeRestaurantId', this.activeRestaurantId);
      this.getGeneralSettingsByOutlet(selectedOutletId);
      this.posSharedService.onSelectNotify(selectedOutletId);
      if (userCredential.permissions.some((data) => data.featureCode == "DINEIN_RUNNING_ORDERS") || userCredential.roleName.toLowerCase() == "Super Admin")
        this.router.navigateByUrl('/pos-dashboard/masters-tax');
      else {
        let path = this.commonService.NavigateUserBasedOnPermissions(true, []);
        this.router.navigate([path]);
      }
      setTimeout(() => {
        window.location.reload();
      },)

    }

  }

  getRestaurantDataById() {
    this.ngxLoader.startLoader('loader-01');
    this.validationNoOutletsForSelectedResturant = false;
    sessionStorage.setItem('validationNoOutletsForSelectedResturant', String(this.validationNoOutletsForSelectedResturant));
    this.posDataService.getRestaurantById(this.activeRestaurantId).subscribe((res: any) => {
      this.ngxLoader.stopLoader('loader-01');
      this.resDataByID = res['data'];
      let success = res['success'];
      let msg = res['message'];
      if (success) {
        let outlets = [];
        this.FilterOutlets(outlets);
      } else {
        this.alertService.showError(msg);
        this.validationNoOutletsForSelectedResturant = true;
        sessionStorage.setItem('validationNoOutletsForSelectedResturant', String(this.validationNoOutletsForSelectedResturant));
        this.modalService.open(NoOuletsByResturantComponent, { backdrop: 'static', windowClass: 'main_add_popup nooutlet_alert_popup', keyboard: true, centered: true }).result.then((result) => {
          if (result) {
          }
        }, (reason) => {
        });
      }
    });
  }
  async ngAfterViewChecked(): Promise<void> {
    this.initScrollbars();
  }
  private initScrollbars(): void {
    document.querySelectorAll<HTMLElement>('.resto_dropdown').forEach(el => { Scrollbar.init(el) })
  }

  private FilterOutlets(outlets: any[]) {
    if (this.restaurantUserLink !== null && this.restaurantUserLink !== undefined && this.restaurantUserLink && this.restaurantUserLink?.length > 0) {
      let userOutlets = this.restaurantUserLink?.find(x => x.restaurantId == this.activeRestaurantId)?.outlets;
      this.LoopAndRemoveOutlet(userOutlets, outlets);
    }
    if (outlets != null && outlets != undefined && outlets.length > 0)
      this.resDataByID.outlets = outlets;
    sessionStorage.setItem('RestaurantFeatures', JSON.stringify(this.resDataByID.permission));
    if (this.resDataByID.outlets && this.resDataByID.outlets.length > 0) {
      sessionStorage.setItem('ResturantByID', JSON.stringify(this.resDataByID));

      let outletId = this.resDataByID.outlets[0].outletId;
      let outlet = this.resDataByID.outlets[0];
      sessionStorage.setItem('activeOutlet', JSON.stringify(outlet));
      sessionStorage.setItem('activeOutletId', outletId);
      sessionStorage.setItem('activeOutletname', this.resDataByID.outlets[0].outletName);
      sessionStorage.setItem('activeRestaurantId', this.activeRestaurantId);
      this.getGeneralSettingsByOutlet(outletId);
      this.posSharedService.onSelectNotify(outletId);

    } else {
      this.validationNoOutletsForSelectedResturant = true;
      sessionStorage.setItem('validationNoOutletsForSelectedResturant', String(this.validationNoOutletsForSelectedResturant));
      this.modalService.open(NoOuletsByResturantComponent, { backdrop: 'static', windowClass: 'main_add_popup nooutlet_alert_popup', keyboard: true, centered: true }).result.then((result) => {
        if (result) {
        }
      }, (reason) => {
      });
    }
  }


  private LoopAndRemoveOutlet(userOutlets: any, outlets: any[]) {
    userOutlets.forEach(element => {
      if (element != undefined && element != null && element != '')
        outlets.push(this.resDataByID.outlets.find(x => x.outletId == element));
    });
  }

  Getnotification(isClick) {
    //this.notifydata = ;
    if (isClick == true) {
      this.notifydata = JSON.parse(sessionStorage.getItem("Notification"));
      this.Notification = JSON.parse(sessionStorage.getItem("Notification")).length;
    }
    this.Notifactioncount = JSON.parse(sessionStorage.getItem("Notification")).length;

  }

  toggleDropdown(event: MouseEvent) {
    event.stopPropagation(); // prevent immediate close
    this.showNotificationPopup = !this.showNotificationPopup;
  }

  closeDropdown(event: MouseEvent) {
    const target = event.target as HTMLElement;
    const clickedInside = target.closest('.notifiction_body_blk') || target.closest('#dropdownNotiBlk');
    if (!clickedInside) {
      this.showNotificationPopup = false;
    }
  }

  MarkAsRead(item: any): void {

    this.ngxLoader.startLoader('loader-01');
    this.posDataService.postChangeNotificationStatus([item?.id]).subscribe((res: any) => {
      this.ngxLoader.stopLoader('loader-01');
      this.notifydata = this.notifydata.filter(n => n.id != item.id)
      this.Notification = this.notifydata.length;
      sessionStorage.setItem("Notification", JSON.stringify(this.notifydata));
      this.alertService.showSuccess("Notification Read Successfully");
    });
  }
  markAllAsRead(notifydata: any[]) {
    const allIDs: string[] = notifydata.map((item: any) => item.id);
    this.ngxLoader.startLoader('loader-01');
    this.posDataService.postChangeNotificationStatus(allIDs).subscribe((res: any) => {
      this.ngxLoader.stopLoader('loader-01');
      this.notifydata = this.notifydata.filter(n => !notifydata.map(item => item.id).includes(n.id))
      this.Notification = this.notifydata.length;
      sessionStorage.setItem("Notification", JSON.stringify(this.notifydata));
    });
  }
  GettAllNotification() {
    const today = new Date().toISOString().split('T')[0];
    this.ngxLoader.startLoader('loader-01');
    this.posDataService.getAllNotifications(today).subscribe((res: any) => {
      this.ngxLoader.stopLoader('loader-01');
      this.notifydata = res.data;
      this.Notification = this.notifydata.length;
    });
  }
  getGeneralSettingsByOutlet(selectedOutletId) {
    this.itemService.getGeneralSettingsByOutletID(selectedOutletId).subscribe((res: any) => {
      if (res.success == true) {
        this.ngxLoader.stopLoader('loader-01');
        sessionStorage.setItem("GeneralSetting", JSON.stringify(res.data));
        this.commonService.SetGeneralSetting();
        window.location.reload();
      }
      else {
        this.ngxLoader.stopLoader('loader-01');
      }
    });
  }
}
