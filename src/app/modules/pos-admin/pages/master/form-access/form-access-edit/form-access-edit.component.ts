import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { AlertService } from '@core/services/common/alert.service';
import { CommonService } from '@core/services/common/common.service';
import { PosDataService } from '@core/services/pos-system/pos-data.service';
import { PosEditService } from '@core/services/pos-system/pos-edit.service';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';
import { NgxUiLoaderService } from 'ngx-ui-loader';

@Component({
  selector: 'app-form-access-edit',
  templateUrl: './form-access-edit.component.html',
  styleUrls: ['./form-access-edit.component.css']
})
export class FormAccessEditComponent implements OnInit {
  addFormAccess: any = FormGroup;
  fData: any;
  fId: any;
  id: any;
  userId: any;
  public isFormAccess: boolean = false;
  accessFormData: any;
  userData: any;
  formNameData: any;
  outletId: any;
  formDataByUser: any;
  admin = true;
  dashboard = true;
  walkIn = true;
  dineIn = true;
  online = true;
  reports = true;
  kitchen = true;
  masters = true;
  isCompanyAdmin: boolean = false;
  tableDetails = true;
  category = true;
  restaurant = true;
  printDesign = true;
  role = true;
  items = true;
  orderStatus = true;
  itemStatus = true;
  modifiers = true;
  promoCode = true;
  discounts = true;
  userReg = true;
  wareHouse = true;
  taxSetup = true;
  formAccess = true;
  tax = true;
  tableType = true;
  resId: any;
  selecteduserData: any;
  roleDetails: string;
  isAddRolePermission: boolean = false;
  roleId: string;
  roleName: string;
  roleDataById: any;
  userName: string;
  Modules: any;
  Features: any;
  DisplayFeaturesList = [];
  roleData: any;

  constructor(
    private ngxLoader: NgxUiLoaderService,
    private activeModal: NgbActiveModal,
    private formBuilder: FormBuilder,
    private alertService: AlertService,
    private posDataService: PosDataService,
    private posEditService: PosEditService,
    private commonService: CommonService
  ) {
    this.isAddRolePermission = sessionStorage.getItem("isAddRolePermission") ? true : false;
    this.roleId = sessionStorage.getItem("newlyAddedRoleId") ? sessionStorage.getItem("newlyAddedRoleId") : null;
    this.roleName = sessionStorage.getItem("newlyAddedRoleName") ? sessionStorage.getItem("newlyAddedRoleName") : null;
    this.userName = sessionStorage.getItem("editFormAccessUserName") ? sessionStorage.getItem("editFormAccessUserName") : null;

  }

  async ngOnInit() {
    this.addFormAccess = this.formBuilder.group({
      'userId': [''],
      'userRoleId': ['']

    });
    let restData = JSON.parse(sessionStorage.getItem('restaurantData'));
    if (sessionStorage.getItem('activeRestaurantId') !== null && sessionStorage.getItem('activeRestaurantId') !== undefined) {
      this.resId = sessionStorage.getItem('activeRestaurantId');
    } else {
      this.resId = restData.restaurantId;
    }
    await this.getRoleById();
  }

  async getRoleById() {
    this.ngxLoader.startLoader('loader-01');
    await this.posDataService.getRoleByID(this.roleId).subscribe(async (res: any) => {
      this.ngxLoader.stopLoader('loader-01');
      this.roleDataById = res['data'];
      let success = res['success'];
      let msg = res['message'];
      if (success) {
        await this.getAllFeaturesList();
      }
      else {
        this.alertService.showError(msg);
      }
    });
  }

  /**Roles & Permissions new logic 25-03-2025 */
  async getAllFeaturesList() {
    this.ngxLoader.startLoader('loader-01');
    await this.posDataService.getAllFeatures().subscribe(async (res: any) => {
      this.ngxLoader.stopLoader('loader-01');
      this.Features = res['data'];
      for (let i = 0; i < this.Features.length; i++) {
        this.Features[i].isChecked = false;
      }
      setTimeout(async () => {
        await this.getAllModulesList();
      }, 1000);
      let success = res['success'];
      let msg = res['message'];
      if (!success) {
        this.alertService.showError(msg);
      }
    });
  }

  getAllModulesList() {
    this.ngxLoader.startLoader('loader-01');
    this.posDataService.getAllModules().subscribe((res: any) => {
      this.ngxLoader.stopLoader('loader-01');
      this.Modules = res['data'];
      //Implemented on 14-05-2025, Start
      this.DisplayModulesBasedOnRestaurantPermission();
      //Implemented on 14-05-2025, End
      for (let i = 0; i < this.Modules.length; i++) {
        this.Modules[i].isChecked = false;

        //Make Module checkbox checked, based on exisitng assigned permissions for user role
        let findModule = this.roleDataById.permissions?.some(x => x.moduleId == this.Modules[i].moduleId);
        if (findModule) {
          this.Modules[i].isChecked = true;

          //Display & Make Features checkbox checked based on exisitng assigned permissions for role
          let filterPermissionsByModuleId = this.roleDataById.permissions.filter(el => el.moduleId == this.Modules[i].moduleId);
          let filteredMasterData = this.Features.filter(x => x.moduleId == this.Modules[i].moduleId);

          //Check the assigned permissions in master features
          let array = [];
          for (let k = 0; k < filteredMasterData.length; k++) {
            if (filterPermissionsByModuleId.some(x => x.featureId == filteredMasterData[k].featureId)) {
              filteredMasterData[k].isChecked = true // Becuase in role table only true (means : Only assigned) values will be stored
            }
            array.push(filteredMasterData[k]); //Here already assigned permissions + Not assigned permissions will be stored to display it on UI
          }

          let obj =
          {
            "ModuleId": this.Modules[i].moduleId,
            "ModuleName": this.Modules[i].moduleName,
            "Features": array
          }
          this.DisplayFeaturesList.push(obj);
        }
      }
      let success = res['success'];
      let msg = res['message'];
      if (!success) {
        this.alertService.showError(msg);
      }
    });
  }

