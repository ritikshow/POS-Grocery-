import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { exit } from 'process';

@Injectable({
  providedIn: 'root'
})
export class CommonService {
  generalSettings: any;
  Modules: any;
  constructor(
    private router: Router
  ) {
    if (JSON.parse(sessionStorage.getItem("GeneralSetting")))
      this.generalSettings = JSON.parse(sessionStorage.getItem("GeneralSetting"))
  }

  DefaultCheckToViewModuleData(moduleData, getFeaturesByModuleId, isCheck) {
    let findFeatureIndx: any;
    switch (moduleData.moduleName) {
      case "Dashboard":
        findFeatureIndx = getFeaturesByModuleId.findIndex(ele => ele.featureCode == "VIEW_DASHBOARD_MODULE");
        break;
      case "Settings":
        findFeatureIndx = getFeaturesByModuleId.findIndex(ele => ele.featureCode == "LIST_TABLE_DESIGNS");
        break;
      case "Menu":
        findFeatureIndx = getFeaturesByModuleId.findIndex(ele => ele.featureCode == "LIST_MENU");
        break;
      case "Stock":
        findFeatureIndx = getFeaturesByModuleId.findIndex(ele => ele.featureCode == "LIST_STOCK");
        break;
      case "Product":
        findFeatureIndx = getFeaturesByModuleId.findIndex(ele => ele.featureCode == "LIST_PRODUCT");
        break;
      case "Supplier":
        findFeatureIndx = getFeaturesByModuleId.findIndex(ele => ele.featureCode == "LIST_SUPPLIER");
        break;
      case "Supplier Order":
        findFeatureIndx = getFeaturesByModuleId.findIndex(ele => ele.featureCode == "LIST_SUPPLIER_ORDER");
        break;
      case "Batch Item":
        findFeatureIndx = getFeaturesByModuleId.findIndex(ele => ele.featureCode == "LIST_BATCH_ITEM");
        break;
      case "Dine In":
        findFeatureIndx = getFeaturesByModuleId.findIndex(ele => ele.featureCode == "LIST_DINE_IN");
        break;
      case "Online":
        findFeatureIndx = getFeaturesByModuleId.findIndex(ele => ele.featureCode == "LIST_ONLINE");
        break;
      case "Takeaway":
        findFeatureIndx = getFeaturesByModuleId.findIndex(ele => ele.featureCode == "LIST_TAKEAWAY");
        break;
      case "Kitchen":
        findFeatureIndx = getFeaturesByModuleId.findIndex(ele => ele.featureCode == "LIST_KITCHEN");
        break;
      case "Bar":
        findFeatureIndx = getFeaturesByModuleId.findIndex(ele => ele.featureCode == "LIST_BAR");
        break;
      case "Sales":
        findFeatureIndx = getFeaturesByModuleId.findIndex(ele => ele.featureCode == "BY_CATEGORY");
        break;
      case "Category":
        findFeatureIndx = getFeaturesByModuleId.findIndex(ele => ele.featureCode == "LIST_CATEGORY");
        break;
      case "Restaurant Sections":
        findFeatureIndx = getFeaturesByModuleId.findIndex(ele => ele.featureCode == "LIST_RESTAURANT_SECTION");
        break;
      case "Table Designs":
        findFeatureIndx = getFeaturesByModuleId.findIndex(ele => ele.featureCode == "LIST_TABLE_DESIGNS");
        break;
      case "Print Design":
        findFeatureIndx = getFeaturesByModuleId.findIndex(ele => ele.featureCode == "LIST_PRINT_DESIGNS");
        break;
      case "Restaurant":
        findFeatureIndx = getFeaturesByModuleId.findIndex(ele => ele.featureCode == "LIST_RESTAURANT");
        break;
      case "Tax":
        findFeatureIndx = getFeaturesByModuleId.findIndex(ele => ele.featureCode == "LIST_TAX");
        break;
      case "Modifiers":
        findFeatureIndx = getFeaturesByModuleId.findIndex(ele => ele.featureCode == "LIST_MODIFIERS");
        break;
      case "Discount":
        findFeatureIndx = getFeaturesByModuleId.findIndex(ele => ele.featureCode == "LIST_DISCOUNT");
        break;
      case "Promo Codes":
        findFeatureIndx = getFeaturesByModuleId.findIndex(ele => ele.featureCode == "LIST_PROMO_CODES");
        break;
      case "Roles & Permissions":
        findFeatureIndx = getFeaturesByModuleId.findIndex(ele => ele.featureCode == "LIST_ROLES_AND_PERMISSIONS");
        break;
      case "User Registration":
        findFeatureIndx = getFeaturesByModuleId.findIndex(ele => ele.featureCode == "LIST_USER_REGISTRATION");
        break;
      case "General Settings":
        findFeatureIndx = getFeaturesByModuleId.findIndex(ele => ele.featureCode == "LIST_GENERAL_SETTINGS");
        break;
      case "Loyality Settings":
        findFeatureIndx = getFeaturesByModuleId.findIndex(ele => ele.featureCode == "LIST_LOYALITY_SETTINGS");
        break;
      case "Shift Timings":
        findFeatureIndx = getFeaturesByModuleId.findIndex(ele => ele.featureCode == "LIST_SHIFT_TIMINGS");
        break;
      case "PettyCash":
        findFeatureIndx = getFeaturesByModuleId.findIndex(ele => ele.featureCode == "LIST_PETTYCASH");
        break;
      case "PaymentMode":
        findFeatureIndx = getFeaturesByModuleId.findIndex(ele => ele.featureCode == "LIST_PAYMENTMODE");
        break;
      case "Cash Counter":
        findFeatureIndx = getFeaturesByModuleId.findIndex(ele => ele.featureCode == "VIEW_CASH_COUNTER");
        break;

    }
    getFeaturesByModuleId[findFeatureIndx].isChecked = isCheck;
    return getFeaturesByModuleId;
  }

