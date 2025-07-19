import { Component, OnInit, ViewChild } from '@angular/core';
import { PosDataService } from '@core/services/pos-system/pos-data.service';
import { DataTableDirective } from 'angular-datatables';
import { Subject } from 'rxjs';

@Component({
  selector: 'app-shifttiming',
  templateUrl: './shifttiming.component.html',
  styleUrls: ['./shifttiming.component.css']
})
export class ShiftTimingComponent implements OnInit {
  users: any;
  runningOrders: any;
  status: any;
  closeResult: string;
  outletId: any;
  orderType = 'Dine-in'
  count = 0;
  outletName: string;
  RestaurantId: string;
  orderfilter: any;
  finalorderFilter: any;
  date: Date;
  userRegData: any;
  resId: any;
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
    private posDataService: PosDataService,
  ) { }

  ngOnInit(): void {
    // this.dtOptions = {
    //   order: [[1, 'desc']],
    //   lengthChange: false,
    //   paging: false,
    //   pageLength: -1,
    //   infoCallback: (settings: DataTables.SettingsLegacy, start: number, end: number, mnax: number, total: number, pre: string) => {
    //     this.tableListRecord.total = total;
    //   }
    // }
    this.resId = sessionStorage.getItem('activeRestaurantId');
    this.outletName = sessionStorage.getItem('activeOutletname');
    this.outletId = sessionStorage.getItem('activeOutletId');
    this.getAllUser();
  }
  getAllUser() {
    this.isDataLoaded = false;
    this.posDataService.getAllUserRegDataByRestaurantId(this.resId).subscribe((res: any) => {
      this.userRegData = res['data'];
      this.dtTrigger.next();
      this.isDataLoaded = true;
      this.tableListRecord.total = this.userRegData.length;
    });
  }
  IsOffDay(data, day) {
    if (data.weekDays != null) {
      if (data.weekDays.includes(day)) {
        return false;
      } else {
        return true;
      }
    } else {
      return true;
    }
  }
  rerender(): void {
    this.dtElement.dtInstance.then((dtInstance: DataTables.Api) => {
      // Destroy the table first
      dtInstance.destroy();
      // Call the dtTrigger to rerender again
      this.dtTrigger.next();
    });
  }
}
