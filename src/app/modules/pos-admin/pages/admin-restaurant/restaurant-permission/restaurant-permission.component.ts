import { FormGroup, FormControl, FormBuilder, Validators } from '@angular/forms';
import { Component, OnInit } from '@angular/core';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';
import { PosDataService } from '@core/services/pos-system/pos-data.service';
import { AlertService } from '@core/services/common/alert.service';
import { NgxUiLoaderService } from 'ngx-ui-loader';
import { CommonService } from '@core/services/common/common.service';

@Component({
  selector: 'app-restaurant-permission',
  templateUrl: './restaurant-permission.component.html',
  styleUrls: ['./restaurant-permission.component.css']
})
export class RestaurantPermissionComponent implements OnInit {

  addFormAccess: any;
  outletId: any;
  getRestaurantData: any;
  tierOne = [];
  tierTwo = [];
  tierThree = [];
  status = true;
  resData: any;
  ResId: string;
  tierOneChecked = true;
  isDisabledTierOne = true;
  isDisabledTierTwo = true;
  isDisabledTierThree = true;
  isDisabledTierFour = true;
  activeRestaurantId: any;

  //Permissions variables
  Modules: any;
  Features: any;
  DisplayFeaturesList = [];
  isEdit: any;

  constructor(
    private ngxLoader: NgxUiLoaderService,
    private activeModal: NgbActiveModal,
    private posDataService: PosDataService,
    private alertService: AlertService,
    private formBuilder: FormBuilder,
    private commonService: CommonService
  ) {

  }

