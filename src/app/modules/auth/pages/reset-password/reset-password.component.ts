import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { AuthService } from '@core/services/auth/auth.service';
import { PosAuthService } from '@core/services/auth/pos-auth.service';
import { AlertService } from '@core/services/common/alert.service';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';
import { first } from 'rxjs/operators';

@Component({
  selector: 'app-reset-password',
  templateUrl: './reset-password.component.html',
})
export class ResetPasswordComponent implements OnInit {
  resetpasswordFrm: FormGroup;
  voidpasswordFrm: FormGroup;
  submitted: boolean;
  showLoginMessage: boolean = false;
  closeResult: string;
  isContent: boolean = false;
  VoidOrderId: string;
  userData: any;
  userId: any;
  isVoid: boolean;
  tokenValue: any;
  isNotMatching = false;
  ResetMailDateTime: any;

  constructor(
    private router: Router,
    private formBuilder: FormBuilder,
    private authservice: AuthService,
    private alertService: AlertService,
    private route: ActivatedRoute,
    private activeModal: NgbActiveModal,
    private posAuthService: PosAuthService,
  ) {
    this.route.queryParams.subscribe(params => {
      if (params.token != null && params.token != "") {
        this.tokenValue = params.token;
        this.ResetMailDateTime = atob(params.token?.split("*")[1]);
      }
    });
  }

  ngOnInit() {
    this.VoidOrderId = sessionStorage.getItem("voidOrderId") ? sessionStorage.getItem("voidOrderId") : null;
    this.isVoid = sessionStorage.getItem("voidOrderId") ? true : false;
    this.userData = JSON.parse(sessionStorage.getItem('userCredential'));
    if (this.userData != null && this.userData != undefined)
      this.userId = this.userData.userId;
    this.resetpasswordFrm = this.formBuilder.group({
      newPassword: ['', Validators.required],
      confirmPassword: ['', Validators.required],
    }, {
      validator: this.MustMatch('newPassword', 'confirmPassword')
    });

    this.voidpasswordFrm = this.formBuilder.group({
      voidPassword: ['', Validators.required]
    });
  }

  get f() { return this.resetpasswordFrm.controls; } //edit
  get voidOrderValue() { return this.voidpasswordFrm.controls; } //edit
  onClick() {

    this.submitted = true;
    if (this.resetpasswordFrm.invalid) {
      this.isNotMatching = true;
    } else {
      const requestDate = new Date(this.ResetMailDateTime);
      const now = new Date();
      const diffMs = now.getTime() - requestDate.getTime(); // difference in ms
      const diffMinutes = diffMs / (1000 * 60);

      if (diffMinutes > 15) {
        this.alertService.showWarning("This password reset link has expired.");
        return;
      }
      this.isNotMatching = false
      let jsonData: any = {};
      jsonData.userId = "123";
      jsonData.confirmPassword = this.f.confirmPassword.value;
      jsonData.newPassword = this.f.newPassword.value;
      jsonData.token = this.tokenValue;
      this.posAuthService.resetPassword(jsonData).subscribe((res: any) => {
        let msg = res['message'];
        let success = res['success'];
        if (success) {
          this.submitted = false;
          this.alertService.showSuccess(msg);
          //this.router.navigate(['/login']);
          this.resetpasswordFrm.reset();
        }
        else {
          this.alertService.showWarning(msg);
        }
      });
    }
  }

  // Close Reset Password
  closeModal() {
    this.activeModal.close();

  }

  //to verify whether new password and confirm password is same or not.
  MustMatch(newPassword: string, confirmPassword: string) {
    return (formGroup: FormGroup) => {
      const control = formGroup.controls[newPassword];
      const matchingControl = formGroup.controls[confirmPassword];

      if (matchingControl.errors && !matchingControl.errors.mustMatch) {
        // return if another validator has already found an error on the matchingControl
        return;
      }

      // set error on matchingControl if validation fails
      if (control.value !== matchingControl.value) {
        matchingControl.setErrors({ mustMatch: true });
      } else {
        matchingControl.setErrors(null);
      }
    }
  }

  ngOnDestroy() {
    sessionStorage.removeItem("voidOrderId");
  }

  submitVoidOrder() {

    if (this.voidpasswordFrm.invalid) {
      this.alertService.showWarning("Please Enter Password");
    } else {
      let data = { userId: this.userId, OrderId: this.VoidOrderId, VoidPassword: this.voidOrderValue.voidPassword.value };
      this.authservice.checkVoidOrder(this.userId, data).pipe(first()).subscribe(
        response => {
          if (response.success) {
            this.alertService.showSuccess("Voided Successfully");
          } else {
            this.alertService.showError("Password is Not Matching");
          }
        }, error => {
          this.alertService.showError(error.message);
        });
    }
    this.closeModal();
  }
  OnEnterKey(){
    this.isNotMatching = false;
  }
}
