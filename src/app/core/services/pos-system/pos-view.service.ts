import { Injectable } from '@angular/core';  

@Injectable({ providedIn: 'root' })
export class PosViewService {
  discountId: any;
  modifierId: any;
  outletId: any;
  tableTypeId: any;
  userViewId: any;
  taxId: any;
  promocodeViewId: any;
  accessId: any;
  Id: any;
  orderId: any;

  setDiscountViewId(data){
    this.discountId = data;
  }

  getDiscountViewId(): any{
    return this.discountId;
  }

  setModifierViewId(data){
    this.modifierId = data;
  }

  getModifierViewId(): any{
    return this.modifierId;
  }

  setOutletViewId(data){
    this.outletId = data;
  }

  getOutletViewId(): any{
    return this.outletId;
  }

  setTableTypeViewId(data){
    this.tableTypeId = data;
  }

  getTableTypeViewId(): any{
    return this.tableTypeId;
  }

  setTaxViewId(data){
    this.taxId = data;
  }

  getTaxViewId(): any{
    return this.taxId;
  }
  setTaxSetupViewId(data){
    this.taxId = data;
  }

  getTaxSetupViewId(): any{
    return this.taxId;
  }

  setUserRegViewId(data){
    this.userViewId = data;
  }

  getUserRegViewId(): any{
    return this.userViewId;
  }

  setPromocodeViewId(data){
    this.promocodeViewId = data;
  }

  getPromocodeViewId(): any{
    return this.promocodeViewId;
  }
  
  setFormAccessViewId(data){
    this.accessId = data;
  }

  getFormAccessViewId(): any{
    return this.accessId;
  }

  setNotificationViewId(data){
    this.Id = data;
  }
  getNotificationViewId(): any{
    return this.Id;
  }

  setPreparedViewId(data){
    this.orderId = data;
  }
  getPreparedViewId(): any{
    return this.orderId;
  }
 
}