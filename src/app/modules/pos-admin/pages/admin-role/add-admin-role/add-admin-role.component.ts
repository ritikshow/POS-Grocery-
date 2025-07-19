import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { AlertService } from '@core/services/common/alert.service';
import { PosDataService } from '@core/services/pos-system/pos-data.service';
import { NgbModal, ModalDismissReasons, NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';
import { NgxUiLoaderService } from 'ngx-ui-loader';
import { FormAccessFormComponent } from '../../master/form-access/form-access-form/form-access-form.component';

@Component({
  selector: 'app-add-admin-role',
  templateUrl: './add-admin-role.component.html',
  styleUrls: ['./add-admin-role.component.css']
})
export class AddAdminRoleComponent implements OnInit {

  roleForm: any = FormGroup;
  id: any;
  roleData: any;
  newlyAddedRoleId: string = '';
  closeResult: string;
  isAddPermission: boolean = true;
  isUpdate = false;

  constructor(
    private ngxLoader: NgxUiLoaderService,
    private activeModal: NgbActiveModal,
    private formBuilder: FormBuilder,
    private alertService: AlertService,
    private posDataService: PosDataService,
    private modalService: NgbModal
  ) { }

  ngOnInit(): void {
    this.roleForm = this.formBuilder.group({
      roleName: ['', Validators.required],
      description: ['']
    });
    let isNew = sessionStorage.getItem('isNewUserType');
    if (isNew == 'false') {
      this.id = sessionStorage.getItem('editUserType');
      this.isUpdate = true;
      sessionStorage.removeItem('isNewUserType');
      sessionStorage.removeItem('editUserType');
      this.getRoleDataById();
    }
  }
  getRoleDataById() {
    this.ngxLoader.startLoader('loader-01');
    this.posDataService.getRoleByID(this.id).subscribe((res: any) => {
      this.ngxLoader.stopLoader('loader-01');
      this.roleData = res['data'];
      this.patchValuesToForm();
    });
  }

  patchValuesToForm() {
    this.roleForm.patchValue({
      roleName: this.roleData.roleName,
      description: this.roleData.description
    });
  }
  closeModal() {
    this.activeModal.close();
  }

  addRoleFormData(data: any) {

    if (this.roleForm.invalid) {
      this.alertService.showError("Field should not be empty");
    }
    else {
      data.ActiveStatus = true;
      data.OutletId = sessionStorage.getItem('activeOutletId');
      this.ngxLoader.startLoader('loader-01');
      (this.posDataService.postRoleData(data)).subscribe((result) => {
        this.ngxLoader.stopLoader('loader-01');
        sessionStorage.setItem("isAddRolePermission", String(this.isAddPermission));
        sessionStorage.setItem("newlyAddedRoleId", result.data.roleId);
        sessionStorage.setItem("newlyAddedRoleName", result.data.roleName);
        sessionStorage.setItem("newlyAddedRoleData", JSON.stringify(result.data));
        if (result.success && this.isAddPermission) {
          this.newlyAddedRoleId = result.data.roleId;
          this.activeModal.close(result.success);
          this.modalService.open(FormAccessFormComponent, { backdrop: 'static', windowClass: 'main_add_popup', keyboard: true, centered: true }).result.then((result) => {
            this.closeResult = `Closed with: ${result}`;
            if (result) {
              this.activeModal.close(result.success);
            }
          }, (reason) => {

            this.closeResult = `Dismissed ${this.getDismissReason(reason)}`;
          });
        }
      });
    }

  }
  updateRoleFormData(data: any) {
    if (this.roleForm.invalid) {
      this.alertService.showError("Field should not be empty");
    } else {
      let editData = {
        roleId: this.id,
        roleName: this.roleForm.get('roleName').value,
        description: this.roleForm.get('description').value ?? '',
        ActiveStatus: this.roleData.activeStatus,
        OutletId: this.roleData.outletId,
      }
      this.ngxLoader.startLoader('loader-01');
      this.posDataService.upDateRoleData(this.id, editData).subscribe((res: any) => {
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

  addPermission() {
    this.modalService.open(FormAccessFormComponent, { backdrop: 'static', windowClass: 'main_add_popup', keyboard: true, centered: true }).result.then((result) => {
      this.closeResult = `Closed with: ${result}`;
      if (result) {
        this.activeModal.close(result.success);
      }
    }, (reason) => {
      this.closeResult = `Dismissed ${this.getDismissReason(reason)}`;
    });
  }
}
