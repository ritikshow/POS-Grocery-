import { Component, OnDestroy, OnInit } from '@angular/core';
import { AlertService } from '@core/services/common/alert.service';
import { PosDataService } from '@core/services/pos-system/pos-data.service';
import { PosDataShareService } from '@core/services/pos-system/posDataShare.service';
import { NgbModal, ModalDismissReasons } from '@ng-bootstrap/ng-bootstrap';
import { OutletSelectionComponent } from '../dines-in/outlet-selection/outlet-selection.component';
import { RestaurantSelectionComponent } from '../dines-in/restaurant-selection/restaurant-selection.component';
//import { KitchenItemComponent } from './kitchen-item/kitchen-item.component';
import { NgxUiLoaderService } from 'ngx-ui-loader';
import Scrollbar from 'smooth-scrollbar';
import { ActivatedRoute } from '@angular/router';
//import { WarehousePrintComponent } from '../warehouse/warehouse-print/warehouse-print.component';
import { CommonService } from '@core/services/common/common.service';

@Component({
  selector: 'app-kitchen',
  templateUrl: './kitchen.component.html',
  styleUrls: ['./kitchen.component.css']
})
export class KitchenComponent implements OnInit, OnDestroy {
  closeResult: string;
  receivedOrders: any;
  runningOrders: any;
  panelOpenState = false;
  order: any;
  tempOrderList: any = {};
  outletId: any;
  itemIds = [];
  interval: NodeJS.Timeout;
  outletName: string;
  orderTime: any;
  duration: any;
  startTime: any;
  end: any[] = [];
  returnDiffTime: any;
  returnDiffTimeWithoutHour: any;
  isShowPrepareAll: boolean = true;
  Week: any;
  CurrentDate: any;
  viewType: any;
  constructor(
    private ngxLoader: NgxUiLoaderService,
    private modalService: NgbModal,
    private posDataService: PosDataService,
    private posDataSharedService: PosDataShareService,
    private alertService: AlertService,
    private route: ActivatedRoute,
    public commonService: CommonService
  ) { }

  async ngOnInit() {
    this.outletName = sessionStorage.getItem('activeOutletname');
    this.outletId = sessionStorage.getItem('activeOutletId');

    this.route.paramMap.subscribe(params => {
      this.viewType = params.get('type') || 'kitchen';
      if (this.viewType == 'kitchen') {
        this.KitchenBlockExecution();
      } else {
        this.WarehouseBlockExecution();
      }
    });
  }
  ngOnDestory(){
    if (this.interval) {
      clearInterval(this.interval);
    }
  }

