import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from '@core/services/auth/auth.service';
import { CommonService } from '@core/services/common/common.service';
import { PosSharedService } from '@core/services/common/pos-shared.service';

@Component({
  selector: 'app-settings',
  templateUrl: './settings.component.html',
  styleUrls: ['./settings.component.css']
})
export class SettingsComponent implements OnInit {
  roleId: number;
  userId: any;
  restData: any;
  userData: any;
  outletId: any;
  restaurantId: any;
  userRoleId: any;
  permissions: any;
  showTax = false;
  showCategory = false;
  showDeliverect = false;
  showLoyaltyPoints = false;
  showAdminTableDetails = false;
  showUserReg = false;
  showTableType = false;

  constructor(
    private authService: AuthService,
    private posSharedService: PosSharedService,
    private router: Router,
    public commonService: CommonService
  ) {
    this.posSharedService.callToggle.subscribe((data) => {
      this.restaurantId = sessionStorage.getItem('activeRestaurantId');
    });
  }

  ngOnInit() {
    this.userData = JSON.parse(sessionStorage.getItem('userCredential'));
    this.restData = JSON.parse(sessionStorage.getItem('restaurantData'));
    this.restaurantId = sessionStorage.getItem('activeRestaurantId');
    this.outletId = sessionStorage.getItem('activeOutletId');
    this.userId = this.userData.userId;
    this.userRoleId = this.userData.userRoleId;
    this.permissions = JSON.parse(sessionStorage.getItem('RestaurantFeatures'));

    let tax = this.permissions?.find(x => x.key == 'TaxComponent');
    this.showTax = tax?.value;

    let loyaltyPoints = this.permissions?.find(x => x.key == 'LoyalityPointsComponent');
    this.showLoyaltyPoints = loyaltyPoints?.value;

    let category = this.permissions.find(x => x.key == 'AdminCategoryComponent');
    this.showCategory = category?.value;

    let adminTableDetails = this.permissions.find(x => x.key == 'AdminTableDetailsComponent');
    this.showAdminTableDetails = adminTableDetails?.value;

    let userRegistration = this.permissions.find(x => x.key == 'UserRegistrationComponent');
    this.showUserReg = userRegistration?.value;

    let deliverect = this.permissions.find(x => x.key == 'DeliverectComponent');
    this.showDeliverect = deliverect?.value;

    let tableType = this.permissions.find(x => x.key == 'TableTypeComponent');
    this.showTableType = tableType?.value;
  }
}
