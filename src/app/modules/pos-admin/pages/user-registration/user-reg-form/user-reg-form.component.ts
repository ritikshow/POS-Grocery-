import { Component, OnInit } from '@angular/core';
import { FormGroup, FormBuilder, Validators, FormArray, FormControl } from '@angular/forms';
import { AlertService } from '@core/services/common/alert.service';
import { PosDataService } from '@core/services/pos-system/pos-data.service';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';
import { NgxUiLoaderService } from 'ngx-ui-loader';
import { DomSanitizer } from '@angular/platform-browser';
import { environment } from 'src/environments/environment';
import { PhoneValidatorService } from 'src/app/validators/phone-validator.service';
@Component({
  selector: 'app-user-reg-form',
  templateUrl: './user-reg-form.component.html',
  styleUrls: ['./user-reg-form.component.css']
})
export class UserRegFormComponent implements OnInit {
  userForm: any = FormGroup;
  roleData: any;
  countryData: any;
  AllCity: any;
  userRegData: any;
  modItems: any;
  emailIds: any;
  profileImage: any;
  outletId: any;
  cityData: any;
  SelectedImage: any;
  BaseUrl: string;
  id: any;
  userData: any;
  restaurantId: any;
  resData: any;
  weekOffList: any = [];
  weekOffArray: any = [];
  dropdownList = [];
  isUpdate = false;
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
  ]

  showPassword = false;
  showConfirmPassword = false;
  passwordLengthValid = false;
  passwordCaseValid = false;
  passwordNumberValid = false;
  passwordSpecialValid = false;
  passwordMismatch = false;
  countryList: any[] = [];
  selectedCountries: any[] = [];
  countryCodeInput: string[] = [];
  countryCodeError: boolean[] = [];

  constructor(
    private ngxLoader: NgxUiLoaderService,
    private activeModal: NgbActiveModal,
    private formBuilder: FormBuilder,
    private alertService: AlertService,
    private posDataService: PosDataService,
    private sanitize: DomSanitizer,
    private phoneValidator: PhoneValidatorService
  ) { }

  ngOnInit(): void {
    this.countryList = this.phoneValidator.getCountries();
    const defaultCountry = this.countryList.find(c => c.dialCode === '+91') || this.countryList[0];
    this.selectedCountries = [defaultCountry];
    this.countryCodeInput = [defaultCountry.dialCode];
    this.countryCodeError = [false];
    this.userForm = this.formBuilder.group({
      userName: ['', Validators.required],
      password: ['', [Validators.required, Validators.minLength(6), Validators.maxLength(16), Validators.pattern('^(?=.*[a-z])(?=.*[A-Z])(?=.*\\d)(?=.*[@$!%*?&])[A-Za-z\\d@$!%*?&]{6,16}$')]],
      confirmPassword: ['', Validators.required],
      userRoleId: ['', Validators.required],
      phoneNo: this.formBuilder.array([this.createPhone(0)]),
      emailId: ['', [Validators.required, Validators.email]],
      address: ['', Validators.required],
      city: ['', Validators.required],
      country: ['', Validators.required],
      shiftTiming: ['', Validators.required],
      file: [''],
      imageName: [''],
      imagePath: [''],
      imageExtension: [''],
      idCardNo: [''],
      joiningDate: [''],
      voidPassword: [''],

    });
    this.outletId = sessionStorage.getItem('activeOutletId');
    this.restaurantId = sessionStorage.getItem('activeRestaurantId');
    this.getAllCountry();
    this.getAllRoles();
    let isNew = sessionStorage.getItem('isNewUser');
    if (isNew == 'false') {
      this.id = sessionStorage.getItem('editUserId');
      this.isUpdate = true;
      this.getUserRegDataById();
      sessionStorage.removeItem('isNewUser');
      sessionStorage.removeItem('editUserId');
    }
    this.BaseUrl = environment.apiUrl.replace(/^(.*:\/\/[^\/]+\/).*$/, '$1');
  }

  getUserRegDataById() {
    this.ngxLoader.startLoader('loader-01');
    this.posDataService.getUSerRegDataById(this.id).subscribe((res: any) => {
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
    debugger
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
    this.LoopNumber();
    for (let i = 0; i < this.weekOffArray.length; i++) {
      const ele = document.getElementById(this.weekOffArray[i]) as HTMLInputElement;
      if (ele !== undefined && ele !== null) {
        ele.checked = true;
      }
    }
  }
  private LoopNumber() {
    for (let i = 0; i < this.userData.phoneNo.length; i++) {
      let matchedCountry = this.countryList[0];
      const phone = this.userData.phoneNo[i];
      if (phone.countryCode) {
        matchedCountry = this.countryList.find(c => c.dialCode === phone.countryCode) || this.countryList[0];
      } else if (phone.countryName) {
        matchedCountry = this.countryList.find(c => c.name === phone.countryName) || this.countryList[0];
      }
      this.countryCodeInput[i] = matchedCountry.dialCode;
      this.selectedCountries[i] = matchedCountry;
      if (i == 0) {
        console.log('Patching phone[0]:', {
          country: matchedCountry,
          number: phone.number,
          isPrimary: phone.isPrimary
        });
        (<FormGroup>this.modItemsControls.at(i)).patchValue({
          country: matchedCountry,
          number: phone.number,
          isPrimary: phone.isPrimary
        });
        this.CheckPrimaryNumber(i);
      } else {
        this.EnablePrimaryNumberInView(i, matchedCountry, phone);
      }
    }
  }

  private EnablePrimaryNumberInView(i: number, matchedCountry?: any, phone?: any) {
    this.modItems = this.userForm.get('phoneNo') as FormArray;
    this.modItems.push(this.createPhone(i));
    if (matchedCountry && phone) {
      console.log(`Patching phone[${i}]:`, {
        country: matchedCountry,
        number: phone.number,
        isPrimary: phone.isPrimary
      });
      (<FormGroup>this.modItemsControls.at(i)).patchValue({
        country: matchedCountry,
        number: phone.number,
        isPrimary: phone.isPrimary
      });
    } else {
      (<FormGroup>this.modItemsControls.at(i)).patchValue({
        number: this.userData.phoneNo[i].number,
        isPrimary: this.userData.phoneNo[i].isPrimary
      });
    }
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
    // Patch selectedCountries for each phone number
    if (this.userData && this.userData.phoneNo) {
      this.selectedCountries = this.userData.phoneNo.map((p: any) => {
        return this.countryList.find(c => c.dialCode === (p.countryCode || '+91')) || this.countryList[0];
      });
      this.countryCodeInput = this.selectedCountries.map(c => c.dialCode);
      this.countryCodeError = this.selectedCountries.map(() => false);
    }

    this.userForm.patchValue({
      userName: this.userData.userName,
      password: this.userData.password,
      confirmPassword: this.userData.password,
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
    if (this.userData?.imagePath != null && this.userData?.imagePath != 'null')
      this.profileImage = this.userData?.imagePath?.match(/Uploads.*/)[0];
  }

  checkCheckBox(i) {
    const ele = document.getElementById('headerCheck' + i) as HTMLInputElement;
    if (ele !== undefined && ele !== null) {
      ele.checked = true;
    }
  }

  createPhone(index: number): FormGroup {
    const country = this.selectedCountries[index] || this.countryList[0];
    this.countryCodeInput[index] = country.dialCode;
    this.countryCodeError[index] = false;
    return this.formBuilder.group({
      country: [country, Validators.required],
      number: ['', [Validators.required, this.phoneValidator.createPhoneValidator(country)]],
      isPrimary: [true, Validators.required]
    });
  }

  get modItemsControls() {
    return this.userForm.get('phoneNo')['controls'];
  }

  addMod(): void {
    this.modItems = this.userForm.get('phoneNo') as FormArray;
    const defaultCountry = this.countryList.find(c => c.dialCode === '+91') || this.countryList[0];
    this.selectedCountries.push(defaultCountry);
    this.countryCodeInput.push(defaultCountry.dialCode);
    this.countryCodeError.push(false);
    this.modItems.push(this.createPhone(this.modItems.length));
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
    if (event.target.files && event.target.files[0]) {
      const file = event.target.files[0];
      this.SelectedImage = file;
      this.profileImage = this.sanitize.bypassSecurityTrustUrl(URL.createObjectURL(file));
      this.userForm.patchValue({
        imageName: file.name, // File name
        imageExtension: file.name.split('.').pop(),
      });
    }
  }

  onPasswordInput() {
    const value = this.userForm.get('password')?.value || '';
    this.passwordLengthValid = value.length >= 6 && value.length <= 16;
    this.passwordCaseValid = /[a-z]/.test(value) && /[A-Z]/.test(value);
    this.passwordNumberValid = /\d/.test(value);
    this.passwordSpecialValid = /[@$!%*?&]/.test(value);
  }

  onConfirmPasswordInput() {
    const password = this.userForm.get('password')?.value;
    const confirmPassword = this.userForm.get('confirmPassword')?.value;
    this.passwordMismatch = password !== confirmPassword;
  }

  SubmitForm() {
    if (this.userForm.get('emailId').invalid) {
      this.alertService.showError('email is not valid');
      return;
    }
    if (this.userForm.get('password').invalid) {
      this.alertService.showError('Password is not valid. It must be 6-16 chars, include upper and lower case, a number, and a special character.');
      return;
    }
    if (this.userForm.get('confirmPassword').invalid) {
      this.alertService.showError('Confirm Password is required.');
      return;
    }
    if (this.userForm.get('password').value !== this.userForm.get('confirmPassword').value) {
      this.alertService.showError('Password and Confirm Password do not match.');
      return;
    }
    if (this.userForm.invalid) {
      this.alertService.showError('Fields are empty');
      return;
    }
    let formData = new FormData();
    formData.append('userName', this.userForm.get('userName').value ?? '');
    formData.append('password', this.userForm.get('password').value  ?? '');
    formData.append('userRoleId', this.userForm.get('userRoleId').value  ?? '');
    // Prepare phoneNo array with country info
    const phoneNoRaw = this.userForm.get('phoneNo').value;
    const phoneNo = phoneNoRaw.map((p, i) => ({
      number: p.number,
      isPrimary: p.isPrimary,
      countryCode: this.selectedCountries[i]?.dialCode,
      countryName: this.selectedCountries[i]?.name
    }));
    formData.append('phoneNo', JSON.stringify(phoneNo));
    formData.append('emailId', this.userForm.get('emailId').value  ?? '');
    formData.append('address', this.userForm.get('address').value ?? '');
    formData.append('city', this.userForm.get('city').value  ?? '');
    formData.append('country', this.userForm.get('country').value  ?? '');
    formData.append('imageName', this.userForm.get('imageName').value ?? '');
    formData.append('imageExtension', this.userForm.get('imageExtension').value ?? '');
    formData.append('idCardNo', this.userForm.get('idCardNo').value ?? '');
    formData.append('joiningDate', this.userForm.get('joiningDate').value  ?? '');
    formData.append('shiftTiming', this.userForm.get('shiftTiming').value  ?? '');
    formData.append('outletId', this.outletId);
    formData.append('voidPassword', this.userForm.get('voidPassword').value);
    this.weekOffArray.forEach((day: string, index: number) => {
      formData.append(`weekDays[${index}]`, day);
    });
    formData.append('ImageSource', this.SelectedImage ?? '');
    formData.append('restaurantId', this.restaurantId ?? '');
    this.ngxLoader.startLoader('loader-01');
    this.posDataService.postUserRegData(formData).subscribe((res: any) => {
      this.ngxLoader.stopLoader('loader-01');
      let status = res['success'];
      let msg = res['message'];
      if (status) {
        this.activeModal.close(status);
        this.alertService.showSuccess('User Register Successfully!');
      } else {
        this.alertService.showError(msg);
      }
    });
  }
  UpdateUser() {
    debugger
    if (this.userForm.get('emailId').invalid) {
      this.alertService.showError('email is not valid');
      return;
    }
    if (this.userForm.get('password').invalid) {
      this.alertService.showError('Password is not valid. It must be 6-16 chars, include upper and lower case, a number, and a special character.');
      return;
    }
    if (this.userForm.get('confirmPassword').invalid) {
      this.alertService.showError('Confirm Password is required.');
      return;
    }
    if (this.userForm.get('password').value !== this.userForm.get('confirmPassword').value) {
      this.alertService.showError('Password and Confirm Password do not match.');
      return;
    }
    if (this.userForm.invalid) {
      this.alertService.showError('Fields are empty');
      return;
    }
    else {
      let formData = new FormData();
      formData.append('userId', this.userData.userId);
      formData.append('userName', this.userForm.get('userName').value ?? '');
      formData.append('password', this.userForm.get('password').value ?? '');
      formData.append('userRoleId', this.userForm.get('userRoleId').value ?? '');
      // Prepare phoneNo array with country info
      const phoneNoRaw = this.userForm.get('phoneNo').value;
      const phoneNo = phoneNoRaw.map((p, i) => ({
        number: p.number,
        isPrimary: p.isPrimary,
        countryCode: this.selectedCountries[i]?.dialCode,
        countryName: this.selectedCountries[i]?.name
      }));
      formData.append('phoneNo', JSON.stringify(phoneNo));
      formData.append('emailId', this.userForm.get('emailId').value ?? '');
      formData.append('address', this.userForm.get('address').value ?? '');
      formData.append('city', this.userForm.get('city').value ?? '');
      formData.append('country', this.userForm.get('country').value ?? '');
      formData.append('imageName', this.userForm.get('imageName').value ?? '');
      formData.append('imageExtension', this.userForm.get('imageExtension').value ?? '');
      formData.append('idCardNo', this.userForm.get('idCardNo').value ?? '');
      formData.append('joiningDate', this.userForm.get('joiningDate').value ?? '');
      formData.append('shiftTiming', this.userForm.get('shiftTiming').value ?? '');
      formData.append('outletId', this.outletId);
      formData.append('voidPassword', this.userForm.get('voidPassword').value ?? '');
      formData.append('ActiveStatus', this.userData.activeStatus);
      this.weekOffArray.forEach((day: string, index: number) => {
        formData.append(`weekDays[${index}]`, day);
      });
      if (this.SelectedImage) {
        formData.append('ImageSource', this.SelectedImage ?? '');
      }
      else {
        formData.append('imageName', this.userData.imageName ?? '');
        formData.append('imageExtension', this.userData.imageExtension ?? '');
        formData.append('imagePath', this.userData.imagePath ?? '');
      }
      formData.append('restaurantId', this.restaurantId ?? '');
      this.ngxLoader.startLoader('loader-01');
      this.posDataService.updateUserRegData(this.id, formData).subscribe((res: any) => {
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
  onCountryChange(event: any, i: number) {
    const countryCode = event.target.value;
    const country = this.countryList.find(c => c.dialCode === countryCode);
    this.selectedCountries[i] = country;
    const phoneArray = this.userForm.get('phoneNo') as FormArray;
    phoneArray.at(i).get('country').setValue(country);
    phoneArray.at(i).get('number').setValidators([Validators.required, this.phoneValidator.createPhoneValidator(country)]);
    phoneArray.at(i).get('number').updateValueAndValidity();
  }

  onCountryCodeChange(code: string, i: number, address: any) {
    const country = this.countryList.find(c => c.dialCode === code);
    if (country) {
      this.selectedCountries[i] = country;
      this.countryCodeInput[i] = country.dialCode;
      this.countryCodeError[i] = false;
      address.get('country').setValue(country);
      address.get('number').setValidators([Validators.required, this.phoneValidator.createPhoneValidator(country)]);
      address.get('number').setValue(''); // Reset the phone number input
      address.get('number').updateValueAndValidity();
    } else {
      this.countryCodeError[i] = true;
      address.get('number').setValue(''); // Reset the phone number input
    }
  }

  getPhoneLengthForCountry(country: any): number {
    if (country && (country.dial_code || country.dialCode)) {
      const code = country.dial_code || country.dialCode;
      const found = this.countryList.find(c => c.dial_code === code || c.dialCode === code);
      if (found && found.phoneLength) {
        return found.phoneLength;
      }
    }
    return 0;
  }
}

