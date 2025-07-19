import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from 'src/environments/environment';

@Injectable({
  providedIn: 'root'
})
export class AddItemService {

  base_url = environment.apiUrl;
  addViewIds: any;

  constructor(private http: HttpClient) {
  }

  addPromoCodeData(data: any): Observable<any> {
    return this.http.post(`${this.base_url}/PromocodeMaster/Post`, data);
  }

  addItemStatusData(data: any): Observable<any> {
    return this.http.post(`${this.base_url}/ItemStatus/Post`, data);
  }


  getItemStatusData(): Observable<any> {
    return this.http.get(`${this.base_url}/ItemStatus/GetAllItemStatus`);
  }

  addOrderStatusData(data: any): Observable<any> {
    return this.http.post(`${this.base_url}/OrderStatus/Post`, data);
  }

  getAllOrderStatus(): Observable<any> {
    return this.http.get(`${this.base_url}/OrderStatus/GetAllOrderStatus`)
  }

  addTableDetailsData(data: any): Observable<any> {
    return this.http.post(`${this.base_url}/TableMaster/Post`, data);
  }

  insertGeneralSettings(data: any): Observable<any> {
    return this.http.post(`${this.base_url}/Outlets/CreateGeneralSettings`, data);
  }

  updateGeneralSettings(data: any): Observable<any> {
    return this.http.put(`${environment.apiUrl}/Outlets/UpdateGeneralSettings`, data);
  }
  
  getGeneralSettingsByOutletID(id: any): Observable<any> {
    return this.http.get(`${this.base_url}/Outlets/GetGeneralSettingsByOutletId/${id}`);
  }

  getAllAdminTableDetails(): Observable<any> {
    return this.http.get(`${this.base_url}/TableMaster/GetAllTableMaster`);
  }

  getAllTabledetailsByOutlet(id: any,isAllItem:boolean): Observable<any> {
    return this.http.get(`${this.base_url}/TableMaster/GetAllTableDetailsByOutlet?OutletId=${id}&isAllItem=${isAllItem}`);
  }

  addAdminCategoryData(data: any): Observable<any> {
    return this.http.post(`${this.base_url}/Category/Post`, data);
  }

  getCategoryById(categoryId: any): Observable<any> {
    return this.http.get(`${this.base_url}/Category/GetCategoryById/${categoryId}`);
  }

  postData(data: any): Observable<any> {
    return this.http.post(`${this.base_url}/Items/Post`, data);
  }

  createUser(user): Observable<any> {
    return this.http.post(`${this.base_url}/Category/Post`, user)
  }

  getAllAdminCategory(): Observable<any> {
    return this.http.get(`${this.base_url}/Category/GetAllCategory`)
  }

  updateUser(user): Observable<any> {
    return this.http.put(`${this.base_url}/Items/Put` + user.id, user)
  }

  updateData(id: any, data: any): Observable<any> {
    return this.http.put(`${this.base_url}/${id}`, data)
  }

  updateItemStatus(item) {
    return this.http.put(`${this.base_url}/ItemStatus/Put/${item.itemStatusId}`, item)
  }

  updateAdminCategory(item) {
    return this.http.put(`${this.base_url}/Category/Put/${item.categoryId}`, item)
  }

  updateOrderStatus(item) {
    return this.http.put(`${this.base_url}/OrderStatus/Put/${item.orderStatusId}`, item)
  }

  updateTableDetails(item) {
    return this.http.put(`${this.base_url}/TableMaster/Put/${item.tableId}`, item)
  }


  setIdForCategoryView(data) {
    this.addViewIds = data;
  }

  getIdForCategoryView(): any {
    return this.addViewIds;
  }

  setIdForRoleView(data) {
    this.addViewIds = data;
  }

  getIdForRoleView(): any {
    return this.addViewIds;
  }

  setPromocodeViewId(data) {
    this.addViewIds = data;
  }

  getPromocodeViewId(): any {
    return this.addViewIds;
  }

  setIdForTableDetailsView(data) {
    this.addViewIds = data;
  }

  getIdForTableDetailsView(): any {
    return this.addViewIds;
  }

  setIdForItemStatusView(data) {
    this.addViewIds = data;
  }

  getIdForItemStatusView(): any {
    return this.addViewIds;
  }

  setIdForOrderStatusView(data) {
    this.addViewIds = data;
  }

  getIdForOrderStatusView(): any {
    return this.addViewIds;
  }

  setIdForTaxView(data) {
    this.addViewIds = data;
  }

  getIdForTaxView(): any {
    return this.addViewIds;
  }
}
