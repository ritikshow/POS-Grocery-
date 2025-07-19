import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { PosDataService } from '@core/services/pos-system/pos-data.service';
import { NgbModal, ModalDismissReasons } from '@ng-bootstrap/ng-bootstrap';
import { NgxUiLoaderService } from 'ngx-ui-loader';
import { OutletSelectionComponent } from '../../dines-in/outlet-selection/outlet-selection.component';
import { RestaurantSelectionComponent } from '../../dines-in/restaurant-selection/restaurant-selection.component';

@Component({
  selector: 'app-shift-table',
  templateUrl: './merge-table.component.html',
  styleUrls: ['./merge-table.component.css']
})
export class MergeTableComponent implements OnInit {
  closeResult: string;
  numbers: any;
  tables: any;
  tableType: any;
  selectType: any;
  tableData: any;
  orderData: any;
  outletId: any;
  outletName: string;
  activeModal: any;
  oldTableNo: any;
  orderId: string;
  alertService: any;
  oldTableId: any;
  newTableId: any;
  selectedTableToMergeOrder: any;
  mergeTableNo : any;

  constructor(
    private ngxLoader: NgxUiLoaderService,
    private posDataService: PosDataService,
    private formBuilder: FormBuilder,
    private modalService: NgbModal,
  ) { }

  ngOnInit(): void {
    this.orderId = sessionStorage.getItem('orderId');
    this.outletId = sessionStorage.getItem('activeOutletId');
    this.oldTableNo = sessionStorage.getItem('TableNum');
    this.oldTableId = sessionStorage.getItem('tableId');
    this.getAllTables();
  }

  getOutletModalView() {
    this.modalService.open(OutletSelectionComponent, { backdrop: 'static', size: 'md', keyboard: true, centered: true }).result.then((result) => {
      this.closeResult = `Closed with: ${result}`;
      if (result) {
        this.outletId = sessionStorage.getItem('activeOutletId');
        this.outletName = sessionStorage.getItem('activeOutletname');
        this.getAllTables();
      }
    }, (reason) => {
      this.closeResult = `Dismissed ${this.getDismissReason(reason)}`;
    });
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

  private getDismissReason(reason: any): string {
    if (reason === ModalDismissReasons.ESC) {
      return 'by pressing ESC';
    } else if (reason === ModalDismissReasons.BACKDROP_CLICK) {
      return 'by clicking on a backdrop';
    } else {
      return `with: ${reason}`;
    }
  }

  getAllTables() {
    this.ngxLoader.startLoader('loader-01');
    this.posDataService.getAllTabledetailsByOutlet(this.outletId, false).subscribe((res: any) => {
      this.ngxLoader.stopLoader('loader-01');
      this.tables = res['data'];
      let success = res['success'];
      let msg = res['message'];
      if (success) {
        this.tables = this.tables.filter(x => x.tableStatus === 'Empty');
        this.CalculateTimeOfTable();
        this.getTableType();
      }
      else {
        this.alertService.showError(msg);
      }
    });
  }

  private CalculateTimeOfTable() {
    setTimeout(() => {

      for (let k = 0; k < this.tables.length; k++) {

        let data = this.tables[k];
        let start = new Date().getTime();
        this.CheckOccupideDate(data, start, k);
      }
    }, 1000);
  }

  private CheckOccupideDate(data: any, start: number, k: number) {
    if (data.occupiedOn != null) {
      let { diffHour, diffMin, seconds } = this.CheckDifference(data, start);

      if (diffHour > 0) {
        this.tables[k].diffTime = diffHour + " : " + diffMin + " : " + seconds;
      } else {
        this.tables[k].diffTime = diffMin + " : " + seconds;
      }
    }
    else {
      this.tables[k].diffTime = "00:00";
    }
  }

  private CheckDifference(data: any, start: number) {
    let end = new Date(data.occupiedOn).getTime();
    let diff = start - end;
    let diffDay = Math.floor(diff / (60 * 60 * 24 * 1000));
    let diffHour = Math.floor((diff / (60 * 60 * 1000)) - (diffDay * 24));
    let diffMin = Math.floor(diff / (60 * 1000)) - ((diffDay * 24 * 60) + (diffHour * 60));
    let seconds = Math.floor(diff / 1000) - ((diffDay * 24 * 60 * 60) + (diffHour * 60 * 60) + (diffMin * 60));
    return { diffHour, diffMin, seconds };
  }

  getTableType() {
    this.ngxLoader.startLoader('loader-01');
    this.posDataService.getTableTypeDataByOutletId(this.outletId, false).subscribe((res: any) => {
      this.ngxLoader.stopLoader('loader-01');
      this.tableType = res['data'];
      let success = res['success'];
      let msg = res['message'];
      if (success) {
        if (sessionStorage.getItem('tableType')) {
          this.selectType = sessionStorage.getItem('tableType');
        } else {
          this.selectType = this.tableType[0].tableTypeName;
        }
        this.selectPlace();
      }
      else {
        this.alertService.showError(msg);
      }
    });
  }

  selectPlace() {
    this.numbers = this.tables.filter((res: any) => {
      return res.tableType.match(this.selectType);
    });
  }
  closeModal() {
    this.modalService.dismissAll();
    this.activeModal.close();
  }
  mergeTables() {
    this.posDataService.MergeTables(this.oldTableId, this.selectedTableToMergeOrder.tableId, this.outletId, this.orderId).subscribe((res: any) => {
      this.ngxLoader.stopLoader('loader-01');
      let status = res['success'];
      if (status) {
        this.closeModal();
        this.alertService.showSuccess("Sucessfully merged");
      } else {
        this.alertService.showError("Unable to merge");
      }
    });
  }
  selectTableToMerge(table) {
    this.selectedTableToMergeOrder = table;
    this.mergeTableNo = table.tableNo;
  }
}
