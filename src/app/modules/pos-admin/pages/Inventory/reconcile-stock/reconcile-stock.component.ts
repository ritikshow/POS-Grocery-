import { Component, OnInit, ViewChild } from '@angular/core';
import { AlertService } from '@core/services/common/alert.service';
import { PosDataService } from '@core/services/pos-system/pos-data.service';
import { ModalDismissReasons, NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';
import { DataTableDirective } from 'angular-datatables';
import { NgxUiLoaderService } from 'ngx-ui-loader';
import { Subject } from 'rxjs';

@Component({
  selector: 'app-reconcile-stock',
  templateUrl: './reconcile-stock.component.html',
  styleUrls: ['./reconcile-stock.component.css']
})
export class ReconcileStockComponent implements OnInit {
  tableListRecord: any = [];
  dataLoaded = false;

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

  AllMasterData: any;
  outletId: any;
  outletName: string;
  RestaurantId: string;
  closeResult: any;
  editActualQty: any;
  id: any;
  rem: any;
  listOfId = [];
  Stock: Array<{ SrNo: any, productName: any, supplierName: any, price: any, unit: any, quantity: any, actualQuantity: any, criticalQuantity: any, orderQuantity: any, }> = [];
  constructor(
    private posDataService: PosDataService,
    private activeModal: NgbActiveModal,
    private ngxLoader: NgxUiLoaderService,
    private alertService: AlertService,

  ) { }

  ngOnInit(): void {
    this.dtOptions = {
      order: [[1, 'desc']],
      lengthChange: false,
      pageLength: 10,
      infoCallback: (settings: DataTables.SettingsLegacy, start: number, end: number, mnax: number, total: number, pre: string) => {
        this.tableListRecord.total = total;
      }
    }
    let restData = JSON.parse(sessionStorage.getItem('restaurantData'));
    if (sessionStorage.getItem('activeRestaurantId') !== null && sessionStorage.getItem('activeRestaurantId') !== undefined) {
      this.RestaurantId = sessionStorage.getItem('activeRestaurantId');
    } else {
      this.RestaurantId = restData.restaurantId;
    }
    this.outletName = sessionStorage.getItem('activeOutletname');
    this.outletId = sessionStorage.getItem('activeOutletId');
    this.GetAllInventory();
    this.id = sessionStorage.getItem('editId');
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

  GetAllInventory() {
    this.dataLoaded = false;
    this.posDataService.GetAllPsMaster(this.outletId).subscribe((res: any) => {
      this.AllMasterData = res['data'];
      let success = res['success'];
      let msg = res['message'];
      if (success) {
        this.dataLoaded = true;
        this.dtTrigger.next();
        this.tableListRecord.total = this.AllMasterData.length;
      }
      else {
        this.dataLoaded = true;
        this.alertService.showError(msg);
      }
    });
  }

  closeModal() {
    this.activeModal.close();
  }
  editActualQuantity(event, i, id) {
    this.AllMasterData[i].actualQuantity = event.target.value;
    if (!this.listOfId.includes(id)) {
      this.listOfId.push(id);
    }

  }
  Remarks(event) {
    this.rem = event.target.value;
  }

  reconsileStock() {

    if (this.rem == null || this.rem == undefined || this.rem == '') {
      this.alertService.showError("Please enter remarks");
      return;
    }
    for (let i = 0; i < this.AllMasterData.length; i++) {
      if (this.listOfId.includes(this.AllMasterData[i]._id)) {
        this.AllMasterData[i].lastReconcileBy = this.rem;
        this.posDataService.UpdateProductSupplierMaster(this.AllMasterData[i]._id, this.AllMasterData[i]).subscribe((res: any) => {
          this.ngxLoader.stopLoader('loader-01');
          let success = res['success'];
          let msg = res['message'];
          if (success) {
            this.alertService.showSuccess(msg);
          }
          else {
            this.alertService.showError(msg);
          }
        });
      }
    }
    this.activeModal.close();
    this.alertService.showSuccess("Successfully Saved");
  }
}

