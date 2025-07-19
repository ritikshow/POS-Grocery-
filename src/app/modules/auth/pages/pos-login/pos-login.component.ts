import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { PosAuthService } from '@core/services/auth/pos-auth.service';
import { AlertService } from '@core/services/common/alert.service';
import { ModalDismissReasons, NgbActiveModal, NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { ForgotPasswordComponent } from '../forgot-password/forgot-password.component';
import { NgxUiLoaderService } from 'ngx-ui-loader';
import { PosDataService } from '@core/services/pos-system/pos-data.service';
import { AddItemService } from '@core/services/common/add-item.service';
import { PosSharedService } from '@core/services/common/pos-shared.service';
import { CommonService } from '@core/services/common/common.service';
import * as CryptoJS from 'crypto-js';

@Component({
  selector: 'app-pos-login',
  templateUrl: './pos-login.component.html',
  styleUrls: ['./pos-login.component.css']
})
export class PosLoginComponent implements OnInit {
  LoginForm: FormGroup;
  loginData: any;
  submitted: boolean;
  returnUrl: any;
  userData: any;
  closeResult: string;
  resData = [];
  MultiRestaurant: any;
  showpassword: boolean;
  passIcon: boolean = false;
  loginError: string = "";
  ResturantSelection: boolean = false;
  restaurantUserLink: any;
  resId: string;
  validationNoOutletsForSelectedResturant: any = false;
  resDataByID: any;
  validateResturantSelection: any = false;
  login: boolean = false;
  Modules: any;

  constructor(
    private router: Router,
    private ngxLoader: NgxUiLoaderService,
    private formBuilder: FormBuilder,
    private posDataService: PosDataService,
    private posAuthService: PosAuthService,
    private alertService: AlertService,
    private route: ActivatedRoute,
    private modalService: NgbModal,
    private activeModal: NgbActiveModal,
    private posSharedService: PosSharedService,
    public commonService: CommonService,
    private itemService : AddItemService
  ) { }

  get loginForm() { return this.LoginForm.controls; }

  ngOnInit() {
    this.ResturantSelection = false;
    sessionStorage.clear();
    this.returnUrl = this.route.snapshot.queryParams['returnUrl'] || '/home'
    this.LoginForm = this.formBuilder.group({
      username: ['', Validators.required],
      password: ['', Validators.required],
      restaurantId: ['']
    });
  }
  public onLogin() {
    this.loginError = '';
    this.submitted = true;
    if (this.LoginForm.invalid) {
      this.alertService.showWarning("Field is Empty");
    } else {
      const secretKey = 'qwertyuiop77893408sdsdfd'; 
      const encrypted = CryptoJS.AES.encrypt(this.LoginForm.value.password, secretKey).toString();
      sessionStorage.setItem('Password', encrypted);
      this.posAuthService.userCredential(this.LoginForm.value).subscribe((res: any) => {
        let msg = res['message'];
        let success = res['success'];
        let data = res['data'];
        if (success) {
          this.login = success;

          this.alertService.showSuccess('Login Successfully!!!');
          if (data.roleName == "Super Admin") {
            sessionStorage.setItem('userCredential', JSON.stringify(data));
            sessionStorage.setItem('Role', data.roleName);
            sessionStorage.setItem('token', data.token);
            this.restaurantUserLink = [];
            this.getAllRestaurantData();
          } else {
            this.posAuthService.userResDataByUserId(data.userId).subscribe((res: any) => {
              let Resdata = res['data'];
              this.restaurantUserLink = Resdata;
              sessionStorage.setItem('restaurantData', JSON.stringify(Resdata));
              sessionStorage.setItem('userCredential', JSON.stringify(data));
              sessionStorage.setItem('Role', data.roleName);
              sessionStorage.setItem('token', data.token);
              this.getAllRestaurantData();
            });
          }
          this.validateResturantSelection = false;
        } else {

          this.loginError = msg;

          this.alertService.showError("Login failed!!, email or password is incorrect");
        }
      });
    }
  }
  // Forgot Password Modal
  forgotPassword() {
    this.activeModal.close();
    this.modalService.open(ForgotPasswordComponent, { backdrop: 'static', windowClass: 'main_add_popup', keyboard: true, centered: true }).result.then((result) => {
      this.closeResult = `Closed with: ${result}`;
    }, (reason) => {
      this.closeResult = `Dismissed ${this.getDismissReason(reason)}`;
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



  enablePass(event) {
    if (event.target.value) {
      this.passIcon = true;
    } else {
      this.passIcon = false;
    }
  }

  show_password() {
    this.showpassword = !this.showpassword;
  }

  getAllRestaurantData() {
    this.resData = [];
    this.ngxLoader.startLoader('loader-01');
    this.posDataService.getAllRestaurants(false).subscribe((res: any) => {
      this.ngxLoader.stopLoader('loader-01');
      let data = res['data'];
      let success = res['success'];
      let msg = res['message'];
      if (success) {
        if (sessionStorage.getItem('Role') != 'Super Admin') {
          this.MultiRestaurant = JSON.parse(sessionStorage.getItem('restaurantData'));
          this.MultiRestaurant.forEach(element => {
            let resD = data.find(x => x.restaurantId == element.restaurantId);
            if (resD != null && resD != undefined)
              this.resData?.push(resD);
          });
        }
        else {
          this.resData = data;
        }
        sessionStorage.setItem('restaurants', JSON.stringify(this.resData));
        this.ResturantSelection = true;
      } else {
        this.alertService.showError(msg);
      }
    });
  }

  OnClickLogout() {
    sessionStorage.clear();
    localStorage.removeItem('authToken');
    this.login = false;
    this.ResturantSelection = false
    this.loginForm.restaurantId.setValue("");

  }


  onSelectRestaurant(restaurant): void {

    this.validateResturantSelection = false;
    const selectedRestaurantId = (event.target as HTMLSelectElement).value;
    if (selectedRestaurantId) {
      // if (this.restaurantUserLink && this.restaurantUserLink.length == 0) {
      //   this.resId = selectedRestaurantId;
      // } else {
      //   this.resId = this.restaurantUserLink[0].restaurantId;
      // }
       this.resId = selectedRestaurantId;
      if (this.resId != null && this.resId != undefined)
        this.getRestaurantDataById();
    }
  }

  getRestaurantDataById() {
    this.ngxLoader.startLoader('loader-01');
    this.validationNoOutletsForSelectedResturant = false;
    this.posDataService.getRestaurantById(this.resId).subscribe((res: any) => {
      this.ngxLoader.stopLoader('loader-01');
      this.resDataByID = res['data'];
      let success = res['success'];
      let msg = res['message'];
      if (success) {
        sessionStorage.setItem('activeRestaurant', JSON.stringify(res['data']));
        let outlets = [];
        this.FilterOutlets(outlets);
      } else {
        this.alertService.showError(msg);
        this.validationNoOutletsForSelectedResturant = true;
      }
    });
  }

  private FilterOutlets(outlets: any[]) {
    if (this.restaurantUserLink !== null && this.restaurantUserLink !== undefined && this.restaurantUserLink && this.restaurantUserLink?.length > 0) {
      let userOutlets = this.restaurantUserLink.find(x => x.restaurantId == this.resId).outlets;
      this.LoopAndRemoveOutlet(userOutlets, outlets);
    }
    if (outlets != null && outlets != undefined && outlets.length > 0)
      this.resDataByID.outlets = outlets;
    sessionStorage.setItem('RestaurantFeatures', JSON.stringify(this.resDataByID.permission));
    if (this.resDataByID.outlets && this.resDataByID.outlets.length > 0) {
      sessionStorage.setItem('ResturantByID', JSON.stringify(this.resDataByID));

      let outletId = this.resDataByID.outlets[0].outletId;//this.outletForm.get('outlet').value;
      let outlet = this.resDataByID.outlets[0];
      sessionStorage.setItem('activeOutlet', JSON.stringify(outlet));
      sessionStorage.setItem('activeOutletId', outletId);
      sessionStorage.setItem('activeOutletname', this.resDataByID.outlets[0].outletName);
      sessionStorage.setItem('activeRestaurantId', this.resId);
      this.posSharedService.onSelectNotify(outletId);
    } else {
      this.validationNoOutletsForSelectedResturant = true;
    }
  }

  private LoopAndRemoveOutlet(userOutlets: any, outlets: any[]) {
    userOutlets.forEach(element => {
      if (element != undefined && element != null && element != '')
        outlets.push(this.resDataByID.outlets.find(x => x.outletId == element));
    });
  }

  Reset() {
    window.location.reload();
  }

  onContinue() {
    if (this.LoginForm.get('restaurantId').value == '' || !this.LoginForm.get('restaurantId').value) {
      this.validateResturantSelection = true;
      return;
    }
    if (this.validationNoOutletsForSelectedResturant) {
      return;
    }
    let restaurantId = this.LoginForm.get('restaurantId').value;
    sessionStorage.setItem('activeRestaurantId', restaurantId);
    sessionStorage.setItem('validationNoOutletsForSelectedResturant', String(this.validationNoOutletsForSelectedResturant));

    this.getAllModulesList();
    setTimeout(() => {      
      let userData = JSON.parse(sessionStorage.getItem('userCredential'));
      this.getGeneralSettingsByOutlet();
      //If login user has Super Admin role, then bypass the roles&permissions check
      if (userData.roleName == 'Super Admin') {
        this.router.navigate(['/pos-dashboard/dine-in']);
      } else {
        let path = this.commonService.NavigateUserBasedOnPermissions(true, []);
        this.router.navigate([path]);
        // this.router.navigate(['/pos-dashboard/dine-in']);
      }
    }, 1000);

  }
  getGeneralSettingsByOutlet() {
    this.itemService.getGeneralSettingsByOutletID(sessionStorage.getItem("activeOutletId")).subscribe((res: any) => {
      if (res.success == true) {
        this.ngxLoader.stopLoader('loader-01');
        sessionStorage.setItem("GeneralSetting",JSON.stringify(res.data))
        this.commonService.SetGeneralSetting();
      }
      else {
        this.ngxLoader.stopLoader('loader-01');
      }
    });
  }
  getAllModulesList() {
    this.ngxLoader.startLoader('loader-01');
    this.posDataService.getAllModules().subscribe((res: any) => {
      this.ngxLoader.stopLoader('loader-01');
      this.Modules = res['data'];
      for (let i = 0; i < this.Modules.length; i++) {
        this.Modules[i].isChecked = false;
      }
      console.log("Modules", this.Modules);
      sessionStorage.setItem("ModulesMaster",JSON.stringify(this.Modules));
      let success = res['success'];
      let msg = res['message'];
      if (!success) {
        this.alertService.showError(msg);
      }
    });
  }
}
