import { PosDataService } from '@core/services/pos-system/pos-data.service';
import { Component, OnInit, ViewChild } from '@angular/core';
import { NgbModal, ModalDismissReasons } from '@ng-bootstrap/ng-bootstrap';
import { AlertService } from '@core/services/common/alert.service';
import { AddItemService } from '../../../../core/services/common/add-item.service';
import { AddAdminCategoryComponent } from './add-admin-category/add-admin-category.component';
import { PosEditService } from '@core/services/pos-system/pos-edit.service';
import { NgxUiLoaderService } from 'ngx-ui-loader';
import { Subject } from 'rxjs';
import { DataTableDirective } from 'angular-datatables';
import { CommonService } from '@core/services/common/common.service';

@Component({
  selector: 'app-admin-category',
  templateUrl: './admin-category.component.html',
  styleUrls: ['./admin-category.component.css']
})
export class AdminCategoryComponent implements OnInit {
  tableListRecord: any = [];
  isDataLoaded = false;

  dtOptions: DataTables.Settings = {
    order: [[1, 'desc']],
    lengthChange: false,
    pageLength: 10,
    infoCallback: (settings: DataTables.SettingsLegacy, start: number, end: number, mnax: number, total: number, pre: string) => {
      this.tableListRecord.total = total;
    }
  };
  activeModal: any;
  changedLength(event) {
    this.datatableElement.dtInstance.then((dtInstance: DataTables.Api) => {
      dtInstance.page.len(parseInt(event.target.value)).draw();
    });
  }

  @ViewChild(DataTableDirective, { static: false }) datatableElement: DataTableDirective;
  dtElement: DataTableDirective;
  dtTrigger: Subject<any> = new Subject();

  closeResult: string;

  users: any;
  allItems: any;
  outletId: any;
  outletName: string;
  viewData: any;
  courseName: any;

  constructor(
    private ngxLoader: NgxUiLoaderService,
    private modalService: NgbModal,
    private alertService: AlertService,
    private posEditService: PosEditService,
    private posDataService: PosDataService,
    public commonService: CommonService
  ) { }

  getLatestAdminCategory() {
    this.isDataLoaded = false;
    this.ngxLoader.startLoader('loader-01');
    this.posDataService.getAllCategoryByOutletId(this.outletId,true).subscribe((response: any) => {
      this.ngxLoader.stopLoader('loader-01');
      console.log(response);
      this.allItems = response['data']
      let success = response['success'];
      let msg = response['message'];
      if (success) {
        this.isDataLoaded = true;
        this.dtTrigger.next();
        this.tableListRecord.total = this.allItems.length;
        this.alertService.showSuccess(msg);
      }
      else {
        this.isDataLoaded = true;
        this.alertService.showError(msg);
      }

    })
  }

  ngOnInit(): void {
    this.outletName = sessionStorage.getItem('activeOutletname');
    this.outletId = sessionStorage.getItem('activeOutletId');
    this.getLatestAdminCategory();
  }

  openForm() {
    this.modalService.open(AddAdminCategoryComponent, { backdrop: 'static',windowClass: 'main_add_popup', keyboard: true, centered: true }).result.then((result) => {
      this.closeResult = `Closed with: ${result}`;

      this.getLatestAdminCategory();

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

  edit(id) {
    sessionStorage.setItem('isNewCategory', 'false');
    sessionStorage.setItem('editCategory', id);
    this.posEditService.setCategoryEditId(id);
    this.modalService.open(AddAdminCategoryComponent, { backdrop: 'static', windowClass: 'main_add_popup ', keyboard: true, centered: true }).result.then((result) => {
      this.closeResult = `Closed with: ${result}`;
      this.getLatestAdminCategory();
    }, (reason) => {

      this.closeResult = `Dismissed ${this.getDismissReason(reason)}`;
    });
  }
  onDelete(id) {
    this.ngxLoader.startLoader('loader-01');
    this.posDataService.deleteAdminCategoryRow(id).subscribe((res) => {
      this.ngxLoader.stopLoader('loader-01');
      console.log(res);
      let success =res['success'];
      let msg = res['message'];
      if (success) {
        this.getLatestAdminCategory();
        this.alertService.showSuccess('Deleted Successfully');

      }
      else {
        this.alertService.showError(msg);
      }
    });
  }

  view(item, content) {

    this.viewData = item;
    this.modalService.open(content, { ariaLabelledBy: 'modal-basic-title', keyboard: false, backdrop: 'static', windowClass: 'main_add_popup', centered: true }).result.then((result) => {

    }, (reason) => {
      console.log(reason);
    });
  }

  closeAction() {
    if (this.modalService.hasOpenModals) {
      this.modalService.dismissAll();
    }
  }

  closeModal() {
    this.activeModal.close();
  }
  course(event) {
    this.courseName = event.target.value;
  }
  openAddCoursePopUp(content) {
    this.modalService.open(content, { ariaLabelledBy: 'modal-basic-title', keyboard: false, backdrop: 'static', windowClass: 'main_add_popup', centered: true}).result.then((result) => {
    }, (reason) => {
      console.log(reason);
    });
  }
  addCourse() {
    if (this.courseName == null) {
      this.alertService.showError("Field should not be empty");
    } else {
      let data = {
        courseName: this.courseName,
        outletId: this.outletId
      }
      this.ngxLoader.startLoader('loader-01');
      this.posDataService.addCourseData(data).subscribe((result) => {
        this.ngxLoader.stopLoader('loader-01');
        let success = result['success'];
        let msg = result['message'];
        if (success) {
          this.alertService.showSuccess("Course added successfully");
          this.closeAction();
        } else {
          this.alertService.showError(msg);
        }
      });
    }
  }
  changeCategoryStatus(id,status){
// let jsonData : any={};
// jsonData.CategoryId = id;
// jsonData.ActiveStatus = !status

    this.posDataService.UpdateCategoryStatus(id,!status).subscribe((res: any) => {
      this.ngxLoader.stopLoader('loader-01');
      let status = res['success'];
      let msg = res['message'];
      if (status) {
        this.alertService.showSuccess(msg);
      } else {
        this.alertService.showError(msg);
      }
    });
  }
}