  checkRolePermissions(permissionType) {
    this.Modules = JSON.parse(sessionStorage.getItem("ModulesMaster"));
    let UserData = JSON.parse(sessionStorage.getItem('userCredential'));

    //If login user has Super Admin role, then bypass the roles&permissions check
    if (UserData.roleName == 'Super Admin') {
      return true;
    } else {
      //If not, check roless & permissions check for other users
      let result = UserData.permissions?.find(x => x.featureCode == permissionType);
      if (result != undefined || result != null) {
        return result.isChecked;
      } else {
        return false;
      }
    }
  }


  // NavigateUserBasedOnPermissions() {
  //   let UserData = JSON.parse(sessionStorage.getItem('userCredential'));
  //   let path: any;
  //   for (let i = 0; i < UserData.permissions.length; i++) {
  //     path = this.callNavigationBlock(UserData.permissions[i].featureCode);
  //     if (path != "")
  //       break;
  //   }
  //   return path;
  // }


  callNavigationBlock(featureCode) {
    //Navigate
    let path = "";
    switch (featureCode) {
      case "LIST_CATEGORY":
        //this.router.navigate(['/pos-dashboard/dine-in']);
        path = '/pos-dashboard/admin-category';
        break;
      case "LIST_RESTAURANT_SECTION":
        path = '/pos-dashboard/masters-table-type';
        break;
      case "LIST_TABLE_DESIGNS":
        path = '/pos-dashboard/admin-table-details';
        break;
      case "LIST_RESTAURANT":
        path = '/pos-dashboard/admin-restaurant';
        break;
      case "LIST_TAX":
        path = '/pos-dashboard/masters-tax';
        break;
      case "LIST_MODIFIERS":
        path = '/pos-dashboard/masters-modifiers';
        break;
      case "LIST_DISCOUNT":
        path = '/pos-dashboard/masters-discount';
        break;
      case "LIST_PROMO_CODES":
        path = '/pos-dashboard/promo-code';
        break;
      case "LIST_ROLES_AND_PERMISSIONS":
        path = '/pos-dashboard/role';
        break;
      case "LIST_USER_REGISTRATION":
        path = '/pos-dashboard/master-user-registration';
        break;
      case "LIST_MENU":
        path = '/pos-dashboard/item-master';
        break;
      case "LIST_STOCK":
        path = '/pos-dashboard/Inventory';
        break;
      case "LIST_PRODUCT":
        path = '/pos-dashboard/Inventory/product';
        break;
      case "LIST_SUPPLIER":
        path = '/pos-dashboard/Inventory/supplier';
        break;
      case "LIST_SUPPLIER_ORDER":
        path = '/pos-dashboard/Inventory/supplier-order';
        break;
      case "LIST_BATCH_ITEM":
        path = '/pos-dashboard/Inventory/batch-item';
        break;
      case "LIST_DINE_IN":
        path = '/pos-dashboard/dine-in';
        break;
      case "LIST_ONLINE":
        path = '/pos-dashboard/online';
        break;
      case "LIST_TAKEAWAY":
        path = '/pos-dashboard/walk-in';
        break;
      case "LIST_KITCHEN":
        path = '/pos-dashboard/kitchen';
        break;
      case "LIST_BAR":
        path = '/pos-dashboard/warehouse';
        break;
      case "LIST_PRINT_DESIGNS":
        path = '/pos-dashboard/print';
        break;
      case "LIST_GENERAL_SETTINGS":
        path = '/pos-dashboard/general-settings';
        break;
      case "LIST_LOYALITY_SETTINGS":
        path = '/pos-dashboard/loyality-settings';
        break;
      case "LIST_SHIFT_TIMINGS":
        path = '/pos-dashboard/shifttiming';
        break;
      case "BY_CATEGORY":
        path = '/pos-dashboard/sales-by-category';
        break;
      case "BY_ITEM":
        path = '/pos-dashboard/sales-by-item';
        break;
      case "BY_ORDER":
        path = '/pos-dashboard/sales-by';
        break;
      case "VIEW_DASHBOARD_MODULE":
        path = '/pos-dashboard/dashboard';
        break;
      case "LIST_PETTYCASH":
        path = '/pos-dashboard/pettycash';
        break;
      case "LIST_PAYMENTMODE":
        path = '/pos-dashboard/paymentmode';
      case "DOWNLOAD_REPORT":
        path = '/pos-dashboard/pettycash';
      case "ADD_CASH":
        path = '/pos-dashboard/pettycash';

        break;
    }
    return path;
  }
  SetGeneralSetting() {
    this.generalSettings = JSON.parse(sessionStorage.getItem("GeneralSetting"));
  }

