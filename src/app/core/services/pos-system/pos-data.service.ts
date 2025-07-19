import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from 'src/environments/environment';

@Injectable({
  providedIn: 'root'
})

export class PosDataService {


  constructor(
    private httpClient: HttpClient
  ) { }

  // ****** Get Api's ****** //
  getCategoryById(id: any): Observable<any> {
    return this.httpClient.get(`${environment.apiUrl}/Category/GetCategoryById/${id}`)
  }
  getAllCourse(outletId: any): Observable<any> {
    return this.httpClient.get(`${environment.apiUrl}/Category/GetAllCourse/${outletId}`)
  }

  getAllItemsByOutletId(data: any): Observable<any> {
    return this.httpClient.post(`${environment.apiUrl}/Items/GetAllItemsByOutlet`, data);

  }
  InsertCredentials(data: any) {
    return this.httpClient.post(`${environment.apiUrl}/OnlineIntegration/InsertCredential`, data);
  }
  getCredentialsByOutletId(id: any) {
    return this.httpClient.get(`${environment.apiUrl}/OnlineIntegration/GetCredentialByOutlet/${id}`);
  }
  UpdateCredentials(id: any, data: any) {
    return this.httpClient.put(`${environment.apiUrl}/OnlineIntegration/UpdateCredential/${id}`, data);
  }
  UpdateCredentialsToken(id: any) {
    return this.httpClient.get(`${environment.apiUrl}/OnlineIntegration/UpdateToken/${id}`);
  }
  UpdateDeliverectOrderStatus(id: any, status: number) {
    return this.httpClient.get(`${environment.apiUrl}/OnlineIntegration/ChangeOrderStatus/${id}?status=${status}`);
  }
  getItemById(id: any): Observable<any> {
    return this.httpClient.get(`${environment.apiUrl}/Items/GetItemsById/${id}`);
  }
  getItemStatusById(id: any): Observable<any> {
    return this.httpClient.get(`${environment.apiUrl}/ItemStatus/GetItemStatusById/${id}`);
  }
  getOrderStatusById(id: any): Observable<any> {
    return this.httpClient.get(`${environment.apiUrl}/OrderStatus/GetOrderStatusById/${id}`);
  }
  async getAllOrderByStatus(status: any, outletId: any): Promise<Observable<any>> {
    return this.httpClient.get(`${environment.apiUrl}/Orders/GetOrdersByStatus/${status}?OutletId=${outletId}`);
  }
  getOrderById(id: any): Observable<any> {
    return this.httpClient.get(`${environment.apiUrl}/Orders/GetOrdersById/${id}`);
  }
  getDeliverectOrderById(id: any): Observable<any> {
    return this.httpClient.get(`${environment.apiUrl}/OnlineIntegration/GetOrderById/${id}`);
  }

  ArrangeTable(Data: any): Observable<any> {
    return this.httpClient.post(`${environment.apiUrl}/TableMaster/ArrangeTables`, Data);
  }
  getAllTabledetailsByOutlet(id: any, isAllItem: boolean): Observable<any> {
    return this.httpClient.get(`${environment.apiUrl}/TableMaster/GetAllTableDetailsByOutlet?OutletId=${id}&isAllItem=${isAllItem}`);
  }
  getTableMasterById(id: any): Observable<any> {
    return this.httpClient.get(`${environment.apiUrl}/TableMaster/GetTableMasterById/${id}`);
  }

  getTableTypeDataById(id: any): Observable<any> {
    return this.httpClient.get(`${environment.apiUrl}/TableType/GetTableTypeById/${id}`);
  }
  getTableTypeDataByOutletId(id: any, isAllItem: boolean): Observable<any> {
    return this.httpClient.get(`${environment.apiUrl}/TableType/GetAllTableTypeByOutLet?OutletId=${id}&isAllItem=${isAllItem}`);
  }
  shiftTableOrder(oldTableNo: any, newTableNo: any, outletId: any, orderId: any) {
    return this.httpClient.put(`${environment.apiUrl}/Orders/ShiftTableByOrder/${oldTableNo}/${newTableNo}/${outletId}/${orderId}`, '');
  }
  MergeTables(oldTableId: any, newTableId: any, outletId: any, orderId: any) {
    return this.httpClient.put(`${environment.apiUrl}/Orders/MergeTableByOrder/${oldTableId}/${newTableId}/${outletId}/${orderId}`, '');
  }
  getmodifierById(id: any): Observable<any> {
    return this.httpClient.get(`${environment.apiUrl}/ModifierGroups/GetModifiedGroupsById/${id}`)
  }
  getDiscountByID(id: any): Observable<any> {
    return this.httpClient.get(`${environment.apiUrl}/Discount/GetDiscountById/${id}`);
  }
  getPromoDiscountData(): Observable<any> {
    return this.httpClient.get(`${environment.apiUrl}/PromocodeMaster/GetAllPromocodeMaster`);
  }
  getTaxById(id: any): Observable<any> {
    return this.httpClient.get(`${environment.apiUrl}/Tax/GetTaxById/${id}`);
  }

  getAllIngredients(): Observable<any> {
    return this.httpClient.get(`${environment.apiUrl}/BOM/GetAllBOM`);
  }