  async ngOnInit(): Promise<void> {
    this.StaticData();
    this.ResId = sessionStorage.getItem('restaurantDataToEdit');
    this.outletId = sessionStorage.getItem('activeOutletId');
    this.activeRestaurantId = sessionStorage.getItem('activeRestaurantId');
    this.isEdit = sessionStorage.getItem("EditRestPermission");
    await this.getRestauranrById();
    await this.getAllFeaturesList();

    setTimeout(async () => {
      if (this.isEdit) {
        await this.getAllModulesListForEdit();
      } else {
        await this.getAllModulesList();
      }      
    }, 1000);
  }
  StaticData() {
    let tOne2 = {
      label: "Kitchen",
      value: 'KitchenComponent'
    }
    this.tierOne.push(tOne2);

    let tOne3 = {
      label: "tax",
      value: 'TaxComponent'
    }
    this.tierOne.push(tOne3);

    let tOne4 = {
      label: "Table Type",
      value: 'TableTypeComponent'
    }
    this.tierOne.push(tOne4);

    let tOne5 = {
      label: "Take Away",
      value: 'WalkInComponent'
    }
    this.tierOne.push(tOne5);

    let tOne6 = {
      label: "Bar",
      value: 'WarehouseComponent'
    }
    this.tierOne.push(tOne6);

    let tOne7 = {
      label: "Table Details",
      value: 'AdminTableDetailsComponent'
    }
    this.tierOne.push(tOne7);

    let tOne8 = {
      label: "Online",
      value: 'OnlineComponent'
    }
    this.tierOne.push(tOne8);

    let tOne9 = {
      label: "Dashboard",
      value: 'DashboardComponent'
    }
    this.tierOne.push(tOne9);

    let tOne10 = {
      label: "Category",
      value: 'AdminCategoryComponent'
    }
    this.tierOne.push(tOne10);

    let tOne11 = {
      label: "Daily Sales Report",
      value: 'SalesReceiptComponent'
    }
    this.tierOne.push(tOne11);
    //end
    //Tier two
    let tTwo1 = {
      label: "Detailed Report",
      value: 'DetailedReportComponent'
    }
    this.tierTwo.push(tTwo1);

    let tTwo2 = {
      label: "User Registration",
      value: 'UserRegistrationComponent'
    }
    this.tierTwo.push(tTwo2);

    let tTwo3 = {
      label: "Cash Counter Report",
      value: 'pettyCashReport'
    }
    this.tierTwo.push(tTwo3);

    let tTwo4 = {
      label: "Export Customer Data",
      value: 'exportCustomerData'
    }
    this.tierTwo.push(tTwo4);
    //end
    //Tier three

    let tThree1 = {
      label: "Recipe",
      value: 'recipe'
    }
    this.tierThree.push(tThree1);

    let tThree2 = {
      label: "Deliverect",
      value: 'DeliverectComponent'
    }
    this.tierThree.push(tThree2);

    let tThree3 = {
      label: "Inventory",
      value: 'InventoryComponent'
    }
    this.tierThree.push(tThree3);

    let tThree4 = {
      label: "Loyalty Points",
      value: 'LoyalityPointsComponent'
    }
    this.tierThree.push(tThree4);
    //end
  }
  getRestauranrById() {
    this.posDataService.getRestaurantById(this.ResId).subscribe((response: any) => {
      this.ngxLoader.stopLoader('loader-01');
      this.getRestaurantData = response['data'];
      let status = response['success'];
      let msg = response['message'];
      if (status) {
        // setTimeout(() => {
        //   this.addData();
        // }, 1000);
      } else {
        this.alertService.showError(msg);
      }
    });
  }
  addData() {
    let array = [...this.tierOne, ...this.tierTwo, ...this.tierThree];
    if (this.getRestaurantData.permission == undefined || this.getRestaurantData.permission == null)
      this.getRestaurantData.permission = [];
    for (let i = 0; i < this.getRestaurantData.permission.length; i++) {
      if (!array.map(x => x.value).includes(this.getRestaurantData.permission[i].key)) {
        this.getRestaurantData.permission.splice(i, 1);
        i--;
      }
    }
    for (let i = 0; i < array.length; i++) {
      if (this.getRestaurantData.permission.length > 0 && this.getRestaurantData.permission.map(x => x.key).includes(array[i].value)) {
        let indx = this.getRestaurantData.permission.map(function (x) { return x.key; }).indexOf(array[i].value);
        const ele = document.getElementById(this.getRestaurantData.permission[indx].key) as HTMLInputElement;
        if (ele !== undefined && ele !== null) {
          ele.checked = this.getRestaurantData.permission[indx].value;
        }
        this.CheckPermission(this.tierOne, indx, "tierOne");
        this.CheckPermission(this.tierTwo, indx, "tierTwo");
        this.CheckPermission(this.tierThree, indx, "tierThree");
      }
      else {
        let data = {
          key: array[i].value,
          value: true
        };
        this.getRestaurantData.permission.push(data);
      }
    }
  }
  private CheckPermission(tire: any, indx: any, tireName: string) {
    if (tire.map(x => x.value).includes(this.getRestaurantData.permission[indx].key) && this.getRestaurantData.permission[indx].value) {
      const ele = document.getElementById(tireName) as HTMLInputElement;
      if (ele !== undefined && ele !== null) {
        ele.checked = true;
        this.EnableTires(tireName, true);
      }
    }
  }
  private EnableTires(tire: string, IsEnable: boolean) {
    if (tire === "tierOne") {
      this.isDisabledTierOne = IsEnable;
    } else if (tire === "tierTwo") {
      this.isDisabledTierTwo = IsEnable;
    } else if (tire === "tierThree") {
      this.isDisabledTierThree = IsEnable;
    }
  }
  closeModal() {
    this.activeModal.close();
  }
  enable(event, data) {
    if (this.getRestaurantData.permission.map(x => x.key).includes(data)) {
      let indx = this.getRestaurantData.permission.map(function (x) { return x.key; }).indexOf(data);
      this.getRestaurantData.permission[indx].value = event.target.checked;

      const ele = document.getElementById(this.getRestaurantData.permission[indx].key) as HTMLInputElement;
      if (ele !== undefined && ele !== null) {
        ele.checked = event.target.checked;
      }
    } else {
      let data1 = {
        key: data,
        value: event.target.checked
      };
      this.getRestaurantData.permission.push(data1);
    }
  }
  tierCheck(event, tierNumber) {
    if (tierNumber == 1) {
      this.LoopTireAndDissable(event, this.tierOne, "tierOne");
    }
    else if (tierNumber == 2) {
      this.LoopTireAndDissable(event, this.tierTwo, "tierTwo");
    }
    else if (tierNumber == 3) {
      this.LoopTireAndDissable(event, this.tierThree, "tierThree");
    }
  }

  private LoopTireAndDissable(event: any, TireArray: any, TireName: string) {
    for (let i = 0; i < TireArray.length; i++) {
      if (this.getRestaurantData.permission == undefined || this.getRestaurantData.permission == null)
        this.getRestaurantData.permission = [];
      if (this.getRestaurantData.permission.length > 0 && this.getRestaurantData.permission.map(x => x.key).includes(TireArray[i].value)) {
        this.CheckPermissions(TireArray, i, event, TireName);
      }
      else {
        let tierData = {
          key: TireArray[i].value,
          value: true
        };
        this.getRestaurantData.permission.push(tierData);
      }
    }
  }

  private CheckPermissions(TireArray: any, i: number, event: any, TireName: string) {
    let indx = this.getRestaurantData.permission.map(function (x) { return x.key; }).indexOf(TireArray[i].value);
    const ele = document.getElementById(this.getRestaurantData.permission[indx].key) as HTMLInputElement;
    if (ele !== undefined && ele !== null) {
      ele.checked = event.target.checked;
    }
    if (!ele.checked) {
      this.EnableTires(TireName, true);
    }
    else {
      this.EnableTires(TireName, false);
    }
    this.getRestaurantData.permission[indx].value = event.target.checked;
  }

