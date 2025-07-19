import { Injectable } from '@angular/core';   
import { BehaviorSubject } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class PosDataShareService {
  invoiceDetails: any;
  addModId: any;
  addDiscId: any;
  addViewId: any;
  addResId: any;
  orderId: any;
  editResId: any;
    
  private modifierCount = new BehaviorSubject(0);
  modifier = this.modifierCount.asObservable();

  private itemDiscount = new BehaviorSubject(0);
  discount = this.itemDiscount.asObservable();
 
  
  onSelectModifier(data: any){
    this.modifierCount.next(data);
  }
  
  onItemDiscount(data: any){
    this.itemDiscount.next(data);
  }

  setInvoiceData(data){
    this.invoiceDetails = data;
  }

  getInvoiceData(): any{
    return this.invoiceDetails;
  }

  setIdForItemModifier(data){
    this.addModId = data;
  }

  getIdForItemModifier(): any{
    return this.addModId;
  }

  setIdForItemDiscount(data){
    this.addDiscId = data;
  }

  getIdForItemDiscount(): any{
    return this.addDiscId;
  }

  setIdForResOutlet(data){
    this.addResId = data;
  }

  getIdForResOutlet(): any{
    return this.addResId;
  }

  setIdForItemView(data){
    this.addViewId = data;
  }

  getIdForItemView(): any{
    return this.addViewId;
  }

  setIdForOrderId(data){
    this.orderId = data;
  }

  getIdForOrderId(): any{
    return this.orderId;
  }
  setRestaurantEditId(data){
   this.editResId = data; 
  }
  getRestaurantEditId(): any{
    return this.editResId;
  }
}