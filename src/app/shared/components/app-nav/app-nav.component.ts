import { Component, OnDestroy, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from '@core/services/auth/auth.service';
import { PosSharedService } from '@core/services/common/pos-shared.service';
import { PosDataService } from '@core/services/pos-system/pos-data.service';
import { PosViewService } from '@core/services/pos-system/pos-view.service';
import { ModalDismissReasons, NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { NgxUiLoaderService } from 'ngx-ui-loader';
import Scrollbar from 'smooth-scrollbar';
import { CommonService } from '@core/services/common/common.service';

@Component({
  selector: 'app-app-nav',
  templateUrl: './app-nav.component.html',
  styleUrls: ['./app-nav.component.css']
})
export class AppNavComponent implements OnInit, OnDestroy {

  menuList: any = [];
  roleId: number;
  masterList: any;
  menuListOrg: any;
  reportsList: any;
  pendingApproval: number;
  isOpen: any;
  isDropdownOpen: any;
  formAccessData: any;
  userId: any;
  dashboardShow = false;
  itemShow = true;
  walkInShow = false;
  dineInShow = true;
  onlineShow = false;
  kitchenShow = false;
  warehouseShow = false;
  restData: any;
  userData: any;
  showFiller = false;
  notifydata: any;
  id: any;
  interval: NodeJS.Timeout;
  counter: any = 0;
  notifyItemIds = [];
  outletId: any;
  outletName: any;
  restaurantId: any;
  closeResult: string;
  itemData: any;
  orderData: any;
  audioCount = 0;
  bar = false;
  isUserRoleAdded: boolean = true;
  userRoleId: any;
  features: any;
  inventoryShow = false;
  status: boolean = false;
  DashboardPermit = false;
  //To fetch url
  URL: any = {};

  //To make menu array 
  InventoryMenu: any;
  Settings: any;
  Orders: any;
  Sales: any;
  constructor(
    private posViewService: PosViewService,
    private modalService: NgbModal,
    private authService: AuthService,
    private posSharedService: PosSharedService,
    private posDataService: PosDataService,
    private router: Router,
    private ngxLoader: NgxUiLoaderService,
    public commonService: CommonService
  ) {
  }

  ngOnInit() {    

    //Segreate menus which have multiple sub menus before features.
    this.makeSubMenuarray();

    this.userData = JSON.parse(sessionStorage.getItem('userCredential'));
    this.restData = JSON.parse(sessionStorage.getItem('restaurantData'));
    this.restaurantId = sessionStorage.getItem('activeRestaurantId');
    this.outletId = sessionStorage.getItem('activeOutletId');
    this.userId = this.userData.userId;
    this.userRoleId = this.userData.userRoleId;
    Scrollbar.init(document.querySelector('.sidemenu_container'));
    this.setMenuItems();
    this.features = JSON.parse(sessionStorage.getItem('RestaurantFeatures'));

    this.getFormPermissionId();
    this.viewNotificationsByUserId();
    this.routerOnActivate();

  }
  openNav() {
    document.getElementById("mySidenav").style.width = "100%";
    document.getElementById("mysidenav_div").style.display = "block";
  }
  closeNav() {
    for (let i = 0; i < this.notifydata.length; i++) {
      if (this.notifydata[i].id) {
        this.notifyItemIds.push(this.notifydata[i].id);
      }
    }
    this.ngxLoader.startLoader('loader-01');
    this.posDataService.postChangeNotificationStatus(this.notifyItemIds).subscribe((res: any) => {
      this.ngxLoader.stopLoader('loader-01');
    });
    document.getElementById("mySidenav").style.width = "0";
    document.getElementById("mysidenav_div").style.display = "none";
  }
  toggleNavbar() {
    this.isOpen = !this.isOpen;
  }

  toggleDropDown() {
    this.isDropdownOpen = !this.isDropdownOpen;
  }
  setMenuItems() {
    this.menuList = [
      {
        "screen_name": "Dashboard",
        "screen_image": "icon-dashboard.svg",
        "screen_order": "1",
        "screen_url": "/home"
      },
      {
        "screen_name": "Users",
        "screen_image": "icon-user.svg",
        "screen_order": "2",
        "screen_url": "/userprofile/users/list"
      }
    ];
  }
  routerOnActivate() {
    this.interval = setInterval(() => {
      this.viewNotificationsByUserId(); // api call
    }, 60000);
  }

  viewNotificationsByUserId() {

    this.posDataService.getNotificationsByUserId(this.userId).subscribe((res: any) => {
      this.notifydata = res['data'];
      this.counter = this.notifydata.length;
      sessionStorage.setItem("Notification", JSON.stringify(this.notifydata));


      if (this.counter !== this.audioCount) {
        // this.audioCount = this.counter;
        // let audio = new Audio();
        // audio.src = "../assets/audio/notifySound.wav";
        // audio.load();
        // audio.play();
      }
    });
  }
  getFormPermissionId() {
    this.ngxLoader.startLoader('loader-01');
    if (this.isUserRoleAdded) {
      this.posDataService.getRoleByID(this.userRoleId).subscribe((res: any) => {
        this.ngxLoader.stopLoader('loader-01');
        this.formAccessData = res['data'].permissions;
        this.disableMenuItems();
      });
    }
    else {
      this.posDataService.getFormAccessByUserId(this.userId).subscribe((res: any) => {
        this.ngxLoader.stopLoader('loader-01');
        this.formAccessData = res['data'];
        this.disableMenuItems();
      });
    }
  }
  disableMenuItems() {
    let kitchen = this.features?.find(x => x.key == 'KitchenComponent');

    let walkin = this.features?.find(x => x.key == 'WalkInComponent');

    let bar = this.features?.find(x => x.key == 'KitchenComponent');

    let online = this.features?.find(x => x.key == 'OnlineComponent');

    let dashboard = this.features?.find(x => x.key == 'DashboardComponent');

    let inventory = this.features?.find(x => x.key == 'InventoryComponent');
    this.CheckPermissionAndShowTabs(inventory, dashboard, walkin, online, kitchen, bar);
  }

  private CheckPermissionAndShowTabs(inventory: any, dashboard: any, walkin: any, online: any, kitchen: any, bar: any) {
    if (inventory?.value && this.userData.roleName === 'Super Admin' || this.userData.roleName === 'Company Admin') {
      this.inventoryShow = true;
    }
    if (this.userData.roleName != 'Super Admin' && this.userData.roleName != 'Company Admin' && this.formAccessData != null && this.formAccessData.length > 0) {
      this.CheckAllPermissions(dashboard, walkin, online, kitchen, bar);
    } else {
      this.warehouseShow = bar?.value;
      this.kitchenShow = kitchen?.value;
      this.dashboardShow = dashboard?.value;
      this.walkInShow = walkin?.value;
      this.onlineShow = online?.value;
    }
  }

  private CheckAllPermissions(dashboard: any, walkin: any, online: any, kitchen: any, bar: any) {
    this.CheckPermissition1(dashboard);
    this.CheckPermissition2(walkin);
    this.CheckPermissition3(online, kitchen);
    if (this.formAccessData.map(x => x.formId).includes("61a208700de641b6533d1aae")) {
      let availableData = this.formAccessData.find(x => x.formId == "61a208700de641b6533d1aae");
      if (bar.value && availableData.isFormAccess) {
        this.warehouseShow = true;
      }
    }
  }

  private CheckPermissition3(online: any, kitchen: any) {
    if (this.formAccessData.map(x => x.formId).includes("616fcb914754880a6f3053f2")) {
      let availableData = this.formAccessData.find(x => x.formId == "616fcb914754880a6f3053f2");
      if (online.value && availableData.isFormAccess) {
        this.onlineShow = true;
      }
    }
    if (this.formAccessData.map(x => x.formId).includes("616fcbab4754880a6f3053f3")) {
      let availableData = this.formAccessData.find(x => x.formId == "616fcbab4754880a6f3053f3");
      if (kitchen.value && availableData.isFormAccess) {
        this.kitchenShow = true;
      }
    }
  }

  private CheckPermissition2(walkin: any) {
    if (this.formAccessData.map(x => x.formId).includes("612626f34d9ab38e75f63b48")) {
      let availableData = this.formAccessData.find(x => x.formId == "612626f34d9ab38e75f63b48");
      if (walkin.value && availableData.isFormAccess) {
        this.walkInShow = true;
      }
    }
    if (this.formAccessData.map(x => x.formId).includes("616fcb634754880a6f3053f1")) {
      let availableData = this.formAccessData.find(x => x.formId == "616fcb634754880a6f3053f1");
      if (!availableData.isFormAccess) {
        this.dineInShow = false;
      }
    }
  }

  private CheckPermissition1(dashboard: any) {
    if (this.formAccessData.map(x => x.formId).includes("612626104d9ab38e75f63b47")) {
      let availableData = this.formAccessData.find(x => x.formId == "612626104d9ab38e75f63b47");
      if (dashboard.value && availableData.isFormAccess) {
        this.dashboardShow = true;
      }
    }
    if (this.formAccessData.map(x => x.formId).includes("616ff45193a8d65d6c50a439")) {
      let availableData = this.formAccessData.find(x => x.formId == "616ff45193a8d65d6c50a439");
      if (!availableData.isFormAccess) {
        this.itemShow = false;
      }
    }
  }

  clickEvent() {
    this.status = !this.status;
  }

  onLogout() {
    sessionStorage.clear();
    this.authService.logout();
    this.router.navigate(['/login']);
  }

  ngOnDestroy() {
    clearInterval(this.interval);
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
 
  //Abhijith
  //For more than 1 submenu for side menu. Add here
  makeSubMenuarray() {
    this.InventoryMenu = ['Stock', 'Product', 'Supplier', 'Supplier Order', 'Batch Item'];
    this.Settings = ['Category', 'Restaurant Sections', 'Table Designs', 'Print Design', 'Restaurant', 'Tax', 'Modifiers',
      'Discount', 'Promo Codes', 'Roles & Permissions', 'User Registration', 'General Settings','Loyality Settings', 'Tier Managemen' , 'Shift Timings'
    ];
    this.Orders = ['Dine In', 'Online', 'Takeaway'];
    this.Sales = ['Sales'];
  }
}
