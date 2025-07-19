import { Component, OnInit } from '@angular/core';
import { AlertService } from '@core/services/common/alert.service';
import { Router } from '@angular/router';
import { PosDataService } from '@core/services/pos-system/pos-data.service';
import { MakePaymentComponent } from '../../make-payment/make-payment.component';
import { NgxUiLoaderService } from 'ngx-ui-loader';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { PrintVeiwComponent } from '../../print-design-veiw/print-veiw/print-veiw.component';
import { environment } from 'src/environments/environment';

@Component({
  selector: 'app-walk-in-order',
  templateUrl: './walk-in-order.component.html',
  styleUrls: ['./walk-in-order.component.css']
})
export class WalkInOrderComponent implements OnInit {
  subCat = false;
  allItems = [];
  items = [];
  selectSubCat: any;
  singleItem: any;
  pager: any = {};
  pageNumber = 1;
  pageSize = 10;
  totalRows: number;
  closeResult: string;
  menuItemData: any;
  menuItemList: any = [];
  qty: any;
  subTotal = 0;
  subtotalTax = 0;
  total = 0;
  customerDetails: any;

  allCategory: any;
  allItemsByApi: any;
  orderType: any;
  orderDetails: Array<{}> = [];
  orderHistory: Array<{}> = [];
  customerId: any;
  placeOrderEnable = false;
  categoryName: any;
  orderId: any = null;
  PrimaryOrder: any;
  runningOrder = false;
  orderStatus: any;
  itemsAllReadyTaken: any = [];
  itemToBeAdded: Array<any> = [];
  itemIndexOfModifier: any;
  modifierData: any;
  modifiedHistory: Array<{}> = [];
  itemIndexForDiscount: any;
  itemDiscountData: any;
  taxData = [];
  dataForPopUp: any;
  orderDiscAmount = 0;
  orderDisData: any;
  taxCondition: any;
  resId: any;
  outletId: any;
  orderNo: any;
  isCalled: boolean = false;
  qtyDecrement: boolean = false;
  subtractSub: boolean = false;
  taxConditionVal: any;
  searchInputItem: any;
  allSearchCategorie: any;
  searchInput: any;
  isSecondCase: boolean = false;
  fixedTotal = 0;
  totalTax = 0;
  itemsTaxData: any[];
  itemTaxes: any;
  AddNote: any;
  voidPassword: any;
  Enteredpassword: any;
  ItemIndex = 0;
  isCorrectPass = true;
  userData: any;
  DisableAfterDiscount = false;

  //Replicate from Dine in variables
  //Used to get master data
  IsDataLoad: boolean = false;
  currentOutlet: any;
  allCategoryList: any;
  allModifiers: any;
  allDiscountsMaster: any;
  allDiscounts: any;
  allPromocodes: any;
  allTaxes: any;

  itemsOfSelectedCategory = []; //  item user can filter by categories
  activeCategoryIndex: number = 0;
  filteredCategoryView: any; // categories user can filter by course

  itemTaxList = [];
  itemDiscountList = []; // All discounts of all items (selecting this for view purpose)
  //For popup (When Click on item)
  selectedItemIndex: any;
  itemModifier=[]
  ItemDiscountPromocode=[]

  // Below is for calculation
  allModifiersTotalAmount = 0;
  // To select item level discount
  selectedItemDiscount: any;
  // Below both variable you use it for both the popup because user will not open both the popup at a time
  PromocodeDiscountTypeToOpenPopUp: any;
  OrderwisePromocodeDiscountTypeToOpenPopUp: any;

  BaseUrl: any;
  currentUser: any;
  isRemoveItem = false;

  constructor(
    private ngxLoader: NgxUiLoaderService,
    private modalService: NgbModal,
    private alertService: AlertService,
    private router: Router,
    private posDataService: PosDataService,
    private loader: NgxUiLoaderService
  ) { this.currentUser = JSON.parse(sessionStorage.getItem('userCredential')); }