  async KitchenBlockExecution() {
    await this.getAllOrders();
    this.orderTime = sessionStorage.getItem('createdOn');
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
        this.getOutletModalView();
      }
    }
    this.Week = new Date().toLocaleDateString('en-US', { weekday: 'long' });
    setInterval(() => {
      this.ToDayDateAndTime();
    }, 1000);
  }

  async WarehouseBlockExecution() {
    await this.getAllOrdersForWarehouse();
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
      if (items[h].itemLocation === 'Kitchen' && items[h].itemStatus === 'Ordered') {
        return true;
      }
    }
    return false;
  }

  CompareobjForWarehouse(items: any) {
    for (let h = 0; h < items.length; h++) {
      if (items[h].itemLocation == 'Warehouse' && items[h].itemStatus == 'Ordered') {
        return true;
      }
    }
    return false;
  }

  routerOnActivate() {
    if (this.viewType == 'kitchen') {
      this.interval = setInterval(() => {
        this.getAllOrders();
      }, 60000);
    } else {
      this.interval = setInterval(() => {
        this.getAllOrdersForWarehouse();
      }, 60000);
    }
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
    (await this.posDataService.getAllOrderByStatus("Running", this.outletId)).subscribe((res: any) => {
      this.ngxLoader.stopLoader('loader-01');
      this.receivedOrders = res['data'];
      let IsPlayed = false;
      for (let i = 0; i < this.receivedOrders?.length; i++) {
        ({ i, IsPlayed } = this.FilterOnlyKitchenData(i, oldData, IsPlayed));
      }
      this.receivedOrders?.sort((a, b) => a.createdByName.localeCompare(b.createdByName));
      setTimeout(() => {
        this.CalculateTimeOfOccupiedTable();
      }, 1000);
    });
  }

  private CalculateTimeOfOccupiedTable() {
    this.order = this.receivedOrders;
    this.FilterKitchenDataFirst();
    if (this.order?.length > 0) {
      (this.isShowPrepareAll = true);
    } else {
      (this.isShowPrepareAll = false);
    }
    setInterval(() => {
      for (let k = 0; k < this.order?.length; k++) {
        this.CalculateTime(k);
      }
    }, 1000);
  }

  async ngAfterViewChecked(): Promise<void> { //same
    this.initScrollbars();
  }
  private initScrollbars(): void { //same
    document.querySelectorAll<HTMLElement>('.order_food_info_blk').forEach(el => { Scrollbar.init(el) })
  }

  private CalculateTime(k: number) {
    let data = this.order[k];
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
    if (diffHour > 0) {
      this.order[k].diffTime = diffHour + " : " + diffMin + " : " + seconds;
    } else {
      this.order[k].diffTime = diffMin + " : " + seconds;
    }
    this.order[k].TimeToPreapareOrder = TimeToPreapareOrder;
  }
  getRemainingTime(timeString: string, minutesToAdd: number): string { //same
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
  private FilterKitchenDataFirst() {
    for (let i = 0; i < this.order?.length;) {
      let count = 0;
      for (let j = 0; j < this.order[i].items.length; j++) {
        if (this.order[i].items[j].itemStatus == 'Ordered' && this.order[i].items[j].itemLocation == "Kitchen") {
          count++;
        }
      }
      if (count == 0) {
        this.order.splice(i, 1);
        i = 0;
      } else {
        i++;
      }
    }
  }

  private FilterOnlyKitchenData(i: number, oldData: any, IsPlayed: boolean) {

    //Filter only kitchen orders, 11-03-2025
    this.receivedOrders[i].items = this.receivedOrders[i].items.filter(x => x.itemStatus == 'Ordered' && x.itemLocation == "Kitchen")

    if (this.Compareobj(this.receivedOrders[i].items)) {
      let courses = this.receivedOrders[i].items.filter(x => x.itemStatus == 'Ordered' && x.itemLocation == "Kitchen").map(x => x.categoryCourse);
      this.receivedOrders[i].allCategoryCourse = [...new Set(courses)];
      for (let k = 0; k < this.receivedOrders[i].items.length; k++) {
        this.receivedOrders[i].items[k].orderQuantity = Number(this.receivedOrders[i].items[k].orderQuantity) - Number(this.receivedOrders[i].items[k].preparedQuantity);
      }
      if (this.order != undefined && oldData !== undefined && !IsPlayed && !oldData.includes(this.receivedOrders[i].orderId)) {
        this.PlaySound();
        IsPlayed = true;
      }
    } else {
      this.receivedOrders = this.receivedOrders.filter(({ orderId }) => orderId !== this.receivedOrders[i].orderId);
      i--;
    }
    return { i, IsPlayed };
  }

  search(event) { //same
    let input = event.target.value;
    if (input == '') {
      this.order = this.receivedOrders;
    } else {
      this.order = this.receivedOrders.filter((res: any) => {
        return res.orderNo == input;
      });
    }
  }

  async prepareSingle(itemId, orderId, itemIndex, orderIndex) { //same
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

    //Based on URL viewType == kitchen || warehouse
    if (this.viewType == 'kitchen') {
      for (let j = 0; j < data[0].items.length; j++) {
        if (data[0].items[j].id) {
          if (data[0].items[j].itemLocation == "Kitchen") { //Add Ware house if condition based on url
            this.itemIds.push(data[0].items[j].id);
          }
        }
      }
    } else {
      for (let j = 0; j < data[0].items.length; j++) {
        if (data[0].items[j].id) {
          if (data[0].items[j].itemLocation == "Warehouse") {
            this.itemIds.push(data[0].items[j].id);
          }
        }
      }
    }
    await this.AppiCallToChengStatus(orderId, i);
  }
  private async AppiCallToChengStatus(orderId: any, i: any) {
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
  async prepareCourse(inds, orderData, courseName) { //same
    let items = orderData.items.filter(x => x.categoryCourse == courseName);
    let itemsId = items.map(x => x.id);
    (await this.posDataService.changeMultipleItemStatus(orderData.orderId, itemsId, "Prepared")).subscribe((res: any) => {
      let msg = res['message'];
      let success = res['success'];
      if (success) {
        this.PlaySound();
        this.alertService.showSuccess(msg);
        this.order[inds].allCategoryCourse.splice(this.order[inds].allCategoryCourse.indexOf(courseName), 1);

        //add if condition based on url this.getAllOrdersForWarehouse();
        if (this.viewType == 'kitchen') {
          this.getAllOrders();
        } else {
          this.getAllOrdersForWarehouse();
        }
      } else {
        this.alertService.showError(msg);
      }
    });
  }

  preparedAll() { //same
    for (let i = 0; i < this.order.length; i++) {
      this.prepare(i);
    }
    this.order = [];
    this.alertService.showSuccess("Successfully marked as prepared");
  }

  print(id) {
    this.posDataSharedService.setIdForOrderId(id);

    //add if condtn based on url
    // this.modalService.open(WarehousePrintComponent, { backdrop: 'static', size: 'md', keyboard: true, centered: true }).result.then((result) => {
    //   this.closeResult = `Closed with: ${result}`;
    // }, (reason) => {
    //   this.closeResult = `Dismissed ${this.getDismissReason(reason)}`;
    // });
    if (this.viewType == 'kitchen') {
      this.modalService.open( { backdrop: 'static', windowClass: 'main_add_popup order_bill_pint_popup', keyboard: true, centered: true }).result.then((result) => {
        this.closeResult = `Closed with: ${result}`;
      }, (reason) => {
        this.closeResult = `Dismissed ${this.getDismissReason(reason)}`;
      });
    } else {
      this.modalService.open( { backdrop: 'static',  windowClass: 'main_add_popup order_bill_pint_popup', keyboard: true, centered: true }).result.then((result) => {
        this.closeResult = `Closed with: ${result}`;
      }, (reason) => {
        this.closeResult = `Dismissed ${this.getDismissReason(reason)}`;
      });
    }

  }

  private getDismissReason(reason: any): string { //same
    if (reason === ModalDismissReasons.ESC) {
      return 'by pressing ESC';
    } else if (reason === ModalDismissReasons.BACKDROP_CLICK) {
      return 'by clicking on a backdrop';
    } else {
      return `with: ${reason}`;
    }
  }

  ngOnDestroy() {
    clearInterval(this.interval);
  }

  /**----------------Merged from Warehouse component--------11-03-2025------ */
  async getAllOrdersForWarehouse() {
    let oldData;
    if (this.order != undefined)
      oldData = this.order.map(x => x.orderId);
    this.ngxLoader.startLoader('loader-01');
    (await this.posDataService.getAllOrderByStatus('Running', this.outletId)).subscribe((res: any) => {
      this.ngxLoader.stopLoader('loader-01');
      this.FilterOrderAndCheckTimeOfOrder(res, oldData);
      this.receivedOrders?.sort((a, b) => a.createdByName.localeCompare(b.createdByName));
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
      if (this.CompareobjForWarehouse(this.receivedOrders[i].items)) {
        IsPlayed = this.CheckCourseAndNewOrders(i, oldData, IsPlayed);
      }
      else {
        this.receivedOrders = this.receivedOrders.filter(({ orderId }) => orderId !== this.receivedOrders[i].orderId);
        i--;
      }
    }
  }
  private FilterOrders() {  //Add to kitchen
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
  private FilterWareHouseItems(i: number, count: number) {//add kitchen
    for (let j = 0; j < this.order[i].items.length; j++) {
      if (this.order[i].items[j].itemStatus == 'Ordered' && this.order[i].items[j].itemLocation == "Warehouse") {
        count++;
      }
    }
    if (count == 0) {
      this.order.splice(i, 1);
      i = 0;
    } else {
      i++;
    }
    return { i, count };
  }

  private CalculateTimeOFOrderAndAddTimeToOtrder(k: number) { //Add kitchne
    let data = this.order[k];
    let { diffHour, diffMin, seconds, TimeToPreapareOrder } = this.CalculateTimeOfOrder(data);

    if (diffHour > 0) {
      this.order[k].diffTime = diffHour + " : " + diffMin + " : " + seconds;
    } else {
      this.order[k].diffTime = diffMin + " : " + seconds;
    }
    this.order[k].TimeToPreapareOrder = TimeToPreapareOrder;

  }
  private CalculateTimeOfOrder(data: any) { //add kitchen
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
  private CheckCourseAndNewOrders(i: number, oldData: any, IsPlayed: boolean) {//add kitchen

    //Filter only warehouse orders, 11-03-2025
    this.receivedOrders[i].items = this.receivedOrders[i].items.filter(x => x.itemStatus == 'Ordered' && x.itemLocation == "Warehouse");

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
}
