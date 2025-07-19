import { Component, OnInit, TemplateRef, ViewChild } from '@angular/core';
import { FormGroup, FormBuilder, Validators, FormArray } from '@angular/forms';
import { AlertService } from '@core/services/common/alert.service';
import { PosDataService } from '@core/services/pos-system/pos-data.service';
import { ModalDismissReasons, NgbActiveModal, NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { NgxUiLoaderService } from 'ngx-ui-loader';
import { RestaurantPermissionComponent } from '../restaurant-permission/restaurant-permission.component';
import { DomSanitizer } from '@angular/platform-browser';
import { environment } from 'src/environments/environment';
import { OuterSubscriber } from 'rxjs/internal/OuterSubscriber';
import { PhoneValidatorService } from 'src/app/validators/phone-validator.service';
//import { PhoneValidatorService } from '../../../../../validators/phone-validator.service';
@Component({
  selector: 'app-restaurant-form',
  templateUrl: './restaurant-form.component.html',
  styleUrls: ['./restaurant-form.component.css']
})
export class RestaurantFormComponent implements OnInit {

  @ViewChild('modalContent', { static: true }) modalContent: TemplateRef<any>;

  resForm: any = FormGroup;
  modItems: any;
  countryData: any;
  profileImage: any;
  tradeImage: any;
  trnImage: any;
  resData: any;
  alertMsg: string;
  cityData: any;
  isUpdate = false;
  outletId: any;
  restaurantData: any;
  id: any;
  closeResult: string;
  logo: any;
  trndata: any;
  tradedata: any;
  BaseUrl: any;
  countries: any[] = [];
  countryCodeInput: string[] = [];
  selectedCountry: any[] = [];
  countryCodeError: boolean[] = [];
  countrySearchText: string[] = [];
  filteredCountries: any[] = [];
  passwordLengthValid = false;
  passwordCaseValid = false;
  passwordNumberValid = false;
  passwordSpecialValid = false;
  showPassword = false;
  passwordMismatch = false;
  showConfirmPassword = false;
  constructor(
    private modal: NgbModal,
    private ngxLoader: NgxUiLoaderService,
    private activeModal: NgbActiveModal,
    private formBuilder: FormBuilder,
    private modalService: NgbModal,
    private alertService: AlertService,
    private posDataService: PosDataService,
    private sanitize: DomSanitizer,
    private phoneValidator: PhoneValidatorService
  ) { }

  ngOnInit(): void {
    this.countries = this.phoneValidator.getCountries();
    this.resForm = this.formBuilder.group({
      restaurantName: ['', Validators.required],
      restaurantRegistrationNo: ['', Validators.required],
      file: [''],
      logoName: [''],
      logoPath: [''],
      logoExtension: [''],
      tradeFile: [''],
      tradeLicenseName: [''],
      tradeLicensePath: [''],
      tradeLicenseExtension: [''],
      trnNo: ['', Validators.required],
      trnFile: [''],
      trnCertificateName: [''],
      trnCertificatePath: [''],
      trnCertificateExtension: [''],
      tradeLicense: [''],
      trnCertificate: [''],
      logo: [''],
      firstName: ['', Validators.required],
      middleName: [''],
      lastName: [''],
      address: ['', Validators.required],
      city: ['', Validators.required],
      poBox: [''],
      typeOfBussines: ['', Validators.required],
      typeOfCusine: ['', Validators.required],
      specialFeatures: ['', Validators.required],
      wareHouse_Lable: ['', Validators.required],
      RestaurantType: ['', Validators.required],
      email: ['', Validators.required],
      password: ['', [
        Validators.required,
        Validators.minLength(6),
        Validators.maxLength(16),
        Validators.pattern('^(?=.*[a-z])(?=.*[A-Z])(?=.*\\d)(?=.*[@$!%*?&])[A-Za-z\\d@$!%*?&]{6,16}$')
      ]],
      confirmPassword: ['', Validators.required],
      phoneNo: this.formBuilder.array([this.createPhone()]),
      country: ['', Validators.required],
      isThemAgreed: [true, Validators.required],
      reset: ['', Validators.required]
    });
    this.countrySearchText = [''];
    this.filteredCountries = [this.countries];
    this.countryCodeInput = [this.countries[0]?.dialCode || ''];
    this.selectedCountry = [this.countries[0] || null];
    this.countryCodeError = [false];
    this.getAllCountry();
    setTimeout(() => {
      this.checkHeaderCheckBox();
    }, 1000);
    this.BaseUrl = environment.apiUrl.replace(/^(.*:\/\/[^\/]+\/).*$/, '$1');
    this.outletId = sessionStorage.getItem('activeOutletId');
    let isNew = sessionStorage.getItem('isNewResturant');
    if (isNew == 'false') {
      this.id = sessionStorage.getItem('editResturant');
      this.isUpdate = true;
      sessionStorage.removeItem('isNewResturant');
      sessionStorage.removeItem('editResturant');
      this.getRestaurantData(this.id);
    }
  }
  private mapPhoneNumbersForApi(): any[] {
    const phoneArray = this.resForm.get('phoneNo').value;
    return phoneArray.map(phone => {
      const country = phone.country || {};
      return {
        number: phone.number,
        isPrimary: phone.isPrimary,
        countryCode: country.code || null,
        countryName: country.name || null,
        dialCode: country.dial_code || country.dialCode || null
      };
    });
  }
  addRestaurant() {
    const value = this.resForm.get('password').value || '';
    const emailValue = this.resForm.get('email').value || '';
    const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    // Check for empty required fields and show the field name
    const controls = this.resForm.controls;
    for (let key in controls) {
      if (controls[key].validator && controls[key].errors?.['required']) {
        this.alertService.showWarning(`${key} field is empty`);
        return;
      }
    }

    if (!emailPattern.test(emailValue)) {
      this.alertService.showError('Email is not valid');
      return;
    }
    if (!(value.length >= 6 && value.length <= 16)) {
      this.alertService.showError('Password must be between 6 and 16 characters.');
      return;
    }
    if (!(/[a-z]/.test(value) && /[A-Z]/.test(value))) {
      this.alertService.showError('Password must include upper and lower case letters.');
      return;
    }
    if (!/\d/.test(value)) {
      this.alertService.showError('Password must include at least one number.');
      return;
    }
    if (!/[@$!%*?&]/.test(value)) {
      this.alertService.showError('Password must include at least one special character.');
      return;
    }
    // Phone number validation (country-based)
    const phoneArray = this.resForm.get('phoneNo').controls;
    for (let i = 0; i < phoneArray.length; i++) {
      phoneArray[i].get('number').updateValueAndValidity();
      if (phoneArray[i].get('number').invalid) {
        this.alertService.showError('Phone number is not valid for the selected country.');
        return;
      }
    }
    const formData: FormData = new FormData();

    if (this.resForm.invalid) {
      this.alertService.showWarning("Fields are empty");
    } else if (!this.resForm.get('isThemAgreed').value) {
      this.alertService.showWarning("Please Select Terms and Conditions");
    } else {
      let OutletData: any = {};
      OutletData.outletName = this.resForm.get('restaurantName').value;
      OutletData.outletAddress = this.resForm.get('address').value ?? '';
      OutletData.outletManager = this.resForm.get('firstName').value ?? '';
      formData.append('RestaurantName', this.resForm.get('restaurantName').value);
      formData.append('RestaurantRegistrationNo', this.resForm.get('restaurantRegistrationNo').value);
      formData.append('LogoName', this.resForm.get('logoName').value ?? '');
      formData.append('LogoExtension', this.resForm.get('logoExtension').value ?? '');
      formData.append('TRNNo', this.resForm.get('trnNo').value ?? '');
      formData.append('TRNCertificateName', this.resForm.get('trnCertificateName').value ?? '');
      formData.append('TRNCertificateExtension', this.resForm.get('trnCertificateExtension').value ?? '');
      formData.append('TradeLicenseName', this.resForm.get('tradeLicenseName').value ?? '');
      formData.append('TradeLicenseExtension', this.resForm.get('tradeLicenseExtension').value ?? '');
      formData.append('FirstName', this.resForm.get('firstName').value ?? '');
      formData.append('MiddleName', this.resForm.get('middleName').value ?? '');
      formData.append('LastName', this.resForm.get('lastName').value ?? '');
      formData.append('Address', this.resForm.get('address').value ?? '');
      formData.append('City', this.resForm.get('city').value);
      formData.append('POBox', this.resForm.get('poBox').value ?? '');
      formData.append('TypeOfBussines', this.resForm.get('typeOfBussines').value);
      formData.append('TypeOfCusine', this.resForm.get('typeOfCusine').value);
      formData.append('SpecialFeatures', this.resForm.get('specialFeatures').value);
      formData.append('WareHouse_Lable', this.resForm.get('wareHouse_Lable').value);
      formData.append('RestaurantType', this.resForm.get('RestaurantType').value);
      const phoneList = this.mapPhoneNumbersForApi();
      formData.append('Phone', JSON.stringify(phoneList));
      formData.append('Email', this.resForm.get('email').value);
      formData.append('Password', this.resForm.get('password').value);
      formData.append('IsThemAgreed', this.resForm.get('isThemAgreed').value);
      formData.append('Country', this.resForm.get('country').value);
      formData.append('Outlets', JSON.stringify([])); // If the outlets array is empty, append as an empty array (or add actual data)
      formData.append('InputOutLet', JSON.stringify([OutletData]));
      formData.append('Reset', this.resForm.get('reset').value);

      // Append image files if available
      if (this.logo) {
        formData.append('IamgeLogo', this.logo ?? '');
      }
      if (this.trndata) {
        formData.append('ImageTRNCertificate', this.trndata ?? '');
      }
      if (this.tradedata) {
        formData.append('ImageTradeLicense', this.tradedata ?? '');
      }
      formData.append('TradeLicense', null)
      formData.append('Logo', null)
      formData.append('TRNCertificate', null)
      formData.append('Outlet', JSON.stringify([]));
      formData.append('CreatedBy', JSON.parse(sessionStorage.getItem("userCredential")).userId);
      this.ngxLoader.startLoader('loader-01');
      this.posDataService.postRestaurantData(formData).subscribe((res: any) => {
        this.ngxLoader.stopLoader('loader-01');
        let result = res['data'];
        let status = res['success'];
        let msg = res['message'];
        if (status) {
          this.activeModal.close(status);
          this.alertService.showSuccess('Restaurant Added Succesfully');
          this.OpenPermissionForm(result);
        } else
          this.alertService.showError(msg);
      });
    }
  }
  OpenPermissionForm(data) {
    sessionStorage.setItem('restaurantDataToEdit', data.restaurantId);
    sessionStorage.setItem("EditRestPermission", "false");
    this.modalService.open(RestaurantPermissionComponent, { backdrop: 'static', size: 'lg', keyboard: true, centered: true }).result.then((result) => {
      window.location.reload();
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

  getRestaurantData(id) {
    this.ngxLoader.startLoader('loader-01');
    this.posDataService.getRestaurantById(this.id).subscribe((response) => {
      this.ngxLoader.stopLoader('loader-01');
      this.restaurantData = response['data'];
      let success = response['success'];
      let msg = response['message'];
      if (success) {
        if (this.restaurantData?.country != null) {
          let CountryObj = this.countryData?.find(x => x.countryName == this.restaurantData.country);
          if (CountryObj != undefined && CountryObj != null) {
            this.posDataService.getAllCity(CountryObj.id).subscribe((res: any) => {
              this.cityData = res['data'];
              this.patchValuesToForm();
            });
          } else {
            this.patchValuesToForm();
          }
        } else {
          this.patchValuesToForm();
        }
      } else {
        this.alertService.showError(msg);
      }
    });
  }
  patchValuesToForm() {
    this.PatchToForm();
    if (this.restaurantData?.isThemAgreed) {
      const ele1 = document.getElementById('termsCheck') as HTMLInputElement;
      if (ele1 !== undefined && ele1 !== null) {
        ele1.checked = true;
      }
    }
    for (let j = 0; j < this.restaurantData?.phone.length; j++) {
      this.LoopNumberAndSetToForm(j);
      // Set country code input and selected country for each phone
      const phone = this.restaurantData.phone[j];
      let matchedCountry = this.countries[0];
      if (phone.countryCode) {
        matchedCountry = this.countries.find(c => c.code.toLowerCase() === phone.countryCode.toLowerCase()) || this.countries[0];
      } else if (phone.countryName) {
        matchedCountry = this.countries.find(c => c.name === phone.countryName) || this.countries[0];
      }
      this.countryCodeInput[j] = matchedCountry.dialCode;
      this.selectedCountry[j] = matchedCountry;
      // Patch the form group with the correct country object
      (<FormGroup>this.modItemsControls.at(j)).patchValue({
        country: matchedCountry
      });
    }
  }

  private LoopNumberAndSetToForm(j: number) {
    const phone = this.restaurantData.phone[j];
    let matchedCountry = this.countries[0];
    // Prefer countryCode, fallback to countryName
    if (phone.countryCode) {
      matchedCountry = this.countries.find(c => c.code.toLowerCase() === phone.countryCode.toLowerCase()) || this.countries[0];
    } else if (phone.countryName) {
      matchedCountry = this.countries.find(c => c.name === phone.countryName) || this.countries[0];
    }
    if (j == 0) {
      (<FormGroup>this.modItemsControls.at(j)).patchValue({
        country: matchedCountry,
        number: phone.number,
        isPrimary: phone.isPrimary
      });
      this.CheckPrimaryNumber(j);
    } else {
      this.modItems = this.resForm.get('phoneNo') as FormArray;
      this.modItems.push(this.createPhone());
      (<FormGroup>this.modItemsControls.at(j)).patchValue({
        country: matchedCountry,
        number: phone.number,
        isPrimary: phone.isPrimary
      });
      this.CheckPrimaryNumberAndSetToForm(j);
    }
  }

  private CheckPrimaryNumberAndSetToForm(j: number) {
    if (this.restaurantData.phone[j].isPrimary) {
      let checkId = 'headerCheck' + Number(j + 1);
      setTimeout(() => {
        const ele = document.getElementById(checkId) as HTMLInputElement;
        if (ele !== undefined && ele !== null) {
          ele.checked = true;
        }
      }, 1000);
    }
  }

  private CheckPrimaryNumber(j: number) {
    if (this.restaurantData.phone[j].isPrimary) {
      let checkId = 'headerCheck' + Number(j + 1);
      const ele = document.getElementById(checkId) as HTMLInputElement;
      if (ele !== undefined && ele !== null) {
        ele.checked = true;
      }
    }
  }

  private PatchToForm() {
    this.resForm.patchValue({
      restaurantId: this.restaurantData?.restaurantId,
      restaurantName: this.restaurantData?.restaurantName,
      restaurantRegistrationNo: this.restaurantData?.restaurantRegistrationNo,
      file: this.restaurantData?.file,
      logoName: this.restaurantData?.logoName,
      logoPath: this.restaurantData?.logoPath,
      logoExtension: this.restaurantData?.logoExtension,
      tradeFile: this.restaurantData?.tradeFile,
      tradeLicenseName: this.restaurantData?.tradeLicenseName,
      tradeLicensePath: this.restaurantData?.tradeLicensePath,
      tradeLicenseExtension: this.restaurantData?.tradeLicenseExtension,
      trnNo: this.restaurantData?.trnNo,
      trnFile: this.restaurantData?.trnFile,
      trnCertificateName: this.restaurantData?.trnCertificateName,
      trnCertificatePath: this.restaurantData?.trnCertificatePath,
      trnCertificateExtension: this.restaurantData?.trnCertificateExtension,
      tradeLicense: this.restaurantData?.tradeLicense,
      trnCertificate: this.restaurantData?.trnCertificate,
      logo: this.restaurantData?.logo,
      firstName: this.restaurantData?.firstName,
      middleName: this.restaurantData?.middleName,
      lastName: this.restaurantData?.lastName,
      address: this.restaurantData?.address,
      city: this.restaurantData?.city,
      poBox: this.restaurantData?.poBox,
      typeOfBussines: this.restaurantData?.typeOfBussines,
      typeOfCusine: this.restaurantData?.typeOfCusine,
      specialFeatures: this.restaurantData?.specialFeatures,
      wareHouse_Lable: this.restaurantData?.wareHouse_Lable,
      RestaurantType: this.restaurantData?.restaurantType,
      email: this.restaurantData?.email,
      reset: this.restaurantData?.reset,
      password: this.restaurantData?.password,
      confirmPassword: this.restaurantData?.password,
      country: this.restaurantData?.country,
      isThemAgreed: this.restaurantData?.isThemAgreed
    });
    if (this.restaurantData?.logoPath != null && this.restaurantData?.logoPath != 'null')
      this.profileImage = this.restaurantData.logoPath?.match(/Uploads.*/)[0];
    if (this.restaurantData?.tradeLicensePath != null && this.restaurantData?.tradeLicensePath != 'null')
      this.tradeImage = this.restaurantData.tradeLicensePath?.match(/Uploads.*/)[0];
    if (this.restaurantData?.trnCertificatePath != null && this.restaurantData?.trnCertificatePath != 'null')
      this.trnImage = this.restaurantData.trnCertificatePath?.match(/Uploads.*/)[0];
  }

  checkHeaderCheckBox() {
    const ele = document.getElementById('headerCheck1') as HTMLInputElement;
    if (ele !== undefined && ele !== null) {
      ele.checked = true;
    }
    const ele1 = document.getElementById('termsCheck') as HTMLInputElement;
    if (ele1 !== undefined && ele !== null) {
      ele1.checked = true;
    }
  }

  checkCheckBox(i) {

    const ele = document.getElementById('headerCheck' + i) as HTMLInputElement;
    if (ele !== undefined && ele !== null) {
      ele.checked = true;
    }
  }

  getAllCountry() {
    this.ngxLoader.startLoader('loader-01');
    this.posDataService.getAllCountryData().subscribe((res: any) => {
      this.ngxLoader.stopLoader('loader-01');
      this.countryData = res['data'];
    });
  }
  SelectCountry() {
    let countryName = (<HTMLInputElement>document.getElementById("CountryName")).value;
    let CountryObj = this.countryData.find(x => x.countryName == countryName);
    this.posDataService.getAllCity(CountryObj.id).subscribe((res: any) => {
      this.cityData = res['data'];
    });
  }

  createPhone(): FormGroup {
    const defaultCountry = this.countries[0];
    return this.formBuilder.group({
      country: [defaultCountry, Validators.required],
      number: ['', [Validators.required, this.phoneValidator.createPhoneValidator(defaultCountry)]],
      isPrimary: [true, Validators.required]
    });
  }

  get modItemsControls() {
    return this.resForm.get('phoneNo')['controls'];
  }

  addMod(): void {
    this.modItems = this.resForm.get('phoneNo') as FormArray;
    this.modItems.push(this.createPhone());
    this.countrySearchText.push('');
    this.filteredCountries.push(this.countries);
    // Set default country code and flag for the new phone number
    this.countryCodeInput.push(this.countries[0]?.dialCode || '');
    this.selectedCountry.push(this.countries[0] || null);
    this.countryCodeError.push(false);
    setTimeout(() => {
      this.checkCheckBox(this.modItems.length);
    }, 1000);
  }

  removeMod(i) {
    this.modItems.removeAt(i);
    this.countrySearchText.splice(i, 1);
    this.filteredCountries.splice(i, 1);
    this.countryCodeInput.splice(i, 1);
    this.selectedCountry.splice(i, 1);
    this.countryCodeError.splice(i, 1);
  }

  closeModal() {
    this.activeModal.close(0);
    this.modal.dismissAll();
  }
  editRestaurant() {
    const value = this.resForm.get('password').value || '';
    const confirmValue = this.resForm.get('confirmPassword').value || '';
    const emailValue = this.resForm.get('email').value || '';
    const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    // Check if password and confirm password match
    if (value !== confirmValue) {
      this.alertService.showWarning('Password and Confirm Password do not match.');
      return;
    }

    // Check for empty required fields and show the field name
    const controls = this.resForm.controls;
    for (let key in controls) {
      if (controls[key].validator && controls[key].errors?.['required']) {
        this.alertService.showWarning(`${key} field is empty`);
        return;
      }
    }

    // Phone number validation (country-based)
    const phoneArray = this.resForm.get('phoneNo').controls;
    for (let i = 0; i < phoneArray.length; i++) {
      phoneArray[i].get('number').updateValueAndValidity();
      if (phoneArray[i].get('number').invalid) {
        this.alertService.showError('Phone number is not valid for the selected country.');
        return;
      }
    }

    if (!this.resForm.get('isThemAgreed').value) {
      this.alertService.showWarning("Please Select Terms and Conditions");
      return;
    }

    if (!emailPattern.test(emailValue)) {
      this.alertService.showError('Email is not valid');
      return;
    }
    if (!(value.length >= 6 && value.length <= 16)) {
      this.alertService.showError('Password must be between 6 and 16 characters.');
      return;
    }
    if (!(/[a-z]/.test(value) && /[A-Z]/.test(value))) {
      this.alertService.showError('Password must include upper and lower case letters.');
      return;
    }
    if (!/\d/.test(value)) {
      this.alertService.showError('Password must include at least one number.');
      return;
    }
    if (!/[@$!%*?&]/.test(value)) {
      this.alertService.showError('Password must include at least one special character.');
      return;
    }
    if (this.resForm.invalid) {
      this.alertService.showWarning("Fields are empty");
    } else if (!this.resForm.get('isThemAgreed').value) {
      this.alertService.showWarning("Please Select Terms and Conditions");
    } else {
      const formData: FormData = new FormData();
      console.log("edit data", this.restaurantData)
      formData.append('RestaurantId', this.restaurantData.restaurantId)
      formData.append('RestaurantName', this.resForm.get('restaurantName').value);
      formData.append('RestaurantRegistrationNo', this.resForm.get('restaurantRegistrationNo').value ?? '');
      formData.append('LogoName', this.resForm.get('logoName').value ?? '');
      formData.append('LogoExtension', this.resForm.get('logoExtension').value ?? '');
      formData.append('TRNNo', this.resForm.get('trnNo').value ?? '');
      formData.append('TRNCertificateName', this.resForm.get('trnCertificateName').value ?? '');
      formData.append('TRNCertificateExtension', this.resForm.get('trnCertificateExtension').value ?? '');
      formData.append('TradeLicenseName', this.resForm.get('tradeLicenseName').value ?? '');
      formData.append('TradeLicenseExtension', this.resForm.get('tradeLicenseExtension').value ?? '');
      formData.append('FirstName', this.resForm.get('firstName').value ?? '');
      formData.append('MiddleName', this.resForm.get('middleName').value ?? '');
      formData.append('LastName', this.resForm.get('lastName').value ?? '');
      formData.append('Address', this.resForm.get('address').value ?? '');
      formData.append('City', this.resForm.get('city').value);
      formData.append('POBox', this.resForm.get('poBox').value);
      formData.append('TypeOfBussines', this.resForm.get('typeOfBussines').value);
      formData.append('TypeOfCusine', this.resForm.get('typeOfCusine').value);
      formData.append('SpecialFeatures', this.resForm.get('specialFeatures').value);
      formData.append('WareHouse_Lable', this.resForm.get('wareHouse_Lable').value);
      formData.append('RestaurantType', this.resForm.get('RestaurantType').value);
      const phoneList = this.mapPhoneNumbersForApi();
      formData.append('Phone', JSON.stringify(phoneList));
      formData.append('Email', this.resForm.get('email').value);
      formData.append('Password', this.resForm.get('password').value);
      formData.append('IsThemAgreed', this.resForm.get('isThemAgreed').value);
      formData.append('Country', this.resForm.get('country').value);
      formData.append('Outlets', JSON.stringify([])); // If the outlets array is empty, append as an empty array (or add actual data)
      formData.append('Reset', this.resForm.get('reset').value);
      formData.append('ActiveStatus', this.restaurantData.activeStatus);
      formData.append('Permission', JSON.stringify(this.restaurantData.permission));
      // Append image files if available
      if (this.logo) {
        formData.append('IamgeLogo', this.logo);
      }
      else {
        formData.append('LogoName', this.restaurantData.logoName ?? '');
        formData.append('LogoExtension', this.restaurantData.logoExtension ?? '');
        formData.append('LogoPath', this.restaurantData.logoPath ?? '');
      }
      if (this.trndata) {
        formData.append('ImageTRNCertificate', this.trndata);
      }
      else {
        formData.append('TRNCertificateName', this.restaurantData.trnCertificateName ?? '');
        formData.append('TRNCertificateExtension', this.restaurantData.trnCertificateExtension ?? '');
        formData.append('TRNCertificatePath', this.restaurantData.trnCertificatePath ?? '');
      }
      if (this.tradedata) {
        formData.append('ImageTradeLicense', this.tradedata ?? '');
      }
      else {
        formData.append('TradeLicenseName', this.restaurantData.tradeLicenseName ?? '');
        formData.append('TradeLicenseExtension', this.restaurantData.tradeLicenseExtension ?? '');
        formData.append('TradeLicensePath', this.restaurantData.tradeLicensePath ?? '');
      }
      formData.append('TradeLicense', null)
      formData.append('Logo', null)
      formData.append('TRNCertificate', null)
      formData.append('InputOutLet', JSON.stringify(this.restaurantData.outlets));
      this.ngxLoader.startLoader('loader-01');
      this.posDataService.updateRestaurant(this.id, formData).subscribe((res: any) => {
        this.ngxLoader.stopLoader('loader-01');
        let status = res['success'];
        let msg = res['message'];
        if (status) {
          this.activeModal.close(status);
          this.alertService.showSuccess('Restaurant Updated Succesfully');
        } else {
          this.alertService.showError(msg);
        }
      });
    }
  }
  createOutlet() {
    let outletDetails = {};
    outletDetails = {
      'outletAddress': this.resForm.get('address').value,
      'outletManager': this.resForm.get('firstName').value,
      'outletName': this.resForm.get('restaurantName').value
    };
    let outlet = this.resData.outlets.concat(outletDetails)
    let data = {
      restaurant: {
        restaurantId: this.resData.restaurantId,
        restaurantName: this.resData.restaurantName,
        restaurantRegistrationNo: this.resData.restaurantRegistrationNo,
        wareHouse_Lable: this.resData.wareHouse_Lable,
        country: this.resData.country,
        outlets: outlet,
        logoName: this.resData.logoName,
        logoExtension: this.resData.logoExtension,
        tradeLicenseName: this.resData.tradeLicenseName,
        tradeLicenseExtension: this.resData.tradeLicenseExtension,
        trnNo: this.resData.trnNo,
        trnCertificateName: this.resData.trnCertificateName,
        trnCertificateExtension: this.resData.trnCertificateExtension,
        firstName: this.resData.firstName,
        middleName: this.resData.middleName,
        lastName: this.resData.lastName,
        address: this.resData.address,
        city: this.resData.city,
        poBox: this.resData.poBox,
        typeOfBussines: this.resData.typeOfBussines,
        typeOfCusine: this.resData.typeOfCusine,
        specialFeatures: this.resData.specialFeatures,
        email: this.resData.email,
        phone: this.resData.phone,
        isThemAgreed: this.resData.isThemAgreed,
        reset: this.resData.reset
      },
      tradeLicense: this.resData.tradeLicense,
      logo: this.resData.logo,
      trnCertificate: this.resData.trnCertificate
    }
    this.posDataService.updateRestaurantData(this.resData.restaurantId, data).subscribe((res: any) => {
      let status = res['success'];
      let msg = res['message'];
      if (status) {
        this.activeModal.close(status);
        this.alertService.showSuccess(msg);
        this.closeModal();
      } else {
        this.alertService.showError(msg);
      }
    });
  }

  onTermsCheckboxChange(event) {
    if (event.target.checked) {
      this.resForm.patchValue({
        isThemAgreed: true
      });
    } else {
      this.resForm.patchValue({
        isThemAgreed: false
      });
    }
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

  onCountryChange(country: any, index: number): void {
    const phoneArray = this.resForm.get('phoneNo') as FormArray;
    const group = phoneArray.at(index);

    group.get('country')?.setValue(country);
    group.get('number')?.setValidators([
      Validators.required,
      this.phoneValidator.createPhoneValidator(country)
    ]);
    group.get('number')?.updateValueAndValidity();

    // Mark as touched and dirty so validation error shows immediately
    group.get('number')?.markAsTouched();
    group.get('number')?.markAsDirty();
  }

  dragNdrop(event) {
    if (event.target.files && event.target.files[0]) {
      const file = event.target.files[0];
      this.logo = file;
      this.profileImage = this.sanitize.bypassSecurityTrustUrl(URL.createObjectURL(file));
      this.resForm.patchValue({
        logoName: file.name, // File name
        logoExtension: file.name.split('.').pop(),
      });
      //this.resForm.get('logo').setValue(file); // Store the file object
    }
  }



  dragNdropTrade(event) {
    if (event.target.files && event.target.files[0]) {
      const file = event.target.files[0];
      this.tradedata = file;
      this.tradeImage = this.sanitize.bypassSecurityTrustUrl(URL.createObjectURL(file));
      console.log("tradeCertificate", this.tradeImage);
      this.resForm.patchValue({
        tradeLicenseName: file.name,
        tradeLicenseExtension: file.name.split('.').pop(),
      });
      this.resForm.get('tradeLicense').setValue(file);
    }
  }
  dragNdropTrn(event) {
    if (event.target.files && event.target.files[0]) {
      const file = event.target.files[0];
      this.trndata = file;
      this.trnImage = this.sanitize.bypassSecurityTrustUrl(URL.createObjectURL(file));
      this.resForm.patchValue({
        trnCertificateName: file.name,
        trnCertificateExtension: file.name.split('.').pop(),
      });

      this.resForm.get('trnCertificate').setValue(file);
    }
  }

  onCountryCodeChange(code: string, i: number, address: any) {
    const country = this.countries.find(c => c.dialCode === code.trim());
    if (country) {
      this.selectedCountry[i] = country;
      this.countryCodeInput[i] = country.dialCode;
      this.countryCodeError[i] = false;
      address.get('country').setValue(country);
      address.get('number').setValidators([
        Validators.required,
        this.phoneValidator.createPhoneValidator(country)
      ]);
      address.get('number').setValue(''); // Reset the phone number input
      address.get('number').updateValueAndValidity();
    } else {
      this.selectedCountry[i] = null;
      this.countryCodeInput[i] = '';
      this.countryCodeError[i] = true;
      address.get('country').setValue(null);
      address.get('number').setValidators([Validators.required]);
      address.get('number').setValue(''); // Reset the phone number input
      address.get('number').updateValueAndValidity();
    }
  }

  onPasswordInput() {
    const value = this.resForm.get('password')?.value || '';
    this.passwordLengthValid = value.length >= 6 && value.length <= 16;
    this.passwordCaseValid = /[a-z]/.test(value) && /[A-Z]/.test(value);
    this.passwordNumberValid = /\d/.test(value);
    this.passwordSpecialValid = /[@$!%*?&]/.test(value);
  }

  onPhoneInput(i: number) {}
 
    onConfirmPasswordInput() {
    const password = this.resForm.get('password')?.value;
    const confirmPassword = this.resForm.get('confirmPassword')?.value;
    this.passwordMismatch = password !== confirmPassword;
  }

  getPhoneLengthForCountry(country: any): number {
    if (country && (country.dial_code || country.dialCode)) {
      const code = country.dial_code || country.dialCode;
      const found = this.countries.find(c => c.dial_code === code || c.dialCode === code);
      if (found && found.phoneLength) {
        return found.phoneLength;
      }
    }
    return 0;
  }

}