  ngOnInit(): void {
    // this.GetAndSetValuesToSession();
    // this.getAllTaxesData();
    // this.getAllCategories();
    // this.getAllItems();

    //From Dine in replicated API calls
    this.currentOutlet = JSON.parse(sessionStorage.getItem('activeOutlet')); // Here we require to get full data of outlet (Currently it is only ID)
    //this.getAddedItemData();
    this.GetCategoriesList();
    this.getAllTaxs();
    this.getAllDiscounts();
    this.getAllModifiers();
    this.getAllPromocodes();

    this.orderId = sessionStorage.getItem('orderId');

    if (this.orderId != undefined || this.orderId != null) { //Make this code for update takeaway order
      this.getAddedItemData();
    } else
      this.newOrderObjectInitialized();

    this.BaseUrl = environment.apiUrl.replace(/^(.*:\/\/[^\/]+\/).*$/, '$1');

    setTimeout(() => {
      if (sessionStorage.getItem('PayNowFromWalkIn') == 'payNow') {
        this.PayNow();
      }
    }, 2000);
  }
  newOrderObjectInitialized() {
    this.IsDataLoad = true;
    this.itemsOfSelectedCategory = [];
    this.itemTaxList = [];
    this.customerDetails = JSON.parse(sessionStorage.getItem('customerData'));
    this.PrimaryOrder = {
      orderId: null,
      orderType: 'Walk-in',
      items: [],
      customerId: this.customerDetails?.customerId,
      customerName: this.customerDetails?.customerName,
      orderNo: 0,
      orderDetails: [],
      orderNotes: null,
      totalDiscount: 0,
      orderStatus: "",
      createdBy: this.currentUser.userId,
      createdByName: this.currentUser.userName,
      isDeleted: false,
      isVoidOrder: false,
      isAccepted: true,
      deliverectId: null,
      isMerged: false,
      isPrinted: false,
      mergedWith: null,
      numberOfPeople: 1,
      outletId: this.currentOutlet.outletId,
      subTotal: 0,
      total: 0,
      isPaid: false,
      taxDetails: [],
      totalOrderTax: 0,
      paymentBreakage: [],
      totalTip: 0,
      itemWiseTax: [],
      totalItemsTax: 0,
      orderDiscounts: [],
    };
  }

  //Start to replicate from Dine In
  // Start Get all masters from DB
  getAllItems() {
    this.loader.startLoader('loader-01');
    let data = { outletId: this.currentOutlet.outletId, IsAllItem: false }
    this.posDataService.getAllItemsByOutletId(data).subscribe((res: any) => {
      this.loader.stopLoader('loader-01');
      this.allItems = res['data'];
      this.allItems = this.allItems.filter(x => !x.isBatchRecipe);
      if (this.allCategoryList) {
        this.selectCategoryMenu(this.allCategoryList[0].categoryId, 0);
      }
      let showSuccess = res['success'];
      let msg = res['message'];
      if (!showSuccess) {
        this.alertService.showError(msg);
      }
    });
  }
  getAllModifiers() {
    let obj = {
      outletId: this.outletId,
      isAllItem: false,
      OutletId: sessionStorage.getItem('activeOutletId')
    }
    this.posDataService.getModifiersByOutletId(obj).subscribe(res => {
      if (res.success) {
        this.allModifiers = res['data'];
        this.allModifiers.forEach(element => {
          element.isChecked = false;
        });
      } else {
        this.alertService.showError(res.message);
        return null;
      }
    });
  }
  getAllDiscounts() {
    let obj = {
      outletId: this.currentOutlet.outletId,
      isAllItem: false,
    }
    this.posDataService.getAllDiscountByOutletId(obj).subscribe(res => {
      if (res.success) {
        this.allDiscountsMaster = res['data'];
        this.allDiscounts = this.allDiscountsMaster;
      } else {
        this.alertService.showError(res.message);
        return null;
      }
    });
  }
  getAllPromocodes() {
    let jsonData: any = {};
    jsonData.outletId = sessionStorage.getItem('activeOutletId');
    jsonData.isAllItem = false;
    this.posDataService.getAllPromocodeByOutletId(jsonData).subscribe((response) => {
      this.allPromocodes = response['data'];
      let success = response['success'];
      let msg = response['message'];
      if (success) {
      }
      else {
        this.alertService.showError(msg);
      }
    })
  }
  getAllTaxs() {
    this.posDataService.getTaxByOutletId(this.currentOutlet.outletId, false).subscribe(res => {
      if (res.success) {
        this.allTaxes = res.data;
      } else {
        // this.alertService.showError(res.message);
        return null;
      }
    });
  }
  activeCourdeIndex = -1;
  GetCategoriesList() {
    this.loader.startLoader('loader-01');
    this.posDataService.getAllCategoryByOutletId(this.currentOutlet.outletId, false).subscribe((res: any) => {
      this.loader.stopLoader('loader-01');
      this.allCategoryList = res['data'];
      for (let i = 0; i < this.allCategoryList.length; i++) {
        this.allCategoryList[i].CategoryImage = this.allCategoryList[i]?.imagePath === null || this.allCategoryList[i]?.imagePath === "null" ? null : this.allCategoryList[i]?.imagePath?.match(/Uploads.*/)[0];
      }
      let showSuccess = res['success'];
      if (showSuccess) {
        this.filteredCategoryView = this.allCategoryList;
        this.getAllItems();
      }
      else {
        this.alertService.showError(res.message);
      }
    });
  }
  // Ends get masters