  updatePermissions() {

    const allFeatures = this.DisplayFeaturesList.reduce((acc, module) => acc.concat(module.Features), []);
    let filterFeatures = allFeatures.filter(el => el.isChecked == true);
    this.getRestaurantData.permission = filterFeatures;
    let obj = {
      restaurant: this.getRestaurantData, confirmPassword: null, isSameasOutlet: false, tradeLicense: null, logo: null, tRNCertificate: null, outlet: null
    }
    this.posDataService.updateRestaurantData(this.getRestaurantData.restaurantId, obj).subscribe((res: any) => {
      let status = res['success'];
      let msg = res['message'];
      if (status) {
        this.alertService.showSuccess('Features Updated');
        if (this.activeRestaurantId == this.getRestaurantData.restaurantId) {
          sessionStorage.removeItem('RestaurantFeatures');
          sessionStorage.setItem('RestaurantFeatures', JSON.stringify(this.getRestaurantData.permission));
          this.activeModal.close(status);
        } else
          this.activeModal.close(false);
      } else {
        this.alertService.showError(msg);
      }
    });
  }

  /**Restaurant wise Roles & Permissions, 13-05-2025, Start */
  getAllModulesList() {
    this.ngxLoader.startLoader('loader-01');
    this.posDataService.getAllModules().subscribe((res: any) => {
      this.ngxLoader.stopLoader('loader-01');
      this.Modules = res['data'];
      let specificModulesForResturantPermission = [];
      let isAvailable = false;
      for (let i = 0; i < this.Modules.length; i++) {
        this.Modules[i].isChecked = false;

        //Make specific modules display for restaurant permission level
        isAvailable = this.selectRestaurantPermissionToDisplay(this.Modules[i].moduleName);
        if (isAvailable) {
          let obj = {
            moduleId: this.Modules[i].moduleId,
            moduleName: this.Modules[i].moduleName,
            isChecked: this.Modules[i].isChecked,
          }
          specificModulesForResturantPermission.push(obj);
        }
      }
      this.Modules = specificModulesForResturantPermission;
      console.log("Modules", this.Modules);
      let success = res['success'];
      let msg = res['message'];
      if (!success) {
        this.alertService.showError(msg);
      }
    });
  }
  getAllModulesListForEdit() {
    console.log("From Edit call");
    this.ngxLoader.startLoader('loader-01');
    this.posDataService.getAllModules().subscribe((res: any) => {
      this.ngxLoader.stopLoader('loader-01');
      this.Modules = res['data'];
      //13-05-2025 start
      let specificModulesForResturantPermission = [];
      let isAvailable = false;
      for (let i = 0; i < this.Modules.length; i++) {
        this.Modules[i].isChecked = false;

        //Make specific modules display for restaurant permission level
        isAvailable = this.selectRestaurantPermissionToDisplay(this.Modules[i].moduleName);
        if (isAvailable) {
          let obj = {
            moduleId: this.Modules[i].moduleId,
            moduleName: this.Modules[i].moduleName,
            isChecked: this.Modules[i].isChecked,
          }
          specificModulesForResturantPermission.push(obj);
        }
      }
      this.Modules = specificModulesForResturantPermission;
      //13-05-2025 end

      //Check box make true functionality
      for (let i = 0; i < this.Modules.length; i++) {
        this.Modules[i].isChecked = false;

        //Make Module checkbox checked, based on exisitng assigned permissions for user role
        let findModule = this.getRestaurantData.permission.some(x => x.moduleId == this.Modules[i].moduleId);
        if (findModule) {
          this.Modules[i].isChecked = true;

          //Display & Make Features checkbox checked based on exisitng assigned permissions for role
          let filterPermissionsByModuleId = this.getRestaurantData.permission.filter(el => el.moduleId == this.Modules[i].moduleId);
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

  getAllFeaturesList() {
    this.ngxLoader.startLoader('loader-01');
    this.posDataService.getAllFeatures().subscribe((res: any) => {
      this.ngxLoader.stopLoader('loader-01');
      this.Features = res['data'];
      for (let i = 0; i < this.Features.length; i++) {
        this.Features[i].isChecked = false;
      }
      let success = res['success'];
      let msg = res['message'];
      if (!success) {
        this.alertService.showError(msg);
      }
    });
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

  selectRestaurantPermissionToDisplay(moduleName) {
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
  /**Restaurant wise Roles & Permissions, 13-05-2025, End */

}
