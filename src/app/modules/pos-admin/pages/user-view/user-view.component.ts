import { Component, OnInit } from '@angular/core';
import { FormGroup, FormBuilder, Validators, FormArray, FormControl } from '@angular/forms';
import { AlertService } from '@core/services/common/alert.service';
import { PosDataService } from '@core/services/pos-system/pos-data.service';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';
import { NgxUiLoaderService } from 'ngx-ui-loader';
import { DomSanitizer } from '@angular/platform-browser';
import { environment } from 'src/environments/environment';
@Component({
  selector: 'app-user-view',
  templateUrl: './user-view.component.html',
  styleUrls: ['./user-view.component.css']
})

export class UserViewComponent implements OnInit {
  enableEdit = false;
  userForm: any = FormGroup;
  roleData: any;
  countryData: any;
  AllCity: any;
  userRegData: any;
  modItems: any;
  emailIds: any;
  profileImage: any;
  SelectedImage: any;
  outletId: any;
  cityData: any;
  userId: any;
  userData: any;
  restaurantId: any;
  resData: any;
  BaseUrl: any;
  weekOffList: any = [];
  weekOffArray: any = [];
  dropdownList = [];
  selectedItems = [];
  weekOffDropdownList = [
    { WeekDay: 'Sunday' },
    { WeekDay: 'Monday' },
    { WeekDay: 'Tuesday' },
    { WeekDay: 'Wednesday' },
    { WeekDay: 'Thursday' },
    { WeekDay: 'Friday' },
    { WeekDay: 'Saturday' }
  ]

  shiftList = [
    { shiftName: 'Morning' },
    { shiftName: 'Evening' },
    { shiftName: 'Night' }
  ];

  constructor(
    private ngxLoader: NgxUiLoaderService,
    private activeModal: NgbActiveModal,
    private formBuilder: FormBuilder,
    private alertService: AlertService,
    private posDataService: PosDataService,
    private sanitize: DomSanitizer
  ) { }

  ngOnInit(): void {
    this.userData = JSON.parse(sessionStorage.getItem('userCredential'));
    this.userId = this.userData.userId;
    this.userForm = this.formBuilder.group({
      joiningDate: [''],
      userName: ['', Validators.required],
      password: ['', Validators.required],
      userRoleId: ['', Validators.required],
      phoneNo: this.formBuilder.array([this.createPhone()]),
      emailId: ['', Validators.required],
      address: ['', Validators.required],
      city: ['', Validators.required],
      country: ['', Validators.required],
      file: [''],
      imageName: [''],
      imagePath: [''],
      imageExtension: [''],
      idCardNo: [''],
      voidPassword: [''],
      shiftTiming: ['', Validators.required],

    });
    this.BaseUrl = environment.apiUrl.replace(/^(.*:\/\/[^\/]+\/).*$/, '$1');
    this.outletId = sessionStorage.getItem('activeOutletId');
    this.restaurantId = sessionStorage.getItem('activeRestaurantId');
    this.getAllCountry();
    this.getAllRoles();
    this.getUserRegDataById();
  }
  enableEditMethod() {
    this.enableEdit = true;
  }

  getUserRegDataById() {
    this.ngxLoader.startLoader('loader-01');
    this.posDataService.getUSerRegDataById(this.userId).subscribe((res: any) => {
      this.ngxLoader.stopLoader('loader-01');
      this.userData = res['data'];
      if (this.userData?.country != null) {
        let CountryObj = this.countryData?.find(x => x.countryName == this.userData.country);
        if (CountryObj != undefined && CountryObj != null) {
          this.posDataService.getAllCity(CountryObj.id).subscribe((res: any) => {
            this.cityData = res['data'];
          });
        }
      }
      setTimeout(() => {
        this.patchValuesToForm();
      }, 1000);
    });
  }

  SelectCountry() {
    let countryName = (<HTMLInputElement>document.getElementById("CountryName")).value;
    let CountryObj = this.countryData.find(x => x.countryName == countryName);
    this.posDataService.getAllCity(CountryObj.id).subscribe((res: any) => {
      this.cityData = res['data'];
    });
  }
  patchValuesToForm() {
    this.weekOffArray = this.userData.weekDays;
    this.PatchToForm();
    if (this.userData.joiningDate) {
      let date = this.userData.joiningDate.split('T')[0];
      this.userForm.patchValue({
        joiningDate: date
      });
    }
    this.EnablePrimaryNumbersAndWeekDays();
  }
  private EnablePrimaryNumbersAndWeekDays() {
    for (let i = 0; i < this.userData.phoneNo.length; i++) {
      this.LoopNumberAndEnablePrimaryNumber(i);
    }
    for (let i = 0; i < this.weekOffArray.length; i++) {
      const ele = document.getElementById(this.weekOffArray[i]) as HTMLInputElement;
      if (ele !== undefined && ele !== null) {
        ele.checked = true;
      }
    }
  }