  getOutletByID(id: any): Observable<any> {
    return this.httpClient.get(`${environment.apiUrl}/Outlets/GetOutletById/${id}`);
  }
  getAllInvoicePrintDesignData(): Observable<any> {
    return this.httpClient.get(`${environment.apiUrl}/InvoicePrintSettings/GetAllInvoicePrintSettings`);
  }
  getInvoicePrintDesignDataByOutlet(id: any): Observable<any> {
    return this.httpClient.get(`${environment.apiUrl}/InvoicePrintSettings/GetInvoicePrintSettingsByOutlet/${id}`)
  }
  GetPaymentRootOrderById(id): Observable<any> {
    return this.httpClient.get(`${environment.apiUrl}/TableMaster/GetPaymentRootOrderById/${id}`);
  }
  getAllRestaurants(IsAll: boolean): Observable<any> {
    return this.httpClient.get(`${environment.apiUrl}/Restaurant/GetAllRestaurant/${IsAll}`);
  }
  getUserRegDataById(id): Observable<any> {
    return this.httpClient.get(`${environment.apiUrl}/UserRegistration/GetUserRestaurantsById/${id}`);
  }
  getAllUserRegData(): Observable<any> {
    return this.httpClient.get(`${environment.apiUrl}/UserRegistration/GetAllUsers`);
  }
  getAllUserRegDataByRestaurantId(resId): Observable<any> {
    return this.httpClient.get(`${environment.apiUrl}/UserRegistration/GetUsersByRestaurant/${resId}`)
  }
  getUSerRegDataById(id): Observable<any> {
    return this.httpClient.get(`${environment.apiUrl}/UserRegistration/GetUserById/${id}`);
  }
  getAllCountryData(): Observable<any> {
    return this.httpClient.get(`${environment.apiUrl}/Country/GetAllCountry`);
  }
  getAllCity(id): Observable<any> {
    return this.httpClient.get(`${environment.apiUrl}/City/GetCitysByCountryId/${id}`);
  }
  getAllRole(data): Observable<any> {
    return this.httpClient.post(`${environment.apiUrl}/Role/GetAllRole`, data);
  }
  getRoleByID(id: any): Observable<any> {
    return this.httpClient.get(`${environment.apiUrl}/Role/GetRoleById/${id}`);
  }
  getAllFormAccess(): Observable<any> {
    return this.httpClient.get(`${environment.apiUrl}​/FormAccess/GetAllFormAccess`);
  }
  getAllFormAccessData(): Observable<any> {
    return this.httpClient.get(`${environment.apiUrl}/FormAccess/GetallFormAccess`);
  }
  getFormAccessByUserId(id: any): Observable<any> {
    return this.httpClient.get(`${environment.apiUrl}/FormAccess/GetFormAccessByUserId/${id}`);
  }
  getAllFormName(): Observable<any> {
    return this.httpClient.get(`${environment.apiUrl}/FormNames/GetAllFormNames`);
  }
  getAllModules(): Observable<any> {
    return this.httpClient.get(`${environment.apiUrl}/role/GetAllModules`);
  }
  getAllFeatures(): Observable<any> {
    return this.httpClient.get(`${environment.apiUrl}/role/GetAllFeatures`);
  }

  getAllPromocode(): Observable<any> {
    return this.httpClient.get(`${environment.apiUrl}/PromocodeMaster/GetAllPromocodeMaster`);
  }

  getPromocodeByID(id: any): Observable<any> {
    return this.httpClient.get(`${environment.apiUrl}/PromocodeMaster/GetPromocodeMasterById/${id}`);
  }

  getAllFormAccessById(id: any): Observable<any> {
    return this.httpClient.get(`${environment.apiUrl}/FormAccess/GetFormAccessById/${id}`);
  }
  getRestaurantById(id: any): Observable<any> {
    return this.httpClient.get(`${environment.apiUrl}/Restaurant/GetRestaurantById/${id}`);
  }
  getCompleteOrderCountByOutletId(data: any): Observable<any> {
    return this.httpClient.post(`${environment.apiUrl}/Orders/GetOrdersByCount`, data);
  }
  repeatOrder(orderId: any): Observable<any> {
    return this.httpClient.get(`${environment.apiUrl}/Orders/RepeatOrder/${orderId}`);
  }

  // ****** Post Api's ****** //

