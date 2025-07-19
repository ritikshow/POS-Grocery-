import { Injectable } from '@angular/core';   

@Injectable({ providedIn: 'root' })
export class PosEditService {
  categoryEditId: any;
  userRegEditId: any;
  discountEditId: any;
  tableTypeEditId: any;
  tableMasterEditId: any;
  itemStatusEditId: any;
  orderStatusEditId: any;
  modifierGroupsEditId: any;
  roleEditId: any;
  promocodeEditId: any;
  taxEditId: any;
  outletEditId: any;
  formAccessEditId: any;
  Id: any;
  outletResEditId: any;
  taxSetupEditId: any;

  setCategoryEditId(data){
    this.categoryEditId = data;
  }

  getCategoryEditId(): any{
    return this.categoryEditId;
  }

  setUserRegEditId(data){
    this.userRegEditId = data;
  }

  getUserRegEditId(): any{
    return this.userRegEditId;
  }
  setDiscountEditId(data){
    this.discountEditId = data;
  }

  getDiscountEditId(): any{
    return this.discountEditId;
  }
  setFormAccessEditId(data){
    this.formAccessEditId = data;
  }
  
  getFormAccessEditId(){
   return this.formAccessEditId;
  }

  setTableTypeEditId(data){
    this.tableTypeEditId = data;
  }

  getTableTypeEditId(): any{
    return this.tableTypeEditId;
  }

  setTableMasterEditId(data){
    this.tableMasterEditId = data;
  }

  getTableMasterEditId(): any{
    return this.tableMasterEditId;
  }

  setItemStatusEditId(data){
    this.itemStatusEditId = data;
  }

  getItemStatusEditId(): any{
    return this.itemStatusEditId;
  }

  setOrderStatusEditId(data){
    this.orderStatusEditId = data;
  }

  getOrderStatusEditId(): any{
    return this.orderStatusEditId;
  }

  setModifierGroupsEditId(data){
    this.modifierGroupsEditId = data;
  }

  getModifierGroupsEditId(): any{
    return this.modifierGroupsEditId;
  }

  setRoleEditId(data){
    this.roleEditId = data;
  }

  getRoleEditId(): any{
    return this.roleEditId;
  }

  setPromocodeEditId(data){
    this.promocodeEditId = data;
  }

  getPromocodeEditId(): any{
    return this.promocodeEditId;
  }

  setOutletEditId(data){
    this.outletEditId = data;
  }

  getOutletEditId(): any{
    return this.outletEditId;
  }

  setResOutletEditId(data){
    this.outletResEditId = data;
  }

  getResOutletEditId(): any{
    return this.outletResEditId;
  }

  setTaxEditId(data){
    this.taxEditId = data;
  }

  getTaxEditId(): any{
    return this.taxEditId;
  }
  setTaxSetupEditId(data){
    this.taxSetupEditId = data;
  }

  getTaxSetupEditId(): any{
    return this.taxSetupEditId;
  }
  getPrintDesignViewEditId(): any{
    return this.Id;
  }
  setPrintDesignViewEditId(data){
    this.Id = data;
  }
  
}