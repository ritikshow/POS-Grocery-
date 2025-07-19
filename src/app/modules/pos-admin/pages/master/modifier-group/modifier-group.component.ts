import { Component, OnInit, ViewChild } from '@angular/core';
import { AlertService } from '@core/services/common/alert.service';
import { PosDataService } from '@core/services/pos-system/pos-data.service';
import { PosEditService } from '@core/services/pos-system/pos-edit.service';
import { PosViewService } from '@core/services/pos-system/pos-view.service';
import { NgbModal, ModalDismissReasons } from '@ng-bootstrap/ng-bootstrap';
import { NgxUiLoaderService } from 'ngx-ui-loader';
import { ModifierGroupEditComponent } from './modifier-group-edit/modifier-group-edit.component';
import { ModifierGroupFormComponent } from './modifier-group-form/modifier-group-form.component';
import { ModifierGroupViewComponent } from './modifier-group-view/modifier-group-view.component';
import { Subject } from 'rxjs';
import { DataTableDirective } from 'angular-datatables';
import { CommonService } from '@core/services/common/common.service';

@Component({
  selector: 'app-modifier-group',
  templateUrl: './modifier-group.component.html',
  styleUrls: ['./modifier-group.component.css']
})
export class ModifierGroupComponent implements OnInit {
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
  changedLength(event) {
    this.datatableElement.dtInstance.then((dtInstance: DataTables.Api) => {
      dtInstance.page.len(parseInt(event.target.value)).draw();
    });
  }

  @ViewChild(DataTableDirective, { static: false }) datatableElement: DataTableDirective;
  dtElement: DataTableDirective;
  dtTrigger: Subject<any> = new Subject();

  modifierData: any;
  closeResult: string;
  outletId: any;
  outletName: string;

  constructor(
    private ngxLoader: NgxUiLoaderService,
    private modalService: NgbModal,
    private alertService: AlertService,
    private posDataService: PosDataService,
    private posViewService: PosViewService,
    private posEditService: PosEditService,
    public commonService: CommonService
  ) { }

  ngOnInit(): void {
    this.outletName = sessionStorage.getItem('activeOutletname');
    this.outletId = sessionStorage.getItem('activeOutletId');
    this.getAllModifierGroupData();
  }

  getAllModifierGroupData() {
    this.isDataLoaded = false;
    this.ngxLoader.startLoader('loader-01');
    let obj = {
      outletId: this.outletId,
      isAllItem: true,
    }
    this.posDataService.getModifiersByOutletId(obj).subscribe(res => {
      this.ngxLoader.stopLoader('loader-01');
      this.modifierData = res['data'];
      let success = res['success'];
      let msg = res['message'];
      this.isDataLoaded = true;
      this.dtTrigger.next();
      this.tableListRecord.total = this.modifierData.length;
      if (!success) {
        this.isDataLoaded = true;
        this.alertService.showError(msg);
      }
    });
  }

  openForm() {
    this.modalService.open(ModifierGroupFormComponent, { backdrop: 'static', windowClass: 'main_add_popup', keyboard: true, centered: true }).result.then((result) => {
      this.closeResult = `Closed with: ${result}`;
      if (result) {
        this.getAllModifierGroupData();
      }
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

  view(id) {
    this.posViewService.setModifierViewId(id);
    this.modalService.open(ModifierGroupViewComponent, { backdrop: 'static', windowClass: 'main_add_popup', keyboard: true, centered: true }).result.then((result) => {
      this.closeResult = `Closed with: ${result}`;
    }, (reason) => {
      this.closeResult = `Dismissed ${this.getDismissReason(reason)}`;
    });
  }


  edit(id) {
    this.posEditService.setModifierGroupsEditId(id);
    this.modalService.open(ModifierGroupEditComponent, { backdrop: 'static', windowClass: 'main_add_popup', keyboard: true, centered: true }).result.then((result) => {
      this.closeResult = `Closed with: ${result}`;
      if (result) {
        this.getAllModifierGroupData();
      }
    }, (reason) => {

      this.closeResult = `Dismissed ${this.getDismissReason(reason)}`;
    });
  }
  onDelete(id) {
    this.ngxLoader.startLoader('loader-01');
    this.posDataService.deleteMasterModifierGroupRow(id).subscribe((res) => {
      this.ngxLoader.stopLoader('loader-01');
      console.log(res);
      let success = res['success'];
      let msg = res['message'];
      if (success) {
        this.getAllModifierGroupData();
        this.alertService.showSuccess('Deleted Successfully');
      }
      else {
        this.alertService.showError(msg);
      }
    });
  }
  changeModiFierStatus(id, status) {
    this.posDataService.changeModiFierStatus(id, !status).subscribe((res: any) => {
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