  postOrderData(data: any): Observable<any> {
    return this.httpClient.post(`${environment.apiUrl}/Orders/Post`, data);
  }
  CloseTable(tableNo: any, outletId: any, remarks: any, userpassword: any, userCredentialId: any): Observable<any> {
    return this.httpClient.post(`${environment.apiUrl}/TableMaster/CloseTable/${tableNo}/${outletId}/${remarks}/${userpassword}/${userCredentialId}`, null);
  }
  postWalkinOrderData(data: any): Observable<any> {
    return this.httpClient.post(`${environment.apiUrl}/Orders/CreateWalkInOrders`, data);
  }
  postOnlineOrderData(data: any): Observable<any> {
    return this.httpClient.post(`${environment.apiUrl}/Orders/CreateOnlineOrders`, data);
  }
  InsertPettyCash(data: any): Observable<any> {
    return this.httpClient.post(`${environment.apiUrl}/PettyCash/Post`, data);
  }
  UpdatePettyCash(data: any): Observable<any> {
    return this.httpClient.put(`${environment.apiUrl}/PettyCash/Put`, data);
  }
  updateOrderData(data: any, id: any): Observable<any> {
    return this.httpClient.put(`${environment.apiUrl}/Orders/Put/${id}`, data);
  }
  changeOrderStatus(id: any, status: any): Observable<any> {
    return this.httpClient.put(`${environment.apiUrl}/Orders/ChangeOrderStatus?OrderId=${id}&OrderStatus=${status}`, { responseType: 'blob' });
  }
  changeItemStatus(orderId: any, itemOrderId: any, itemStatus: any): Observable<any> {
    return this.httpClient.post(`${environment.apiUrl}/Orders/ChangeItemStatus?OrderId=${orderId}&ItemOrderId=${itemOrderId}&ItemStatus=${itemStatus}`, { responseType: 'blob' });
  }
  async MarkAsPrinted(orderId: any, itemOrderId: any): Promise<Observable<any>> {
    return this.httpClient.post(`${environment.apiUrl}/Orders/MarkAsPrinted?OrderId=${orderId}`, itemOrderId);
  }
  async changeMultipleItemStatus(orderId: any, itemOrderId: any, itemStatus: any): Promise<Observable<any>> {
    return this.httpClient.post(`${environment.apiUrl}/Orders/ChangeMultipleItemStatus?OrderId=${orderId}&ItemStatus=${itemStatus}`, itemOrderId);
  }

  postInvoiceData(data: any): Observable<any> {
    return this.httpClient.post(`${environment.apiUrl}/Invoice/Post`, data);
  }
  postWalkinInvoiceData(data: any): Observable<any> {
    return this.httpClient.post(`${environment.apiUrl}/Invoice/WalkInInvoice`, data);
  }
  postOnlineInvoiceData(data: any): Observable<any> {
    return this.httpClient.post(`${environment.apiUrl}/Invoice/OnlineInvoice`, data);
  }
  postItemData(data: any): Observable<any> {
    return this.httpClient.post(`${environment.apiUrl}/Items/CreateItemMasterWithOutletsBase64`, data);
  }
  updateItemData(data: any, id: any): Observable<any> {
    return this.httpClient.put(`${environment.apiUrl}/Items/Put/${id}`, data);
  }
  updateItem(data: any, id: any): Observable<any> {
    return this.httpClient.put(`${environment.apiUrl}/Items/UpdateItem/${id}`, data);
  }
  updateInvoice(data: any, id: any): Observable<any> {
    return this.httpClient.put(`${environment.apiUrl}/Invoice/Put/${id}`, data);
  }
  postModifierData(data: any): Observable<any> {
    return this.httpClient.post(`${environment.apiUrl}/ModifierGroups/Post`, data);
  }

  postDiscountData(data: any): Observable<any> {
    return this.httpClient.post(`${environment.apiUrl}/Discount/Post`, data);
  }
  postTableTypeData(data: any): Observable<any> {
    return this.httpClient.post(`${environment.apiUrl}/TableType/Post`, data);
  }
  postOutletData(data: any): Observable<any> {
    return this.httpClient.post(`${environment.apiUrl}/Outlets/Post`, data);
  }
  postTaxData(data: any): Observable<any> {
    return this.httpClient.post(`${environment.apiUrl}/Tax/Post`, data);
  }
  addOutlet(CloneOutletId,userId, data: any): Observable<any> {
    return this.httpClient.post(`${environment.apiUrl}/Restaurant/AddOutlet/${CloneOutletId}?userId=${userId}`, data);
  }
  upDateCategoryData(id: any, data: any): Observable<any> {
    return this.httpClient.put(`${environment.apiUrl}/Category/Put/${id}`, data);
  }
  addCourseData(data: any): Observable<any> {
    return this.httpClient.post(`${environment.apiUrl}/Category/InsertCourse`, data);
  }
  postPrintDesignData(data: any) {
    return this.httpClient.post(`${environment.apiUrl}/InvoicePrintSettings/Post`, data);
  }
  postRestaurantData(data: any) {
    return this.httpClient.post(`${environment.apiUrl}/Restaurant/Post`, data);
  }
  updateRestaurantData(id: any, data: any): Observable<any> {
    return this.httpClient.put(`${environment.apiUrl}/Restaurant/Put/${id}`, data);
  }
  updateRestaurant(id: any, data: any): Observable<any> {
    return this.httpClient.put(`${environment.apiUrl}/Restaurant/PostRestoWithImage/${id}`, data);
  }
  updateOutlet(restaurantId: any, data: any): Observable<any> {
    return this.httpClient.put(`${environment.apiUrl}/Restaurant/UpdateOutlet/${restaurantId}`, data);
  }
  postTaxConditionData(data: any): Observable<any> {
    return this.httpClient.post(`${environment.apiUrl}/TaxCondition/Post`, data);
  }
  updateTaxConditionData(id: any, data: any): Observable<any> {
    return this.httpClient.put(`${environment.apiUrl}/TaxCondition/Put/${id}`, data);
  }
  postUserRegData(data: any): Observable<any> {
    return this.httpClient.post(`${environment.apiUrl}/UserRegistration/Post`, data);
  }
  updatePrintDesignData(id: any, data: any): Observable<any> {
    return this.httpClient.put(`${environment.apiUrl}/InvoicePrintSettings/Put/${id}`, data);
  }

