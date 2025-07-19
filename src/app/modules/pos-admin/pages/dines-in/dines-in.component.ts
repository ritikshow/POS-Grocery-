import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { Router } from '@angular/router';
import { AlertService } from '@core/services/common/alert.service';
import { PosDataService } from '@core/services/pos-system/pos-data.service';
import { ModalDismissReasons, NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { NgxUiLoaderService } from 'ngx-ui-loader';
import { OutletSelectionComponent } from './outlet-selection/outlet-selection.component';
import { RestaurantSelectionComponent } from './restaurant-selection/restaurant-selection.component';
import { CommonService } from '@core/services/common/common.service';

@Component({
  selector: 'app-dines-in',
  templateUrl: './dines-in.component.html',
  styleUrls: ['./dines-in.component.css']
})

export class DinesInComponent implements OnInit {
  srcIdx;
  targetIdx;
  srcEle;
  style = {
    height: null,
    width: null,
    top: null,
    left: null,
    offsetX: null,
    offsetY: null,
    mirrorWidth: null,
    mirrorHeight: null
  };
  customerForm: any = FormGroup;
  closeResult: string;
  numbers: any;
  tables: any;
  tableType: any;
  selectType: any;
  tableData: any;
  orderData: any;
  outletId: any;
  outletName: string;
  MultiRestaurant: any;
  isEditTables = false;
  PageY = null;
  resData: any;
  getCustomerDataByEventId: any;
  orderType = "Dine-in";
  searchInputItem: any;
  costomerData: any;
  tempcostomerData: any;
  searchInput: any;
  customerData:any;

  constructor(
    private ngxLoader: NgxUiLoaderService,
    private posDataService: PosDataService,
    private alertService: AlertService,
    private router: Router,
    private formBuilder: FormBuilder,
    private modalService: NgbModal,
    public commonService : CommonService
  ) { }

  ngOnInit(): void {
     this.customerData = JSON.parse(sessionStorage.getItem('customerData'))
     if(this.customerData)
       sessionStorage.removeItem('customerData');
    this.resData = JSON.parse(sessionStorage.getItem('restaurants'));
    this.outletName = sessionStorage.getItem('activeOutletname');
    sessionStorage.removeItem('orderId');
    sessionStorage.removeItem('tableOrder')
    this.outletId = sessionStorage.getItem('activeOutletId');
    sessionStorage.removeItem('tab');
    if (sessionStorage.getItem('Role') == 'Super Admin') {
      this.CheckRestaurantSelection();
    } else {
      this.MultiRestaurant = JSON.parse(sessionStorage.getItem('restaurantData'));
      this.CheckOutletSelectiion();
    }
    if (this.outletId != null && this.outletId != undefined) {
      this.getAllTables();
    }

     this.customerForm = this.formBuilder.group({
      cusName: [''],
      phone: [''],
      address: ['']
    });

  }

  private CheckOutletSelectiion() {
    if (this.MultiRestaurant.length > 1) {
      if (sessionStorage.getItem('activeRestaurantId') == null || sessionStorage.getItem('activeRestaurantId') == undefined) {
        this.getRestaurantModalView();
      } else if (sessionStorage.getItem('activeOutletId') == null || sessionStorage.getItem('activeOutletId') == undefined) {
        this.getOutletModalView();
      }
    }
    else if (sessionStorage.getItem('activeOutletId') == null || sessionStorage.getItem('activeOutletId') == undefined) {
      this.getOutletModalView();
    }
  }

  private CheckRestaurantSelection() {
    if (sessionStorage.getItem('activeRestaurantId') == null || sessionStorage.getItem('activeRestaurantId') == undefined) {
      this.getRestaurantModalView();
    } else {
      if (sessionStorage.getItem('activeOutletId') == null || sessionStorage.getItem('activeOutletId') == undefined) {
        this.getOutletModalView();
      }
    }
  }

  EditTable() {
    this.isEditTables = true;
  }

  onMoveEnd(event, i) {
    this.numbers[i].x = event.x;
    this.numbers[i].y = event.y;
  }

  onMovePage(event) {
    this.PageY = event.pageY;
    console.log("Live drag page event", event);
    console.log("Live drag page Y", event.pageY);
  }

  SaveTableArrangement() {
    this.isEditTables = false;
    this.numbers.map((table) => {
      table.pageY = this.PageY;
    });
    this.posDataService.ArrangeTable(this.numbers).subscribe((res: any) => {
    });
    this.alertService.showSuccess("Successfully Saved");
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
      this.CheckSucessOfResponse(success, msg);
    });
  }
  private CheckSucessOfResponse(success: any, msg: any) {
    if (success) {
      setTimeout(() => {
        for (let k = 0; k < this.tables.length; k++) {
          this.GetTimeOfOcupiedTable(k);
        }
      }, 1000);
      this.getTableType();
    } else {
      this.alertService.showError(msg);
    }
  }

  private GetTimeOfOcupiedTable(k: number) {
    let data = this.tables[k];
    let start = new Date().getTime();
    if (data.occupiedOn != null) {
      let end = new Date(data.occupiedOn).getTime();
      let diff = start - end;
      let diffDay = Math.floor(diff / (60 * 60 * 24 * 1000));
      let diffHour = Math.floor((diff / (60 * 60 * 1000)) - (diffDay * 24));
      let diffMin = Math.floor(diff / (60 * 1000)) - ((diffDay * 24 * 60) + (diffHour * 60));
      let seconds = Math.floor(diff / 1000) - ((diffDay * 24 * 60 * 60) + (diffHour * 60 * 60) + (diffMin * 60));

      this.AddDifferenceToVariable(diffHour, k, diffMin, seconds);
    }
    else {
      this.tables[k].diffTime = "00:00";
    }
  }

  private AddDifferenceToVariable(diffHour: number, k: number, diffMin: number, seconds: number) {
    if (diffHour > 0) {
      this.tables[k].diffTime = diffHour + " : " + diffMin + " : " + seconds;
    } else {
      this.tables[k].diffTime = diffMin + " : " + seconds;
    }
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
      } else {
        this.alertService.showError(msg);
      }
    });
  }

  selectTable(table: any, isPayNow: boolean) {
    if (isPayNow)
      sessionStorage.setItem('PayNowFromDineIn', 'payNow');
    sessionStorage.setItem('tableNo', table.tableNo);
    sessionStorage.setItem('selectedTable', JSON.stringify(table));
    sessionStorage.setItem('tableType', this.selectType);
    sessionStorage.setItem('orderType', 'Dine-in');

    if (table.orderId && table.orderId !== '') {
      sessionStorage.setItem('orderId', table.orderId);
    }
    sessionStorage.setItem('page', 'dine');
    this.router.navigate(['/pos-dashboard/dine-in/order']);
  }

  selectPlace() {
    this.numbers = this.tables.filter((res: any) => {
      return res.tableType.match(this.selectType);
    });
    this.PageY = this.numbers[0]?.pageY ?? 0;
  }
 

}
