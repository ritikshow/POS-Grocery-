import { Component, OnDestroy, OnInit } from '@angular/core';
import { AlertService } from '@core/services/common/alert.service';
import { PosDataService } from '@core/services/pos-system/pos-data.service';
import { PosDataShareService } from '@core/services/pos-system/posDataShare.service';
import { NgbModal, ModalDismissReasons } from '@ng-bootstrap/ng-bootstrap';
import { NgxUiLoaderService } from 'ngx-ui-loader';
import { OutletSelectionComponent } from '../dines-in/outlet-selection/outlet-selection.component';
import { RestaurantSelectionComponent } from '../dines-in/restaurant-selection/restaurant-selection.component';
import { WarehousePrintComponent } from './warehouse-print/warehouse-print.component';
import Scrollbar from 'smooth-scrollbar';

@Component({
  selector: 'app-warehouse',
  templateUrl: './warehouse.component.html',
  styleUrls: ['./warehouse.component.css']
})
export class WarehouseComponent implements OnInit, OnDestroy {
  closeResult: string;
  receivedOrders: any;
  order: any;
  outletId: any;
  Week: any;
  countdownTimers: { [key: string]: string } = {};;
  CurrentDate: any;
  orders: any[] = [
    { id: '67aedf66033ff92e701a79f2', dueTime: '2025-02-18T10:52:52.588Z' },
    { id: '67aedf66033ff92e701a79f3', dueTime: '2025-02-18T11:00:00.000Z' },
    { id: '67aedf66033ff92e701a79f4', dueTime: '2025-02-18T11:30:00.000Z' },
    { id: '67aedf66033ff92e701a79f5', dueTime: '2025-02-18T12:00:00.000Z' },
    { id: '67aedf66033ff92e701a79f8', dueTime: '2025-02-18T12:30:00.000Z' }
  ];
  itemIds = [];
  interval: NodeJS.Timeout;
  outletName: string;
  isShowPrepareAll: boolean = false;

  constructor(
    private ngxLoader: NgxUiLoaderService,
    private modalService: NgbModal,
    private posDataService: PosDataService,
    private posDataSharedService: PosDataShareService,
    private alertService: AlertService,
  ) { }

  async ngOnInit() {
    this.outletName = sessionStorage.getItem('activeOutletname');
    this.outletId = sessionStorage.getItem('activeOutletId');
    await this.getAllOrders();
    if (sessionStorage.getItem('Role') == 'Super Admin') {
      if (sessionStorage.getItem('activeRestaurantId') == null || sessionStorage.getItem('activeRestaurantId') == undefined) {
        await this.getRestaurantModalView();
      } else {
        if (sessionStorage.getItem('activeOutletId') == null || sessionStorage.getItem('activeOutletId') == undefined) {
          await this.getOutletModalView();
        }
      }
    } else {
      if (sessionStorage.getItem('activeOutletId') == null || sessionStorage.getItem('activeOutletId') == undefined) {
        await this.getOutletModalView();
      }
    }
    this.Week = new Date().toLocaleDateString('en-US', { weekday: 'long' });
    this.routerOnActivate();
    setInterval(() => {
      this.ToDayDateAndTime();
    }, 1000);
  }
  ngOnDestroy() {
    if(this.interval)
    clearInterval(this.interval);
  }
  ToDayDateAndTime() {
    this.CurrentDate = new Date().toLocaleString('en-GB', {
      day: '2-digit', month: '2-digit', year: 'numeric',
      hour: '2-digit', minute: '2-digit', second: '2-digit',
      hour12: false
    }).replace(',', ' |');
  }

  async getRestaurantModalView() {
    this.modalService.open(RestaurantSelectionComponent, { backdrop: 'static', size: 'md', keyboard: true, centered: true }).result.then((result) => {
      this.closeResult = `Closed with: ${result}`;
      if (result) {
        this.getOutletModalView();
      }
    }, (reason) => {
      this.closeResult = `Dismissed ${this.getDismissReason(reason)}`;
    });
  }

  async getOutletModalView() {
    this.modalService.open(OutletSelectionComponent, { backdrop: 'static', size: 'md', keyboard: true, centered: true }).result.then((result) => {
      this.closeResult = `Closed with: ${result}`;
    }, (reason) => {
      this.closeResult = `Dismissed ${this.getDismissReason(reason)}`;
    });
  }

