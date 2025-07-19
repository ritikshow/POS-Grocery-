import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { AlertService } from '@core/services/common/alert.service';
import { PosDataService } from '@core/services/pos-system/pos-data.service';
import { NgbModal, ModalDismissReasons } from '@ng-bootstrap/ng-bootstrap';
import { NgxUiLoaderService } from 'ngx-ui-loader';
import { OutletSelectionComponent } from '../../dines-in/outlet-selection/outlet-selection.component';
import { RestaurantSelectionComponent } from '../../dines-in/restaurant-selection/restaurant-selection.component';

@Component({
  selector: 'app-shift-table',
  templateUrl: './shift-table.component.html',
  styleUrls: ['./shift-table.component.css']
})
export class ShiftTableComponent implements OnInit {
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
  selectedTableToShiftOrder: any;
  shiftTableNo: any;

  constructor(
    private ngxLoader: NgxUiLoaderService,
    private posDataService: PosDataService,
    private formBuilder: FormBuilder,
    private modalService: NgbModal,
    private alertService: AlertService,
  ) { }

  ngOnInit(): void {
    this.orderId = sessionStorage.getItem('orderId');
    this.outletId = sessionStorage.getItem('activeOutletId');
    this.oldTableNo = sessionStorage.getItem('TableNum');
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
    this.posDataService.getAllTabledetailsByOutlet(this.outletId,false).subscribe((res: any) => {
      this.ngxLoader.stopLoader('loader-01');
      this.tables = res['data'];
      let success = res['success'];
      let msg = res['message'];
      this.CheckSuccessAndAddTiemToOrder(success, msg);
    });
  }

  private CheckSuccessAndAddTiemToOrder(success: any, msg: any) {
    if (success) {
      this.tables = this.tables.filter(x => x.tableStatus === 'Empty');

      setTimeout(() => {
        this.LoopAllOrderAndCalculateTime();
      }, 1000);
      this.getTableType();
    } else {
      this.alertService.showError(msg);
    }
  }

  private LoopAllOrderAndCalculateTime() {
    for (let k = 0; k < this.tables.length; k++) {
      let data = this.tables[k];
      let start = new Date().getTime();
      if (data.occupiedOn != null) {
        this.CalculateTime(data, start, k);
      }
      else {
        this.tables[k].diffTime = "00:00";
      }
    }
  }

  private CalculateTime(data: any, start: number, k: number) {
    let end = new Date(data.occupiedOn).getTime();
    let diff = start - end;
    let diffDay = Math.floor(diff / (60 * 60 * 24 * 1000));
    let diffHour = Math.floor((diff / (60 * 60 * 1000)) - (diffDay * 24));
    let diffMin = Math.floor(diff / (60 * 1000)) - ((diffDay * 24 * 60) + (diffHour * 60));
    let seconds = Math.floor(diff / 1000) - ((diffDay * 24 * 60 * 60) + (diffHour * 60 * 60) + (diffMin * 60));

    if (diffHour > 0) {
      this.tables[k].diffTime = diffHour + " : " + diffMin + " : " + seconds;
    } else {
      this.tables[k].diffTime = diffMin + " : " + seconds;
    }
  }

  getTableType() {
    this.ngxLoader.startLoader('loader-01');
    this.posDataService.getTableTypeDataByOutletId(this.outletId,false).subscribe((res: any) => {
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
  moveTable() {    
    this.posDataService.shiftTableOrder(this.oldTableNo, this.selectedTableToShiftOrder.tableNo, this.outletId, this.orderId).subscribe((res: any) => {
      this.ngxLoader.stopLoader('loader-01');
      let status = res['success'];
      if (status) {
        this.closeModal();
        this.alertService.showSuccess("Sucessfully moved");
      } else {
        this.alertService.showError("Unable to move");
      }
    });
  }
  selectTableToShift(table){
    this.selectedTableToShiftOrder = table;
    this.shiftTableNo = table.tableNo;
  }
}
