import { Component, OnInit, ViewChild } from '@angular/core';
import { NgbModal, ModalDismissReasons, NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';
import { AlertService } from '@core/services/common/alert.service';
import { AddItemService } from '../../../../core/services/common/add-item.service';
import { AddAdminTabledetailsComponent } from './add-admin-tabledetails/add-admin-tabledetails.component';
import { PrintTableQrComponent } from './print-table-qr/print-table-qr.component';
import { PosDataService } from '@core/services/pos-system/pos-data.service';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { PosEditService } from '@core/services/pos-system/pos-edit.service';
import { OutletSelectionComponent } from '../dines-in/outlet-selection/outlet-selection.component';
import { ViewAdminTableDetailsComponent } from './view-admin-table-details/view-admin-table-details.component';
import { RestaurantSelectionComponent } from '../dines-in/restaurant-selection/restaurant-selection.component';
import { NgxUiLoaderService } from 'ngx-ui-loader';
import { Subject } from 'rxjs';
import { DataTableDirective } from 'angular-datatables';
import QRCode from 'qrcode';
import { CommonService } from '@core/services/common/common.service';

@Component({
  selector: 'app-admin-table-details',
  templateUrl: './admin-table-details.component.html',
  styleUrls: ['./admin-table-details.component.css']
})
export class AdminTableDetailsComponent implements OnInit {
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
  qrCodeUrl: any;
  changedLength(event) {
    this.datatableElement.dtInstance.then((dtInstance: DataTables.Api) => {
      dtInstance.page.len(parseInt(event.target.value)).draw();
    });
  }

  @ViewChild(DataTableDirective, { static: false }) datatableElement: DataTableDirective;
  dtElement: DataTableDirective;
  dtTrigger: Subject<any> = new Subject();
  tableDetailForm: any = FormGroup;
  closeResult: string;
  allItems: any;
  items: any;
  pager: any = {};
  pageNumber = 1;
  pageSize = 10;
  totalRows: number;
  outletId: any;
  outletName: string;

  constructor(
    private ngxLoader: NgxUiLoaderService,
    private modalService: NgbModal,
    private alertService: AlertService,
    private addItems: AddItemService,
    private posDataService: PosDataService,
    private formBuilder: FormBuilder,
    private activeModal: NgbActiveModal,
    private posEditService: PosEditService,
    public commonService: CommonService
  ) { }

  addTableDetailsFormData(data: any) {
    this.addItems.addAdminCategoryData(data).subscribe((result) => {
      this.getLatestAdminTableDetails();
    });
  }

  getLatestAdminTableDetails() {
    this.ngxLoader.startLoader('loader-01');
    this.isDataLoaded = false;
    this.addItems.getAllTabledetailsByOutlet(this.outletId, true).subscribe((res: any) => {
      this.isDataLoaded = true;
      this.ngxLoader.stopLoader('loader-01');
      this.allItems = res['data'];
      this.dtTrigger.next();
      this.tableListRecord.total = this.allItems.length;
    });
  }

  ngOnInit(): void {
    this.outletName = sessionStorage.getItem('activeOutletname');
    this.tableDetailForm = this.formBuilder.group({
      tableNo: ['', Validators.required],
      pilot: ['', Validators.required],
      capacity: ['', Validators.required],
      tableType: ['', Validators.required]
    });
    if (sessionStorage.getItem('Role') == 'Super Admin') {
      if (sessionStorage.getItem('activeRestaurantId') == null || sessionStorage.getItem('activeRestaurantId') == undefined) {
        this.getRestaurantModalView();
      } else {
        if (sessionStorage.getItem('activeOutletId') == null || sessionStorage.getItem('activeOutletId') == undefined) {
          this.getOutletModalView();
        }
      }
    } else {
      if (sessionStorage.getItem('activeOutletId') == null || sessionStorage.getItem('activeOutletId') == undefined) {
        this.getOutletModalView();
      }
    }
    this.outletId = sessionStorage.getItem('activeOutletId');
    this.getLatestAdminTableDetails();
  }

  getRestaurantModalView() {
    this.modalService.open(RestaurantSelectionComponent, { backdrop: 'static', size: 'md', keyboard: true, centered: true }).result.then((result) => {
      this.closeResult = `Closed with: ${result}`;
      if (result) {
        this.getOutletModalView();
      }
    }, (reason) => {
      this.closeResult = `Dismissed ${this.getDismissReason(reason)}`;
    });
  }
  getOutletModalView() {
    this.modalService.open(OutletSelectionComponent, { backdrop: 'static', size: 'md', keyboard: true, centered: true }).result.then((result) => {
      this.closeResult = `Closed with: ${result}`;
      if (result) {
        this.outletId = sessionStorage.getItem('activeOutletId');
        this.getLatestAdminTableDetails();
      }
    }, (reason) => {
      this.closeResult = `Dismissed ${this.getDismissReason(reason)}`;
    });
  }

  closeModal() {
    this.activeModal.close();
  }

  openForm() {
    sessionStorage.setItem('isNewTable', 'true');
    this.modalService.open(AddAdminTabledetailsComponent, { backdrop: 'static', windowClass: 'main_add_popup', keyboard: true, centered: true }).result.then((result) => {
      this.closeResult = `Closed with: ${result}`;
      this.getLatestAdminTableDetails();
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
    this.addItems.setIdForTableDetailsView(id);
    this.modalService.open(ViewAdminTableDetailsComponent, { backdrop: 'static', windowClass: 'main_add_popup', keyboard: true, centered: true }).result.then((result) => {
      this.closeResult = `Closed with: ${result}`;
    }, (reason) => {
      this.closeResult = `Dismissed ${this.getDismissReason(reason)}`;
    });
  }

  edit(id) {
    sessionStorage.setItem('isNewTable', 'false');
    sessionStorage.setItem('editTable', id);
    this.posEditService.setTableMasterEditId(id);
    this.modalService.open(AddAdminTabledetailsComponent, { backdrop: 'static', windowClass: 'main_add_popup', keyboard: true, centered: true }).result.then((result) => {
      this.closeResult = `Closed with: ${result}`;
      if (result) {
        this.getLatestAdminTableDetails();
      }
    }, (reason) => {
      this.closeResult = `Dismissed ${this.getDismissReason(reason)}`;
    });
  }

  onDelete(id) {
    this.ngxLoader.startLoader('loader-01');
    this.posDataService.deleteTableDetailsRow(id).subscribe((res) => {
      this.ngxLoader.stopLoader('loader-01');
      let success = res['success'];
      let msg = res['message'];
      if (success) {
        this.getLatestAdminTableDetails();
        this.alertService.showSuccess('Deleted Successfully');
      }
      else {
        this.alertService.showError(msg);
      }
    });
  }

  changeTableStatus(id, status) {
        this.posDataService.UpdateTableStatus(id, !status).subscribe((res: any) => {
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

  printQr(item) {
    //let qrValue = "***urlOfTheNewComponent***/" + item.outletId + "/" + item.tableId + "/" + item.tableType.toString() + "/" + item.capacity.toString() + "/" + item.tableNo.toString();
    let qrValue = window.location.origin + "/#/myorder/" + item.outletId + "/" + item.tableId + "/" + item.outletName;
    console.log("QRValue",qrValue)
    let qrCode: any ={
      tableNo: item.tableNo,
      capacity: item.capacity,
      tableType: item.tableType,
      restaurantName: item.restaurantName,
      outletName: item.outletName
    }

    QRCode.toDataURL(qrValue)
      .then(url => {
        qrCode.qrCodeUrl = url; // Set the generated QR code image URL
        sessionStorage.setItem('tableQrCode', JSON.stringify(qrCode));
        this.modalService.open(PrintTableQrComponent, { backdrop: 'static', windowClass: 'main_add_popup print_qr_popup', keyboard: true, centered: true }).result.then((result) => {
          this.closeResult = `Closed with: ${result}`;
          if (result) {
          }
        }, (reason) => {
        });
      })
      .catch(err => {
        console.error('Error generating QR code:', err);
      });
  }
}