  private LoopNumberAndEnablePrimaryNumber(i: number) {
    if (i == 0) {
      (<FormGroup>this.modItemsControls.at(i)).patchValue({
        number: this.userData.phoneNo[i].number,
        isPrimary: this.userData.phoneNo[i].isPrimary
      });
      this.CheckPrimaryNumber(i);
    } else {
      this.modItems = this.userForm.get('phoneNo') as FormArray;
      this.modItems.push(this.createPhone());
      (<FormGroup>this.modItemsControls.at(i)).patchValue({
        number: this.userData.phoneNo[i].number,
        isPrimary: this.userData.phoneNo[i].isPrimary
      });
      this.CheckPrimaryNumber1(i);
    }
  }

  private CheckPrimaryNumber1(i: number) {
    if (this.userData.phoneNo[i].isPrimary) {
      let checkId = 'headerCheck' + Number(i + 1);
      setTimeout(() => {
        const ele = document.getElementById(checkId) as HTMLInputElement;
        if (ele !== undefined && ele !== null) {
          ele.checked = true;
        }
      }, 1000);
    }
  }

  private CheckPrimaryNumber(i: number) {
    if (this.userData.phoneNo[i].isPrimary) {
      let checkId = 'headerCheck' + Number(i + 1);
      const ele = document.getElementById(checkId) as HTMLInputElement;
      if (ele !== undefined && ele !== null) {
        ele.checked = true;
      }
    }
  }

  private PatchToForm() {

    this.userForm.patchValue({
      userName: this.userData.userName,
      password: this.userData.password,
      userRoleId: this.userData.userRoleId,
      joiningDate: this.userData.joiningDate,
      emailId: this.userData.emailId,
      address: this.userData.address,
      city: this.userData.city,
      country: this.userData.country,
      imageName: this.userData.imageName,
      imagePath: this.userData.imagePath,
      imageExtension: this.userData.imageExtension,
      idCardNo: this.userData.idCardNo,
      voidPassword: this.userData.voidPassword,
      shiftTiming: this.userData.shiftTiming,
      Outlets: this.userData.Outlets,
    });
    this.profileImage = this.userData?.imagePath?.match(/Uploads.*/)[0];
  }

  checkCheckBox(i) {
    const ele = document.getElementById('headerCheck' + i) as HTMLInputElement;
    if (ele !== undefined && ele !== null) {
      ele.checked = true;
    }
  }

  createPhone(): FormGroup {
    return this.formBuilder.group({
      number: ['', Validators.required],
      isPrimary: [true, Validators.required]
    });
  }

  get modItemsControls() {
    return this.userForm.get('phoneNo')['controls'];
  }

  addMod(): void {
    this.modItems = this.userForm.get('phoneNo') as FormArray;
    this.modItems.push(this.createPhone());
    setTimeout(() => {
      this.checkCheckBox(this.modItems.length);
    }, 1000);
  }

  removeMod(i) {
    this.modItems.removeAt(i);
  }

  get emailControls() {
    return this.userForm.get('emailId')['controls'];
  }

  addEmail() {
    this.emailIds = this.userForm.get('emailId') as FormArray;
    this.emailIds.push(new FormControl(''));
  }

  removeEmail(i) {
    this.emailIds.removeAt(i);
  }

  getAllRoles() {
    this.ngxLoader.startLoader('loader-01');
    let obj = {
      outletId: this.outletId,
      isAllItem: false,
    };
    this.posDataService.getAllRole(obj).subscribe((res: any) => {
      this.ngxLoader.stopLoader('loader-01');
      this.roleData = res['data'];
    });
  }

  getAllCountry() {
    this.ngxLoader.startLoader('loader-01');
    this.posDataService.getAllCountryData().subscribe((res: any) => {
      this.ngxLoader.stopLoader('loader-01');
      this.countryData = res['data'];
    });
  }

  closeModal() {
    this.activeModal.close();
  }