  getAddedItemData() {
    console.log("called")
    if (this.orderId !== null && this.orderId !== 'null' && this.menuItemList.length == 0) {
      this.ngxLoader.startLoader('loader-01');
      this.posDataService.getOrderById(this.orderId).subscribe((res: any) => {
        this.ngxLoader.stopLoader('loader-01');
        this.PrimaryOrder = res['data'];
        this.customerDetails = {
          customerId: this.PrimaryOrder.customerId,
          customerName: this.PrimaryOrder.customerName
        };
        console.log("Pri", this.PrimaryOrder);
        //this.ExistingOrderSetupAndCalculationTax();
      });
    }
  }

  selectCategoryMenu(categoryId, index) {
    this.itemsOfSelectedCategory = this.allItems.filter(x => x.itemCategoryId == categoryId);
    this.allItemsByApi = this.itemsOfSelectedCategory;
    this.activeCategoryIndex = index;
    for (let i = 0; i < this.itemsOfSelectedCategory?.length; i++) {
      this.itemsOfSelectedCategory[i].imagePath = this.itemsOfSelectedCategory[i].imagePath === null || this.itemsOfSelectedCategory[i].imagePath === "null" ? null : this.itemsOfSelectedCategory[i].imagePath?.match(/Uploads.*/)[0];
    }
  }

  OnClickItem(item: any) {
    if (this.PrimaryOrder.items.map(x => x.itemId).includes(item.id)) {
      let index = this.PrimaryOrder.items.map(function (x) { return x.itemId; }).indexOf(item.id);
      this.PrimaryOrder.items[index].orderQuantity++;
    } else {
      item.active = !item.active;
      this.AddItemIntoMainObject(item);

    }
    this.CommonCalculation();

    //below code is not working so disabled
    //this.itemTaxList = this.mainOrderObject.reduce((acc, item) => acc.concat(item.itemWiseTax), []);
  }