  updateUserRegData(id: any, data: any): Observable<any> {
    return this.httpClient.put(`${environment.apiUrl}/UserRegistration/Put/${id}`, data);
  }
  upDateDiscountData(id: any, data: any): Observable<any> {
    return this.httpClient.put(`${environment.apiUrl}/Discount/Put/${id}`, data);
  }
  upDateTableTypeData(id: any, data: any): Observable<any> {
    return this.httpClient.put(`${environment.apiUrl}/TableType/Put/${id}`, data);
  }
  updateFormAccessData(id: any, data: any): Observable<any> {
    return this.httpClient.put(`${environment.apiUrl}/FormAccess/Put/${id}`, data);
  }
  updateFormAccessListData(data: any): Observable<any> {
    return this.httpClient.put(`${environment.apiUrl}/FormAccess/UpdateFormAccessList`, data);
  }
  upDateTableMasterData(id: any, data: any): Observable<any> {
    return this.httpClient.put(`${environment.apiUrl}/TableMaster/Put/${id}`, data);
  }
  upDateItemStatusData(id: any, data: any): Observable<any> {
    return this.httpClient.put(`${environment.apiUrl}/ItemStatus/Put/${id}`, data);
  }
  upDateOrderStatusData(id: any, data: any): Observable<any> {
    return this.httpClient.put(`${environment.apiUrl}/OrderStatus/Put/${id}`, data);
  }
  upDateModifierGroupsData(id: any, data: any): Observable<any> {
    return this.httpClient.put(`${environment.apiUrl}/ModifierGroups/Put/${id}`, data);
  }
  upDateRoleData(id: any, data: any): Observable<any> {
    return this.httpClient.put(`${environment.apiUrl}/Role/Put/${id}`, data);
  }
  updateOutletId(userId: any, outletId: any, data: any): Observable<any> {
    return this.httpClient.put(`${environment.apiUrl}/UserRegistration/UpdateOutlets/${userId}?OutletId=${outletId}`, data);
  }
  upDatePromocodeData(id: any, data: any): Observable<any> {
    return this.httpClient.put(`${environment.apiUrl}/PromocodeMaster/Put/${id}`, data);
  }
  upDateOutletData(id: any, data: any): Observable<any> {
    return this.httpClient.put(`${environment.apiUrl}/Outlets/Put/${id}`, data);
  }
  upDateTaxData(id: any, data: any): Observable<any> {
    return this.httpClient.put(`${environment.apiUrl}/Tax/Put/${id}`, data);
  }
  postAccessFormData(data: any): Observable<any> {
    return this.httpClient.post(`${environment.apiUrl}/FormAccess/Post`, data);
  }
  postCreateFormAccessList(data: any): Observable<any> {
    return this.httpClient.post(`${environment.apiUrl}/FormAccess/CreateFormAccessList`, data);
  }
  editFormAccessListByUserRole(data: any): Observable<any> {
    return this.httpClient.post(`${environment.apiUrl}/FormAccess/CreateFormAccessList`, data);
  }
  postUserRestaurantLinkData(data: any): Observable<any> {
    return this.httpClient.post(`${environment.apiUrl}/UserRestaurantLink/Post`, data);
  }
  updateUserRestaurantLinkData(data: any): Observable<any> {
    return this.httpClient.post(`${environment.apiUrl}/UserRestaurantLink/UpdateUserRestaurant`, data);
  }
  getWBSupplierByKeyword(data: any, auth: any): Observable<any> {
    return this.httpClient.post(`${environment.wMApiUrl}/index.php/api/v1/all-suppliers?Authorization=${auth}`, data);
  }
  getWBProductByKeyword(data: any, auth: any): Observable<any> {
    return this.httpClient.post(`${environment.wMApiUrl}/index.php/api/v1/all-products?Authorization=${auth}`, data);
  }
  addLoyaltyPoints(data: any): Observable<any> {
    return this.httpClient.post(`${environment.apiUrl}/CLoyaltyPoints/Post`, data);
  }
  // ----Walk-in--Api's-----
  getOrdersByOrderTypeAndStatus(status: any, type: any, outletId: any): Observable<any> {
    return this.httpClient.get(`${environment.apiUrl}/Orders/GetActiveOrdersByOrderType/${status}?OutletId=${outletId}&OrderType=${type}`);
  }
  postCustomerDetails(data: any): Observable<any> {
    return this.httpClient.post(`${environment.apiUrl}/CustomerMaster/Post`, data);
  }
  updateCustomerDetails(customerId: any, data: any): Observable<any> {
    return this.httpClient.put(`${environment.apiUrl}/CustomerMaster/Put/${customerId}`, data);
  }
  getOrdersAllOrdersAboveRestTime(data: any): Observable<any> {
    return this.httpClient.post(`${environment.apiUrl}/Orders/GetOrdersAllOrdersAboveRestTime`, data);
  }
  // -----For Delete-------------
  deleteTableDetailsRow(id: any): Observable<any> {
    return this.httpClient.delete(`${environment.apiUrl}/TableMaster/Delete/${id}`);
  }
  deleteAdminCategoryRow(id: any): Observable<any> {
    return this.httpClient.delete(`${environment.apiUrl}/Category/Delete/${id}`);
  }
  deleteAdminRestaurentRow(id: any): Observable<any> {
    return this.httpClient.delete(`${environment.apiUrl}/Restaurant/Delete/${id}`);
  }
  deleteTableTypeRow(id: any): Observable<any> {
    return this.httpClient.delete(`${environment.apiUrl}/TableType/Delete/${id}`);
  }
  deleteFormAccessRow(id: any): Observable<any> {
    return this.httpClient.delete(`${environment.apiUrl}/FormAccess/Delete/${id}`);
  }
  deleteMasterItemStatusRow(id: any): Observable<any> {
    return this.httpClient.delete(`${environment.apiUrl}/ItemStatus/Delete/${id}`);
  }
  deleteMasterModifierGroupRow(id: any): Observable<any> {
    return this.httpClient.delete(`${environment.apiUrl}/ModifierGroups/Delete/${id}`);
  }
  deleteMasterPomoCodeRow(id: any): Observable<any> {
    return this.httpClient.delete(`${environment.apiUrl}/PromocodeMaster/Delete/${id}`);
  }
  deleteDiscountRow(id: any): Observable<any> {
    return this.httpClient.delete(`${environment.apiUrl}/Discount/Delete/${id}`);
  }
  deleteTaxRow(id: any): Observable<any> {
    return this.httpClient.delete(`${environment.apiUrl}/Tax/Delete/${id}`);
  }
  deleteTaxSetupRow(id: any): Observable<any> {
    return this.httpClient.delete(`${environment.apiUrl}/TaxCondition/Delete/${id}`);
  }
  deleteMasterUserRegRow(id: any): Observable<any> {
    return this.httpClient.delete(`${environment.apiUrl}/UserRegistration/Delete/${id}`);
  }
  deleteUserRestaurantLink(id: any, restid: any): Observable<any> {
    return this.httpClient.delete(`${environment.apiUrl}/UserRestaurantLink/Delete/${id}?restaurantId=${restid}`);
  }
  deleteItemRow(id: any): Observable<any> {
    return this.httpClient.delete(`${environment.apiUrl}/Items/Delete/${id}`);
  }
  deleteRoleRow(id: any): Observable<any> {
    return this.httpClient.delete(`${environment.apiUrl}/Role/Delete/${id}`);
  }
  deleteOrderStatusRow(id: any): Observable<any> {
    return this.httpClient.delete(`${environment.apiUrl}/OrderStatus/Delete/${id}`);
  }
  deleteOutletRow(id: any): Observable<any> {
    return this.httpClient.delete(`${environment.apiUrl}/Outlets/Delete/${id}`);
  }
  deletePrintDesign(id: any): Observable<any> {
    return this.httpClient.delete(`${environment.apiUrl}/InvoicePrintSettings/Delete/${id}`);
  }
  deleteRunningOrder(id: any): Observable<any> {
    return this.httpClient.delete(`${environment.apiUrl}/Orders/Delete/${id}`);
  }
  deletePettyCash(id: any): Observable<any> {
    return this.httpClient.delete(`${environment.apiUrl}/PettyCash/Delete/${id}`);
  }