  //To filter the modules based on selected restaurant permissions, 14-05-2025
  DisplayModulesBasedOnRestaurantPermission() {
    let restData = JSON.parse(sessionStorage.getItem('activeRestaurant'));
    for (let i = 0; i < this.Modules.length; i++) {
      this.Modules[i].isChecked = false;

      //Display modules & Permissions based on selected restaurant permissions
      //Check module -phase 1
      let isAvailable = this.RestaurantMasterPermissions(this.Modules[i].moduleName);
      if (isAvailable) {

        //Check module -phase 2, start.
        for (let k = 0; k < this.commonService.ResturantPermissionMaster.length; k++) {
          let findModuleId = this.Modules.find(el => el.moduleName == this.commonService.ResturantPermissionMaster[k]);

          if (findModuleId != undefined) {
            let findModule = restData?.permission?.find(e => e.moduleId == findModuleId.moduleId);
            if (findModule == undefined) {
              let indx = this.Modules.findIndex(e => e.moduleId == findModuleId.moduleId);
              this.Modules.splice(indx, 1);
            }
          }
        }
        //Check module -phase 2, end.

        //Check if selected restaurant permission have modulename or not, If not then delete from master data.
        if (restData.permission?.some(e => e.moduleId == this.Modules[i].moduleId)) {
          //This block refers : Module is available in restaurant data, So check the features to display.
          let getFilterdList = this.Features.filter(r => r.moduleId == this.Modules[i].moduleId);
          for (let j = 0; j < getFilterdList.length; j++) {
            let Result = restData.permission.filter(x => x.featureId == getFilterdList[j].featureId);
            if (Result.length <= 0) {
              let index = this.Features.findIndex(item => item.featureId == getFilterdList[j].featureId);
              this.Features.splice(index, 1);
            }
          }
        } else {
          this.Modules.splice(i, 1);
        }
      }
    }
  }

  switchModuleButton(moduleData, indx) {
    let isCheck = <HTMLInputElement>document.getElementById(moduleData.moduleId);
    this.Modules[indx].isChecked = isCheck.checked;

    //Display Features Based On Selected Module
    if (isCheck.checked) {
      let getFeaturesByModuleId = this.Features.filter(x => x.moduleId == this.Modules[indx].moduleId);

      //If module button is checked, Then make view/list true by default to showcase the data
      let result = this.commonService.DefaultCheckToViewModuleData(moduleData, getFeaturesByModuleId, true);
      let obj =
      {
        "ModuleId": moduleData.moduleId,
        "ModuleName": moduleData.moduleName, //Not neccessary but kept for recognition
        "Features": result
      }
      this.DisplayFeaturesList.push(obj);
    } else {
      //Uncheck the default view/list from Features array
      let getFeaturesByModuleId = this.Features.filter(x => x.moduleId == this.Modules[indx].moduleId);
      let result = this.commonService.DefaultCheckToViewModuleData(moduleData, getFeaturesByModuleId, false);

      //If uncheck, then delete the module from DisplayFeaturesList, or else it will keep on adding duplciates everytime
      let eleIndex = this.DisplayFeaturesList.findIndex(el => el.ModuleId == this.Modules[indx].moduleId);
      this.DisplayFeaturesList.splice(eleIndex, 1);
    }
  }

  switchFeaturesButton(featureData, displayFeature_ArrayIndx, feature_Arrayindx) {
    let isCheck = <HTMLInputElement>document.getElementById(featureData.featureId);
    this.DisplayFeaturesList[displayFeature_ArrayIndx].Features[feature_Arrayindx].isChecked = isCheck.checked;
  }

  AddPermissionsToRole() {
    const allFeatures = this.DisplayFeaturesList.reduce((acc, module) => acc.concat(module.Features), []);
    let filterFeatures = allFeatures.filter(el => el.isChecked == true);
    let editData = {
      roleId: this.roleDataById.roleId,
      roleName: this.roleDataById.roleName,
      description: this.roleDataById.description,
      permissions: filterFeatures,
      ActiveStatus: this.roleDataById.activeStatus,
      OutletId: this.roleDataById.outletId,
    }

    this.ngxLoader.startLoader('loader-01');
    this.posDataService.upDateRoleData(this.roleId, editData).subscribe((res: any) => {
      this.ngxLoader.stopLoader('loader-01');
      let status = res['success'];
      let msg = res['message'];
      if (status) {
        this.alertService.showSuccess(msg);
        this.activeModal.close(status);
      } else {
        this.alertService.showError(msg);
      }
    });

  }
  closeModal() {
    this.activeModal.close();
  }
  RestaurantMasterPermissions(moduleName) {
    let isAvailable = false;
    switch (moduleName) {
      case "Dashboard":
        isAvailable = true;
        break;
      case "PettyCash":
        isAvailable = true;
        break;
      //Inventory Start
      case "Stock":
        isAvailable = true;
        break;
      case "Product":
        isAvailable = true;
        break;
      case "Supplier":
        isAvailable = true;
        break;
      case "Supplier Order":
        isAvailable = true;
        break;
      case "Batch Item":
        isAvailable = true;
        break;
      //Inventory End
      //Order Start
      case "Dine In":
        isAvailable = true;
        break;
      case "Online":
        isAvailable = true;
        break;
      case "Takeaway":
        isAvailable = true;
        break;
      //Order End
      case "Sales":
        isAvailable = true;
        break;
      default:
        isAvailable = false;
    }
    return isAvailable;
  }
}
