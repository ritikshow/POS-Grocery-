import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { PosAuthService } from '@core/services/auth/pos-auth.service';
import { AlertService } from '@core/services/common/alert.service';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';

@Component({
  selector: 'app-forgot-password',
  templateUrl: './forgot-password.component.html',
})
export class ForgotPasswordComponent implements OnInit {

  forgotPasswordFrm: FormGroup;
  submitted: boolean;
  closeResult: string;

  constructor(
    private formBuilder: FormBuilder,
    private posAuthService: PosAuthService,
    private activeModal: NgbActiveModal,
    private alertService: AlertService,
  ) { }

  ngOnInit() {
    this.forgotPasswordFrm = this.formBuilder.group({
      emailAddress: ['', Validators.required]
    });
  }

  ResetPasswordFunc() {
    if (this.forgotPasswordFrm.invalid) {
      this.alertService.showSuccess("Please enter mail address");
      return;
    }
    this.posAuthService.forgotPassword(this.forgotPasswordFrm.value.emailAddress).subscribe((res: any) => {
      let msg = res['message'];
      let success = res['success'];
      if (success) {
        this.alertService.showSuccess(msg);
        this.closeModal();
      }
      else {
        this.alertService.showWarning(msg);
      }
    });
  }
  closeModal() {
    this.activeModal.close();
  }
}