  onCheckboxChange(event, i) {
    if (event.target.checked) {
      (<FormGroup>this.modItemsControls.at(i)).patchValue({
        isPrimary: true
      });
    } else {
      (<FormGroup>this.modItemsControls.at(i)).patchValue({
        isPrimary: false
      });
    }
  }

  dragNdrop(event) {
    let localUrl;
    if (event.target.files && event.target.files[0]) {
      const file = event.target.files[0];
      this.SelectedImage = file;
      this.profileImage = this.sanitize.bypassSecurityTrustUrl(URL.createObjectURL(file));
      this.userForm.patchValue({
        imageName: file.name,
        imageExtension: file.name.split('.').pop()
      });
    }
  }

  UpdateUser() {

    if (this.userForm.invalid) {
      this.alertService.showError('Fields are empty');
    } else {
      const formData = new FormData();
      formData.append('userId', this.userData.userId);
      formData.append('userName', this.userForm.get('userName').value);
      formData.append('password', this.userForm.get('password').value);
      formData.append('userRoleId', this.userForm.get('userRoleId').value);
      formData.append('phoneNo', JSON.stringify(this.userForm.get('phoneNo').value));
      formData.append('emailId', this.userForm.get('emailId').value);
      formData.append('address', this.userForm.get('address').value);
      formData.append('city', this.userForm.get('city').value);
      formData.append('country', this.userForm.get('country').value);
      formData.append('imageName', this.userForm.get('imageName').value);
      formData.append('imageExtension', this.userForm.get('imageExtension').value);
      formData.append('idCardNo', this.userForm.get('idCardNo').value);
      formData.append('joiningDate', this.userForm.get('joiningDate').value);
      formData.append('shiftTiming', this.userForm.get('shiftTiming').value);
      formData.append('outletId', this.outletId);
      formData.append('voidPassword', this.userForm.get('voidPassword').value);
      formData.append('restaurantId', this.restaurantId);
      formData.append('ActiveStatus', this.userData.activeStatus);
      this.weekOffArray.forEach((day: string, index: number) => {
        formData.append(`weekDays[${index}]`, day);
      });
      if (this.SelectedImage) {
        formData.append('ImageSource', this.SelectedImage);
      }
      else {
        formData.append('imageName', this.userData.imageName);
        formData.append('imageExtension', this.userData.imageExtension);
        formData.append('imagePath', this.userData.imagePath ?? '');
      }
      this.ngxLoader.startLoader('loader-01');
      this.posDataService.updateUserRegData(this.userId, formData).subscribe((res: any) => {
        this.ngxLoader.stopLoader('loader-01');
        let status = res['success'];
        let msg = res['message'];
        if (status) {
          this.activeModal.close(status);
          this.alertService.showSuccess('Updated Successfully!');
        } else {
          this.alertService.showError(msg);
        }
      });
    }
  }

  onWeekOffCheckboxChange(event) {
    let id = event.target.value;

    if (event.target.checked) {
      if (this.weekOffArray == null) {
        this.weekOffArray = [];
      }
      this.weekOffArray.push(id);
    } else {
      let i: number = 0;
      this.weekOffArray.forEach((res: any) => {
        if (res == event.target.value) {
          this.weekOffArray.splice(i, 1);
          return;
        }
        i++;
      });
      const ele = document.getElementById('selectAllWeekOff') as HTMLInputElement;
      if (ele !== undefined && ele !== null) {
        ele.checked = false;
      }
    }
    console.log(this.weekOffArray);
  }

  onSelectAllWeekOffBoxChange(e) {
    this.weekOffList = [];
    if (e.target.checked) {
      for (let i = 0; i < this.weekOffDropdownList.length; i++) {
        this.weekOffList.push(this.weekOffDropdownList[i].WeekDay);
        const ele = document.getElementById(this.weekOffDropdownList[i].WeekDay) as HTMLInputElement;
        if (ele !== undefined && ele !== null) {
          ele.checked = true;
        }
      }
    } else {
      for (let i = 0; i < this.weekOffDropdownList.length; i++) {
        this.weekOffList.splice(0, 1);
        const ele = document.getElementById(this.weekOffDropdownList[i].WeekDay) as HTMLInputElement;
        if (ele !== undefined && ele !== null) {
          ele.checked = false;
        }
      }
    }
  }
  OnClickCancel() {
    this.enableEdit = false;
  }
}