  /* GetDataByOutletId */
  GetAllReceipe(id): Observable<any> {
    return this.httpClient.get(`${environment.apiUrl}/Inventory/GetAllRecipe/${id}`);
  }
  GetAllProduct(id): Observable<any> {
    return this.httpClient.get(`${environment.apiUrl}/Inventory/GetAllProduct/${id}`);
  }
  GetAllSupplier(id): Observable<any> {
    return this.httpClient.get(`${environment.apiUrl}/Inventory/GetAllSupplier/${id}`);
  }
  GetAllPsMaster(id): Observable<any> {
    return this.httpClient.get(`${environment.apiUrl}/Inventory/GetAllProductSupplierMaster/${id}`);
  }
  GetAllSupplierOrder(id): Observable<any> {
    return this.httpClient.get(`${environment.apiUrl}/SupplierOrder/GetAllSupplierOrder/${id}`);
  }
  ChangeSupplierOrderStatus(id, status, outletId): Observable<any> {
    return this.httpClient.get(`${environment.apiUrl}/SupplierOrder/ChangeSupplierOrderStatus/${status}/${id}/${outletId}`);
  }
  DeleteProductSupplierMaster(id): Observable<any> {
    return this.httpClient.delete(`${environment.apiUrl}/Inventory/DeleteProductSupplierMaster/${id}`);
  }
  DeleteProduct(id): Observable<any> {
    return this.httpClient.delete(`${environment.apiUrl}/Inventory/DeleteProduct/${id}`);
  }
  DeleteSupplier(id): Observable<any> {
    return this.httpClient.delete(`${environment.apiUrl}/Inventory/DeleteSupplier/${id}`);
  }
  DeleteSupplierOrder(id): Observable<any> {
    return this.httpClient.delete(`${environment.apiUrl}/SupplierOrder/DeleteSupplierOrder/${id}`);
  }
  getGRNById(id): Observable<any> {
    return this.httpClient.get(`${environment.apiUrl}/SupplierOrder/GetGRNByOrderId/${id}`);
  }
  getSupplierOrderById(id): Observable<any> {
    return this.httpClient.get(`${environment.apiUrl}/SupplierOrder/GetSupplierOrderById/${id}`);
  }
  GetProductSupplierMasterById(id): Observable<any> {
    return this.httpClient.get(`${environment.apiUrl}/Inventory/GetProductSupplierMasterById/${id}`);
  }
  GetProductById(id): Observable<any> {
    return this.httpClient.get(`${environment.apiUrl}/Inventory/GetProductById/${id}`);
  }
  GetSupplierById(id): Observable<any> {
    return this.httpClient.get(`${environment.apiUrl}/Inventory/GetSupplierById/${id}`);
  }
  InsertProductSupplierMaster(data): Observable<any> {
    return this.httpClient.post(`${environment.apiUrl}/Inventory/InsertProductSupplierMaster`, data);
  }
  InsertGRN(data): Observable<any> {
    return this.httpClient.post(`${environment.apiUrl}/SupplierOrder/InsertGRN`, data);
  }
  InsertProduct(data): Observable<any> {
    return this.httpClient.post(`${environment.apiUrl}/Inventory/InsertProduct`, data);
  }
  InsertSupplier(data): Observable<any> {
    return this.httpClient.post(`${environment.apiUrl}/Inventory/InsertSupplier`, data);
  }
  InsertSupplierOrder(data): Observable<any> {
    return this.httpClient.post(`${environment.apiUrl}/SupplierOrder/InsertSupplierOrder`, data);
  }
  UpdateProductSupplierMaster(Id, data): Observable<any> {
    return this.httpClient.put(`${environment.apiUrl}/Inventory/UpdateProductSupplierMaster/${Id}`, data);
  }
  UpdateProduct(Id, data): Observable<any> {
    return this.httpClient.put(`${environment.apiUrl}/Inventory/UpdateProduct/${Id}`, data);
  }
  UpdateSupplier(Id, data): Observable<any> {
    return this.httpClient.put(`${environment.apiUrl}/Inventory/UpdateSupplier/${Id}`, data);
  }
  UpdateGrn(Id, data): Observable<any> {
    return this.httpClient.put(`${environment.apiUrl}/SupplierOrder/UpdateGRN/${Id}`, data);
  }
  UpdateSupplierOrder(Id, data): Observable<any> {
    return this.httpClient.put(`${environment.apiUrl}/SupplierOrder/UpdateSupplierOrder/${Id}`, data);
  }
  getAllCategoryByOutletId(id, isAllItem: boolean): Observable<any> {
    return this.httpClient.get(`${environment.apiUrl}/Category/GetAllCategoryByOutlet?OutletId=${id}&isAllItem=${isAllItem}`);
  }
  getAllBomDataByOutletId(id): Observable<any> {
    return this.httpClient.get(`${environment.apiUrl}/BOM/GetAllBOMByOutlet?OutletId=${id}`);
  }
  getAllDiscountByOutletId(data): Observable<any> {
    return this.httpClient.post(`${environment.apiUrl}/Discount/GetAllDiscountByOutlet`, data);
  }
  getAllPromocodeByOutletId(data:any): Observable<any> {
    return this.httpClient.post(`${environment.apiUrl}/PromocodeMaster/GetAllPromocodeMasterByOutlet`,data);
  }
  getFormAccessByOutletId(id): Observable<any> {
    return this.httpClient.get(`${environment.apiUrl}/FormAccess/GetAllFormAccessByOutlet?OutletId=${id}`);
  }
  getModifiersByOutletId(data): Observable<any> {
    return this.httpClient.post(`${environment.apiUrl}/ModifierGroups/GetAllModifiedGroupsByOutlet`, data);
  }
  getItemStatusByOutletId(id): Observable<any> {
    return this.httpClient.get(`${environment.apiUrl}/ItemStatus/GetAllItemStatusByOutlet?OutletId=${id}`);
  }
  getOrderStatusByOutletId(id): Observable<any> {
    return this.httpClient.get(`${environment.apiUrl}/OrderStatus/GetAllOrderStatusByOutlet?OutletId=${id}`);
  }
  getTaxByOutletId(id, isAllItem: boolean): Observable<any> {
    return this.httpClient.get(`${environment.apiUrl}/Tax/GetAllTaxByOutlet?OutletId=${id}&isAllItem=${isAllItem}`);
  }
  getAllPrintDesignByOutletId(id): Observable<any> {
    return this.httpClient.get(`${environment.apiUrl}/InvoicePrintSettings/GetInvoicePrintSettingsByOutlet/${id}`);

  }
  getAllPrintDesignById(id): Observable<any> {
    return this.httpClient.get(`${environment.apiUrl}/InvoicePrintSettings/GetInvoicePrintSettingsById/${id}`);

  }
  validActivedesignStatus(id: any, isTrue: any): Observable<any> {
    return this.httpClient.get(`${environment.apiUrl}/InvoicePrintSettings/ValidActivedesignStatus/${id}?isTrue=${isTrue}`);

  }
  getPromocodeByOutletId(data): Observable<any> {
    return this.httpClient.post(`${environment.apiUrl}/PromocodeMaster/GetAllPromocodeMasterByOutlet`,data);
  }
  postAllPrintDesignById(data: any): Observable<any> {
    return this.httpClient.post(`${environment.apiUrl}/api/InvoicePrintSettings/Post`, data);
  }
  // ******Notification api's********