  ResturantPermissionMaster = [
    "Dashboard",
    "PettyCash",
    "Stock",
    "Product",
    "Supplier",
    "Supplier Order",
    "Batch Item",
    "Dine In",
    "Online",
    "Takeaway",
    "Sales"
  ];

  //This method is used to check the side menu display permission.
  //If 1 side menu has multiple sub menus inside.
  checkMenuDisplayPermission(ModuleArray) {
    //console.log("called menu disp")
    //If login user has Super Admin role, then bypass the roles&permissions check
    this.Modules = JSON.parse(sessionStorage.getItem("ModulesMaster"));
    let UserData = JSON.parse(sessionStorage.getItem('userCredential'));
    if (UserData.roleName == 'Super Admin') {
      return true;
    } else {

      let ModuleIdArray = [];
      for (let i = 0; i < ModuleArray.length; i++) {
        let getModuleid = this.Modules.find(x => x.moduleName == ModuleArray[i]);
        ModuleIdArray.push(getModuleid);
      }

      //If any 1 module id is present in user->permissions->moduleId. Then display the particular side menu
      let status = false;
      for (let j = 0; j < ModuleIdArray.length; j++) {
        if (UserData?.permissions?.some(x => x.moduleId == ModuleIdArray[j]?.moduleId)) {
          return status = true;
        } else {
          status = false;
          continue;
        }
      }
      return status;
    }
  }

  NavigateUserBasedOnPermissions(isFromLogin, ModuleArray) {
    this.Modules = JSON.parse(sessionStorage.getItem("ModulesMaster"));
    let UserData = JSON.parse(sessionStorage.getItem('userCredential'));
    let path: any;
    if (isFromLogin) {
      //This block refers to navigate the routing on click of user login

      for (let i = 0; i < UserData.permissions.length; i++) {
        path = this.callNavigationBlock(UserData.permissions[i].featureCode);
        if (path != "")
          break;
      }
      return path;

    } else {
      //This block refers to navigate the routing on click of side menu
      let ModuleIdArray = [];
      for (let i = 0; i < ModuleArray.length; i++) {
        let getModuleid = this.Modules.find(x => x.moduleName == ModuleArray[i]);
        if (getModuleid != undefined)
          ModuleIdArray.push(getModuleid);
      }
      /*Only for Orders page, start 03-06-2025
      Whenever user clicks the order menu, The first order type should be active*/
      let tempArray = [];
      let DineInObj = ModuleIdArray.find(x => x.moduleName == 'Dine In');
      let OnlineObj = ModuleIdArray.find(x => x.moduleName == 'Online');
      let TakeawayObj = ModuleIdArray.find(x => x.moduleName == 'Takeaway');

      if (DineInObj) {
        tempArray.push(DineInObj);
        let index = ModuleIdArray.findIndex(x => x.moduleId == DineInObj.moduleId);
        ModuleIdArray.splice(index, 1);
      } if (OnlineObj) {
        tempArray.push(OnlineObj);
        let Onlineindex = ModuleIdArray.findIndex(x => x.moduleId == DineInObj.moduleId);
        ModuleIdArray.splice(Onlineindex, 1);
      } if (TakeawayObj) {
        tempArray.push(TakeawayObj);
        let Takeawayindex = ModuleIdArray.findIndex(x => x.moduleId == DineInObj.moduleId);
        ModuleIdArray.splice(Takeawayindex, 1);
      }
      tempArray.forEach(element => {
        ModuleIdArray.push(element);
      });
      /*Only for Orders page, end 04-06-2025*/

      //If any 1 module id is present in user->permissions->moduleId. Then display the particular side menu
      let status = false;
      for (let j = 0; j < ModuleIdArray.length; j++) {
        if (UserData.permissions.some(x => x.moduleId == ModuleIdArray[j]?.moduleId)) {

          //Navigate the user according to the permission routing
          let getFeatureCodeByModuleId = UserData.permissions.filter(x => x.moduleId == ModuleIdArray[j].moduleId);
          for (let l = 0; l < getFeatureCodeByModuleId.length; l++) {
            path = this.callNavigationBlock(getFeatureCodeByModuleId[l].featureCode);
            if (path != "") {
              break;
            } else {
              continue;
            }
          }
        } else {
          continue;
        }
        break;
      }
      this.router.navigate([path]);
    }

  }

}