  Compareobj(items: any) {
    for (let h = 0; h < items.length; h++) {
      if (items[h].itemLocation == 'Warehouse' && items[h].itemStatus == 'Ordered') {
        return true;
      }
    }
    return false;
  }
  routerOnActivate() {
    this.interval = setInterval(() => {
      this.getAllOrders();
    }, 60000);
  }
  PlaySound() {
    // let audio = new Audio();
    // audio.src = "../assets/audio/notifySound.wav";
    // audio.load();
    // audio.play();
  }
  async getAllOrders() {
    let oldData;
    if (this.order != undefined)
      oldData = this.order.map(x => x.orderId);
    this.ngxLoader.startLoader('loader-01');
    (await this.posDataService.getAllOrderByStatus('Running', this.outletId)).subscribe((res: any) => {
      this.ngxLoader.stopLoader('loader-01');
      this.FilterOrderAndCheckTimeOfOrder(res, oldData);
      this.receivedOrders.sort((a, b) => a.createdByName.localeCompare(b.createdByName));
      setTimeout(() => {
        this.order = this.receivedOrders;
        this.FilterOrders();
      }, 1000);
    });
  }

  private FilterOrderAndCheckTimeOfOrder(res: any, oldData: any) {
    this.receivedOrders = res['data'];
    let IsPlayed = false;
    for (let i = 0; i < this.receivedOrders?.length; i++) {
      if (this.Compareobj(this.receivedOrders[i].items)) {
        IsPlayed = this.CheckCourseAndNewOrders(i, oldData, IsPlayed);
      }
      else {
        this.receivedOrders = this.receivedOrders.filter(({ orderId }) => orderId !== this.receivedOrders[i].orderId);
        i--;
      }
    }
  }
  async ngAfterViewChecked(): Promise<void> {
    this.initScrollbars();
  }
  private initScrollbars(): void {
    document.querySelectorAll<HTMLElement>('.order_food_info_blk').forEach(el => { Scrollbar.init(el) })
  }

  private FilterOrders() {
    for (let i = 0; i < this.order.length;) {
      let count = 0;
      ({ i, count } = this.FilterWareHouseItems(i, count));
    }
    if (this.order.length > 0) {
      (this.isShowPrepareAll = true);
    } else {
      (this.isShowPrepareAll = false);
    }
    setInterval(() => {
      for (let k = 0; k < this.order.length; k++) {
        this.CalculateTimeOFOrderAndAddTimeToOtrder(k);
      }
    }, 1000);
  }

  private CalculateTimeOFOrderAndAddTimeToOtrder(k: number) {
    let data = this.order[k];
    let { diffHour, diffMin, seconds, TimeToPreapareOrder } = this.CalculateTimeOfOrder(data);

    if (diffHour > 0) {
      this.order[k].diffTime = diffHour + " : " + diffMin + " : " + seconds;
    } else {
      this.order[k].diffTime = diffMin + " : " + seconds;
    }
    this.order[k].TimeToPreapareOrder = TimeToPreapareOrder;

  }