  getAllNotifications(date?: string): Observable<any> {
    let url = `${environment.apiUrl}/Notification/GetAllNotifications`;
    if (date) {
      url += `?date=${date}`;
    }
    return this.httpClient.get(url);
  }

  getNotificationsById(id: any): Observable<any> {
    return this.httpClient.get(`${environment.apiUrl}/Notification/GetNotificationsById/${id}`);
  }
  getNotificationsByUserId(userId: any): Observable<any> {
    return this.httpClient.get(`${environment.apiUrl}/Notification/GetNotificationsByUserId?UserId=${userId}`);
  }
  postNotificationData(data: any): Observable<any> {
    return this.httpClient.post(`${environment.apiUrl}/Notification/Post`, data);
  }
  postChangeNotificationStatus(data: any): Observable<any> {
    return this.httpClient.post(`${environment.apiUrl}/Notification/ChangeNotificationStatus`, data);
  }
  upDateNotification(id: any, data: any): Observable<any> {
    return this.httpClient.put(`${environment.apiUrl}/Notification/Put/${id}`, data);
  }
  deleteNotification(id: any): Observable<any> {
    return this.httpClient.delete(`${environment.apiUrl}/Notification/Delete/${id}`);
  }

  // ===DashBoard Api===
  getAllOrdersByCount(OutletId: any, fromDate: any, toDate: any): Observable<any> {

    let status = 'all';

    return this.httpClient.get(`${environment.apiUrl}/Orders/GetOrdersByStatus/${status}?OutletId=${OutletId}`);
  }
  // ===User Restaurent links===
  getRestaurantByUserId(userId: any): Observable<any> {
    return this.httpClient.get(`${environment.apiUrl}/UserRestaurantLink/GetRestaurantByUserId/${userId}`);
  }
  postItemMasterFile(data: any, outletId: any): Observable<any> {
    return this.httpClient.post(`${environment.apiUrl}/Items/PostItemMasterFile`, outletId);
  }
  pushToDeliverect(outletId: any, data: any, isAllItem: boolean): Observable<any> {
    return this.httpClient.post(`${environment.apiUrl}/OnlineIntegration/PushProduct?outletId=${outletId}&isAllItem=${isAllItem}`, data);
  }
  async getAllItemsByCategoryId(id: any): Promise<Observable<any>> {
    return this.httpClient.get(`${environment.apiUrl}/Items/getAllItemByCategory?CategoryId=${id}`);
  };

