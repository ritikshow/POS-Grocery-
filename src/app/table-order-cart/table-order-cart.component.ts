import { JsonPipe } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormBuilder } from '@angular/forms';
import { Router } from '@angular/router';
import { AlertService } from '@core/services/common/alert.service';
import { PosDataService } from '@core/services/pos-system/pos-data.service';
import { ModalDismissReasons, NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { NgxUiLoaderService } from 'ngx-ui-loader';
import { environment } from 'src/environments/environment';

@Component({
  selector: 'table-order-cart',
  templateUrl: './table-order-cart.component.html',
  styleUrls: ['./table-order-cart.component.css']
})

export class TableOrderCartComponent implements OnInit {
  PrimaryOrder: any;
  itemTaxList = [];
  allModifiersTotalAmount = 0;
  itemDiscountList = [];
  allTaxes = [];
  allDiscounts: any;
  orderHostory: any;
  LoginCustomerOrders: any;
  PageToLoad: number
  OutletName: string;
  TableNumber: string;
  allModifiersByOutlet: any;
  Modifiers = [];
  Ingredients = [];
  SelectedModifiers = [];
  allItems: any;
  SelectedItemIndex: any;
  BaseUrl: any;
  CustomerCount: any;
  searchText: string = '';
  //LoginPersonItem :any;
  constructor(private alertService: AlertService,
    private posDataService: PosDataService,
    private router: Router,
    private ngxLoader: NgxUiLoaderService,
    private modalService: NgbModal,
  ) {

  }
  ngOnInit(): void {
    this.GetAllMasters();
    this.PageToLoad = JSON.parse(sessionStorage.getItem('PageToload'));
    this.PrimaryOrder = JSON.parse(sessionStorage.getItem('CartData'));
    this.orderHostory = JSON.parse(sessionStorage.getItem("orderHistory"));
    this.TableNumber = JSON.parse(sessionStorage.getItem("tableNo"));
    this.BaseUrl = environment.apiUrl.replace(/^(.*:\/\/[^\/]+\/).*$/, '$1');
    this.OutletName = JSON.parse(sessionStorage.getItem('OutLetName'));
    if (this.orderHostory) {
      this.GetTableDetailsById(false)
      setInterval(() => {
        this.GetTableDetailsById(false);
      }, 30000);
    }

  }
  QuantityDecreament(index) {
    //let AllowDecreament = true;
    //if (this.orderHostory?.items) {
      //let OrderdData = this.orderHostory?.items.find((data) => data.itemId == this.PrimaryOrder.items[index].itemId);
      // if (OrderdData?.orderQuantity == this.PrimaryOrder.items[index].orderQuantity && OrderdData?.itemStatus == "Ordered") {
      //   AllowDecreament = false;
      //   this.alertService.showWarning("Sorry Can't Decrease Quantity,Order is Updated")
      // }
    //}
   // if (AllowDecreament == true) {
      this.PrimaryOrder.items[index].orderQuantity--;
      if (this.PrimaryOrder.items[index].orderQuantity == 0) {
        this.PrimaryOrder.items.splice(index, 1);
        if (this.PrimaryOrder.items?.length <= 0)
          this.PrimaryOrder = {};
      }
      sessionStorage.setItem("CartData", JSON.stringify(this.PrimaryOrder));
      this.CommonCalculation();
    //}
  }
  QuantityIncreament(index) {
    if (this.PrimaryOrder.items[index].orderQuantity > 9999) {
      this.alertService.showError("You can not order this many quantity");
      return;
    }
    this.PrimaryOrder.items[index].orderQuantity++;
    sessionStorage.setItem("CartData", JSON.stringify(this.PrimaryOrder));
    this.CommonCalculation();
  }
  // Calculation Starts
  private CommonCalculation() {
    this.PrimaryOrder.totalOrderTax = 0;
    this.PrimaryOrder = this.CalcutateItemTotalAndDiscount(this.PrimaryOrder);
    this.PrimaryOrder = this.CalcutateDefaultTaxOfOrder(this.PrimaryOrder);

    this.itemTaxList = [];
    this.ItemLevelTaxCalculation();
    this.PrimaryOrder.subTotal += this.allModifiersTotalAmount;
    this.PrimaryOrder.total += this.allModifiersTotalAmount;
  }

  private ItemLevelTaxCalculation() {
    for (let y = 0; y < this.PrimaryOrder.items.length; y++) {
      for (let t = 0; t < this.PrimaryOrder.items[y].itemWiseTax?.length; t++) {
        this.PrimaryOrder.items[y].itemWiseTax[t].taxAmount = this.PrimaryOrder.items[y].itemWiseTax[t].taxPercentage * (this.PrimaryOrder.items[y].itemAmount * this.PrimaryOrder.items[y].orderQuantity) / 100;

        // Adding item name to tax list
        this.PrimaryOrder.items[y].itemWiseTax[t].itemName = this.PrimaryOrder.items[y].itemName;
        this.itemTaxList.push(this.PrimaryOrder.items[y].itemWiseTax[t]);
        if (this.PrimaryOrder.items[y].itemWiseTax[t].isItemIncludeTax && this.PrimaryOrder.items[y].itemWiseTax[t].isSubtractFromSubTotal) {
          this.PrimaryOrder.subTotal -= this.PrimaryOrder.items[y].itemWiseTax[t].taxAmount;
          // Adding tax amount to main variable (using this variable for reports)
          this.PrimaryOrder.totalOrderTax += this.PrimaryOrder.items[y].itemWiseTax[t].taxAmount;
        } else if (this.PrimaryOrder.items[y].itemWiseTax[t].isItemIncludeTax && !this.PrimaryOrder.items[y].itemWiseTax[t].isSubtractFromSubTotal) {

        } else {
          this.PrimaryOrder.total += this.PrimaryOrder.items[y].itemWiseTax[t].taxAmount;
          // Adding tax amount to main variable (using this variable for reports)
          this.PrimaryOrder.totalOrderTax += this.PrimaryOrder.items[y].itemWiseTax[t].taxAmount;
        }
        //this.mainOrderObject.items[y].itemTotal += this.mainOrderObject.items[y].itemWiseTax.reduce((t, x) => t + x.taxAmount, 0);
      }
    }
  }

  CalcutateDefaultTaxOfOrder(mainPrimaryOrder: any): any {
    //let allItemTotal = mainOrder.items.reduce((total, item) => total + (item.itemAmount * item.orderQuantity), 0);
    // Calculating the all discounts below & Adding all Discounts amount to main variable (using this variable for reports)
    this.PrimaryOrder.totalDiscount = 0; // This variable contains some of all discount(item level and order level)
    for (let itm = 0; itm < this.PrimaryOrder.items.length; itm++) {
      if (this.PrimaryOrder.items[itm].discount)
        this.PrimaryOrder.totalDiscount += this.PrimaryOrder.items[itm].discount.reduce((t, x) => t + x.discountedAmount, 0);
    }
    for (let ad = 0; ad < this.PrimaryOrder.orderDiscounts?.length; ad++) {
      if (this.PrimaryOrder.orderDiscounts[ad].discountType == 'Percentage') {
        if (this.PrimaryOrder.orderDiscounts[ad].discountOnTotal) {
          this.PrimaryOrder.orderDiscounts[ad].discountedAmount = (this.PrimaryOrder.total - this.PrimaryOrder.totalDiscount) * this.allDiscounts[ad].discountValue / 100;
        } else {
          this.PrimaryOrder.orderDiscounts[ad].discountedAmount = (this.PrimaryOrder.subTotal) * this.PrimaryOrder.orderDiscounts[ad].discountValue / 100;
        }
      } else if (this.PrimaryOrder.orderDiscounts[ad].discountType == 'Amount') {
        this.PrimaryOrder.orderDiscounts[ad].discountedAmount = this.PrimaryOrder.orderDiscounts[ad].discountValue;
      }
    }
    // Now adding order discount values to 'AllDiscounttotal'
    let totalorderDiscount = this.PrimaryOrder.orderDiscounts.reduce((t, x) => t + x.discountedAmount, 0);

    let taxList = this.allTaxes?.filter(x => x.isDefault == true);
    mainPrimaryOrder.taxDetails = [];
    // Note : Default tax will be applicable on modifiers also. // Itemwise tax will not be applicable on modifiers
    for (let j = 0; j < taxList?.length; j++) {
      const singleTaxDetail = taxList[j];
      const tx = {
        taxName: singleTaxDetail.taxName,
        taxPercentage: singleTaxDetail.taxPercentage,
        taxAmount: (mainPrimaryOrder.subTotal - this.PrimaryOrder.totalDiscount) * singleTaxDetail.taxPercentage / 100,
        isItemIncludeTax: singleTaxDetail.isItemIncludeTax,
        isSubtractFromSubTotal: singleTaxDetail.isSubtractFromSubTotal,
      };
      if (singleTaxDetail.isItemIncludeTax && singleTaxDetail.isSubtractFromSubTotal) {
        mainPrimaryOrder.subTotal -= tx.taxAmount;
        // Adding tax amount to main variable (using this variable for reports)
        this.PrimaryOrder.totalOrderTax += tx.taxAmount;
      } else if (singleTaxDetail.isItemIncludeTax && !singleTaxDetail.isSubtractFromSubTotal) {

      } else {
        mainPrimaryOrder.total += tx.taxAmount;
        // Adding tax amount to main variable (using this variable for reports)
        this.PrimaryOrder.totalOrderTax += tx.taxAmount;
      }
      mainPrimaryOrder.taxDetails.push(tx);
    }
    // minus(-) items discount from subtotal
    mainPrimaryOrder.subTotal -= this.PrimaryOrder.totalDiscount;

    // minus(-) Order discount from subtotal
    mainPrimaryOrder.total -= totalorderDiscount;

    // Plus(+) total Order discount into 'totalDiscountAmount' main global discount.
    this.PrimaryOrder.totalDiscount += totalorderDiscount;
    return mainPrimaryOrder;
  }

  //Pre tax calculation
  CalcutateItemTotalAndDiscount(mainOrder: any): any {
    this.allModifiersTotalAmount = 0;
    mainOrder.total = 0;
    mainOrder.subTotal = 0;
    this.itemDiscountList = [];
    for (let i = 0; i < mainOrder.items.length; i++) {
      let totalItemDiscountAmount = 0;
      mainOrder.items[i].itemTotal = mainOrder.items[i].itemAmount * mainOrder.items[i].orderQuantity;

      // Discount calculation (Pending - Discount)
      if (mainOrder.items[i].discount && mainOrder.items[i].discount.length > 0) {
        for (let d = 0; d < mainOrder.items[i].discount.length; d++) {
          if (mainOrder.items[i].discount[d].discountType == 'Percentage') {
            mainOrder.items[i].discount[d].discountedAmount = (mainOrder.items[i].itemTotal - totalItemDiscountAmount) * mainOrder.items[i].discount[d].discountValue / 100;
            totalItemDiscountAmount += mainOrder.items[i].discount[d].discountedAmount;
          } else if (mainOrder.items[i].discount[d].discountType == 'Amount') {
            totalItemDiscountAmount += mainOrder.items[i].discount[d].discountValue * this.PrimaryOrder.items[i].orderQuantity;
          }
          this.itemDiscountList.push(mainOrder.items[i].discount[d]);
        }
      }

      // Modifier calculation(Pending - Modifiers)
      if (mainOrder.items[i].modifiers && mainOrder.items[i].modifiers.length > 0)
        this.allModifiersTotalAmount += mainOrder.items[i].modifiers?.reduce((sum, acc) => sum + acc.totalAmount, 0);

      // Item Tax calculation
      // Note : Default tax will be applicable on modifiers also. // Itemwise tax will not be applicable on modifiers
      for (let it = 0; it < mainOrder.items[i].itemWiseTax?.length; it++) {
        mainOrder.items[i].itemWiseTax[it].taxAmount = mainOrder.items[i].itemWiseTax[it].taxPercentage * (mainOrder.items[i].itemTotal - totalItemDiscountAmount) / 100;
      }

      mainOrder.subTotal += mainOrder.items[i].itemTotal;
      mainOrder.total += mainOrder.items[i].itemTotal - totalItemDiscountAmount;
    }
    return mainOrder;
  }
  // Calculation Ends.
  navigateToCart(value) {
    let CustomerIds = new Set(this.orderHostory?.items?.map((data) => data.customerId));
    this.CustomerCount = CustomerIds?.size;
    if (value == 2 || value == 3)
      this.GetTableDetailsById(false)
    this.PageToLoad = value;
    sessionStorage.setItem('PageToload', JSON.stringify(this.PageToLoad));
  }
  async PlaceOrder() {
    await this.GetTableDetailsById(true)
    //this.IsPlaceOrderDisable = true;
  }
  async GetOrderByOrderId(isUpdate) {
    this.ngxLoader.startLoader('loader-01');
    await this.posDataService.getOrderById(JSON.parse(sessionStorage.getItem("orderHistory")).orderId).subscribe(async res => {
      if (isUpdate == true) {
        this.orderHostory = res.data;
        if (res.success) {
          if (this.orderHostory) {
            let ISOrderUpdated = this.orderHostory?.items?.some((data) => data.itemStatus == "Ordered")
            this.PrimaryOrder.items.forEach((item) => {
              let indx = this.orderHostory.items?.findIndex((data) => data.customerId == item.customerId && data.itemId == item.itemId);
              if (indx != -1) {
                this.orderHostory.items[indx].orderQuantity += item.orderQuantity;
                item.modifiers?.forEach((itemMod) => {
                  let modIndx = this.orderHostory.items[indx]?.modifiers?.findIndex((data) => data.modifierId == itemMod.modifierId);
                  if (modIndx != -1)
                    this.orderHostory.items[indx].modifiers[modIndx].orderQuantity += 1;
                  else
                    this.orderHostory.items[indx].modifiers.push(itemMod);
                })
              }
              else {
                if (ISOrderUpdated == true)
                  item.itemStatus = "Ordered";
                this.orderHostory.items.push(item);
              }
            })
            this.PrimaryOrder = JSON.parse(JSON.stringify(this.orderHostory));
            this.CommonCalculation();
            await this.posDataService.updateOrderData(this.PrimaryOrder, this.orderHostory.orderId).subscribe(res => {
              if (res.success) {
                this.PrimaryOrder = null;
                this.orderHostory = res.data;
                this.orderHostory?.items?.forEach((data) => {
                  data.image = data?.imagePath === null || data?.imagePath === "null" ? null : data?.imagePath?.match(/Uploads.*/)[0];
                })
                this.ngxLoader.stopLoader('loader-01');
                sessionStorage.setItem("orderHistory", JSON.stringify(this.orderHostory));
                sessionStorage.removeItem('CartData');
                this.alertService.showSuccess("Order Updated Successfully");
              } else {
                this.alertService.showError(res.message);
              }
            });
          }
        }
      } else {
        // image loding 
        this.orderHostory = res.data;
        sessionStorage.setItem("orderHistory", JSON.stringify(res.data));
        this.orderHostory?.items?.forEach((data) => {
          data.image = data?.imagePath === null || data?.imagePath === "null" ? null : data?.imagePath?.match(/Uploads.*/)[0];
        })
      }
      this.LoginCustomerOrders = this.orderHostory?.items.filter((item) => item.customerId == JSON.parse(sessionStorage.getItem("CustomerLoginData")).customerId)
      let CustomerIds = new Set(this.orderHostory?.items?.map((data) => data.customerId));
      this.CustomerCount = CustomerIds?.size;

    });
  }
  async GetTableDetailsById(isUpdateOrder) {
    // this.PrimaryOrder?.items?.forEach(element => {
    //   if (element.itemStatus != "Ordered")
    //     element.itemStatus = 'InCart';
    // });
    this.ngxLoader.startLoader('loader-01');
    await this.posDataService.getTableMasterById(JSON.parse(sessionStorage.getItem("TableId"))).subscribe(res => {
      if (res.success) {
        let TableDetails = res.data;
        if (isUpdateOrder == false) {
          if (TableDetails.tableStatus == 'Occupied')
            this.GetOrderByOrderId(isUpdateOrder);
          else
            this.orderHostory = null;
        }
        else if (isUpdateOrder == true) {
          if (TableDetails.tableStatus == 'Occupied')
            this.GetOrderByOrderId(isUpdateOrder);
          else {
            this.PrimaryOrder.customerId =  JSON.parse(sessionStorage.getItem("CustomerLoginData"))?.customerId
            this.PrimaryOrder.customerName = JSON.parse(sessionStorage.getItem("CustomerLoginData"))?.customerName
            this.posDataService.postOrderData(this.PrimaryOrder).subscribe(res => {
              if (res.success) {
                sessionStorage.setItem("orderHistory", JSON.stringify(res.data));
                this.ngxLoader.stopLoader('loader-01');
                this.PrimaryOrder = null;
                sessionStorage.removeItem("CartData");
                this.orderHostory = res.data;
                this.orderHostory?.items?.forEach((data) => {
                  data.image = data?.imagePath == null || data?.imagePath == "null" ? null : data?.imagePath?.match(/Uploads.*/)[0];
                })
                this.alertService.showSuccess("Order Placed Successfully");
              } else {
                this.alertService.showError(res.message);
              }
            });
          }
        }

      } else {
        this.alertService.showError(res.message);
      }
    });
  }
  OnClickHome() {
    let tableId = JSON.parse(sessionStorage.getItem("TableId"));
    let outletId = JSON.parse(sessionStorage.getItem("OutletId"));
    this.router.navigate(['/myorder', outletId, tableId, this.OutletName]);
  }
  openModifier(content, ItemIndex, item) {
    this.Modifiers = [];
    this.Ingredients = [];
    this.SelectedModifiers = [];
    let itemDataToSelectModifier = this.allItems?.find((data) => data.id == item.itemId);
    this.SelectedItemIndex = ItemIndex;
    itemDataToSelectModifier?.modifiers?.forEach((itemModifier) => {
      let modifiers = this.allModifiersByOutlet.find((Modifier) => Modifier.id == itemModifier);
      modifiers.checked = this.PrimaryOrder.items[ItemIndex].modifiers.some((data) => data.modifierId == itemModifier);
      if (modifiers)
        if (modifiers?.modifierType == "Modifiers")
          this.Modifiers.push(modifiers);
        else if (modifiers?.modifierType == "Ingredients")
          this.Ingredients.push(modifiers);
    })
    if (this.Modifiers != null && this.Modifiers?.length > 0 || (this.Ingredients != null && this.Ingredients?.length > 0)) {
      this.modalService.open(content, { backdrop: 'static', windowClass: 'main_add_popup food_customization_popup', keyboard: true, centered: true }).result.then((result) => {
      });
    }
  }
  closeAction() {
    if (this.modalService.hasOpenModals) {
      this.modalService.dismissAll();
    }
  }
  OnAddingModifiers() {
    this.PrimaryOrder.items[this.SelectedItemIndex].modifiers = this.SelectedModifiers;
    sessionStorage.setItem("CartData", JSON.stringify(this.PrimaryOrder));
    this.CommonCalculation();
    this.closeAction();
  }
  OnSelectModifier(event, data) {
    if (event.target.checked) {
      let obj = {
        modifierId: data.id,
        modifierName: data.modifierName,
        orderQuantity: 1, //Default 1
        price: data.price,
        totalAmount: data.price * 1,
        groupName: data.groupName,
        modifierType: data.modifierType
      }
      this.SelectedModifiers.push(obj)

    }
    else {
      this.SelectedModifiers = this.SelectedModifiers?.filter((mod) => mod.modifierId != data.id)
    }
  }
  GetAllMasters() {
    this.ngxLoader.startLoader('loader-01');
    this.posDataService.GetMasterDataForQr(JSON.parse(sessionStorage.getItem("OutletId"))).subscribe((response: any) => {
      this.ngxLoader.stopLoader('loader-01');
      let MasterData = response['data'];
      this.allItems = MasterData.items;
      this.allItems = this.allItems.filter(x => !x.isBatchRecipe);
      this.allTaxes = MasterData.tax;
      this.allModifiersByOutlet = MasterData.modifiers;
    })
  }
  filterItemsByCustomer(items: any[]): any[] {
    if (!items) return [];
    if (!this.searchText) return items;

    const lowerSearch = this.searchText.toLowerCase();
    return items.filter(item =>
      item.customerName?.toLowerCase().includes(lowerSearch)
    );
  }
}