  private CalculateTimeOfOrder(data: any) {
    let start = new Date().getTime();
    let end = new Date(data.orderDateTime).getTime();
    let diff = start - end;
    let diffDay = Math.floor(diff / (60 * 60 * 24 * 1000));
    let diffHour = Math.floor((diff / (60 * 60 * 1000)) - (diffDay * 24));
    let diffMin = Math.floor(diff / (60 * 1000)) - ((diffDay * 24 * 60) + (diffHour * 60));
    let seconds = Math.floor(diff / 1000) - ((diffDay * 24 * 60 * 60) + (diffHour * 60 * 60) + (diffMin * 60));
    let MaxPreparationTime = 0;
    for (let i = 0; i < data.items?.length; i++) {
      if (MaxPreparationTime < data.items[i].preparingTime) {
        MaxPreparationTime = data.items[i].preparingTime;
      }
    }
    let TimeToPreapareOrder = this.getRemainingTime(data.lastModifiedOn, MaxPreparationTime);
    return { diffHour, diffMin, seconds, TimeToPreapareOrder };
  }
  getRemainingTime(timeString: string, minutesToAdd: number): string {
    let modifiedTime = new Date(timeString);
    modifiedTime.setMinutes(modifiedTime.getMinutes() + minutesToAdd);
    let currentTime = new Date();
    let diffInSeconds = Math.floor((modifiedTime.getTime() - currentTime.getTime()) / 1000);
    if (diffInSeconds <= 0) {
      return "00:00:00";
    }
    let hours = Math.floor(diffInSeconds / 3600);
    let minutes = Math.floor((diffInSeconds % 3600) / 60);
    let seconds = diffInSeconds % 60;
    return `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
  }
  private FilterWareHouseItems(i: number, count: number) {
    for (let j = 0; j < this.order[i].items.length; j++) {
      if (this.order[i].items[j].itemStatus == 'Ordered' && this.order[i].items[j].itemLocation == "Warehouse") {
        count++;
      }
    }
    this.order[i].items = this.order[i].items.filter(x => x.itemStatus == 'Ordered' && x.itemLocation == "Warehouse")
    if (count == 0) {
      this.order.splice(i, 1);
      i = 0;
    } else {
      i++;
    }
    return { i, count };
  }

  private CheckCourseAndNewOrders(i: number, oldData: any, IsPlayed: boolean) {
    let courses = this.receivedOrders[i].items.filter(x => x.itemStatus == 'Ordered' && x.itemLocation == "Warehouse").map(x => x.categoryCourse);
    if (courses != null && courses.length != 0)
      this.receivedOrders[i].allCategoryCourse = [...new Set(courses)];

    for (let k = 0; k < this.receivedOrders[i].items.length; k++) {
      this.receivedOrders[i].items[k].orderQuantity = Number(this.receivedOrders[i].items[k].orderQuantity) - Number(this.receivedOrders[i].items[k].preparedQuantity);
    }
    if (this.order != undefined && oldData !== undefined && !IsPlayed && !oldData.includes(this.receivedOrders[i].orderId)) {
      this.PlaySound();
      IsPlayed = true;
    }
    return IsPlayed;
  }

  search(event) {
    if (event.target.value == '') {
      this.order = this.receivedOrders;
    } else {
      this.order = this.receivedOrders.filter((res: any) => {
        return res.orderNo == event.target.value;
      });
    }
  }

  async prepareSingle(itemId, orderId, itemIndex, orderIndex) {
    let itemIds = [];
    itemIds.push(itemId);
    this.ngxLoader.startLoader('loader-01');
    (await this.posDataService.changeMultipleItemStatus(orderId, itemIds, "Prepared")).subscribe((res: any) => {
      this.ngxLoader.stopLoader('loader-01');
      let msg = res['message'];
      let success = res['success'];
      if (success) {
        this.PlaySound();
        this.alertService.showSuccess(msg);
        this.getAllOrders();
      } else {
        this.alertService.showError(msg);
      }
    });
  }
  async prepare(i) {

    let orderId = this.receivedOrders[i].orderId;
    let data = this.order.filter((res: any) => {
      return res.orderId == orderId;
    });
    for (let j = 0; j < data[0].items.length; j++) {
      if (data[0].items[j].id) {
        if (data[0].items[j].itemLocation == "Warehouse") {
          this.itemIds.push(data[0].items[j].id);
        }
      }
    }
    (await this.posDataService.changeMultipleItemStatus(orderId, this.itemIds, "Prepared")).subscribe((res: any) => {
      let msg = res['message'];
      let success = res['success'];
      if (success) {
        this.PlaySound();
        this.alertService.showSuccess(msg);
        this.order.splice(i, 1);
      } else {
        this.alertService.showError(msg);
      }
    });
  }
  //prepare course wise items
  async prepareCourse(inds, orderData, courseName) {

    let items = orderData.items.filter(x => x.categoryCourse == courseName);
    let itemsId = items.map(x => x.id);
    (await this.posDataService.changeMultipleItemStatus(orderData.orderId, itemsId, "Prepared")).subscribe((res: any) => {
      let msg = res['message'];
      let success = res['success'];
      if (success) {
        this.PlaySound();
        this.alertService.showSuccess(msg);
        this.order[inds].allCategoryCourse.splice(this.order[inds].allCategoryCourse.indexOf(courseName), 1);
        this.getAllOrders();
      } else {
        this.alertService.showError(msg);
      }
    });
  }

  preparedAll() {
    for (let i = 0; i < this.order.length; i++) {
      this.prepare(i);
    }
    this.order = [];
    this.alertService.showSuccess("Successfully marked as prepared");
  }

  print(id) {
    this.posDataSharedService.setIdForOrderId(id);
    this.modalService.open(WarehousePrintComponent, { backdrop: 'static', windowClass: 'main_add_popup order_bill_pint_popup', keyboard: true, centered: true }).result.then((result) => {
      this.closeResult = `Closed with: ${result}`;
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

  
}