  getAllCustomers(outletId: any, orderType) {
    return this.httpClient.get(`${environment.apiUrl}/CustomerMaster/GetAllCustomers/${outletId}?orderType=${orderType}`);
  }
  getCustomerById(outletId: any) {
    return this.httpClient.get(`${environment.apiUrl}/CustomerMaster/GetCustomerById/${outletId}`);
  }
  // getRestaurantCurrentTime(id: any): Observable<any> {
  //   return this.httpClient.get(`${environment.apiUrl}/Restaurant/getRestaurantCurrentTime/${id}`);
  // }
  GetAllVoidedOrder(id: any, orderTypes: any) {
    return this.httpClient.get(`${environment.apiUrl}/Orders/GetAllVoidedOrder/${id}?orderType=${orderTypes}`);
  }
  getOrdersCountForPrint(data): Observable<any> {
    return this.httpClient.post(`${environment.apiUrl}/Orders/GetOrdersForPrintByDate`, data);
  }
  getFilterOrdersByCount(data): Observable<any> {
    return this.httpClient.post(`${environment.apiUrl}/Orders/GetOrdersByCount`, data);
  }
  GetCategoryDetail(data): Observable<any> {
    return this.httpClient.post(`${environment.apiUrl}/Orders/GetCategoryDetail`, data);

  }
  GetPettyCash(date: any, outletId: any): Observable<any> {
    return this.httpClient.get(`${environment.apiUrl}/PettyCash/GetPettyCashByDate/${date}/${outletId}`);
  }
  GetPettyCashReportByDate(startDate: any, endDate: any, outletId: any): Observable<any> {
    return this.httpClient.get(`${environment.apiUrl}/PettyCash/GetPettyCashReportByDate/${startDate}/${endDate}/${outletId}`);
  }
  getTaxByItems(id: any): Observable<any> {
    return this.httpClient.get(`${environment.apiUrl}/Tax/GetTaxByItems/${id}`);

  }
  getLoyaltySettingById(outletId: any) {
    return this.httpClient.get(`${environment.apiUrl}/CLoyaltyPoints/GetLoyaltySettingById/${outletId}`);
  }
  // ****** Post Api's ****** //
  postRoleData(data: any): Observable<any> {
    return this.httpClient.post(`${environment.apiUrl}/Role/Post`, data);
  }
  UpdateCategoryStatus(id: any, activestatus: any): Observable<any> {
    return this.httpClient.put(`${environment.apiUrl}/Category/ChangeStatus?id=${id}&activestatus=${activestatus}`, {});
  }
  UpdateTableStatus(id: any, activestatus: any): Observable<any> {
    return this.httpClient.put(`${environment.apiUrl}/TableMaster/ChangeStatus?id=${id}&activestatus=${activestatus}`, {});
  }
  UpdatePrintStatus(id: any, activestatus: any, outletId: any): Observable<any> {
    return this.httpClient.put(`${environment.apiUrl}/InvoicePrintSettings/ChangePrintDesginStatus?id=${id}&activestatus=${activestatus}&outletId=${outletId}`, {});
  }
  UpdateRestorantSectionStatus(id: any, activestatus: any): Observable<any> {
    return this.httpClient.put(`${environment.apiUrl}/TableType/ChangeStatus?id=${id}&activestatus=${activestatus}`, {});
  }
  UpdateRestaruntStatus(id: any, activestatus: any): Observable<any> {
    return this.httpClient.put(`${environment.apiUrl}/Restaurant/ChangeStatus?id=${id}&activestatus=${activestatus}`, {});
  }
  changeModiFierStatus(id: any, activestatus: any): Observable<any> {
    return this.httpClient.put(`${environment.apiUrl}/ModifierGroups/ChangeStatus?id=${id}&activestatus=${activestatus}`, {});
  }
  changePromoCodeStatus(id: any, activestatus: any): Observable<any> {
    return this.httpClient.put(`${environment.apiUrl}/PromocodeMaster/ChangeStatus?id=${id}&activestatus=${activestatus}`, {});
  }
  changeTaxStatus(id: any, activestatus: any): Observable<any> {
    return this.httpClient.put(`${environment.apiUrl}/Tax/ChangeStatus?id=${id}&activestatus=${activestatus}`, {});
  }
  changeUserStatus(id: any, activestatus: any): Observable<any> {
    return this.httpClient.put(`${environment.apiUrl}/UserRegistration/ChangeStatus?id=${id}&activestatus=${activestatus}`, {});
  }
  changeItemsStatus(id: any, activestatus: any): Observable<any> {
    return this.httpClient.put(`${environment.apiUrl}/Items/ChangeStatus?id=${id}&activestatus=${activestatus}`, {});
  }
  changeRoleStatus(id: any, activestatus: any): Observable<any> {
    return this.httpClient.put(`${environment.apiUrl}/Role/ChangeStatus?id=${id}&activestatus=${activestatus}`, {});
  }
  GetMasterDataForQr(OutletId: string) {
    return this.httpClient.get(`${environment.apiUrl}/CustomerMaster/GetMasterDataForQR/${OutletId}`);
  }
  CreateCusotmer(data: any): Observable<any> {
    return this.httpClient.post(`${environment.apiUrl}/CustomerMaster/PostCustomer`, data);
  }