  private CommonCalculation() {
    this.PrimaryOrder.totalOrderTax = 0;
    this.PrimaryOrder = this.CalcutateItemTotalAndDiscount(this.PrimaryOrder);
    this.PrimaryOrder = this.CalcutateDefaultTaxOfOrder(this.PrimaryOrder);

    this.itemTaxList = [];
    this.ItemLevelTaxCalculation();
    this.PrimaryOrder.subTotal += this.allModifiersTotalAmount;
    this.PrimaryOrder.total += this.allModifiersTotalAmount;
  }
  AddItemIntoMainObject(item: any) {
    let category = this.allCategoryList.find(x => x.categoryId == item.itemCategoryId); // Change this to categoryId after Deployment/Pointing to local
    let newItem = {
      id: null,
      imagePath: item.imagePath === null || item.imagePath === "null" ? null : item.imagePath?.match(/Uploads.*/)[0],
      itemId: item.id,
      itemName: item.itemName,
      orderQuantity: 1,
      preparedQuantity: 0,
      preparingTime: item.preparingTime,
      categoryName: category.categoryName,
      categoryId: category.categoryId,
      itemLocation: category.location,
      categoryCourse: category.course,
      itemAmount: item.itemAmount,
      isReadyMade: category.isReadyMade,
      isPaid: false,
      notes: null,
      //tableNo: this.currentTableDetails.tableNo,
      itemWiseTax: item.taxId ? this.AddTaxToItem(item) : [],
      itemStatus: '',
      //tableType: this.currentTableDetails.tableType,
      itemTotal: item.itemAmount,
      modifiers: [],
      discount: [],
      isPrinted: false,
    }
    this.PrimaryOrder.items.push(newItem);
  }
  AddTaxToItem(item: any) {
    let tax = [];
    const taxDetail = this.allTaxes?.find(x => x.taxId == item.taxId);
    if (taxDetail != null) {
      const tx = {
        taxId: taxDetail.TaxId,
        taxName: taxDetail.taxName,
        taxPercentage: taxDetail.taxPercentage,
        taxAmount: taxDetail.taxPercentage * (item.itemAmount) / 100,
        isItemIncludeTax: taxDetail.isItemIncludeTax,
        isSubtractFromSubTotal: taxDetail.isSubtractFromSubTotal,
        isDefault: taxDetail.isDefault,
        itemName: item.itemName,
      };
      tax.push(tx);
    }
    return tax;
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

  QuantityIncreament(index) {
    if (this.PrimaryOrder.items[index].orderQuantity > 9999) {
      this.alertService.showError("You can not order this many quantity");
      return;
    }
    this.PrimaryOrder.items[index].orderQuantity++;
    this.CommonCalculation();
  }
  QuantityDecreament(index) {
    this.PrimaryOrder.items[index].orderQuantity--;
    this.CommonCalculation();
    if (this.PrimaryOrder.items[index].orderQuantity == 0) {
      // this.alertService.showError("Minimum 1 quantity required");
      // return;
      this.PrimaryOrder.items.splice(index, 1);
    }
  }
  ManualQuantityChange(quantity, index) {
    if (quantity.length > 4) {
      this.alertService.showError("You can not order this many quantity");
      return;
    }
    this.PrimaryOrder.items[index].orderQuantity = quantity;
    this.CommonCalculation();
  }

  RemoveDiscount(itemIndex) {
    this.PrimaryOrder.items[itemIndex].discount = [];
    this.CommonCalculation();
  }

  OnClickNote(type, content, indx) {
    if (type == 1) // type 1 = Item level, 2= order level
      this.selectedItemIndex = indx;
    this.modalService.open(content, { ariaLabelledBy: 'modal-basic-title', keyboard: false, backdrop: 'static', windowClass: 'main_add_popup add_discount_popup' }).result.then((result) => {
    }, (reason) => {
      console.log(reason);
    });

  }
  // Starts for discounts and modifiers
  OpenDiscountDialog(dialogType, content, itemIndex) {
    this.PromocodeDiscountTypeToOpenPopUp = dialogType;
    this.selectedItemIndex = itemIndex;

    let AllDiscounttotal = 0;
    if (this.PrimaryOrder.items[this.selectedItemIndex].discount)
      AllDiscounttotal = this.PrimaryOrder.items[this.selectedItemIndex].discount.reduce((t, x) => t + x.discountedAmount, 0);
   const selectedItemId = this.PrimaryOrder.items[this.selectedItemIndex].itemId;
     const matchedItem = this.allItems.find(item => item.id === selectedItemId);
      this.ItemDiscountPromocode = this.allDiscounts.filter(item => matchedItem.discount?.includes(item.discountId));

        
    for (let ad = 0; ad < this.ItemDiscountPromocode?.length; ad++) {
      if (this.ItemDiscountPromocode[ad].discountType == 'Percentage') {
        this.ItemDiscountPromocode[ad].discountedAmount = (this.PrimaryOrder.items[this.selectedItemIndex].itemTotal - AllDiscounttotal) * this.ItemDiscountPromocode[ad].discountValue / 100;
      } else if (this.ItemDiscountPromocode[ad].discountType == 'Amount') {
        this.ItemDiscountPromocode[ad].discountedAmount = this.ItemDiscountPromocode[ad].discountValue * this.PrimaryOrder.items[this.selectedItemIndex].orderQuantity;
      }
    }
    this.modalService.open(content, { ariaLabelledBy: 'modal-basic-title', keyboard: false, backdrop: 'static', windowClass: 'main_add_popup add_discount_popup' }).result.then((result) => {
    }, (reason) => {
      console.log(reason);
    });
  }
  OpenPrmocodeDialog(dialogType, content, index) {
    this.PromocodeDiscountTypeToOpenPopUp = dialogType;
    this.selectedItemIndex = index;

    let AllDiscounttotal = 0;
    if (this.PrimaryOrder.items[this.selectedItemIndex].discount)
      AllDiscounttotal = this.PrimaryOrder.items[this.selectedItemIndex].discount.reduce((t, x) => t + x.discountedAmount, 0);
 
      const selectedItemId = this.PrimaryOrder.items[this.selectedItemIndex].itemId;
      const matchedItem = this.allItems.find(item => item.id === selectedItemId);
      this.ItemDiscountPromocode = this.allPromocodes.filter(item => matchedItem.discount?.includes(item.promocodeId));
     
    for (let ad = 0; ad < this.ItemDiscountPromocode?.length; ad++) {
      if (this.ItemDiscountPromocode[ad].promocodeType == 'Percentage') {
        this.ItemDiscountPromocode[ad].discountedAmount = (this.PrimaryOrder.items[this.selectedItemIndex].itemTotal - AllDiscounttotal) * this.ItemDiscountPromocode[ad].promocodeValue / 100;
      } else if (this.ItemDiscountPromocode[ad].promocodeType == 'Amount') {
        this.ItemDiscountPromocode[ad].discountedAmount = this.ItemDiscountPromocode[ad].promocodeValue * this.PrimaryOrder.items[this.selectedItemIndex].orderQuantity;
      }
    }
    this.modalService.open(content, { ariaLabelledBy: 'modal-basic-title', keyboard: false, backdrop: 'static', windowClass: 'main_add_popup add_discount_popup' }).result.then((result) => {
    }, (reason) => {
      console.log(reason);
    });
  }

  ApplyDiscountOrPromocodeForItem(type) {
    //Here type 1 = Discount and 2 = Prmocode
    if (type === 'Discount') {
      this.selectedItemDiscount.promocodeDiscountType = 'Discount'
    } else {
      this.selectedItemDiscount = {
        promocodeDiscountType: 'Promocode',
        discountName: this.selectedItemDiscount.promocodeName,
        discountValue: this.selectedItemDiscount.promocodeValue,
        discountType: this.selectedItemDiscount.promocodeType,
        discountedAmount: this.selectedItemDiscount?.discountedAmount,
        discountOnTotal: this.selectedItemDiscount?.discountOnTotal,
        promocode: this.selectedItemDiscount.promocodeType
      }
    }
    //Apply selected discount to primary order this.itemIndex
    this.PrimaryOrder.items[this.selectedItemIndex].discount = [] //override the selected discount, Bcz only 1 discount is applied
    this.PrimaryOrder.items[this.selectedItemIndex].discount.push(this.selectedItemDiscount);
    this.CommonCalculation();
    this.closeAction();
  }
  ApplyDiscountOrPromocodeForOrderLevel(type) {
    //Here type 1 = Discount and 2 = Prmocode
    if (type === 'Discount') {
      this.selectedItemDiscount.PromocodeDiscountType = 'Discount'
    } else {

      this.selectedItemDiscount = {
        promocodeDiscountType: 'Promocode',
        discountName: this.selectedItemDiscount.promocodeName,
        discountValue: this.selectedItemDiscount.promocodeValue,
        discountType: this.selectedItemDiscount.promocodeType,
        discountedAmount: this.selectedItemDiscount?.discountedAmount,
        discountOnTotal: this.selectedItemDiscount?.discountOnTotal,
        promocode: this.selectedItemDiscount.promocodeType
      }
    }
    //Apply selected discount to primary order this.itemIndex
    this.PrimaryOrder.orderDiscounts = [] //override the selected discount, Bcz only 1 discount is applied
    this.PrimaryOrder.orderDiscounts.push(this.selectedItemDiscount);
    this.CommonCalculation();
    this.closeAction();
  }

  closeAction() {
    if (this.modalService.hasOpenModals) {
      this.modalService.dismissAll();
    }
  }

  selectedDiscount(type, discount) {
    //type == Discount / Promocode
    this.selectedItemDiscount = discount;
  }
   onClickModifier(content, itemIndx) {
    this.selectedItemIndex = itemIndx;
     const selectedItemId = this.PrimaryOrder.items[this.selectedItemIndex].itemId;
     const matchedItem = this.allItems.find(item => item.id === selectedItemId);
     this.itemModifier = this.allModifiers?.filter(item => matchedItem?.modifiers?.includes(item.id));
     this.itemModifier?.forEach(item => item.active = false);
     this.itemModifier?.forEach(item => item.quantity = 0);


    //Patch value if modifiers is already exits
    if (this.PrimaryOrder.items[this.selectedItemIndex].modifiers.length > 0) {
      for (let i = 0; i < this.itemModifier?.length; i++) {
        if (this.PrimaryOrder.items[this.selectedItemIndex].modifiers.some(x => x.modifierId == this.itemModifier[i].id)) {
          this.itemModifier[i].isChecked = true;
          let findModifierIndx = this.PrimaryOrder.items[this.selectedItemIndex].modifiers.findIndex(ele => ele.modifierId == this.itemModifier[i].id)
          if (findModifierIndx >= 0)
            this.itemModifier[i].quantity = this.PrimaryOrder.items[this.selectedItemIndex].modifiers[findModifierIndx].orderQuantity;
        }
      }
    }

    this.modalService.open(content, { ariaLabelledBy: 'modal-basic-title', keyboard: false, backdrop: 'static', windowClass: 'main_add_popup add_discount_popup add_modifier_popup' }).result.then((result) => {
    }, (reason) => {
      console.log(reason);
    });
  }

  //region Order Discount starts
  OpenOrderDiscountDialog(dialogType, content) {
    this.OrderwisePromocodeDiscountTypeToOpenPopUp = dialogType;

    if (dialogType == 'Discount') {
      for (let ad = 0; ad < this.allDiscounts?.length; ad++) {
        if (this.allDiscounts[ad].discountType == 'Percentage') {
          if (this.allDiscounts[ad].isOnTotal) {
            this.allDiscounts[ad].discountedAmount = (this.PrimaryOrder.total - this.PrimaryOrder.totalDiscount) * this.allDiscounts[ad].discountValue / 100;
          } else {
            this.allDiscounts[ad].discountedAmount = (this.PrimaryOrder.subTotal) * this.allDiscounts[ad].discountValue / 100;
          }
        } else if (this.allDiscounts[ad].discountType == 'Amount') {
          this.allDiscounts[ad].discountedAmount = this.allDiscounts[ad].discountValue;
        }
      }
    } else {
      //Promocode block
      for (let ad = 0; ad < this.allPromocodes.length; ad++) {
        if (this.allPromocodes[ad].promocodeType == 'Percentage') {
          if (this.allPromocodes[ad].isOnTotal) {
            this.allPromocodes[ad].discountedAmount = (this.PrimaryOrder.total - this.PrimaryOrder.totalDiscount) * this.allPromocodes[ad].promocodeValue / 100;
          } else {
            this.allPromocodes[ad].discountedAmount = (this.PrimaryOrder.subTotal) * this.allPromocodes[ad].promocodeValue / 100;
          }
        } else if (this.allPromocodes[ad].promocodeType == 'Amount') {
          this.allPromocodes[ad].discountedAmount = this.allPromocodes[ad].discountValue;
        }
      }
    }
    this.modalService.open(content, { ariaLabelledBy: 'modal-basic-title', keyboard: false, backdrop: 'static', windowClass: 'main_add_popup add_discount_popup' }).result.then((result) => {
    }, (reason) => {
      console.log(reason);
    });
  }
  async PlaceOrder(OnlySaveOrder: boolean) {
    if (OnlySaveOrder == false) {
      this.PrimaryOrder.items.forEach(element => {
        element.itemStatus = 'Ordered';
      });
    } else {
      this.PrimaryOrder.items.forEach(element => {
        element.itemStatus = 'InCart';
      });
    }
    if (!this.PrimaryOrder.OrderHistory)
      this.PrimaryOrder.OrderHistory = [];

    await this.posDataService.postOrderData(this.PrimaryOrder).subscribe(res => {
      if (res.success) {
        sessionStorage.setItem('orderId', res['data'].orderId);
        this.modalService.open(PrintVeiwComponent, { backdrop: 'static', size: 'md', keyboard: true, centered: true }).result.then((result) => {
          this.alertService.showSuccess("Order Placed Successfully");
          this.router.navigate(['/pos-dashboard/walk-in']);
        }, (reason) => {
          this.alertService.showSuccess("Something wrong..!!");
        });
      } else {
        this.alertService.showError(res.message);
      }
    });
  }
  async UpdateOrder(OnlySaveOrder: boolean) {
    let isNewItemAdded = false;
    if (OnlySaveOrder == true) {
      this.PrimaryOrder.items.forEach(element => {
        if (element.itemStatus == '') {
          element.itemStatus = 'InCart';
          isNewItemAdded = true;
        }
      });
      if (isNewItemAdded == false)
        return;
    } else {
      this.PrimaryOrder.items.forEach(element => {
        if ((element.itemStatus == 'InCart' || element.itemStatus == '') || element.orderQuantity > element.preparedQuantity)
          element.itemStatus = 'Ordered';
      });
    }
    this.PrimaryOrder.lastModifiedBy = this.currentUser.userId;
    this.PrimaryOrder.lastModifiedByName = this.currentUser.userName;

    //this.PrimaryOrder.totalPerson = this.selectedPersonsCount;
    // Start loader
    await this.posDataService.updateOrderData(this.PrimaryOrder, this.PrimaryOrder.orderId).subscribe(res => {
      if (res.success) {
        // Stop loader
        this.router.navigate(['/pos-dashboard/walk-in']);
        this.alertService.showSuccess("Order Updated Successfully");
        // Redirect to table page
      } else {
        this.alertService.showError(res.message);
      }
    });
  }
  PayNow() {
    sessionStorage.setItem("PaymentSuccessForWalkinOrOnline", "NotPaid");

    // const makePaymentModalRef = this.modalService.open(MakePaymentComponent, { backdrop: 'static', windowClass: 'main_add_popup', keyboard: true, centered: true });
    //  makePaymentModalRef.componentInstance.PrimaryOrder = this.PrimaryOrder;
    // makePaymentModalRef.componentInstance.itemTaxList = this.itemTaxList;
    // makePaymentModalRef.componentInstance.itemDiscountList = this.itemDiscountList;
    // makePaymentModalRef.componentInstance.customerData = this.customerDetails;

    const makePaymentModalRef = this.modalService.open(MakePaymentComponent, {
      backdrop: 'static',
      windowClass: 'main_add_popup',
      keyboard: true,
      centered: true
    });

    // Set component instance inputs
    makePaymentModalRef.componentInstance.PrimaryOrder = this.PrimaryOrder;
    makePaymentModalRef.componentInstance.itemTaxList = this.itemTaxList;
    makePaymentModalRef.componentInstance.itemDiscountList = this.itemDiscountList;
    makePaymentModalRef.componentInstance.customerData = this.customerDetails;

    // Handle modal result
    makePaymentModalRef.result.then((result) => {
      // Success handler (if needed)
    }, (reason) => {
      console.log("paynow popup reason", reason);
      // Place or update the order after successful payment
      let checkPaymentStatus = sessionStorage.getItem("PaymentSuccessForWalkinOrOnline");
      if (checkPaymentStatus == 'Paid') {
        if (this.orderId != undefined && this.orderId != null) {
          this.UpdateOrder(false);
        } else {
          this.PlaceOrder(false);
        }
      }

    });



  }
  closeModal(result) {
    this.modalService.dismissAll(result);
  }
  savenote() {
    this.closeModal(true);
    this.alertService.showSuccess('Your Note is saved Successfully!');
  }
  saveLiveNote(event) {
    this.PrimaryOrder.items[this.selectedItemIndex].notes = event.target.value;
  }
  saveLiveOrderNote(event) {
    this.PrimaryOrder.orderNotes = event.target.value;
  }
  closeModifierModal(result) {
    //Display only item level modifiers check box, or else from master it will get checked if user open another item.
    this.allModifiers.forEach(element => {
      element.isChecked = false;
    });
    this.modalService.dismissAll(result);
  }
  selecteModifier(data, index) {
    let isCheck = <HTMLInputElement>document.getElementById(data.id);
    this.itemModifier[index].isChecked = isCheck.checked;

    let isModifierAExists = this.PrimaryOrder.items[this.selectedItemIndex].modifiers.some(x => x.modifierId == data.id);
    if (isCheck.checked && !isModifierAExists) {
      let obj = {
        modifierId: data.id,
        modifierName: data.modifierName,
        orderQuantity: 1, //Default 1
        price: data.price,
        totalAmount: data.price * 1,
        groupName: data.groupName,
        modifierType: data.modifierType
      }
      this.itemModifier[index].quantity = 1;
      this.PrimaryOrder.items[this.selectedItemIndex].modifiers.push(obj);
    }
    else if (!isCheck.checked && isModifierAExists) {
      const updatedItems = this.PrimaryOrder.items[this.selectedItemIndex].modifiers.filter(item => item.modifierId !== data.id);
      this.PrimaryOrder.items[this.selectedItemIndex].modifiers = updatedItems;
    }
    this.CommonCalculation();
  }
  // For Modifiers
  ModifierQuantityIncreament(data, modifierIndex) {
    let findIndx = this.PrimaryOrder.items[this.selectedItemIndex].modifiers.findIndex(x => x.modifierId === data.id);

    if (this.PrimaryOrder.items[this.selectedItemIndex].modifiers[findIndx].orderQuantity > 99) {
      this.alertService.showError("You can not order this many quantity");
      return;
    }
    this.PrimaryOrder.items[this.selectedItemIndex].modifiers[findIndx].orderQuantity++;
    this.PrimaryOrder.items[this.selectedItemIndex].modifiers[findIndx].totalAmount = this.PrimaryOrder.items[this.selectedItemIndex].modifiers[findIndx].price * this.PrimaryOrder.items[this.selectedItemIndex].modifiers[findIndx].orderQuantity;

    //Modifiy in AllModifier master array
    this.itemModifier[modifierIndex].quantity++;
    this.itemModifier[modifierIndex].totalAmount == this.itemModifier[modifierIndex].price * this.itemModifier[modifierIndex].quantity;
    this.CommonCalculation();
  }
  ModifierQuantityDecreament(data, modifierIndex) {
    let findIndx = this.PrimaryOrder.items[this.selectedItemIndex].modifiers.findIndex(x => x.modifierId === data.id);

    if (this.PrimaryOrder.items[this.selectedItemIndex].modifiers[findIndx].orderQuantity == 1) {
      this.alertService.showError("Minimum 1 quantity required");
      return;
    }
    this.PrimaryOrder.items[this.selectedItemIndex].modifiers[findIndx].orderQuantity--;
    this.PrimaryOrder.items[this.selectedItemIndex].modifiers[findIndx].totalAmount = this.PrimaryOrder.items[this.selectedItemIndex].modifiers[findIndx].price * this.PrimaryOrder.items[this.selectedItemIndex].modifiers[findIndx].orderQuantity;

    //Modifiy in AllModifier master array
    this.itemModifier[modifierIndex].quantity--;
    this.itemModifier[modifierIndex].totalAmount == this.itemModifier[modifierIndex].price * this.itemModifier[modifierIndex].quantity;
    this.CommonCalculation();
  }
  ModifierManualQuantityChange(modifierIndex, quantity) {
    if (quantity.length > 4) {
      this.alertService.showError("You can not order this many quantity");
      return;
    }
    this.PrimaryOrder.items[this.selectedItemIndex].modifiers[modifierIndex].orderQuantity = quantity;
    this.PrimaryOrder.items[this.selectedItemIndex].modifiers[modifierIndex].totalAmount = this.PrimaryOrder.items[this.selectedItemIndex].modifiers[modifierIndex].price * this.PrimaryOrder.items[this.selectedItemIndex].modifiers[modifierIndex].orderQuantity;
    this.CommonCalculation();
  }
  RemoveModifier(modifierIndex) {
    this.PrimaryOrder.items[this.selectedItemIndex].modifiers.splice(modifierIndex, 1);
    this.CommonCalculation();
  }
  backToPage(content) {
    if (this.PrimaryOrder.items.length != 0) {
      this.modalService.open(content, { ariaLabelledBy: 'modal-basic-title', keyboard: false, centered: true, backdrop: 'static', windowClass: 'main_add_popup' }).result.then((result) => {
      }, (reason) => {
        if (reason) {
          setTimeout(() => {
            this.router.navigate(['/pos-dashboard/walk-in']);
          }, 50);
        }
      });
    }
    else {
      setTimeout(() => {
        this.router.navigate(['/pos-dashboard/walk-in']);
      }, 50);
    }
  }
  //End replicate

  SearchItems(event): void {
    let input = event.target.value;
    if (input == '') {
      this.selectCategoryMenu(this.filteredCategoryView[this.activeCategoryIndex].categoryId, this.activeCategoryIndex);
    } else {
      //this.subCat = true;
      this.itemsOfSelectedCategory = this.allItemsByApi.filter((res: any) => {
        return res.itemName.toLocaleLowerCase().includes(input.toLocaleLowerCase());
      });
    }
  }
}
