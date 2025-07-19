import { OutletSelectionComponent } from './../../dines-in/outlet-selection/outlet-selection.component';
import { Component, OnInit } from '@angular/core';
import { AlertService } from '@core/services/common/alert.service';
import { PosDataService } from '@core/services/pos-system/pos-data.service';
import { NgbActiveModal, NgbModal, ModalDismissReasons } from '@ng-bootstrap/ng-bootstrap';
import { NgxUiLoaderService } from 'ngx-ui-loader';

@Component({
  selector: 'app-sales-receipt',
  templateUrl: './sales-receipt.component.html',
  styleUrls: ['./sales-receipt.component.css']
})
export class SalesReceiptComponent implements OnInit {
  date: Date;
  dashBoardData: any;
  outletName: string;
  restaurantView: boolean;
  outletId: any;
  closeResult: string;
  PrintDate: any;

  constructor(
    private posDataService: PosDataService,
    private alertService: AlertService,
    private modalService: NgbModal,
    private ngxLoader: NgxUiLoaderService,
    private activeModal: NgbActiveModal,
  ) { }

  ngOnInit(): void {
    this.outletName = sessionStorage.getItem('activeOutletname');
    this.outletId = sessionStorage.getItem('activeOutletId');
    this.PrintDate = sessionStorage.getItem('PrintDate');
    sessionStorage.removeItem('PrintDate');
    if (sessionStorage.getItem('Role') == 'Super Admin') {
      this.restaurantView = true;
    }
    this.date = new Date();
    this.getOrdersCountForPrint();
  }
  getOutletModalView() {

    sessionStorage.setItem('dash', 'dashboard');
    this.modalService.open(OutletSelectionComponent, { backdrop: 'static', size: 'md', keyboard: true, centered: true }).result.then((result) => {
      this.closeResult = `Closed with: ${result}`;
      if (result) {
        this.outletId = sessionStorage.getItem('activeOutletId');
        this.outletName = sessionStorage.getItem('activeOutletname');
      }
      this.getOrdersCountForPrint();
    }, (reason) => {
      this.closeResult = `Dismissed ${this.getDismissReason(reason)}`;
    });
  }

  addEvent(content) {
    this.modalService.open(content, { ariaLabelledBy: 'modal-basic-title', keyboard: false, backdrop: 'static', windowClass: 'add_item_popup' }).result.then((result) => {

    }, (reason) => {
      console.log(reason);
    });
  }
  getOrdersCountForPrint() {
    this.ngxLoader.startLoader('loader-01');
    let values = { outletId: this.outletId, toDate: this.PrintDate, fromDate: this.PrintDate, userId: null };
    this.posDataService.getOrdersCountForPrint(values).subscribe((response: any) => {
      this.ngxLoader.stopLoader('loader-01');
  
       this.dashBoardData = response['data'];
  
    });
  }

  formatDate(date) {
    return [
      date.getFullYear(),
      this.padTo2Digits(date.getMonth() + 1),
      this.padTo2Digits(date.getDate()),
    ].join('-');
  }

  padTo2Digits(num) {
    return num.toString().padStart(2, '0');
  }
  closeModal() {
    this.activeModal.close(0);
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
}