  //Payment Mode API
  GetPaymentModesByOutlet(outletId: any, isAllItem: boolean): Observable<any> {
    return this.httpClient.get(`${environment.apiUrl}/PaymentMode/GetAllPaymentModeByOutlet?OutletId=${outletId}&isAllItem=${isAllItem}`);
  }
  CreatePaymentMode(data: any): Observable<any> {
    return this.httpClient.post(`${environment.apiUrl}/PaymentMode/Post`, data);
  }
  updatePaymentMode(data: any, id: any): Observable<any> {
    return this.httpClient.put(`${environment.apiUrl}/PaymentMode/Put/${id}`, data);
  }
  deletePaymentMode(id: any): Observable<any> {
    return this.httpClient.delete(`${environment.apiUrl}/PaymentMode/Delete/${id}`);
  }
  UpdatePaymentModeStatus(id: any, activestatus: any): Observable<any> {
    return this.httpClient.put(`${environment.apiUrl}/PaymentMode/ChangeStatus?id=${id}&activestatus=${activestatus}`, {});
  }

  //LoyalitySetting

  GetLoyaltyByOutlet(OutletId: any): Observable<any> {
    return this.httpClient.get(`${environment.apiUrl}/CLoyaltyPoints/GetLoyaltySettingById/${OutletId}`);
  }

  CreateLoyalty(data: any): Observable<any> {
    return this.httpClient.post(`${environment.apiUrl}/CLoyaltyPoints/Post`, data);
  }

  UpdateLoylaty(data: any): Observable<any> {
    return this.httpClient.put(`${environment.apiUrl}/CLoyaltyPoints/Update`, data);

  }
  getImageInBase64(imagePath: any): Observable<any> {
    debugger;
    imagePath = btoa(imagePath);
    return this.httpClient.get(`${environment.apiUrl}/Restaurant/GetImageBase64/${imagePath}`);
  }


CloneItem(params: any): Observable<any> {
  // Make sure the URL matches your .NET controller route!
  return this.httpClient.post(`${environment.apiUrl}/Items/CloneItem/CloneItem`, params);
}
ApproveItem(itemId,IsApprove){
return this.httpClient.put(`${environment.apiUrl}/Items/ApproveItems?id=${itemId}&isApproved=${IsApprove}`,{});
}
}
