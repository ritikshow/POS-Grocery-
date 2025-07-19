import { PrintDesignViewViewComponent } from './../print-design-view-view/print-design-view-view.component';
import { Component, OnInit, ViewChild } from '@angular/core';
import { AlertService } from '@core/services/common/alert.service';
import { PosDataService } from '@core/services/pos-system/pos-data.service';
import { PosEditService } from '@core/services/pos-system/pos-edit.service';
import { PosViewService } from '@core/services/pos-system/pos-view.service';
import { NgbModal, ModalDismissReasons } from '@ng-bootstrap/ng-bootstrap';
import { PrintDesignVeiwEditComponent } from '../print-design-veiw-edit/print-design-veiw-edit.component';
import { PrintDesignVeiwComponent } from '../print-design-veiw.component';
import { NgxUiLoaderService } from 'ngx-ui-loader';
import { saveAs } from 'file-saver';
import { DataTableDirective } from 'angular-datatables';
import { Subject } from 'rxjs';
import { CommonService } from '@core/services/common/common.service';
@Component({
  selector: 'app-print-design-table',
  templateUrl: './print-design-table.component.html',
  styleUrls: ['./print-design-table.component.css']
})
export class PrintDesignTableComponent implements OnInit {
  printData: any;
  closeResult: string;
  outletId: any;
  outletName: string;
  isDataLoaded = false;
  tableListRecord: any = [];
  dtOptions: DataTables.Settings = {
    order: [[1, 'desc']],
    lengthChange: false,
    pageLength: 10,
    infoCallback: (settings: DataTables.SettingsLegacy, start: number, end: number, mnax: number, total: number, pre: string) => {
      this.tableListRecord.total = total;
    }
  };
@ViewChild(DataTableDirective, { static: false }) datatableElement: DataTableDirective;
  dtElement: DataTableDirective;
  dtTrigger: Subject<any> = new Subject();
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

    this.getAllPrintDesign();
  }

  getAllPrintDesign() {
this.isDataLoaded = false;
    this.posDataService.getAllPrintDesignByOutletId(this.outletId).subscribe((res: any) => {
      ;
      this.printData = res['data'];
      let success = res['success'];
      let msg = res['message'];
      if (success) {
        this.dtTrigger.next();
        this.tableListRecord.total = this.printData?.length;
        this.isDataLoaded = true;
      }
      else{
        this.alertService.showError(msg);
      }
    });
  }
  DownloadPrintingService() {
    saveAs('assets/PrintingService/Printing Service.zip', `PrintingService.Zip`);
  }
  openForm() {
    this.modalService.open(PrintDesignVeiwComponent, { backdrop: 'static', windowClass: 'main_add_popup print_design_popup', keyboard: true, centered: true }).result.then((result) => {
      this.closeResult = `Closed with: ${result}`;
      this.getAllPrintDesign();
    }, (reason) => {
      this.closeResult = `Dismissed ${this.getDismissReason(reason)}`;
    });
  }
  printDesignView(id) {
    this.posViewService.setNotificationViewId(id);
    this.modalService.open(PrintDesignViewViewComponent, { backdrop: 'static', windowClass: 'main_add_popup', keyboard: true, centered: true }).result.then((result) => {
      this.closeResult = `Closed with: ${result}`;
      if (result) {
        this.getAllPrintDesign();
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

  edit(id) {
    this.posEditService.setPrintDesignViewEditId(id);
    this.modalService.open(PrintDesignVeiwEditComponent, { backdrop: 'static', windowClass: 'main_add_popup print_design_popup', keyboard: true, centered: true }).result.then((result) => {
      this.closeResult = `Closed with: ${result}`;
      if (result) {
        this.getAllPrintDesign();
      }
    }, (reason) => {
      this.closeResult = `Dismissed ${this.getDismissReason(reason)}`;
    });
  }
  onDelete(id, isActive) {
    if (isActive) {
      this.alertService.showWarning('Delete not possible..!!This is active design');
    }
    else {
      this.ngxLoader.startLoader('loader-01');
      this.posDataService.deletePrintDesign(id).subscribe((res) => {
        this.ngxLoader.stopLoader('loader-01');
        console.log(res);
        let success = res['success'];
        let msg = res['message'];
        if (success) {
          this.getAllPrintDesign();
          this.alertService.showSuccess('Deleted Successfully');
        }
        else {
          this.alertService.showError(msg);
        }
      });
    }
  }
  changePrintStatus(id, status) {
    this.posDataService.UpdatePrintStatus(id, !status, this.outletId).subscribe((res: any) => {
      this.ngxLoader.stopLoader('loader-01');
      let status = res['success'];
      let msg = res['message'];
      if (status) {
        this.getAllPrintDesign();//To get updated active status
        this.alertService.showSuccess(msg);
      } else {
        this.alertService.showError(msg);
      }
});
}
}

