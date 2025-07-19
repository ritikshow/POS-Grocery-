import { Injectable } from '@angular/core';
import { BehaviorSubject, Subject } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class PosSharedService {
  subCatItem: any;
  itemData: any;
  tableNum: any;
  status: any;
  orderStatus: any;
  orderId: any;
  itemName: any;
  sOrderDetail: any;

  private countSource = new BehaviorSubject(0);
  currentCount = this.countSource.asObservable();

  private notificationCount = new BehaviorSubject(0);
  notifies = this.notificationCount.asObservable();

  callToggle = new Subject();

  callPrintFunction = new Subject();

  onSelectItem(count: any) {
    this.countSource.next(count)
  }

  onSelectNotify(data: any){
    this.notificationCount.next(data)
  }

  setItemNameFromOrder(data: any){
    this.itemName = data;
  }
  getItemNameFromOrder(): any{
    return this.itemName;
  }
  setSubCatItem(data: any){
      this.subCatItem = data;
  }
  getSubCatItem(): any{
      return this.subCatItem;
  }
  addItemData(data: any){
      this.itemData = data;
  }
  getAddItemData(): any{
      return this.itemData;
  }
  setTableNumber(num: any){
    this.tableNum = num;
  }
  getTableNumber(): any{
    return this.tableNum;
  }
  setTableStatus(data: any){
    this.status = data;
  }
  getTableStatus(): any{
    return this.status;
  }
  setOrderStatus(data: any){
    this.orderStatus = data;
  }
  getOrderStatus(): any{
    return this.orderStatus;
  }
  setOrderDataId(id: any){
    this.orderId = id;
  }
  getOrderDataId(): any{
    return this.orderId;
  }
  setSupplierOrderDetail(id: any){
    this.sOrderDetail = id;
  }
  getSupplierOrderDetail(): any{
    return this.sOrderDetail;
  }
}
