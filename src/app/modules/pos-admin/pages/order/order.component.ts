import { Component, OnInit } from '@angular/core';
import { PosSharedService } from '@core/services/common/pos-shared.service';
import { AlertService } from '@core/services/common/alert.service';
import { Router } from '@angular/router';
import { PosDataService } from '@core/services/pos-system/pos-data.service';
import { PosDataShareService } from '@core/services/pos-system/posDataShare.service';
import { MakePaymentComponent } from '../make-payment/make-payment.component';
import { NgxUiLoaderService } from 'ngx-ui-loader';
import { NgbModal, ModalDismissReasons, NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';
import { FormGroup, FormBuilder } from '@angular/forms';

import Scrollbar from 'smooth-scrollbar';
import { environment } from 'src/environments/environment';
import * as CryptoJS from 'crypto-js';
import { CommonService } from '@core/services/common/common.service';

@Component({
  selector: 'app-order',
  templateUrl: './order.component.html',
  styleUrls: ['./order.component.css']
})
export class OrderComponent implements OnInit {
  // Existing other variables
  ItemIndex = 0;
  isRemoveItem = false;
  Enteredpassword: any;
  remark: any;
  isCorrectPass: boolean = true;

  // This is using for opern the item discount/note/modifiers popup
  itemIndex = 0;

  // It's data will be visible in UI
  PrimaryOrder: any;
  currentRestaurant: any;
  currentOutlet: any;
  currentUser: any;
  itemTaxList = [];
  itemDiscountList = []; // All discounts of all items (selecting this for view purpose)
  customerDetails: any;
  userpassword: any;

  // Below is for masters list
  allCategoryList: any;
  allTaxes = [];
  allItems = [];
  allCourseView = [];
  allDiscountsMaster = [];
  IsDataLoad: boolean = false;
  itemToDecrementIndex: number | null = null;
  IsDecrement: boolean = false;
  allDiscounts = [];
  allPromocodes = [];
  allModifiers = [];
  itemModifier=[]
  ItemDiscountPromocode=[]
  BaseUrl: any;
  DiscountOrPromo: number;
  //For popup (When Click on item)
  selectedItemIndex: any;

  // Below is for calculation
  allModifiersTotalAmount = 0;
  isactive:boolean=false;
  

  itemsOfSelectedCategory = []; //  item user can filter by categories
  filteredCategoryView: any; // categories user can filter by course
  numbers: number[] = Array.from({ length: 12 }, (_, i) => i + 1);
  selectedPersonsCount: number = 1;
  currentTableDetails: any;

  // To select item level discount
  selectedItemDiscount: any;
  // Below both variable you use it for both the popup because user will not open both the popup at a time
  PromocodeDiscountTypeToOpenPopUp: any;
  OrderwisePromocodeDiscountTypeToOpenPopUp: any;
  customerData: any;
  customerForm: any = FormGroup;
  orderType = "Dine-in";
   getCustomerDataByEventId: any;
   searchInputItem: any;
   costomerData: any;
  tempcostomerData: any;
    searchInput: any;
  outletId: string;
 

  constructor(
         private loader: NgxUiLoaderService,
         private modalService: NgbModal,
         public commonService : CommonService,
         private ngxLoader: NgxUiLoaderService,
         private alertService: AlertService,
        private formBuilder: FormBuilder,

         private posDataService: PosDataService, 
         private router: Router) {
    this.currentUser = JSON.parse(sessionStorage.getItem('userCredential'));
  }
  // constructor(
  //   private loader: NgxUiLoaderService,
  //   private modalService: NgbModal,
  //   private posSharedService: PosSharedService,
  //   private alertService: AlertService,
  //   private router: Router,
  //   private posDataService: PosDataService,
  //   private posDataShareService: PosDataShareService,
  //   private activeModal: NgbActiveModal,
  //   private formBuilder: FormBuilder,
  // ) { }

  ngOnInit(): void {
     this.customerDetails = JSON.parse(sessionStorage.getItem('customerData'));
    this.currentTableDetails = JSON.parse(sessionStorage.getItem('selectedTable'));
    this.selectedPersonsCount = this.currentTableDetails?.capacity;
    this.currentRestaurant = JSON.parse(sessionStorage.getItem('ResturantByID'));
    this.outletId = sessionStorage.getItem('activeOutletId');
    this.currentOutlet = JSON.parse(sessionStorage.getItem('activeOutlet')); // Here we require to get full data of outlet (Currently it is only ID)
    this.GetCategoriesList();
    this.getAllTaxs();
    this.getAllDiscounts();
    this.getAllModifiers();
    this.getAllPromocodes();
    if (this.currentTableDetails?.orderId) {
      this.GetOrderByOrderId(this.currentTableDetails.orderId);
    } else
      this.newOrderObjectInitialized();
    this.BaseUrl = environment.apiUrl.replace(/^(.*:\/\/[^\/]+\/).*$/, '$1');
    setTimeout(() => {
      if (document.querySelector('.order_main_category_blk')) {
        Scrollbar.init(document.querySelector('.order_main_category_blk'));
      }
      // if (document.querySelector('.added_item_container')) {
      //   Scrollbar.init(document.querySelector('.added_item_container'));
      // }
      if (document.querySelector('.sub_category_item_row')) {
        Scrollbar.init(document.querySelector('.sub_category_item_row'));
      }
    }, 2000);

     this.customerForm = this.formBuilder.group({
      cusName: [''],
      phone: [''],
      address: ['']
    });

    this.getAllCustomers();

    
  }

  CancelOrder() {
    this.posDataService.deleteRunningOrder(this.PrimaryOrder.orderId).subscribe(res => {
      if (res.success) {
        this.alertService.showError(res.message);
        this.goToTablesPage();
      } else {
        this.alertService.showError(res.message);
        return null;
      }
    });
  }

  // PrintInvoice() {
  //   const modalRef = this.modalService.open(PrintVeiwComponent, { backdrop: 'static', keyboard: false, windowClass: 'invoice_download bookedsucees_modal_open' });
  //   modalRef.componentInstance.invoiceData = this.PrimaryOrder;
  // }

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
    let data = { outletId: this.currentOutlet.outletId, IsAllItem: false };
    this.posDataService.getModifiersByOutletId(data).subscribe(res => {
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
    let data = { outletId: this.currentOutlet.outletId, IsAllItem: false }
    this.posDataService.getAllDiscountByOutletId(data).subscribe(res => {
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
        this.alertService.showError(res.message);
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
        // let row = 0;
        // if (this.pageNumber == 1) {
        //   this.items = this.allCategory.slice(row, this.pageSize);
        // }
        // if (this.pageNumber > 1) {
        //   row = (row + this.pageNumber * this.pageSize) - this.pageSize
        //   this.items = this.allCategory.slice(row, this.pageSize * this.pageNumber);
        // }
      }
      else {
        this.alertService.showError(res.message);
      }
    });
    // this.posDataService.getAllCategory().subscribe(res => {
    //   if (res.success) {
    //     this.allCategoryList = res.result;
    //     this.filteredCategoryView = this.allCategoryList;
    //     this.allCourseView = [...new Set(this.allCategoryList.map(item => item.group))];
    //     this.getAllItems();
    //   } else {
    //     this.alertService.showError(res.message);
    //     return null;
    //   }
    // });
  }
  // Ends get masters


  async UpdateOrder(OnlySaveOrder: boolean) {
    this.IsDecrement = false;
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
     const orderdata=this.PrimaryOrder
    this.customerData= JSON.parse(sessionStorage.getItem('customerData'));
    if(orderdata.customerId==null)
    {
     this.PrimaryOrder.customerId=this.customerData?.customerId;
     this.PrimaryOrder.customerName=this.customerData?.customerName;
    }

    this.PrimaryOrder.lastModifiedBy = this.currentUser.userId;
    this.PrimaryOrder.lastModifiedByName = this.currentUser.userName;

    this.PrimaryOrder.totalPerson = this.selectedPersonsCount;
    // Start loader
    await this.posDataService.updateOrderData(this.PrimaryOrder, this.PrimaryOrder.orderId).subscribe(res => {
      if (res.success) {
        // Stop loader
        this.alertService.showSuccess("Order Updated Successfully");
        sessionStorage.removeItem('customerData');
        // Redirect to table page
      } else {
        this.alertService.showError(res.message);
      }
    });
  }
  async PlaceOrder(OnlySaveOrder: boolean) {
    debugger;
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
    this.PrimaryOrder.numberOfPeople = this.selectedPersonsCount
    this.PrimaryOrder.customerId=this.customerData?.customerId;
    this.PrimaryOrder.customerName=this.customerData?.customerName;
    await this.posDataService.postOrderData(this.PrimaryOrder).subscribe(res => {
      if (res.success) {
        this.router.navigate(['/pos-dashboard/dine-in']);
        this.alertService.showSuccess("Order Placed Successfully");
        sessionStorage.removeItem('customerData'); 


      } else {
        this.alertService.showError(res.message);
      }
    });
  }

  PayNow() {
    const makePaymentModalRef = this.modalService.open(MakePaymentComponent, { backdrop: 'static', windowClass: 'main_add_popup', keyboard: true, centered: true });
    makePaymentModalRef.componentInstance.PrimaryOrder = this.PrimaryOrder;
    makePaymentModalRef.componentInstance.itemTaxList = this.itemTaxList;
    makePaymentModalRef.componentInstance.itemDiscountList = this.itemDiscountList;
    makePaymentModalRef.componentInstance.customerData = this.customerDetails;
  }
  // For Table view
  ShowRemovedItems(content) {
    this.modalService.open(content, {
      windowClass: 'modal', size: 'lg', backdrop: 'static', keyboard: false
    });
  }

  // For item search
  SearchItems(event) {
    let inputTaxt = event.target.value;
    if (!inputTaxt || inputTaxt == '') {
      this.selectCategoryMenu(this.filteredCategoryView[this.activeCategoryIndex].categoryId, this.activeCategoryIndex);
    }
    this.itemsOfSelectedCategory = this.allItems.filter((res: any) => {
      return res.itemName.toLocaleLowerCase().includes(inputTaxt.toLocaleLowerCase());
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

  selectedDiscount(type, discount) {
    //type == Discount / Promocode
    this.selectedItemDiscount = discount;
  }
  //Below is only for Ui
  ApplyDiscountOrModifierActiveDeactive(discountOrModifier, isDiscount, discountType) {
    if (isDiscount) { // This if() for discount
      if (!this.PrimaryOrder.items[this.selectedItemIndex].discount) {
        this.PrimaryOrder.items[this.selectedItemIndex].discount = [];
      }
      if (!discountOrModifier.active) {
        discountOrModifier.active = true;
        let obj = {
          promocodeDiscountType: discountType, // Promocode OR Discount
          discountType: discountOrModifier.discountType, // Percentage OR Amount
          discountName: discountOrModifier.discountName,
          discountValue: discountOrModifier.discountValue,
          discountedAmount: discountOrModifier.discountedAmount,
          discoutNotes: discountOrModifier.discoutNotes,
          discountOnTotal: discountOrModifier.discountOnTotal,
        }
        if (!this.PrimaryOrder.items[this.selectedItemIndex].discount.map(x => x.discountName).includes(discountOrModifier.name))
          this.PrimaryOrder.items[this.selectedItemIndex].discount.push(obj);
      }
      else {
        discountOrModifier.active = false;
        // Remove discount from the list
        this.PrimaryOrder.items[this.selectedItemIndex].discount = this.PrimaryOrder.items[this.selectedItemIndex].discount.filter(x => x.discountName != discountOrModifier.name);
      }
    } else { // This if() for modifiers
      if (!this.PrimaryOrder.items[this.selectedItemIndex].modifiers) {
        this.PrimaryOrder.items[this.selectedItemIndex].modifiers = [];
      }
      if (!discountOrModifier.active) {
        discountOrModifier.active = true;
        let obj = {
          modifierName: discountOrModifier.modifierName,
          quantity: discountOrModifier.quantity,
          price: discountOrModifier.price,
          totalAmount: discountOrModifier.price * discountOrModifier.quantity,
        }
        if (!this.PrimaryOrder.items[this.selectedItemIndex].modifiers.map(x => x.modifierName).includes(discountOrModifier.modifierName))
          this.PrimaryOrder.items[this.selectedItemIndex].modifiers.push(obj);
      }
      else {
        discountOrModifier.active = false;
        // Remove modifier from the list
        this.PrimaryOrder.items[this.selectedItemIndex].modifiers = this.PrimaryOrder.items[this.selectedItemIndex].modifiers.filter(x => x.modifierName != discountOrModifier.modifierName);
      }
    }
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

  RemoveDiscount(itemIndex) {
    this.PrimaryOrder.items[itemIndex].discount = [];
    this.CommonCalculation();
  }
  // Ends for discounts and modifiers

  //region Order Discount starts
  OpenOrderDiscountDialog(dialogType, content) {
    this.OrderwisePromocodeDiscountTypeToOpenPopUp = dialogType;

    if (dialogType == 'Discount') {
      for (let ad = 0; ad < this.allDiscounts.length; ad++) {
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

  ApplyOrderDiscountAndActiveDeactive(selectedDiscount) {
    if (!this.PrimaryOrder.orderDiscounts) {
      this.PrimaryOrder.orderDiscounts = [];
    }
    if (!selectedDiscount.active) {
      selectedDiscount.active = true;
      let obj = {
        discountName: selectedDiscount.name,
        masterType: selectedDiscount.masterType,
        discountType: selectedDiscount.discountType,
        value: selectedDiscount.value,
        amount: selectedDiscount.discountedAmount,
        note: selectedDiscount.discription,
      }
      if (!this.PrimaryOrder.orderDiscounts.map(x => x.discountName).includes(selectedDiscount.name))
        this.PrimaryOrder.orderDiscounts.push(obj);
    }
    else {
      selectedDiscount.active = false;
      // Remove discount from the list
      this.PrimaryOrder.orderDiscounts = this.PrimaryOrder.orderDiscounts.filter(x => x.discountName != selectedDiscount.name);
    }
  }
  //end Order Discount

  //For table
  GetOrderByOrderId(orderId) {
    this.posDataService.getOrderById(orderId).subscribe(res => {
      if (res.success) {
        // For persons sitting on table
        this.selectedPersonsCount = res.data.numberOfPeople;
        this.PrimaryOrder = res.data;
        console.log("primaryData",this.PrimaryOrder)
        for (let i = 0; i < this.PrimaryOrder.items?.length; i++) {
          this.PrimaryOrder.items[i].imagePath = this.PrimaryOrder.items[i].imagePath === null || this.PrimaryOrder.items[i].imagePath === "null" ? null : this.PrimaryOrder.items[i].imagePath?.match(/Uploads.*/)[0];
        }
        this.IsDataLoad = true;
        this.CommonCalculation();
      } else {
        this.alertService.showError(res.message);
      }
    });
  }
  // Below removing Item from cart
  ClearAllItems() {
    this.itemsOfSelectedCategory = [];
    this.itemTaxList = [];
    this.PrimaryOrder.items = [];
    this.PrimaryOrder.subTotal = 0;
    this.PrimaryOrder.total = 0;
    this.PrimaryOrder.taxDetails = [];
  }
  newOrderObjectInitialized() {
    this.IsDataLoad = true;
    this.itemsOfSelectedCategory = [];
    this.itemTaxList = [];
    this.PrimaryOrder = {
      orderId: null,
      orderType: 'Dine-in',
      items: [],
      customerId: null,
      orderNo: 0,
      orderDetails: [],
      orderNotes: null,
      totalDiscount: 0,
      orderStatus: "Running",
      createdBy: this.currentUser.userId,
      createdByName: this.currentUser.userName,
      isDeleted: false,
      isVoidOrder: false,
      isAccepted: true,
      deliverectId: null,
      isMerged: false,
      isPrinted: false,
      mergedWith: null,
      numberOfPeople: this.selectedPersonsCount,
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

  ClearCourseSelection() {
    this.filteredCategoryView = this.allCategoryList;
    this.activeCourdeIndex = -1;
    if (this.filteredCategoryView && this.filteredCategoryView.length > 0) {
      this.selectCategoryMenu(this.filteredCategoryView[this.activeCategoryIndex].categoryId, this.activeCategoryIndex);
    }
  }
  SelectedCourse(group, index) {
    this.activeCourdeIndex = index;
    this.filteredCategoryView = this.allCategoryList.filter(x => x.group == group);
    if (this.filteredCategoryView && this.filteredCategoryView.length > 0) {
      this.selectCategoryMenu(this.filteredCategoryView[this.activeCategoryIndex].categoryId, this.activeCategoryIndex);
    }
    this.activeCategoryIndex = 0;
  }
  selectCategoryMenu(categoryId, index) {
    this.itemsOfSelectedCategory = this.allItems.filter(x => x.itemCategoryId == categoryId);
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
  // Calculation Start
  private CommonCalculation() {
    this.PrimaryOrder.totalOrderTax = 0;
    this.PrimaryOrder = this.CalcutateItemTotalAndDiscount(this.PrimaryOrder);
    setTimeout(()=>{
    this.PrimaryOrder = this.CalcutateDefaultTaxOfOrder(this.PrimaryOrder);
    this.itemTaxList = [];
    this.ItemLevelTaxCalculation();
    this.PrimaryOrder.subTotal += this.allModifiersTotalAmount ?? 0;
    this.PrimaryOrder.total += this.allModifiersTotalAmount ?? 0;
    },10)
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
  // Calculation Ends

  QuantityIncreament(index) {
    if (this.PrimaryOrder.items[index].orderQuantity > 9999) {
      this.alertService.showError("You can not order this many quantity");
      return;
    }
    this.PrimaryOrder.items[index].orderQuantity++;
    this.CommonCalculation();
  }
  QuantityDecreament(index, content) {
    if (this.PrimaryOrder.items[index].preparedQuantity < this.PrimaryOrder.items[index].orderQuantity) {
      this.PrimaryOrder.items[index].orderQuantity--;
      this.CommonCalculation();
      if (this.PrimaryOrder.items[index].orderQuantity == 0) {
        // this.alertService.showError("Minimum 1 quantity required");
        // return;
        this.PrimaryOrder.items.splice(index, 1);
      }
    }
    else {

      if (this.IsDecrement) {
        this.PrimaryOrder.items[index].orderQuantity--;
        this.CommonCalculation();
        if (this.PrimaryOrder.items[index].orderQuantity == 0) {
          this.PrimaryOrder.items.splice(index, 1);
          this.alertService.showSuccess("Item Updated");
        }
      } else {
        if ((JSON.parse(sessionStorage.getItem('userCredential')).roleName).toLowerCase() == "super admin") {
          this.itemToDecrementIndex = index;
          this.modalService.open(content, { backdrop: 'static', size: 'lg', keyboard: true, centered: true }).result.then((result) => {

          }, (reason) => {

          });
        }
        else {
          this.alertService.showWarning("sorry unable to decrease the quantity.");
        }

      }
    }
  }
  confirmDecrement(): void {
    if (this.remark == null) {
      this.alertService.showError("Please Enter remarks");
    }
    else {
      const secretKey = 'qwertyuiop77893408sdsdfd';
      const encryptedPassword = sessionStorage.getItem('Password');
      if (encryptedPassword) {
        const bytes = CryptoJS.AES.decrypt(encryptedPassword, secretKey);
        const decryptedPassword = bytes.toString(CryptoJS.enc.Utf8);
        if (this.userpassword === decryptedPassword) {
          this.IsDecrement = true;
          this.QuantityDecreament(this.itemToDecrementIndex, "")
          this.closeAction();
        } else {
          this.alertService.showError("Invalid Password!")
        }
      }
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
      tableNo: this.currentTableDetails.tableNo,
      itemWiseTax: item.taxId ? this.AddTaxToItem(item) : [],
      itemStatus: '',
      tableType: this.currentTableDetails.tableType,
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
  onSlideChange() {
    console.log('Slide changed');
    // Additional logic here
  }

  activeCategoryIndex: number = 0; // Track the active index
  goToTablesPage() {
    this.router.navigate(['/ordertracker/dinein']);
  }
  OnClickAddDiscountorPromoCode(value, content) {
    this.DiscountOrPromo = value;
    this.modalService.open(content, { ariaLabelledBy: 'modal-basic-title', keyboard: false, backdrop: 'static', windowClass: 'main_add_popup add_discount_popup' }).result.then((result) => {
    }, (reason) => {
      console.log(reason);
    });
  }
  OnClickNote(type, content, indx) {
    if (type == 1) // type 1 = Item level, 2= order level
      this.selectedItemIndex = indx;
    this.modalService.open(content, { ariaLabelledBy: 'modal-basic-title', keyboard: false, backdrop: 'static', windowClass: 'main_add_popup add_discount_popup' }).result.then((result) => {
    }, (reason) => {
      console.log(reason);
    });
  }
  //---------------------------------------------------------------------------------------------------------------------------------
  // addSubCatItem: boolean = false;
  // subCat = false;
  // allItems = [];
  // items = [];
  // selectSubCat: any;
  // dataForPopUp: any;
  // singleItem: any;
  // pager: any = {};
  // pageNumber = 1;
  // pageSize = 10;
  // totalRows: number;
  // closeResult: string;
  // menuItemData: any;
  // menuItemList: any = [];
  // qty: any;
  // subTotal = 0;
  // subtotalTax = 0;
  // total = 0;
  // ItemIndex = 0;
  // tableNumber: any;
  // allCategory: any;
  // allItemsByApi: any;
  // orderType: any;
  // orderDetails: Array<{}> = [];
  // orderHistory: Array<{}> = [];
  // customerId: any;
  // placeOrderEnable = false;
  // categoryName: any;
  // orderId: any = null;
  // orderDataById: any;
  // runningOrder = false;
  // fromDine = false;
  // orderStatus: any;
  // itemsAllReadyTaken: any = [];
  // itemToBeAdded: Array<any> = [];
  // itemIndexOfModifier: any;
  // modifierData: any;
  // modifiedHistory: Array<{}> = [];
  // itemIndexForItemDiscount: any;
  // itemDiscountData: any;
  // taxData = [];
  // orderDiscAmount: any;
  // orderDisData: any;
  // taxCondition: any;
  // resId: any;
  // outletId: any;
  // orderNo: any;
  // show: boolean;
  // isCalled: boolean = false;
  // qtyDecrement: boolean = false;
  // searchInput: '';
  // allSearchCategorie: any;
  // searchInputItem: any;
  // subtractSub: boolean = false;
  // taxConditionVal: any;
  // isSecondCase: boolean = false;
  // fixedTotal = 0;
  // totalTax = 0;
  // itemTax = [];
  // itemsTaxData: any[];
  // remark: any;
  // voidPassword: any;
  // closepassword: any;
  // isCorrectPass = true;
  // Enteredpassword: any;
  // isRemoveItem = false;
  // numberofpeopleList = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12];
  // numberofpeople: any;
  // userForm: any = FormGroup;
  // userData: any;
  // oldTableNo: any;
  // customerDetails: any;
  // DisableAfterDiscount = false;

  // constructor(
  //   private loader: NgxUiLoaderService,
  //   private modalService: NgbModal,
  //   private posSharedService: PosSharedService,
  //   private loader: AlertService,
  //   private router: Router,
  //   private posDataService: PosDataService,
  //   private posDataShareService: PosDataShareService,
  //   private activeModal: NgbActiveModal,
  //   private formBuilder: FormBuilder,
  // ) { }

  // ngOnInit(): void {

  //   this.userForm = this.formBuilder.group({
  //     numberOfPeople: [1],
  //   });


  //   this.orderType = sessionStorage.getItem('orderType');
  //   this.userData = JSON.parse(sessionStorage.getItem('userCredential'));
  //   this.voidPassword = this.userData.voidPassword;
  //   let restData = JSON.parse(sessionStorage.getItem('restaurantData'));
  //   this.outletId = sessionStorage.getItem('activeOutletId');
  //   if (sessionStorage.getItem('activeRestaurantId') !== null && sessionStorage.getItem('activeRestaurantId') !== undefined) {
  //     this.resId = sessionStorage.getItem('activeRestaurantId');
  //   } else {
  //     this.resId = restData.restaurantId;
  //   }
  //   sessionStorage.setItem('opened', 'first');
  //   this.getAllMenuItems();
  //   this.getAllItems();

  //   setTimeout(() => {
  //     if (sessionStorage.getItem('PayNowFromDineIn') == 'payNow') {
  //       this.payNow();
  //     }
  //   }, 2000);
  // }
  // ngOnDestroy(): void {
  //   this.posSharedService.setSubCatItem(null);
  //   this.posSharedService.onSelectItem(0);
  // }


  // getAllCategories() {
  //   this.loader.startLoader('loader-01');
  //   this.posDataService.getAllCategoryByOutletId(this.outletId,false).subscribe((res: any) => {
  //     this.loader.stopLoader('loader-01');
  //     this.allCategory = res['data'];
  //     let showSuccess = res['success'];
  //     let msg = res['message'];
  //     if (showSuccess) {
  //       this.allSearchCategorie = this.allCategory;
  //       let row = 0;
  //       if (this.pageNumber == 1) {
  //         this.items = this.allCategory.slice(row, this.pageSize);
  //       }
  //       if (this.pageNumber > 1) {
  //         row = (row + this.pageNumber * this.pageSize) - this.pageSize
  //         this.items = this.allCategory.slice(row, this.pageSize * this.pageNumber);
  //       }
  //     }
  //     else {
  //       this.alertService.showError(msg);
  //     }
  //   });
  // }

  // getAllItems() {
  //   this.loader.startLoader('loader-01');
  //   let data = { outletId: this.outletId, IsAllItem: false }
  //   this.posDataService.getAllItemsByOutletId(data).subscribe((res: any) => {
  //     this.loader.stopLoader('loader-01');
  //     this.allItemsByApi = res['data'];
  //     this.allItemsByApi = this.allItemsByApi.filter(x => !x.isBatchRecipe);
  //     let showSuccess = res['success'];
  //     let msg = res['message'];
  //     if (!showSuccess) {
  //       this.alertService.showError(msg);
  //     }
  //   });
  // }

  // search(): void {

  //   let input = this.searchInput;
  //   if (input == '') {
  //     this.allSearchCategorie = this.allCategory;
  //   } else {
  //     this.allSearchCategorie = this.allCategory.filter((res: any) => {
  //       return res.categoryName.toLocaleLowerCase().match(input.toLocaleLowerCase());
  //     });
  //   }
  // }

  // searchItem(): void {
  //   let input = this.searchInputItem;
  //   if (input == '') {
  //     this.subCat = false;
  //   } else {
  //     this.subCat = true;
  //     this.selectSubCat = this.allItemsByApi.filter((res: any) => {
  //       return res.itemName.toLocaleLowerCase().match(input.toLocaleLowerCase());
  //     });
  //   }
  // }



  // private CheckTaxAndConditions(data: any) {
  //   for (let l = data.length - 1; l >= 0; l--) {
  //     if (!data[l].isDefault) {
  //       data.pop();
  //     }
  //   }
  //   this.taxCondition = data;

  //   if (this.taxCondition !== null) {
  //     this.CheckTaxConditionValues();
  //   }
  //   this.orderId = sessionStorage.getItem('orderId');
  //   this.tableNumber = sessionStorage.getItem('tableNo');
  //   this.orderType = sessionStorage.getItem('orderType');
  //   this.GetDataFromOtherComponent();
  // }

  // private GetDataFromOtherComponent() {
  //   this.posSharedService.currentCount.subscribe((res) => {
  //     this.menuItemData = res;
  //     this.getAddedItemData();
  //   });
  //   this.posDataShareService.modifier.subscribe((x: any) => {
  //     this.modifierData = x.modifiers;
  //     this.itemIndexOfModifier = x.index;
  //     this.addModifiersData();
  //   });
  //   this.posDataShareService.discount.subscribe((result: any) => {
  //     this.itemIndexForItemDiscount = result.index;
  //     this.itemDiscountData = result.discount;
  //     this.addItemDiscount();
  //   });
  // }

  // private CheckTaxConditionValues() {
  //   this.taxConditionVal = 0;
  //   if (this.taxCondition.isItemIncludeTax) {
  //     this.LoopTaxAndFindVATTax();
  //   }
  //   if (this.taxCondition.isSubtractFromSubTotal) {
  //     sessionStorage.setItem('isSubtracted' + this.orderId, 'true');

  //     this.subtractSub = true;
  //     this.taxConditionVal = 0;
  //   }
  // }

  // private LoopTaxAndFindVATTax() {
  //   for (let t = 0; t < this.taxData.length; t++) {
  //     if (this.taxData[t].taxName == 'VAT') {
  //       this.taxData.splice(t, 1);
  //     }
  //   }
  // }

  // getAllMenuItems() {
  //   this.getAllTaxesData();
  //   this.getAllCategories();
  // }
  // getAllTaxesData() {
  //   this.loader.startLoader('loader-01');
  //   this.posDataService.getTaxByOutletId(this.outletId,false).subscribe((res: any) => {

  //     this.loader.stopLoader('loader-01');
  //     let data = res['data'];
  //     for (let i = 0; i < data.length; i++) {
  //       let taxObj = {
  //         taxId: "",
  //         taxName: "",
  //         taxPercentage: [],
  //         taxAmount: 0,
  //         taxSelectedval: 0,
  //         isDefault: false
  //       };
  //       if (data.length !== 0) {
  //         taxObj.taxId = data[i].taxId;
  //         taxObj.taxName = data[i].taxName;
  //         taxObj.taxAmount = 0;
  //         taxObj.taxSelectedval = 0;
  //         let perData = data[i].taxPercentage;
  //         for (let j = 0; j < perData.length; j++) {
  //           let perObj = {
  //             taxPercentage: 0,
  //             isDefault: false,
  //             taxAmount: 0
  //           };
  //           if (perData.length !== 0) {
  //             perObj.taxPercentage = perData[j].taxPercentage;
  //             perObj.isDefault = perData[j].isDefault;
  //             perObj.taxAmount = 0;
  //           }
  //           taxObj.taxPercentage.push(perObj);
  //           taxObj.isDefault = perObj.isDefault;
  //         }
  //       }
  //       if (taxObj.isDefault) {
  //         this.taxData.push(taxObj);
  //       }
  //     }
  //     this.getTaxConditionData();
  //   });
  // }

  // getAddedItemData() {
  //   this.orderId = sessionStorage.getItem('orderId');
  //   if (this.orderId !== null && this.orderId !== 'null' && this.menuItemList.length == 0) {
  //     this.loader.startLoader('loader-01');
  //     this.posDataService.getOrderById(this.orderId).subscribe((res: any) => {
  //       this.loader.stopLoader('loader-01');
  //       this.orderDataById = res['data'];
  //       this.runningOrder = true;
  //       this.orderNo = this.orderDataById.orderNo;
  //       this.orderStatus = this.orderDataById?.orderStatus;
  //       this.itemsAllReadyTaken = [...this.orderDataById.items];
  //       this.customerDetails = {
  //         customerId: this.orderDataById.customerId,
  //         customerName: this.orderDataById.customerName
  //       }
  //       this.fromDine = true;

  //       this.userForm.patchValue({
  //         numberOfPeople: this.orderDataById.numberOfPeople != 0 ? this.orderDataById.numberOfPeople : 1,
  //       });
  //       this.numberofpeople = this.orderDataById.numberOfPeople;

  //       this.menuItemList = this.orderDataById.items;
  //       this.subTotal = 0;

  //       for (let k = 0; k < this.orderDataById.items.length; k++) {
  //         this.subTotal = this.subTotal + this.orderDataById.items[k].subTotal;
  //       }

  //       this.total = this.orderDataById.total;


  //       this.itemTax = [];

  //       for (let i = 0; i < this.menuItemList.length; i++) {



  //         this.itemTax.push(this.menuItemList[i].itemId);
  //         this.itemTax.push(this.menuItemList[i].orderQuantity);

  //       }

  //       let stringIds = this.itemTax.join(",");
  //       let discData = JSON.parse(sessionStorage.getItem('orderDiscount' + this.orderId));
  //       if (discData != null && discData != undefined)
  //         this.calcDiscount();
  //       else
  //         this.calculateTax(stringIds);
  //     });
  //   } else if (this.orderId !== null && this.orderId !== 'null' && this.menuItemList.length !== 0) {
  //     if (this.menuItemData !== undefined && this.menuItemData !== 0) {
  //       // let existingItem = this.menuItemList.find(x => x.itemId == this.menuItemData.itemId);
  //       // if (existingItem != null && existingItem != undefined && existingItem.itemStatus == 'Order') {
  //       //   //if (this.menuItemList.map(x => x.itemId).includes(this.menuItemData.itemId)) {
  //       //   let indx = this.menuItemList.map(function (x) { return x.itemId; }).indexOf(this.menuItemData.itemId);
  //       //   for (let i = 0; i < this.menuItemData.orderQuantity; i++) {
  //       //     this.quantityIncrement(indx);
  //       //   }
  //       // } else {
  //       this.menuItemList.push(this.menuItemData);
  //       this.alertService.showSuccess("Item have been Added");
  //       this.itemsAllReadyTaken.push(this.menuItemData);
  //       this.subTotal = 0;
  //       for (let i = 0; i < this.menuItemList.length; i++) {


  //         this.subTotal = this.subTotal + this.menuItemList[i].subTotal;
  //         this.total = this.subTotal;

  //         this.itemTax.push(this.menuItemList[i].itemId);
  //         this.itemTax.push(this.menuItemList[i].orderQuantity);
  //       }

  //       let stringIds = this.itemTax.join(",");
  //       let discData = JSON.parse(sessionStorage.getItem('orderDiscount' + this.orderId));
  //       if (discData != null && discData != undefined)
  //         this.calcDiscount();
  //       else
  //         this.calculateTax(stringIds);
  //       // }
  //     }
  //   } else {
  //     if (sessionStorage.getItem('tableOrder') !== 'open') {
  //       this.menuItemData = 0;
  //     }
  //     // let existingItem = this.menuItemList.find(x => x.itemId == this.menuItemData.itemId);
  //     // if (existingItem != null && existingItem != undefined && existingItem.itemStatus == 'Order') {
  //     //   //if (this.menuItemList.map(x => x.itemId).includes(this.menuItemData.itemId)) {
  //     //   let indx = this.menuItemList.map(function (x) { return x.itemId; }).indexOf(this.menuItemData.itemId);
  //     //   for (let i = 0; i < this.menuItemData.orderQuantity; i++) {
  //     //     this.quantityIncrement(indx);
  //     //   }
  //     // } else {
  //     if (this.menuItemData !== undefined && this.menuItemData !== 0) {
  //       this.placeOrderEnable = true;
  //       this.menuItemList.push(this.menuItemData);
  //       this.alertService.showSuccess("Item have been Added");
  //       this.subTotal = 0;

  //       this.itemTax = [];

  //       for (let i = 0; i < this.menuItemList.length; i++) {
  //         this.subTotal = this.subTotal + this.menuItemList[i].subTotal;
  //         this.total = this.subTotal;

  //         this.itemTax.push(this.menuItemList[i].itemId);
  //         this.itemTax.push(this.menuItemList[i].orderQuantity);
  //       }


  //       let stringIds = this.itemTax.join(",");
  //       let discData = JSON.parse(sessionStorage.getItem('orderDiscount' + this.orderId));
  //       if (discData != null && discData != undefined)
  //         this.calcDiscount();
  //       else
  //         this.calculateTax(stringIds);
  //     }
  //     // }
  //   }
  // }
  // removeModifier(itemIndex, modifIndex) {

  //   this.menuItemList[itemIndex].modifiers.splice(modifIndex, 1);
  //   let mod = this.menuItemList[itemIndex].modifiers;
  //   let len = this.menuItemList[itemIndex].modifiers.length;
  //   this.menuItemList[itemIndex].subTotal = this.menuItemList[itemIndex].orderQuantity * this.menuItemList[itemIndex].itemAmount;
  //   for (let i = 0; i < len; i++) {
  //     this.menuItemList[itemIndex].subTotal = this.menuItemList[itemIndex].subTotal + mod[i].price * this.menuItemList[i].orderQuantity;
  //   }
  //   this.CalculateTaxWithExistingItems();
  // }
  // private CalculateTaxWithExistingItems() {
  //   if (this.menuItemList.length != 0) {
  //     this.subTotal = 0;
  //     this.total = 0;
  //     for (let j = 0; j < this.menuItemList.length; j++) {
  //       this.subTotal = this.subTotal + this.menuItemList[j].subTotal;
  //       this.total = this.subTotal;
  //     }
  //     if (this.taxData.length !== 0) {
  //       this.LoopTaxAndCalculateTotalTax();
  //     }
  //     this.CalculateTaxFunction();
  //   }
  // }

  // private LoopTaxAndCalculateTotalTax() {
  //   let tax = this.taxData;
  //   for (let t = 0; t < tax.length; t++) {
  //     for (let v = 0; v < tax[t].taxPercentage.length; v++) {
  //       this.CheckTaxCondition(tax, t, v);
  //     }
  //   }
  // }

  // private CheckTaxCondition(tax: any[], t: number, v: number) {
  //   if (tax[t].taxPercentage[v].isDefault) {
  //     tax[t].taxSelectedval = tax[t].taxPercentage[v].taxPercentage;
  //     tax[t].taxAmount = (tax[t].taxPercentage[v].taxPercentage / 100 * this.subTotal).toFixed(2);
  //   }
  // }

  // addModifiersData() {

  //   let id = this.itemIndexOfModifier;
  //   if (this.orderId !== null) {
  //     if (sessionStorage.getItem('opened') == 'first') {
  //       this.modifierData = 0
  //     }
  //     if (this.modifierData !== 0) {
  //       this.menuItemList[id].modifiers = this.modifierData;
  //       this.menuItemList[id].subTotal = this.menuItemList[id].orderQuantity * this.menuItemList[id].itemAmount;
  //       let mod = this.menuItemList[id].modifiers;
  //       let len = this.menuItemList[id].modifiers.length;
  //       for (let i = 0; i < len; i++) {
  //         this.menuItemList[id].subTotal = this.menuItemList[id].subTotal + mod[i].price * this.menuItemList[id].orderQuantity;
  //       }
  //       if (this.menuItemList.length == 1) {
  //         this.subTotal = this.menuItemList[id].subTotal;
  //         this.total = this.subTotal;
  //         if (this.taxData) {

  //           let tax = this.taxData;
  //           for (let t = 0; t < tax.length; t++) {
  //             for (let v = 0; v < tax[t].taxPercentage.length; v++) {
  //               if (tax[t].taxPercentage[v].isDefault) {
  //                 tax[t].taxSelectedval = tax[t].taxPercentage[v].taxPercentage;
  //                 tax[t].taxAmount = Number(tax[t].taxPercentage[v].taxPercentage / 100 * this.subTotal).toFixed(2);
  //               }
  //             }
  //           }
  //         }

  //         this.CalculateTaxFunction();
  //       } else {
  //         this.subTotal = 0;
  //         this.total = 0;
  //         for (let j = 0; j < this.menuItemList.length; j++) {
  //           this.subTotal = this.subTotal + this.menuItemList[j].subTotal;
  //           this.total = this.subTotal;
  //         }
  //         if (this.taxData) {

  //           let tax = this.taxData;
  //           for (let t = 0; t < tax.length; t++) {
  //             for (let v = 0; v < tax[t].taxPercentage.length; v++) {
  //               if (tax[t].taxPercentage[v].isDefault) {
  //                 tax[t].taxSelectedval = tax[t].taxPercentage[v].taxPercentage;
  //                 tax[t].taxAmount = Number(tax[t].taxPercentage[v].taxPercentage / 100 * this.subTotal).toFixed(2);
  //               }
  //             }
  //           }
  //         }

  //         this.CalculateTaxFunction();
  //       }
  //     }
  //   } else {
  //     if (sessionStorage.getItem('tableOrder') !== 'open') {
  //       this.modifierData = 0;
  //     }
  //     if (this.modifierData !== 0 && this.modifierData !== undefined) {
  //       this.menuItemList[id].modifiers = this.modifierData;
  //       let mod = this.menuItemList[id].modifiers;
  //       let len = this.menuItemList[id].modifiers.length;
  //       for (let i = 0; i < len; i++) {
  //         this.menuItemList[id].subTotal = this.menuItemList[id].subTotal + mod[i].price * this.menuItemList[id].orderQuantity;
  //       }
  //       if (this.menuItemList.length == 1) {
  //         this.subTotal = this.menuItemList[id].subTotal;
  //         this.total = this.subTotal;
  //         if (this.taxData) {

  //           let tax = this.taxData;
  //           for (let t = 0; t < tax.length; t++) {
  //             for (let v = 0; v < tax[t].taxPercentage.length; v++) {
  //               if (tax[t].taxPercentage[v].isDefault) {
  //                 tax[t].taxSelectedval = tax[t].taxPercentage[v].taxPercentage;
  //                 tax[t].taxAmount = Number(tax[t].taxPercentage[v].taxPercentage / 100 * this.subTotal).toFixed(2);
  //               }
  //             }
  //           }
  //         }

  //         this.CalculateTaxFunction();
  //       } else {
  //         this.subTotal = 0;
  //         this.total = 0;
  //         for (let j = 0; j < this.menuItemList.length; j++) {
  //           this.subTotal = this.subTotal + this.menuItemList[j].subTotal;
  //           this.total = this.subTotal;
  //         }
  //         if (this.taxData) {
  //           let tax = this.taxData;
  //           for (let t = 0; t < tax.length; t++) {
  //             for (let v = 0; v < tax[t].taxPercentage.length; v++) {
  //               if (tax[t].taxPercentage[v].isDefault) {
  //                 tax[t].taxSelectedval = tax[t].taxPercentage[v].taxPercentage;
  //                 tax[t].taxAmount = Number(tax[t].taxPercentage[v].taxPercentage / 100 * this.subTotal).toFixed(2);
  //               }
  //             }
  //           }
  //         }
  //         if (this.taxCondition.isSubtractFromSubTotal) {

  //           this.taxConditionVal = Number(this.taxCondition.percentage / 100 * this.subTotal).toFixed(2);
  //           this.subtotalTax = this.subTotal - Number(this.taxConditionVal);
  //           this.total = Number(this.subtotalTax + Number(this.taxConditionVal));
  //         } else {
  //           this.total = this.subTotal;
  //         }
  //         for (let f = 0; f < this.taxData.length; f++) {

  //           if (this.taxData.length !== 0) {
  //             this.total = Number((Number(this.total) + Number(this.taxData[f].taxAmount)).toFixed(2));
  //           }
  //         }
  //       }
  //     }
  //   }
  // }
  // addItemDiscount() {

  //   if (this.orderId !== null) {
  //     if (sessionStorage.getItem('opened') == 'first') {
  //       this.itemDiscountData = 0;
  //     }
  //     if (this.itemDiscountData !== 0) {
  //       this.menuItemList[this.itemIndexForItemDiscount].discount = this.itemDiscountData;

  //       let mod = this.menuItemList[this.itemIndexForItemDiscount].discount;
  //       let len = this.menuItemList[this.itemIndexForItemDiscount].discount.length;
  //       for (let i = 0; i < len; i++) {
  //         if (mod[i].promocode == '') {
  //           this.menuItemList[this.itemIndexForItemDiscount].subTotal = this.menuItemList[this.itemIndexForItemDiscount].subTotal - mod[i].discountedAmount;
  //         } else {
  //           this.menuItemList[this.itemIndexForItemDiscount].subTotal = this.menuItemList[this.itemIndexForItemDiscount].subTotal - mod[i].promocodeAmount;
  //         }
  //       }
  //       if (this.menuItemList.length == 1) {
  //         this.subTotal = this.menuItemList[this.itemIndexForItemDiscount].subTotal;
  //         this.total = this.subTotal;
  //         if (this.taxData.length !== 0) {
  //           let tax = this.taxData;
  //           for (let t = 0; t < tax.length; t++) {
  //             for (let v = 0; v < tax[t].taxPercentage.length; v++) {
  //               if (tax[t].taxPercentage[v].isDefault) {
  //                 tax[t].taxSelectedval = tax[t].taxPercentage[v].taxPercentage;
  //                 tax[t].taxAmount = (tax[t].taxPercentage[v].taxPercentage / 100 * this.subTotal).toFixed(2);
  //               }
  //             }
  //           }
  //         }

  //         this.CalculateTaxFunction();
  //       } else {
  //         this.subTotal = 0;

  //         for (let j = 0; j < this.menuItemList.length; j++) {
  //           this.subTotal = this.subTotal + this.menuItemList[j].subTotal;

  //         }
  //         if (this.taxData.length !== 0) {
  //           let tax = this.taxData;
  //           for (let t = 0; t < tax.length; t++) {
  //             for (let v = 0; v < tax[t].taxPercentage.length; v++) {
  //               if (tax[t].taxPercentage[v].isDefault) {
  //                 tax[t].taxSelectedval = tax[t].taxPercentage[v].taxPercentage;
  //                 tax[t].taxAmount = (tax[t].taxPercentage[v].taxPercentage / 100 * this.subTotal).toFixed(2);
  //               }
  //             }
  //           }
  //         }
  //         this.CalculateTaxFunction();
  //       }
  //     }
  //   } else {

  //     if (sessionStorage.getItem('tableOrder') !== 'open') {
  //       this.itemDiscountData = 0;
  //     }
  //     if (this.itemDiscountData !== 0 && this.itemDiscountData !== undefined) {
  //       this.menuItemList[this.itemIndexForItemDiscount].discount = this.itemDiscountData;
  //       let mod = this.menuItemList[this.itemIndexForItemDiscount].discount;
  //       let len = this.menuItemList[this.itemIndexForItemDiscount].discount.length;
  //       for (let i = 0; i < len; i++) {
  //         if (mod[i].promocode == '') {
  //           this.menuItemList[this.itemIndexForItemDiscount].subTotal = this.menuItemList[this.itemIndexForItemDiscount].subTotal - mod[i].discountedAmount;
  //         } else {
  //           this.menuItemList[this.itemIndexForItemDiscount].subTotal = this.menuItemList[this.itemIndexForItemDiscount].subTotal - mod[i].promocodeAmount;
  //         }
  //       }
  //       if (this.menuItemList.length == 1) {
  //         this.subTotal = this.menuItemList[this.itemIndexForItemDiscount].subTotal;

  //         if (this.taxData.length !== 0) {
  //           let tax = this.taxData;
  //           for (let t = 0; t < tax.length; t++) {
  //             for (let v = 0; v < tax[t].taxPercentage.length; v++) {
  //               if (tax[t].taxPercentage[v].isDefault) {
  //                 tax[t].taxSelectedval = tax[t].taxPercentage[v].taxPercentage;
  //                 tax[t].taxAmount = (tax[t].taxPercentage[v].taxPercentage / 100 * this.subTotal).toFixed(2);
  //               }
  //             }
  //           }
  //         }

  //         this.CalculateTaxFunction();
  //       } else {
  //         this.subTotal = 0;
  //         this.total = 0;
  //         for (let j = 0; j < this.menuItemList.length; j++) {
  //           this.subTotal = this.subTotal + this.menuItemList[j].subTotal;

  //         }
  //         if (this.taxData.length !== 0) {
  //           let tax = this.taxData;
  //           for (let t = 0; t < tax.length; t++) {
  //             for (let v = 0; v < tax[t].taxPercentage.length; v++) {
  //               if (tax[t].taxPercentage[v].isDefault) {
  //                 tax[t].taxSelectedval = tax[t].taxPercentage[v].taxPercentage;
  //                 tax[t].taxAmount = (tax[t].taxPercentage[v].taxPercentage / 100 * this.subTotal).toFixed(2);
  //               }
  //             }
  //           }
  //         }

  //         this.CalculateTaxFunction();
  //       }
  //     }
  //   }
  // }
  // selectMenu(id: any, name: any) {
  //   this.categoryName = name;
  //   this.subCat = true;
  //   this.selectSubCat = this.allItemsByApi.filter(x => x.itemCategoryId == id);
  // }

  // backMenu() {
  //   this.subCat = false;
  // }

  // selectItem(itemData: any) {
  //   if (this.DisableAfterDiscount) {
  //     this.loader.showWarning("Remove applied discount to add item");
  //     return;
  //   }
  //   let subCat = this.selectSubCat;
  //   this.addSubCatItem = true;
  //   let getSingleItem = subCat.filter(x => x.id == itemData.id);
  //   this.singleItem = {
  //     item: getSingleItem[0],
  //     tableNo: this.tableNumber,
  //     ordertakenBy: this.userData.userName,
  //     tableType: sessionStorage.getItem('tableType')
  //   };
  //   let addItemObject = {
  //     itemId: itemData.id,
  //     itemName: itemData.itemName,
  //     orderQuantity: 1,
  //     taxId: itemData.taxId,
  //     itemCategory: itemData.itemCategoryId,
  //     itemSubCategory: itemData.categoryName,
  //     itemAmount: itemData.itemAmount,
  //     itemLocation: itemData.itemLocation,
  //     subTotal: itemData.itemAmount,
  //     isReadyMade: itemData.isReadyMade,
  //     orderTakenBy: this.userData.userName,
  //     tableNo: this.tableNumber,
  //     tableType: sessionStorage.getItem('tableType'),
  //     itemStatus: 'Order',
  //     modifiers: [],
  //     discount: [],
  //     categoryCourse: itemData.categoryCourse
  //   }
  //   this.menuItemData = addItemObject;
  //   sessionStorage.setItem('tableOrder', 'open');
  //   this.getAddedItemData();
  // }

  // private getDismissReason(reason: any): string {
  //   if (reason === ModalDismissReasons.ESC) {
  //     return 'by pressing ESC';
  //   } else if (reason === ModalDismissReasons.BACKDROP_CLICK) {
  //     return 'by clicking on a backdrop';
  //   } else {
  //     return `with: ${reason}`;
  //   }
  // }
  // onKey(e, i) {

  //   if (this.orderId !== null) {
  //     let val = e.target.value;
  //     let qtyVal = this.menuItemList[i].orderQuantity;
  //     if (val == 0) {
  //       this.alertService.showError("Minimum 1 Quantity");
  //       qtyVal = 1;
  //       this.menuItemList[i].subTotal = qtyVal * this.menuItemList[i].itemAmount;
  //       if (this.menuItemList[i].modifiers) {
  //         let mod = this.menuItemList[i].modifiers;
  //         let len = this.menuItemList[i].modifiers.length;
  //         for (let j = 0; j < len; j++) {

  //           this.menuItemList[i].subTotal = this.menuItemList[i].subTotal + qtyVal * mod[j].price;
  //         }
  //       }
  //       if (this.menuItemList[i].discount.length !== 0) {
  //         let mod = this.menuItemList[i].discount;
  //         let len = this.menuItemList[i].discount.length;
  //         for (let p = 0; p < len; p++) {
  //           if (mod[p].promocode == '') {
  //             let discountVal = mod[p].discountValue;
  //             if (mod[p].discountType == "Percentage") {
  //               mod[p].discountedAmount = (discountVal / 100 * this.menuItemList[i].subTotal).toFixed(2);
  //               this.menuItemList[i].subTotal = this.menuItemList[i].subTotal - mod[p].discountedAmount;
  //             } else {
  //               mod[p].discountedAmount = (qtyVal * discountVal).toFixed(2);
  //               this.menuItemList[i].subTotal = this.menuItemList[i].subTotal - mod[p].discountedAmount;
  //             }
  //           } else {
  //             let discountVal = mod[p].promocodeDiscount;
  //             if (mod[p].promocodeDiscountType == "Percentage") {
  //               mod[p].promocodeAmount = (discountVal / 100 * this.menuItemList[i].subTotal).toFixed(2);
  //               this.menuItemList[i].subTotal = this.menuItemList[i].subTotal - mod[p].promocodeAmount;
  //             } else {
  //               mod[p].promocodeAmount = (qtyVal * discountVal).toFixed(2);
  //               this.menuItemList[i].subTotal = this.menuItemList[i].subTotal - mod[p].promocodeAmount;
  //             }
  //           }
  //         }
  //       }
  //       if (this.menuItemList.length == 1) {
  //         this.subTotal = this.menuItemList[i].subTotal;

  //         if (this.taxData.length !== 0) {
  //           let tax = this.taxData;
  //           for (let t = 0; t < tax.length; t++) {
  //             for (let v = 0; v < tax[t].taxPercentage.length; v++) {
  //               if (tax[t].taxPercentage[v].isDefault) {
  //                 tax[t].taxSelectedval = tax[t].taxPercentage[v].taxPercentage;
  //                 tax[t].taxAmount = (tax[t].taxPercentage[v].taxPercentage / 100 * this.subTotal).toFixed(2);
  //               }
  //             }
  //           }
  //         }
  //         if (this.taxCondition.isSubtractFromSubTotal) {

  //           this.taxConditionVal = (this.taxCondition.percentage / 100 * this.subTotal).toFixed(2);
  //           this.subtotalTax = this.subTotal - Number(this.taxConditionVal);
  //           this.total = Number(this.subtotalTax + Number(this.taxConditionVal));
  //         } else {
  //           this.total = this.subTotal;
  //         }
  //         for (let f = 0; f < this.taxData.length; f++) {

  //           if (this.taxData.length !== 0) {
  //             this.total = Number((Number(this.total) + Number(this.taxData[f].taxAmount)).toFixed(2));
  //           }
  //         }
  //       } else {
  //         this.subTotal = 0;
  //         for (let j = 0; j < this.menuItemList.length; j++) {
  //           this.subTotal = this.subTotal + this.menuItemList[j].subTotal;

  //         }
  //         if (this.taxData.length !== 0) {
  //           let tax = this.taxData;
  //           for (let t = 0; t < tax.length; t++) {
  //             for (let v = 0; v < tax[t].taxPercentage.length; v++) {
  //               if (tax[t].taxPercentage[v].isDefault) {
  //                 tax[t].taxSelectedval = tax[t].taxPercentage[v].taxPercentage;
  //                 tax[t].taxAmount = (tax[t].taxPercentage[v].taxPercentage / 100 * this.subTotal).toFixed(2);
  //               }
  //             }
  //           }
  //         }
  //         if (this.taxCondition.isSubtractFromSubTotal) {

  //           this.taxConditionVal = (this.taxCondition.percentage / 100 * this.subTotal).toFixed(2);
  //           this.subtotalTax = this.subTotal - Number(this.taxConditionVal);
  //           this.total = Number(this.subtotalTax + Number(this.taxConditionVal));
  //         } else {
  //           this.total = this.subTotal;
  //         }
  //         for (let f = 0; f < this.taxData.length; f++) {

  //           if (this.taxData.length !== 0) {
  //             this.total = Number((Number(this.total) + Number(this.taxData[f].taxAmount)).toFixed(2));
  //           }
  //         }
  //       }
  //     } else if (val < qtyVal) {
  //       qtyVal = val;
  //       if (this.menuItemList[i].id) {
  //         let data = {
  //           modifiedItem: this.menuItemList[i].itemName,
  //           modifiedToItem: this.menuItemList[i].itemName,
  //           modifiedBy: "",

  //           reason: "Quantity Reduced"
  //         }
  //         this.modifiedHistory.push(data);
  //         this.menuItemList[i].orderQuantity = qtyVal;
  //         this.menuItemList[i].subTotal = qtyVal * this.menuItemList[i].itemAmount;
  //         let qval = qtyVal;
  //         let arrqty = 0;
  //         let QtyM = 0;
  //         for (let r = 0; r < this.itemsAllReadyTaken.length; r++) {
  //           if (this.menuItemList[i].id == this.itemsAllReadyTaken[r].id) {
  //             if (arrqty == 0) {
  //               arrqty = this.itemsAllReadyTaken[r].orderQuantity;
  //               QtyM = arrqty - qval;
  //             } else {
  //               arrqty = arrqty + this.itemsAllReadyTaken[r].orderQuantity;
  //               QtyM = arrqty - qval;
  //             }
  //             if (QtyM == 1) {
  //               if (this.itemsAllReadyTaken[r].orderQuantity == 1) {
  //                 this.itemsAllReadyTaken.splice(r, 1);

  //                 QtyM = 0;
  //               } else if (this.itemsAllReadyTaken[r].orderQuantity > 1) {
  //                 this.itemsAllReadyTaken[r].orderQuantity = this.itemsAllReadyTaken[r].orderQuantity - 1;
  //                 this.itemsAllReadyTaken[r].subTotal = this.itemsAllReadyTaken[r].orderQuantity * this.itemsAllReadyTaken[r].itemAmount;
  //                 QtyM = 0;

  //                 if (this.itemsAllReadyTaken[r].modifiers) {
  //                   let mod = this.itemsAllReadyTaken[r].modifiers;
  //                   let len = this.itemsAllReadyTaken[r].modifiers.length;
  //                   for (let j = 0; j < len; j++) {
  //                     this.itemsAllReadyTaken[r].subTotal = this.itemsAllReadyTaken[r].subTotal + this.itemsAllReadyTaken[r].orderQuantity * mod[j].price;
  //                   }
  //                 }
  //                 if (this.itemsAllReadyTaken[r].discount.length !== 0) {
  //                   let mod = this.itemsAllReadyTaken[r].discount;
  //                   let len = this.itemsAllReadyTaken[r].discount.length;
  //                   for (let p = 0; p < len; p++) {
  //                     if (mod[p].promocode == '') {
  //                       let discountVal = mod[p].discountValue;
  //                       if (mod[p].discountType == "Percentage") {
  //                         mod[p].discountedAmount = (discountVal / 100 * this.itemsAllReadyTaken[r].subTotal).toFixed(2);
  //                         this.itemsAllReadyTaken[r].subTotal = this.itemsAllReadyTaken[i].subTotal - mod[p].discountedAmount;
  //                       } else {
  //                         mod[p].discountedAmount = (this.itemsAllReadyTaken[r].orderQuantity * discountVal).toFixed(2);
  //                         this.itemsAllReadyTaken[i].subTotal = this.itemsAllReadyTaken[i].subTotal - mod[p].discountedAmount;
  //                       }
  //                     } else {
  //                       let discountVal = mod[p].promocodeDiscount;
  //                       if (mod[p].promocodeDiscountType == "Percentage") {
  //                         mod[p].promocodeAmount = (discountVal / 100 * this.itemsAllReadyTaken[r].subTotal).toFixed(2);
  //                         this.itemsAllReadyTaken[r].subTotal = this.itemsAllReadyTaken[r].subTotal - mod[p].promocodeAmount;
  //                       } else {
  //                         mod[p].promocodeAmount = (this.itemsAllReadyTaken[r].orderQuantity * discountVal).toFixed(2);
  //                         this.itemsAllReadyTaken[r].subTotal = this.itemsAllReadyTaken[r].subTotal - mod[p].promocodeAmount;
  //                       }
  //                     }
  //                   }
  //                 }
  //               }
  //             } else if (QtyM > 1) {
  //               if (this.itemsAllReadyTaken[r].orderQuantity == 1) {
  //                 this.itemsAllReadyTaken.splice(r, 1);

  //                 QtyM = QtyM - 1;
  //               } else if (this.itemsAllReadyTaken[r].orderQuantity > 1) {
  //                 if (this.itemsAllReadyTaken[r].orderQuantity > QtyM) {
  //                   this.itemsAllReadyTaken[r].orderQuantity = this.itemsAllReadyTaken[r].orderQuantity - QtyM;
  //                   this.itemsAllReadyTaken[r].subTotal = this.itemsAllReadyTaken[r].orderQuantity * this.itemsAllReadyTaken[r].itemAmount;
  //                   QtyM = 0;

  //                   if (this.itemsAllReadyTaken[r].modifiers) {
  //                     let mod = this.itemsAllReadyTaken[r].modifiers;
  //                     let len = this.itemsAllReadyTaken[r].modifiers.length;
  //                     for (let j = 0; j < len; j++) {
  //                       this.itemsAllReadyTaken[r].subTotal = this.itemsAllReadyTaken[r].subTotal + this.itemsAllReadyTaken[r].orderQuantity * mod[j].price;
  //                     }
  //                   }
  //                   if (this.itemsAllReadyTaken[r].discount.length !== 0) {
  //                     let mod = this.itemsAllReadyTaken[r].discount;
  //                     let len = this.itemsAllReadyTaken[r].discount.length;
  //                     for (let p = 0; p < len; p++) {
  //                       if (mod[p].promocode == '') {
  //                         let discountVal = mod[p].discountValue;
  //                         if (mod[p].discountType == "Percentage") {
  //                           mod[p].discountedAmount = (discountVal / 100 * this.itemsAllReadyTaken[r].subTotal).toFixed(2);
  //                           this.itemsAllReadyTaken[r].subTotal = this.itemsAllReadyTaken[i].subTotal - mod[p].discountedAmount;
  //                         } else {
  //                           mod[p].discountedAmount = (this.itemsAllReadyTaken[r].orderQuantity * discountVal).toFixed(2);
  //                           this.itemsAllReadyTaken[i].subTotal = this.itemsAllReadyTaken[i].subTotal - mod[p].discountedAmount;
  //                         }
  //                       } else {
  //                         let discountVal = mod[p].promocodeDiscount;
  //                         if (mod[p].promocodeDiscountType == "Percentage") {
  //                           mod[p].promocodeAmount = (discountVal / 100 * this.itemsAllReadyTaken[r].subTotal).toFixed(2);
  //                           this.itemsAllReadyTaken[r].subTotal = this.itemsAllReadyTaken[r].subTotal - mod[p].promocodeAmount;
  //                         } else {
  //                           mod[p].promocodeAmount = (this.itemsAllReadyTaken[r].orderQuantity * discountVal).toFixed(2);
  //                           this.itemsAllReadyTaken[r].subTotal = this.itemsAllReadyTaken[r].subTotal - mod[p].promocodeAmount;
  //                         }
  //                       }
  //                     }
  //                   }
  //                 } else if (this.itemsAllReadyTaken[r].orderQuantity < QtyM) {
  //                   let qv = QtyM - this.itemsAllReadyTaken[r].orderQuantity;
  //                   this.itemsAllReadyTaken[r].orderQuantity = this.itemsAllReadyTaken[r].orderQuantity - QtyM;
  //                   this.itemsAllReadyTaken.splice(r, 1);
  //                   QtyM = qv;
  //                 }
  //               }
  //             }
  //           }
  //         }


  //         if (this.menuItemList[i].modifiers) {
  //           let mod = this.menuItemList[i].modifiers;

  //           let len = this.menuItemList[i].modifiers.length;
  //           for (let j = 0; j < len; j++) {


  //             this.menuItemList[i].subTotal = this.menuItemList[i].subTotal + qtyVal * mod[j].price;

  //           }
  //         }
  //         if (this.menuItemList[i].discount.length !== 0) {
  //           let mod = this.menuItemList[i].discount;
  //           let len = this.menuItemList[i].discount.length;
  //           for (let p = 0; p < len; p++) {
  //             if (mod[p].promocode == '') {
  //               let discountVal = mod[p].discountValue;
  //               if (mod[p].discountType == "Percentage") {
  //                 mod[p].discountedAmount = (discountVal / 100 * this.menuItemList[i].subTotal).toFixed(2);
  //                 this.menuItemList[i].subTotal = this.menuItemList[i].subTotal - mod[p].discountedAmount;
  //               } else {
  //                 mod[p].discountedAmount = (qtyVal * discountVal).toFixed(2);
  //                 this.menuItemList[i].subTotal = this.menuItemList[i].subTotal - mod[p].discountedAmount;
  //               }
  //             } else {
  //               let discountVal = mod[p].promocodeDiscount;
  //               if (mod[p].promocodeDiscountType == "Percentage") {
  //                 mod[p].promocodeAmount = (discountVal / 100 * this.menuItemList[i].subTotal).toFixed(2);
  //                 this.menuItemList[i].subTotal = this.menuItemList[i].subTotal - mod[p].promocodeAmount;
  //               } else {
  //                 mod[p].promocodeAmount = (qtyVal * discountVal).toFixed(2);
  //                 this.menuItemList[i].subTotal = this.menuItemList[i].subTotal - mod[p].promocodeAmount;
  //               }
  //             }
  //           }
  //         }

  //         if (this.menuItemList.length == 1) {
  //           this.subTotal = this.menuItemList[i].subTotal;

  //           if (this.taxData.length !== 0) {
  //             let tax = this.taxData;
  //             for (let t = 0; t < tax.length; t++) {
  //               for (let v = 0; v < tax[t].taxPercentage.length; v++) {
  //                 if (tax[t].taxPercentage[v].isDefault) {
  //                   tax[t].taxSelectedval = tax[t].taxPercentage[v].taxPercentage;
  //                   tax[t].taxAmount = (tax[t].taxPercentage[v].taxPercentage / 100 * this.subTotal).toFixed(2);
  //                 }
  //               }
  //             }
  //           }
  //           if (this.taxCondition.isSubtractFromSubTotal) {

  //             this.taxConditionVal = (this.taxCondition.percentage / 100 * this.subTotal).toFixed(2);
  //             this.subtotalTax = this.subTotal - Number(this.taxConditionVal);
  //             this.total = Number(this.subtotalTax + Number(this.taxConditionVal));
  //           } else {
  //             this.total = this.subTotal;
  //           }
  //           for (let f = 0; f < this.taxData.length; f++) {

  //             if (this.taxData.length !== 0) {
  //               this.total = Number((Number(this.total) + Number(this.taxData[f].taxAmount)).toFixed(2));
  //             }
  //           }
  //         } else {
  //           this.subTotal = 0;
  //           for (let j = 0; j < this.menuItemList.length; j++) {
  //             this.subTotal = this.subTotal + this.menuItemList[j].subTotal;

  //             if (this.taxData.length !== 0) {
  //               let tax = this.taxData;
  //               for (let t = 0; t < tax.length; t++) {
  //                 for (let v = 0; v < tax[t].taxPercentage.length; v++) {
  //                   if (tax[t].taxPercentage[v].isDefault) {
  //                     tax[t].taxSelectedval = tax[t].taxPercentage[v].taxPercentage;
  //                     tax[t].taxAmount = (tax[t].taxPercentage[v].taxPercentage / 100 * this.subTotal).toFixed(2);
  //                   }
  //                 }
  //               }
  //             }
  //             if (this.taxCondition.isSubtractFromSubTotal) {

  //               this.taxConditionVal = (this.taxCondition.percentage / 100 * this.subTotal).toFixed(2);
  //               this.subtotalTax = this.subTotal - Number(this.taxConditionVal);
  //               this.total = Number(this.subtotalTax + Number(this.taxConditionVal));
  //             } else {
  //               this.total = this.subTotal;
  //             }
  //             for (let f = 0; f < this.taxData.length; f++) {

  //               if (this.taxData.length !== 0) {
  //                 this.total = Number((Number(this.total) + Number(this.taxData[f].taxAmount)).toFixed(2));
  //               }
  //             }
  //           }
  //         }
  //       } else {
  //         this.menuItemList[i].orderQuantity = qtyVal;
  //         this.menuItemList[i].subTotal = qtyVal * this.menuItemList[i].itemAmount;
  //         this.itemsAllReadyTaken[i].orderQuantity = qtyVal;
  //         this.itemsAllReadyTaken[i].subTotal = qtyVal * this.itemsAllReadyTaken[i].itemAmount;
  //         if (this.menuItemList[i].modifiers) {
  //           let mod = this.menuItemList[i].modifiers;

  //           let len = this.menuItemList[i].modifiers.length;
  //           for (let j = 0; j < len; j++) {


  //             this.menuItemList[i].subTotal = this.menuItemList[i].subTotal + qtyVal * mod[j].price;

  //           }
  //         }
  //         if (this.menuItemList[i].discount.length !== 0) {
  //           let mod = this.menuItemList[i].discount;
  //           let len = this.menuItemList[i].discount.length;
  //           for (let p = 0; p < len; p++) {
  //             if (mod[p].promocode == '') {
  //               let discountVal = mod[p].discountValue;
  //               if (mod[p].discountType == "Percentage") {
  //                 mod[p].discountedAmount = (discountVal / 100 * this.menuItemList[i].subTotal).toFixed(2);
  //                 this.menuItemList[i].subTotal = this.menuItemList[i].subTotal - mod[p].discountedAmount;
  //               } else {
  //                 mod[p].discountedAmount = (qtyVal * discountVal).toFixed(2);
  //                 this.menuItemList[i].subTotal = this.menuItemList[i].subTotal - mod[p].discountedAmount;
  //               }
  //             } else {
  //               let discountVal = mod[p].promocodeDiscount;
  //               if (mod[p].promocodeDiscountType == "Percentage") {
  //                 mod[p].promocodeAmount = (discountVal / 100 * this.menuItemList[i].subTotal).toFixed(2);
  //                 this.menuItemList[i].subTotal = this.menuItemList[i].subTotal - mod[p].promocodeAmount;
  //               } else {
  //                 mod[p].promocodeAmount = (qtyVal * discountVal).toFixed(2);
  //                 this.menuItemList[i].subTotal = this.menuItemList[i].subTotal - mod[p].promocodeAmount;
  //               }
  //             }
  //           }
  //         }
  //         this.itemsAllReadyTaken[i].subTotal = this.menuItemList[i].subTotal;
  //         if (this.menuItemList.length == 1) {
  //           this.subTotal = this.menuItemList[i].subTotal;

  //           if (this.taxData.length !== 0) {
  //             let tax = this.taxData;
  //             for (let t = 0; t < tax.length; t++) {
  //               for (let v = 0; v < tax[t].taxPercentage.length; v++) {
  //                 if (tax[t].taxPercentage[v].isDefault) {
  //                   tax[t].taxSelectedval = tax[t].taxPercentage[v].taxPercentage;
  //                   tax[t].taxAmount = (tax[t].taxPercentage[v].taxPercentage / 100 * this.subTotal).toFixed(2);
  //                 }
  //               }
  //             }
  //           }
  //           if (this.taxCondition.isSubtractFromSubTotal) {

  //             this.taxConditionVal = (this.taxCondition.percentage / 100 * this.subTotal).toFixed(2);
  //             this.subtotalTax = this.subTotal - Number(this.taxConditionVal);
  //             this.total = Number(this.subtotalTax + Number(this.taxConditionVal));
  //           } else {
  //             this.total = this.subTotal;
  //           }
  //           for (let f = 0; f < this.taxData.length; f++) {

  //             if (this.taxData.length !== 0) {
  //               this.total = Number((Number(this.total) + Number(this.taxData[f].taxAmount)).toFixed(2));
  //             }
  //           }
  //         } else {
  //           this.subTotal = 0;
  //           for (let j = 0; j < this.menuItemList.length; j++) {
  //             this.subTotal = this.subTotal + this.menuItemList[j].subTotal;

  //           }
  //           if (this.taxData.length !== 0) {
  //             let tax = this.taxData;
  //             for (let t = 0; t < tax.length; t++) {
  //               for (let v = 0; v < tax[t].taxPercentage.length; v++) {
  //                 if (tax[t].taxPercentage[v].isDefault) {
  //                   tax[t].taxSelectedval = tax[t].taxPercentage[v].taxPercentage;
  //                   tax[t].taxAmount = (tax[t].taxPercentage[v].taxPercentage / 100 * this.subTotal).toFixed(2);
  //                 }
  //               }
  //             }
  //           }
  //           if (this.taxCondition.isSubtractFromSubTotal) {

  //             this.taxConditionVal = (this.taxCondition.percentage / 100 * this.subTotal).toFixed(2);
  //             this.subtotalTax = this.subTotal - Number(this.taxConditionVal);
  //             this.total = Number(this.subtotalTax + Number(this.taxConditionVal));
  //           } else {
  //             this.total = this.subTotal;
  //           }
  //           for (let f = 0; f < this.taxData.length; f++) {

  //             if (this.taxData.length !== 0) {
  //               this.total = Number((Number(this.total) + Number(this.taxData[f].taxAmount)).toFixed(2));
  //             }
  //           }
  //         }
  //       }
  //     } else if (val > qtyVal) {
  //       qtyVal = val;
  //       let temp = this.menuItemList[i].orderQuantity;

  //       if (this.menuItemList[i].id) {
  //         let itemToAdd = {
  //           id: this.menuItemList[i].id,
  //           isReadyMade: this.menuItemList[i].isReadyMade,
  //           itemAmount: this.menuItemList[i].itemAmount,
  //           itemCategory: this.menuItemList[i].itemCategory,
  //           itemDiscountAmount: this.menuItemList[i].itemDiscountAmount,
  //           itemDiscountType: this.menuItemList[i].itemDiscountType,
  //           itemDiscountValue: this.menuItemList[i].itemDiscountValue,
  //           itemId: this.menuItemList[i].itemId,
  //           taxId: this.menuItemList[i].taxId,
  //           itemName: this.menuItemList[i].itemName,
  //           itemStatus: this.menuItemList[i].itemStatus,
  //           itemSubCategory: this.menuItemList[i].itemSubCategory,
  //           modifiers: this.menuItemList[i].modifiers,
  //           discount: this.menuItemList[i].discount,
  //           notes: this.menuItemList[i].notes,
  //           orderQuantity: this.menuItemList[i].orderQuantity,
  //           orderTakenBy: this.menuItemList[i].orderTakenBy,
  //           statusChangeTime: this.menuItemList[i].statusChangeTime,
  //           subTotal: this.menuItemList[i].subTotal,
  //           tableNo: this.menuItemList[i].tableNo,
  //           tableType: this.menuItemList[i].tableType,
  //         };
  //         itemToAdd.orderQuantity = qtyVal - temp;
  //         itemToAdd.subTotal = itemToAdd.orderQuantity * itemToAdd.itemAmount;
  //         if (itemToAdd.modifiers) {
  //           let modifi = itemToAdd.modifiers;
  //           let leng = itemToAdd.modifiers.length;
  //           for (let h = 0; h < leng; h++) {


  //             itemToAdd.subTotal = itemToAdd.subTotal + itemToAdd.orderQuantity * modifi[h].price;

  //           }
  //         }
  //         if (itemToAdd.discount.length !== 0) {
  //           let mod = itemToAdd.discount;
  //           let len = itemToAdd.discount.length;
  //           for (let p = 0; p < len; p++) {
  //             if (mod[p].promocode == '') {
  //               let discountVal = mod[p].discountValue;
  //               if (mod[p].discountType == "Percentage") {
  //                 mod[p].discountedAmount = (discountVal / 100 * itemToAdd.subTotal).toFixed(2);
  //                 itemToAdd.subTotal = itemToAdd.subTotal - mod[p].discountedAmount;
  //               } else {
  //                 mod[p].discountedAmount = (qtyVal * discountVal).toFixed(2);
  //                 itemToAdd.subTotal = itemToAdd.subTotal - mod[p].discountedAmount;
  //               }
  //             } else {
  //               let discountVal = mod[p].promocodeDiscount;
  //               if (mod[p].promocodeDiscountType == "Percentage") {
  //                 mod[p].promocodeAmount = (discountVal / 100 * itemToAdd.subTotal).toFixed(2);
  //                 itemToAdd.subTotal = itemToAdd.subTotal - mod[p].promocodeAmount;
  //               } else {
  //                 mod[p].promocodeAmount = (qtyVal * discountVal).toFixed(2);
  //                 itemToAdd.subTotal = itemToAdd.subTotal - mod[p].promocodeAmount;
  //               }
  //             }
  //           }
  //         }
  //         this.itemToBeAdded.push(itemToAdd);
  //         this.menuItemList[i].orderQuantity = qtyVal;
  //         this.menuItemList[i].subTotal = qtyVal * this.menuItemList[i].itemAmount;
  //         if (this.menuItemList[i].modifiers) {
  //           let mod = this.menuItemList[i].modifiers;

  //           let len = this.menuItemList[i].modifiers.length;
  //           for (let j = 0; j < len; j++) {


  //             this.menuItemList[i].subTotal = this.menuItemList[i].subTotal + qtyVal * mod[j].price;

  //           }
  //         }
  //         if (this.menuItemList.length == 1) {
  //           this.subTotal = this.menuItemList[i].subTotal;

  //           if (this.taxData.length !== 0) {
  //             let tax = this.taxData;
  //             for (let t = 0; t < tax.length; t++) {
  //               for (let v = 0; v < tax[t].taxPercentage.length; v++) {
  //                 if (tax[t].taxPercentage[v].isDefault) {
  //                   tax[t].taxSelectedval = tax[t].taxPercentage[v].taxPercentage;
  //                   tax[t].taxAmount = (tax[t].taxPercentage[v].taxPercentage / 100 * this.subTotal).toFixed(2);
  //                 }
  //               }
  //             }
  //           }
  //           if (this.taxCondition.isSubtractFromSubTotal) {

  //             this.taxConditionVal = (this.taxCondition.percentage / 100 * this.subTotal).toFixed(2);
  //             this.subtotalTax = this.subTotal - Number(this.taxConditionVal);
  //             this.total = Number(this.subtotalTax + Number(this.taxConditionVal));
  //           } else {
  //             this.total = this.subTotal;
  //           }
  //           for (let f = 0; f < this.taxData.length; f++) {

  //             if (this.taxData.length !== 0) {
  //               this.total = Number((Number(this.total) + Number(this.taxData[f].taxAmount)).toFixed(2));
  //             }
  //           }
  //         } else {
  //           this.subTotal = 0;
  //           for (let j = 0; j < this.menuItemList.length; j++) {
  //             this.subTotal = this.subTotal + this.menuItemList[j].subTotal;

  //           }
  //           if (this.taxData.length !== 0) {
  //             let tax = this.taxData;
  //             for (let t = 0; t < tax.length; t++) {
  //               for (let v = 0; v < tax[t].taxPercentage.length; v++) {
  //                 if (tax[t].taxPercentage[v].isDefault) {
  //                   tax[t].taxSelectedval = tax[t].taxPercentage[v].taxPercentage;
  //                   tax[t].taxAmount = (tax[t].taxPercentage[v].taxPercentage / 100 * this.subTotal).toFixed(2);
  //                 }
  //               }
  //             }
  //           }
  //           if (this.taxCondition.isSubtractFromSubTotal) {

  //             this.taxConditionVal = (this.taxCondition.percentage / 100 * this.subTotal).toFixed(2);
  //             this.subtotalTax = this.subTotal - Number(this.taxConditionVal);
  //             this.total = Number(this.subtotalTax + Number(this.taxConditionVal));
  //           } else {
  //             this.total = this.subTotal;
  //           }
  //           for (let f = 0; f < this.taxData.length; f++) {

  //             if (this.taxData.length !== 0) {
  //               this.total = Number((Number(this.total) + Number(this.taxData[f].taxAmount)).toFixed(2));
  //             }
  //           }
  //         }
  //       } else {
  //         this.menuItemList[i].orderQuantity = qtyVal;
  //         this.menuItemList[i].subTotal = qtyVal * this.menuItemList[i].itemAmount;
  //         this.itemsAllReadyTaken[i].orderQuantity = qtyVal;
  //         this.itemsAllReadyTaken[i].subTotal = qtyVal * this.itemsAllReadyTaken[i].itemAmount;
  //         if (this.menuItemList[i].modifiers) {
  //           let mod = this.menuItemList[i].modifiers;

  //           let len = this.menuItemList[i].modifiers.length;
  //           for (let j = 0; j < len; j++) {


  //             this.menuItemList[i].subTotal = this.menuItemList[i].subTotal + qtyVal * mod[j].price;

  //           }
  //         }
  //         if (this.menuItemList[i].discount.length !== 0) {
  //           let mod = this.menuItemList[i].discount;
  //           let len = this.menuItemList[i].discount.length;
  //           for (let p = 0; p < len; p++) {
  //             if (mod[p].promocode == '') {
  //               let discountVal = mod[p].discountValue;
  //               if (mod[p].discountType == "Percentage") {
  //                 mod[p].discountedAmount = (discountVal / 100 * this.menuItemList[i].subTotal).toFixed(2);
  //                 this.menuItemList[i].subTotal = this.menuItemList[i].subTotal - mod[p].discountedAmount;
  //               } else {
  //                 mod[p].discountedAmount = (qtyVal * discountVal).toFixed(2);
  //                 this.menuItemList[i].subTotal = this.menuItemList[i].subTotal - mod[p].discountedAmount;
  //               }
  //             } else {
  //               let discountVal = mod[p].promocodeDiscount;
  //               if (mod[p].promocodeDiscountType == "Percentage") {
  //                 mod[p].promocodeAmount = (discountVal / 100 * this.menuItemList[i].subTotal).toFixed(2);
  //                 this.menuItemList[i].subTotal = this.menuItemList[i].subTotal - mod[p].promocodeAmount;
  //               } else {
  //                 mod[p].promocodeAmount = (qtyVal * discountVal).toFixed(2);
  //                 this.menuItemList[i].subTotal = this.menuItemList[i].subTotal - mod[p].promocodeAmount;
  //               }
  //             }
  //           }
  //         }
  //         this.itemsAllReadyTaken[i].subTotal = this.menuItemList[i].subTotal;
  //         if (this.menuItemList.length == 1) {
  //           this.subTotal = this.menuItemList[i].subTotal;

  //           if (this.taxData.length !== 0) {
  //             let tax = this.taxData;
  //             for (let t = 0; t < tax.length; t++) {
  //               for (let v = 0; v < tax[t].taxPercentage.length; v++) {
  //                 if (tax[t].taxPercentage[v].isDefault) {
  //                   tax[t].taxSelectedval = tax[t].taxPercentage[v].taxPercentage;
  //                   tax[t].taxAmount = (tax[t].taxPercentage[v].taxPercentage / 100 * this.subTotal).toFixed(2);
  //                 }
  //               }
  //             }
  //           }
  //           if (this.taxCondition.isSubtractFromSubTotal) {

  //             this.taxConditionVal = (this.taxCondition.percentage / 100 * this.subTotal).toFixed(2);
  //             this.subtotalTax = this.subTotal - Number(this.taxConditionVal);
  //             this.total = Number(this.subtotalTax + Number(this.taxConditionVal));
  //           } else {
  //             this.total = this.subTotal;
  //           }
  //           for (let f = 0; f < this.taxData.length; f++) {

  //             if (this.taxData.length !== 0) {
  //               this.total = Number((Number(this.total) + Number(this.taxData[f].taxAmount)).toFixed(2));
  //             }
  //           }
  //         } else {
  //           this.subTotal = 0;
  //           for (let j = 0; j < this.menuItemList.length; j++) {
  //             this.subTotal = this.subTotal + this.menuItemList[j].subTotal;

  //           }
  //           if (this.taxData.length !== 0) {
  //             let tax = this.taxData;
  //             for (let t = 0; t < tax.length; t++) {
  //               for (let v = 0; v < tax[t].taxPercentage.length; v++) {
  //                 if (tax[t].taxPercentage[v].isDefault) {
  //                   tax[t].taxSelectedval = tax[t].taxPercentage[v].taxPercentage;
  //                   tax[t].taxAmount = (tax[t].taxPercentage[v].taxPercentage / 100 * this.subTotal).toFixed(2);
  //                 }
  //               }
  //             }
  //           }
  //           if (this.taxCondition.isSubtractFromSubTotal) {

  //             this.taxConditionVal = (this.taxCondition.percentage / 100 * this.subTotal).toFixed(2);
  //             this.subtotalTax = this.subTotal - Number(this.taxConditionVal);
  //             this.total = Number(this.subtotalTax + Number(this.taxConditionVal));
  //           } else {
  //             this.total = this.subTotal;
  //           }
  //           for (let f = 0; f < this.taxData.length; f++) {

  //             if (this.taxData.length !== 0) {
  //               this.total = Number((Number(this.total) + Number(this.taxData[f].taxAmount)).toFixed(2));
  //             }
  //           }
  //         }
  //       }
  //     } else {
  //       this.alertService.showError("Minimum 1 Quantity");
  //       if (this.menuItemList.length == 1) {
  //         this.subTotal = this.menuItemList[i].subTotal;

  //         if (this.taxData.length !== 0) {
  //           let tax = this.taxData;
  //           for (let t = 0; t < tax.length; t++) {
  //             for (let v = 0; v < tax[t].taxPercentage.length; v++) {
  //               if (tax[t].taxPercentage[v].isDefault) {
  //                 tax[t].taxSelectedval = tax[t].taxPercentage[v].taxPercentage;
  //                 tax[t].taxAmount = (tax[t].taxPercentage[v].taxPercentage / 100 * this.subTotal).toFixed(2);
  //               }
  //             }
  //           }
  //         }
  //         if (this.taxCondition.isSubtractFromSubTotal) {

  //           this.taxConditionVal = (this.taxCondition.percentage / 100 * this.subTotal).toFixed(2);
  //           this.subtotalTax = this.subTotal - Number(this.taxConditionVal);
  //           this.total = Number(this.subtotalTax + Number(this.taxConditionVal));
  //         } else {
  //           this.total = this.subTotal;
  //         }
  //         for (let f = 0; f < this.taxData.length; f++) {

  //           if (this.taxData.length !== 0) {
  //             this.total = Number((Number(this.total) + Number(this.taxData[f].taxAmount)).toFixed(2));
  //           }
  //         }
  //       } else {
  //         this.subTotal = 0;
  //         for (let j = 0; j < this.menuItemList.length; j++) {
  //           this.subTotal = this.subTotal + this.menuItemList[j].subTotal;

  //         }
  //         if (this.taxData.length !== 0) {
  //           let tax = this.taxData;
  //           for (let t = 0; t < tax.length; t++) {
  //             for (let v = 0; v < tax[t].taxPercentage.length; v++) {
  //               if (tax[t].taxPercentage[v].isDefault) {
  //                 tax[t].taxSelectedval = tax[t].taxPercentage[v].taxPercentage;
  //                 tax[t].taxAmount = (tax[t].taxPercentage[v].taxPercentage / 100 * this.subTotal).toFixed(2);
  //               }
  //             }
  //           }
  //         }
  //         if (this.taxCondition.isSubtractFromSubTotal) {

  //           this.taxConditionVal = (this.taxCondition.percentage / 100 * this.subTotal).toFixed(2);
  //           this.subtotalTax = this.subTotal - Number(this.taxConditionVal);
  //           this.total = Number(this.subtotalTax + Number(this.taxConditionVal));
  //         } else {
  //           this.total = this.subTotal;
  //         }
  //         for (let f = 0; f < this.taxData.length; f++) {

  //           if (this.taxData.length !== 0) {
  //             this.total = Number((Number(this.total) + Number(this.taxData[f].taxAmount)).toFixed(2));
  //           }
  //         }
  //       }
  //     }
  //   } else {
  //     let val = e.target.value;
  //     let qtyVal = this.menuItemList[i].orderQuantity;
  //     if (val == '') {
  //       this.alertService.showError("Minimum 1 Quantity");
  //       if (this.menuItemList.length == 1) {
  //         this.subTotal = this.menuItemList[i].subTotal;

  //         if (this.taxData.length !== 0) {
  //           let tax = this.taxData;
  //           for (let t = 0; t < tax.length; t++) {
  //             for (let v = 0; v < tax[t].taxPercentage.length; v++) {
  //               if (tax[t].taxPercentage[v].isDefault) {
  //                 tax[t].taxSelectedval = tax[t].taxPercentage[v].taxPercentage;
  //                 tax[t].taxAmount = (tax[t].taxPercentage[v].taxPercentage / 100 * this.subTotal).toFixed(2);
  //               }
  //             }
  //           }
  //         }
  //         if (this.taxCondition.isSubtractFromSubTotal) {

  //           this.taxConditionVal = (this.taxCondition.percentage / 100 * this.subTotal).toFixed(2);
  //           this.subtotalTax = this.subTotal - Number(this.taxConditionVal);
  //           this.total = Number(this.subtotalTax + Number(this.taxConditionVal));
  //         } else {
  //           this.total = this.subTotal;
  //         }
  //         for (let f = 0; f < this.taxData.length; f++) {

  //           if (this.taxData.length !== 0) {
  //             this.total = Number((Number(this.total) + Number(this.taxData[f].taxAmount)).toFixed(2));
  //           }
  //         }
  //       } else {
  //         this.subTotal = 0;
  //         for (let j = 0; j < this.menuItemList.length; j++) {
  //           this.subTotal = this.subTotal + this.menuItemList[j].subTotal;

  //         }
  //         if (this.taxData.length !== 0) {
  //           let tax = this.taxData;
  //           for (let t = 0; t < tax.length; t++) {
  //             for (let v = 0; v < tax[t].taxPercentage.length; v++) {
  //               if (tax[t].taxPercentage[v].isDefault) {
  //                 tax[t].taxSelectedval = tax[t].taxPercentage[v].taxPercentage;
  //                 tax[t].taxAmount = (tax[t].taxPercentage[v].taxPercentage / 100 * this.subTotal).toFixed(2);
  //               }
  //             }
  //           }
  //         }
  //         if (this.taxCondition.isSubtractFromSubTotal) {

  //           this.taxConditionVal = (this.taxCondition.percentage / 100 * this.subTotal).toFixed(2);
  //           this.subtotalTax = this.subTotal - Number(this.taxConditionVal);
  //           this.total = Number(this.subtotalTax + Number(this.taxConditionVal));
  //         } else {
  //           this.total = this.subTotal;
  //         }
  //         for (let f = 0; f < this.taxData.length; f++) {

  //           if (this.taxData.length !== 0) {
  //             this.total = Number((Number(this.total) + Number(this.taxData[f].taxAmount)).toFixed(2));
  //           }
  //         }
  //       }
  //     } else if (val == 0) {
  //       this.alertService.showError("Minimum 1 Quantity");
  //       qtyVal = 1;
  //       this.menuItemList[i].subTotal = qtyVal * this.menuItemList[i].itemAmount;
  //       if (this.modifierData) {
  //         let mod = this.menuItemList[i].modifiers;
  //         let len = this.menuItemList[i].modifiers.length;
  //         for (let j = 0; j < len; j++) {

  //           this.menuItemList[i].subTotal = this.menuItemList[i].subTotal + qtyVal * mod[j].price;
  //         }
  //       }
  //       if (this.menuItemList[i].discount.length !== 0) {
  //         let mod = this.menuItemList[i].discount;
  //         let len = this.menuItemList[i].discount.length;
  //         for (let p = 0; p < len; p++) {
  //           if (mod[p].promocode == '') {
  //             let discountVal = mod[p].discountValue;
  //             if (mod[p].discountType == "Percentage") {
  //               mod[p].discountedAmount = (discountVal / 100 * this.menuItemList[i].subTotal).toFixed(2);
  //               this.menuItemList[i].subTotal = this.menuItemList[i].subTotal - mod[p].discountedAmount;
  //             } else {
  //               mod[p].discountedAmount = (qtyVal * discountVal).toFixed(2);
  //               this.menuItemList[i].subTotal = this.menuItemList[i].subTotal - mod[p].discountedAmount;
  //             }
  //           } else {
  //             let discountVal = mod[p].promocodeDiscount;
  //             if (mod[p].promocodeDiscountType == "Percentage") {
  //               mod[p].promocodeAmount = (discountVal / 100 * this.menuItemList[i].subTotal).toFixed(2);
  //               this.menuItemList[i].subTotal = this.menuItemList[i].subTotal - mod[p].promocodeAmount;
  //             } else {
  //               mod[p].promocodeAmount = (qtyVal * discountVal).toFixed(2);
  //               this.menuItemList[i].subTotal = this.menuItemList[i].subTotal - mod[p].promocodeAmount;
  //             }
  //           }
  //         }
  //       }
  //       if (this.menuItemList.length == 1) {
  //         this.subTotal = this.menuItemList[i].subTotal;

  //         if (this.taxData.length !== 0) {
  //           let tax = this.taxData;
  //           for (let t = 0; t < tax.length; t++) {
  //             for (let v = 0; v < tax[t].taxPercentage.length; v++) {
  //               if (tax[t].taxPercentage[v].isDefault) {
  //                 tax[t].taxSelectedval = tax[t].taxPercentage[v].taxPercentage;
  //                 tax[t].taxAmount = (tax[t].taxPercentage[v].taxPercentage / 100 * this.subTotal).toFixed(2);
  //               }
  //             }
  //           }
  //         }
  //         if (this.taxCondition.isSubtractFromSubTotal) {

  //           this.taxConditionVal = (this.taxCondition.percentage / 100 * this.subTotal).toFixed(2);
  //           this.subtotalTax = this.subTotal - Number(this.taxConditionVal);
  //           this.total = Number(this.subtotalTax + Number(this.taxConditionVal));
  //         } else {
  //           this.total = this.subTotal;
  //         }
  //         for (let f = 0; f < this.taxData.length; f++) {

  //           if (this.taxData.length !== 0) {
  //             this.total = Number((Number(this.total) + Number(this.taxData[f].taxAmount)).toFixed(2));
  //           }
  //         }
  //       } else {
  //         this.subTotal = 0;
  //         for (let j = 0; j < this.menuItemList.length; j++) {
  //           this.subTotal = this.subTotal + this.menuItemList[j].subTotal;

  //         }
  //         if (this.taxData.length !== 0) {
  //           let tax = this.taxData;
  //           for (let t = 0; t < tax.length; t++) {
  //             for (let v = 0; v < tax[t].taxPercentage.length; v++) {
  //               if (tax[t].taxPercentage[v].isDefault) {
  //                 tax[t].taxSelectedval = tax[t].taxPercentage[v].taxPercentage;
  //                 tax[t].taxAmount = (tax[t].taxPercentage[v].taxPercentage / 100 * this.subTotal).toFixed(2);
  //               }
  //             }
  //           }
  //         }
  //         if (this.taxCondition.isSubtractFromSubTotal) {

  //           this.taxConditionVal = (this.taxCondition.percentage / 100 * this.subTotal).toFixed(2);
  //           this.subtotalTax = this.subTotal - Number(this.taxConditionVal);
  //           this.total = Number(this.subtotalTax + Number(this.taxConditionVal));
  //         } else {
  //           this.total = this.subTotal;
  //         }
  //         for (let f = 0; f < this.taxData.length; f++) {

  //           if (this.taxData.length !== 0) {
  //             this.total = Number((Number(this.total) + Number(this.taxData[f].taxAmount)).toFixed(2));
  //           }
  //         }
  //       }
  //     } else {
  //       qtyVal = val;
  //       this.menuItemList[i].orderQuantity = qtyVal;
  //       this.menuItemList[i].subTotal = qtyVal * this.menuItemList[i].itemAmount;
  //       if (this.modifierData) {
  //         let mod = this.menuItemList[i].modifiers;
  //         let len = this.menuItemList[i].modifiers.length;
  //         for (let j = 0; j < len; j++) {

  //           this.menuItemList[i].subTotal = this.menuItemList[i].subTotal + qtyVal * mod[j].price;
  //         }
  //       }
  //       if (this.menuItemList[i].discount.length !== 0) {
  //         let mod = this.menuItemList[i].discount;
  //         let len = this.menuItemList[i].discount.length;
  //         for (let p = 0; p < len; p++) {
  //           if (mod[p].promocode == '') {
  //             let discountVal = mod[p].discountValue;
  //             if (mod[p].discountType == "Percentage") {
  //               mod[p].discountedAmount = (discountVal / 100 * this.menuItemList[i].subTotal).toFixed(2);
  //               this.menuItemList[i].subTotal = this.menuItemList[i].subTotal - mod[p].discountedAmount;
  //             } else {
  //               mod[p].discountedAmount = (qtyVal * discountVal).toFixed(2);
  //               this.menuItemList[i].subTotal = this.menuItemList[i].subTotal - mod[p].discountedAmount;
  //             }
  //           } else {
  //             let discountVal = mod[p].promocodeDiscount;
  //             if (mod[p].promocodeDiscountType == "Percentage") {
  //               mod[p].promocodeAmount = (discountVal / 100 * this.menuItemList[i].subTotal).toFixed(2);
  //               this.menuItemList[i].subTotal = this.menuItemList[i].subTotal - mod[p].promocodeAmount;
  //             } else {
  //               mod[p].promocodeAmount = (qtyVal * discountVal).toFixed(2);
  //               this.menuItemList[i].subTotal = this.menuItemList[i].subTotal - mod[p].promocodeAmount;
  //             }
  //           }
  //         }
  //       }
  //       if (this.menuItemList.length == 1) {
  //         this.subTotal = this.menuItemList[i].subTotal;

  //         if (this.taxData.length !== 0) {
  //           let tax = this.taxData;
  //           for (let t = 0; t < tax.length; t++) {
  //             for (let v = 0; v < tax[t].taxPercentage.length; v++) {
  //               if (tax[t].taxPercentage[v].isDefault) {
  //                 tax[t].taxSelectedval = tax[t].taxPercentage[v].taxPercentage;
  //                 tax[t].taxAmount = (tax[t].taxPercentage[v].taxPercentage / 100 * this.subTotal).toFixed(2);
  //               }
  //             }
  //           }
  //         }
  //         if (this.taxCondition.isSubtractFromSubTotal) {

  //           this.taxConditionVal = (this.taxCondition.percentage / 100 * this.subTotal).toFixed(2);
  //           this.subtotalTax = this.subTotal - Number(this.taxConditionVal);
  //           this.total = Number(this.subtotalTax + Number(this.taxConditionVal));
  //         } else {
  //           this.total = this.subTotal;
  //         }
  //         for (let f = 0; f < this.taxData.length; f++) {

  //           if (this.taxData.length !== 0) {
  //             this.total = Number((Number(this.total) + Number(this.taxData[f].taxAmount)).toFixed(2));
  //           }
  //         }
  //       } else {
  //         this.subTotal = 0;
  //         for (let j = 0; j < this.menuItemList.length; j++) {
  //           this.subTotal = this.subTotal + this.menuItemList[j].subTotal;

  //         }
  //         if (this.taxData.length !== 0) {
  //           let tax = this.taxData;
  //           for (let t = 0; t < tax.length; t++) {
  //             for (let v = 0; v < tax[t].taxPercentage.length; v++) {
  //               if (tax[t].taxPercentage[v].isDefault) {
  //                 tax[t].taxSelectedval = tax[t].taxPercentage[v].taxPercentage;
  //                 tax[t].taxAmount = (tax[t].taxPercentage[v].taxPercentage / 100 * this.subTotal).toFixed(2);
  //               }
  //             }
  //           }
  //         }
  //         if (this.taxCondition.isSubtractFromSubTotal) {

  //           this.taxConditionVal = (this.taxCondition.percentage / 100 * this.subTotal).toFixed(2);
  //           this.subtotalTax = this.subTotal - Number(this.taxConditionVal);
  //           this.total = Number(this.subtotalTax + Number(this.taxConditionVal));
  //         } else {
  //           this.total = this.subTotal;
  //         }
  //         for (let f = 0; f < this.taxData.length; f++) {

  //           if (this.taxData.length !== 0) {
  //             this.total = Number((Number(this.total) + Number(this.taxData[f].taxAmount)).toFixed(2));
  //           }
  //         }
  //       }
  //     }
  //   }
  // }

  // quantityIncrement(i) {
  //   if (this.DisableAfterDiscount) {
  //     this.loader.showWarning("Remove applied discount to increase quantity");
  //     return;
  //   }
  //   let temp = this.menuItemList[i].orderQuantity;
  //   let qtyval = this.menuItemList[i].orderQuantity;
  //   this.menuItemList[i].itemStatus = "Order";
  //   qtyval++;
  //   if (this.orderId !== null) {
  //     if (this.menuItemList[i].id) {
  //       let itemToAdd = {
  //         id: this.menuItemList[i].id,
  //         isReadyMade: this.menuItemList[i].isReadyMade,
  //         itemAmount: this.menuItemList[i].itemAmount,
  //         itemCategory: this.menuItemList[i].itemCategory,
  //         itemDiscountAmount: this.menuItemList[i].itemDiscountAmount,
  //         itemDiscountType: this.menuItemList[i].itemDiscountType,
  //         itemDiscountValue: this.menuItemList[i].itemDiscountValue,
  //         itemId: this.menuItemList[i].itemId,
  //         taxId: this.menuItemList[i].taxId,
  //         itemName: this.menuItemList[i].itemName,
  //         itemStatus: this.menuItemList[i].itemStatus,
  //         itemSubCategory: this.menuItemList[i].itemSubCategory,
  //         modifiers: this.menuItemList[i].modifiers,
  //         discount: this.menuItemList[i].discount,
  //         notes: this.menuItemList[i].notes,
  //         orderQuantity: this.menuItemList[i].orderQuantity,
  //         orderTakenBy: this.menuItemList[i].orderTakenBy,
  //         statusChangeTime: this.menuItemList[i].statusChangeTime,
  //         subTotal: this.menuItemList[i].subTotal,
  //         tableNo: this.menuItemList[i].tableNo,
  //         tableType: this.menuItemList[i].tableType
  //       };
  //       itemToAdd.orderQuantity = qtyval - temp;
  //       itemToAdd.subTotal = itemToAdd.orderQuantity * itemToAdd.itemAmount;
  //       if (itemToAdd.modifiers) {
  //         let modifi = itemToAdd.modifiers;
  //         let leng = itemToAdd.modifiers.length;
  //         for (let h = 0; h < leng; h++) {


  //           itemToAdd.subTotal = itemToAdd.subTotal + itemToAdd.orderQuantity * modifi[h].price;

  //         }
  //       }
  //       if (itemToAdd.discount.length !== 0) {
  //         let mod = itemToAdd.discount;
  //         let len = itemToAdd.discount.length;
  //         for (let p = 0; p < len; p++) {
  //           if (mod[p].promocode == '') {
  //             let discountVal = mod[p].discountValue;
  //             if (mod[p].discountType == "Percentage") {
  //               mod[p].discountedAmount = (discountVal / 100 * itemToAdd.subTotal).toFixed(2);
  //               itemToAdd.subTotal = itemToAdd.subTotal - mod[p].discountedAmount;
  //             } else {
  //               mod[p].discountedAmount = (qtyval * discountVal).toFixed(2);
  //               itemToAdd.subTotal = itemToAdd.subTotal - mod[p].discountedAmount;
  //             }
  //           } else {
  //             let discountVal = mod[p].promocodeDiscount;
  //             if (mod[p].promocodeDiscountType == "Percentage") {
  //               mod[p].promocodeAmount = (discountVal / 100 * itemToAdd.subTotal).toFixed(2);
  //               itemToAdd.subTotal = itemToAdd.subTotal - mod[p].promocodeAmount;
  //             } else {
  //               mod[p].promocodeAmount = (qtyval * discountVal).toFixed(2);
  //               itemToAdd.subTotal = itemToAdd.subTotal - mod[p].promocodeAmount;
  //             }
  //           }
  //         }
  //       }
  //       this.itemToBeAdded.push(itemToAdd);
  //       for (let k = 0; k < this.itemToBeAdded.length; k++) {
  //         for (let l = 0; l < this.itemToBeAdded.length; l++) {
  //           if (k != l) {
  //             if (this.itemToBeAdded[k].itemName == this.itemToBeAdded[l].itemName) {
  //               this.itemToBeAdded[k].orderQuantity = this.itemToBeAdded[k].orderQuantity + this.itemToBeAdded[l].orderQuantity;

  //               this.itemToBeAdded[k].subTotal = this.itemToBeAdded[k].itemAmount + this.itemToBeAdded[l].itemAmount;
  //               this.itemToBeAdded.splice(l, 1);
  //             }
  //           }
  //         }
  //       }
  //       this.menuItemList[i].orderQuantity = qtyval;
  //       this.menuItemList[i].subTotal = qtyval * this.menuItemList[i].itemAmount;
  //       if (this.menuItemList[i].modifiers) {
  //         let mod = this.menuItemList[i].modifiers;

  //         let len = this.menuItemList[i].modifiers.length;
  //         for (let j = 0; j < len; j++) {


  //           this.menuItemList[i].subTotal = this.menuItemList[i].subTotal + this.menuItemList[i].orderQuantity * mod[j].price;

  //         }
  //       }
  //       if (this.menuItemList.length == 1) {
  //         this.subTotal = this.menuItemList[i].subTotal;
  //         this.total = this.subTotal;
  //         if (this.taxData.length !== 0) {
  //           let tax = this.taxData;
  //           for (let t = 0; t < tax.length; t++) {
  //             for (let v = 0; v < tax[t].taxPercentage.length; v++) {
  //               if (tax[t].taxPercentage[v].isDefault) {
  //                 tax[t].taxSelectedval = tax[t].taxPercentage[v].taxPercentage;
  //                 tax[t].taxAmount = (tax[t].taxPercentage[v].taxPercentage / 100 * this.subTotal).toFixed(2);
  //               }
  //             }
  //           }
  //         }


  //         this.CalculateTaxFunction();
  //       } else {
  //         this.subTotal = 0;
  //         for (let j = 0; j < this.menuItemList.length; j++) {
  //           this.subTotal = this.subTotal + this.menuItemList[j].subTotal;
  //           this.total = this.subTotal;
  //         }
  //         if (this.taxData.length !== 0) {
  //           let tax = this.taxData;
  //           for (let t = 0; t < tax.length; t++) {
  //             for (let v = 0; v < tax[t].taxPercentage.length; v++) {
  //               if (tax[t].taxPercentage[v].isDefault) {
  //                 tax[t].taxSelectedval = tax[t].taxPercentage[v].taxPercentage;
  //                 tax[t].taxAmount = (tax[t].taxPercentage[v].taxPercentage / 100 * this.subTotal).toFixed(2);
  //               }
  //             }
  //           }
  //         }


  //         this.CalculateTaxFunction();
  //       }
  //     } else {
  //       this.menuItemList[i].orderQuantity = qtyval;
  //       this.menuItemList[i].subTotal = qtyval * this.menuItemList[i].itemAmount;
  //       this.itemsAllReadyTaken[i].orderQuantity = qtyval;
  //       this.itemsAllReadyTaken[i].subTotal = qtyval * this.itemsAllReadyTaken[i].itemAmount;
  //       if (this.modifierData) {
  //         let mod = this.menuItemList[i].modifiers;

  //         let len = this.menuItemList[i].modifiers.length;
  //         for (let j = 0; j < len; j++) {


  //           this.menuItemList[i].subTotal = this.menuItemList[i].subTotal + qtyval * mod[j].price;

  //         }
  //       }
  //       if (this.menuItemList[i].discount.length !== 0) {
  //         let mod = this.menuItemList[i].discount;
  //         let len = this.menuItemList[i].discount.length;
  //         for (let p = 0; p < len; p++) {
  //           if (mod[p].promocode == '') {
  //             let discountVal = mod[p].discountValue;
  //             if (mod[p].discountType == "Percentage") {
  //               mod[p].discountedAmount = (discountVal / 100 * this.menuItemList[i].subTotal).toFixed(2);
  //               this.menuItemList[i].subTotal = this.menuItemList[i].subTotal - mod[p].discountedAmount;
  //             } else {
  //               mod[p].discountedAmount = (qtyval * discountVal).toFixed(2);
  //               this.menuItemList[i].subTotal = this.menuItemList[i].subTotal - mod[p].discountedAmount;
  //             }
  //           } else {
  //             let discountVal = mod[p].promocodeDiscount;
  //             if (mod[p].promocodeDiscountType == "Percentage") {
  //               mod[p].promocodeAmount = (discountVal / 100 * this.menuItemList[i].subTotal).toFixed(2);
  //               this.menuItemList[i].subTotal = this.menuItemList[i].subTotal - mod[p].promocodeAmount;
  //             } else {
  //               mod[p].promocodeAmount = (qtyval * discountVal).toFixed(2);
  //               this.menuItemList[i].subTotal = this.menuItemList[i].subTotal - mod[p].promocodeAmount;
  //             }
  //           }
  //         }
  //       }
  //       this.itemsAllReadyTaken[i].subTotal = this.menuItemList[i].subTotal;
  //       if (this.menuItemList.length == 1) {
  //         this.subTotal = this.menuItemList[i].subTotal;
  //         this.total = this.subTotal;
  //         if (this.taxData.length !== 0) {
  //           let tax = this.taxData;
  //           for (let t = 0; t < tax.length; t++) {
  //             for (let v = 0; v < tax[t].taxPercentage.length; v++) {
  //               if (tax[t].taxPercentage[v].isDefault) {
  //                 tax[t].taxSelectedval = tax[t].taxPercentage[v].taxPercentage;
  //                 tax[t].taxAmount = (tax[t].taxPercentage[v].taxPercentage / 100 * this.subTotal).toFixed(2);
  //               }
  //             }
  //           }
  //         }
  //         this.CalculateTaxFunction();
  //       } else {
  //         this.subTotal = 0;
  //         for (let j = 0; j < this.menuItemList.length; j++) {
  //           this.subTotal = this.subTotal + this.menuItemList[j].subTotal;
  //           this.total = this.subTotal;
  //         }
  //         if (this.taxData.length !== 0) {
  //           let tax = this.taxData;
  //           for (let t = 0; t < tax.length; t++) {
  //             for (let v = 0; v < tax[t].taxPercentage.length; v++) {
  //               if (tax[t].taxPercentage[v].isDefault) {
  //                 tax[t].taxSelectedval = tax[t].taxPercentage[v].taxPercentage;
  //                 tax[t].taxAmount = (tax[t].taxPercentage[v].taxPercentage / 100 * this.subTotal).toFixed(2);
  //               }
  //             }
  //           }
  //         }
  //         this.CalculateTaxFunction();
  //       }
  //     }
  //   } else {
  //     this.menuItemList[i].orderQuantity = qtyval;
  //     this.menuItemList[i].subTotal = qtyval * this.menuItemList[i].itemAmount;
  //     if (this.modifierData) {
  //       let mod = this.menuItemList[i].modifiers;
  //       let len = this.menuItemList[i].modifiers.length;
  //       for (let j = 0; j < len; j++) {

  //         this.menuItemList[i].subTotal = this.menuItemList[i].subTotal + qtyval * mod[j].price;
  //       }
  //     }
  //     if (this.menuItemList[i].discount.length !== 0) {
  //       let mod = this.menuItemList[i].discount;
  //       let len = this.menuItemList[i].discount.length;
  //       for (let p = 0; p < len; p++) {
  //         if (mod[p].promocode == '') {
  //           let discountVal = mod[p].discountValue;
  //           if (mod[p].discountType == "Percentage") {
  //             mod[p].discountedAmount = (discountVal / 100 * this.menuItemList[i].subTotal).toFixed(2);
  //             this.menuItemList[i].subTotal = this.menuItemList[i].subTotal - mod[p].discountedAmount;
  //           } else {
  //             mod[p].discountedAmount = (qtyval * discountVal).toFixed(2);
  //             this.menuItemList[i].subTotal = this.menuItemList[i].subTotal - mod[p].discountedAmount;
  //           }
  //         } else {
  //           let discountVal = mod[p].promocodeDiscount;
  //           if (mod[p].promocodeDiscountType == "Percentage") {
  //             mod[p].promocodeAmount = (discountVal / 100 * this.menuItemList[i].subTotal).toFixed(2);
  //             this.menuItemList[i].subTotal = this.menuItemList[i].subTotal - mod[p].promocodeAmount;
  //           } else {
  //             mod[p].promocodeAmount = (qtyval * discountVal).toFixed(2);
  //             this.menuItemList[i].subTotal = this.menuItemList[i].subTotal - mod[p].promocodeAmount;
  //           }
  //         }
  //       }
  //     }
  //     if (this.menuItemList.length == 1) {
  //       this.subTotal = this.menuItemList[i].subTotal;
  //       this.total = this.subTotal;
  //       this.itemTax = [];
  //       this.itemTax.push(this.menuItemList[i].itemId);
  //       this.itemTax.push(this.menuItemList[i].orderQuantity);

  //       let stringIds = this.itemTax.join(",");
  //       this.calculateTax(stringIds);

  //     } else {
  //       this.subTotal = 0;
  //       this.itemTax = [];

  //       for (let j = 0; j < this.menuItemList.length; j++) {
  //         this.subTotal = this.subTotal + this.menuItemList[j].subTotal;
  //         this.total = this.subTotal;
  //         this.itemTax.push(this.menuItemList[j].itemId);
  //         this.itemTax.push(this.menuItemList[j].orderQuantity);


  //       }


  //       let stringIds = this.itemTax.join(",");
  //       this.calculateTax(stringIds);

  //     }
  //   }
  // }
  // quantityDecrement(i) {
  //   if (this.DisableAfterDiscount) {
  //     this.loader.showWarning("Remove applied discount to decrease quantity");
  //     return;
  //   }
  //   if (this.orderId !== null) {
  //     if (this.menuItemList[i].id) {
  //       let qtyval = this.menuItemList[i].orderQuantity;
  //       if (qtyval > 1) {
  //         let data = {
  //           modifiedItem: this.menuItemList[i].itemName,
  //           modifiedToItem: this.menuItemList[i].itemName,
  //           modifiedBy: "",
  //           reason: "Quantity Reduced"
  //         }
  //         this.modifiedHistory.push(data);
  //         this.qtyDecrement = true;
  //         qtyval--;
  //         this.menuItemList[i].orderQuantity = qtyval;
  //         this.menuItemList[i].subTotal = qtyval * this.menuItemList[i].itemAmount;
  //         let qval = 1;
  //         for (let r = 0; r < this.itemsAllReadyTaken.length; r++) {
  //           if (this.menuItemList[i].id == this.itemsAllReadyTaken[r].id) {
  //             if (qval == 1) {
  //               if (this.itemsAllReadyTaken[r].orderQuantity == 1) {
  //                 this.itemsAllReadyTaken.splice(r, 1);

  //                 qval = 0;
  //               } else if (this.itemsAllReadyTaken[r].orderQuantity > 1) {

  //                 this.itemsAllReadyTaken[r].orderQuantity = qtyval;
  //                 this.itemsAllReadyTaken[r].subTotal = this.itemsAllReadyTaken[r].orderQuantity * this.itemsAllReadyTaken[r].itemAmount;
  //                 qval = 0;

  //                 if (this.itemsAllReadyTaken[r].modifiers) {
  //                   let mod = this.itemsAllReadyTaken[r].modifiers;
  //                   let len = this.itemsAllReadyTaken[r].modifiers.length;
  //                   for (let j = 0; j < len; j++) {
  //                     this.itemsAllReadyTaken[r].subTotal = this.itemsAllReadyTaken[r].subTotal + this.itemsAllReadyTaken[r].orderQuantity * mod[j].price;
  //                   }
  //                 }
  //                 if (this.itemsAllReadyTaken[r].discount.length !== 0) {
  //                   let mod = this.itemsAllReadyTaken[r].discount;
  //                   let len = this.itemsAllReadyTaken[r].discount.length;
  //                   for (let p = 0; p < len; p++) {
  //                     if (mod[p].promocode == '') {
  //                       let discountVal = mod[p].discountValue;
  //                       if (mod[p].discountType == "Percentage") {
  //                         mod[p].discountedAmount = (discountVal / 100 * this.itemsAllReadyTaken[r].subTotal).toFixed(2);
  //                         this.itemsAllReadyTaken[r].subTotal = this.itemsAllReadyTaken[i].subTotal - mod[p].discountedAmount;
  //                       } else {
  //                         mod[p].discountedAmount = (this.itemsAllReadyTaken[r].orderQuantity * discountVal).toFixed(2);
  //                         this.itemsAllReadyTaken[i].subTotal = this.itemsAllReadyTaken[i].subTotal - mod[p].discountedAmount;
  //                       }
  //                     } else {
  //                       let discountVal = mod[p].promocodeDiscount;
  //                       if (mod[p].promocodeDiscountType == "Percentage") {
  //                         mod[p].promocodeAmount = (discountVal / 100 * this.itemsAllReadyTaken[r].subTotal).toFixed(2);
  //                         this.itemsAllReadyTaken[r].subTotal = this.itemsAllReadyTaken[r].subTotal - mod[p].promocodeAmount;
  //                       } else {
  //                         mod[p].promocodeAmount = (this.itemsAllReadyTaken[r].orderQuantity * discountVal).toFixed(2);
  //                         this.itemsAllReadyTaken[r].subTotal = this.itemsAllReadyTaken[r].subTotal - mod[p].promocodeAmount;
  //                       }
  //                     }
  //                   }
  //                 }
  //               }
  //             }
  //           }
  //         }


  //         if (this.menuItemList[i].modifiers) {
  //           let mod = this.menuItemList[i].modifiers;

  //           let len = this.menuItemList[i].modifiers.length;
  //           for (let j = 0; j < len; j++) {


  //             this.menuItemList[i].subTotal = this.menuItemList[i].subTotal + qtyval * mod[j].price;

  //           }
  //         }
  //         if (this.menuItemList[i].discount.length !== 0) {
  //           let mod = this.menuItemList[i].discount;
  //           let len = this.menuItemList[i].discount.length;
  //           for (let p = 0; p < len; p++) {
  //             if (mod[p].promocode == '') {
  //               let discountVal = mod[p].discountValue;
  //               if (mod[p].discountType == "Percentage") {
  //                 mod[p].discountedAmount = (discountVal / 100 * this.menuItemList[i].subTotal).toFixed(2);
  //                 this.menuItemList[i].subTotal = this.menuItemList[i].subTotal - mod[p].discountedAmount;
  //               } else {
  //                 mod[p].discountedAmount = (qtyval * discountVal).toFixed(2);
  //                 this.menuItemList[i].subTotal = this.menuItemList[i].subTotal - mod[p].discountedAmount;
  //               }
  //             } else {
  //               let discountVal = mod[p].promocodeDiscount;
  //               if (mod[p].promocodeDiscountType == "Percentage") {
  //                 mod[p].promocodeAmount = (discountVal / 100 * this.menuItemList[i].subTotal).toFixed(2);
  //                 this.menuItemList[i].subTotal = this.menuItemList[i].subTotal - mod[p].promocodeAmount;
  //               } else {
  //                 mod[p].promocodeAmount = (qtyval * discountVal).toFixed(2);
  //                 this.menuItemList[i].subTotal = this.menuItemList[i].subTotal - mod[p].promocodeAmount;
  //               }
  //             }
  //           }
  //         }

  //       } else {
  //         this.alertService.showError("Minimum 1 Quantity");
  //         this.menuItemList[i].subTotal = qtyval * this.menuItemList[i].itemAmount;
  //       }
  //       if (this.menuItemList.length == 1) {
  //         this.subTotal = this.menuItemList[i].subTotal;
  //         this.total = this.subTotal;
  //         if (this.taxData.length !== 0) {
  //           let tax = this.taxData;
  //           for (let t = 0; t < tax.length; t++) {
  //             for (let v = 0; v < tax[t].taxPercentage.length; v++) {
  //               if (tax[t].taxPercentage[v].isDefault) {
  //                 tax[t].taxSelectedval = tax[t].taxPercentage[v].taxPercentage;
  //                 tax[t].taxAmount = (tax[t].taxPercentage[v].taxPercentage / 100 * this.subTotal).toFixed(2);
  //               }
  //             }
  //           }
  //         }
  //         this.CalculateTaxFunction();
  //       } else {
  //         this.subTotal = 0;
  //         for (let j = 0; j < this.menuItemList.length; j++) {
  //           this.subTotal = this.subTotal + this.menuItemList[j].subTotal;
  //           this.total = this.subTotal;
  //         }
  //         if (this.taxData.length !== 0) {
  //           let tax = this.taxData;
  //           for (let t = 0; t < tax.length; t++) {
  //             for (let v = 0; v < tax[t].taxPercentage.length; v++) {
  //               if (tax[t].taxPercentage[v].isDefault) {
  //                 tax[t].taxSelectedval = tax[t].taxPercentage[v].taxPercentage;
  //                 tax[t].taxAmount = (tax[t].taxPercentage[v].taxPercentage / 100 * this.subTotal).toFixed(2);
  //               }
  //             }
  //           }
  //         }
  //         this.CalculateTaxFunction();
  //       }
  //     } else {
  //       let qtyval = this.menuItemList[i].orderQuantity;
  //       if (qtyval > 1) {
  //         qtyval--;
  //         this.menuItemList[i].orderQuantity = qtyval;
  //         this.menuItemList[i].subTotal = qtyval * this.menuItemList[i].itemAmount;
  //         this.itemsAllReadyTaken[i].orderQuantity = qtyval;
  //         this.itemsAllReadyTaken[i].subTotal = qtyval * this.itemsAllReadyTaken[i].itemAmount;
  //         if (this.menuItemList[i].modifiers) {
  //           let mod = this.menuItemList[i].modifiers;

  //           let len = this.menuItemList[i].modifiers.length;
  //           for (let j = 0; j < len; j++) {


  //             this.menuItemList[i].subTotal = this.menuItemList[i].subTotal + qtyval * mod[j].price;

  //           }
  //         }
  //         if (this.menuItemList[i].discount.length !== 0) {
  //           let mod = this.menuItemList[i].discount;
  //           let len = this.menuItemList[i].discount.length;
  //           for (let p = 0; p < len; p++) {
  //             if (mod[p].promocode == '') {
  //               let discountVal = mod[p].discountValue;
  //               if (mod[p].discountType == "Percentage") {
  //                 mod[p].discountedAmount = (discountVal / 100 * this.menuItemList[i].subTotal).toFixed(2);
  //                 this.menuItemList[i].subTotal = this.menuItemList[i].subTotal - mod[p].discountedAmount;
  //               } else {
  //                 mod[p].discountedAmount = (qtyval * discountVal).toFixed(2);
  //                 this.menuItemList[i].subTotal = this.menuItemList[i].subTotal - mod[p].discountedAmount;
  //               }
  //             } else {
  //               let discountVal = mod[p].promocodeDiscount;
  //               if (mod[p].promocodeDiscountType == "Percentage") {
  //                 mod[p].promocodeAmount = (discountVal / 100 * this.menuItemList[i].subTotal).toFixed(2);
  //                 this.menuItemList[i].subTotal = this.menuItemList[i].subTotal - mod[p].promocodeAmount;
  //               } else {
  //                 mod[p].promocodeAmount = (qtyval * discountVal).toFixed(2);
  //                 this.menuItemList[i].subTotal = this.menuItemList[i].subTotal - mod[p].promocodeAmount;
  //               }
  //             }
  //           }
  //         }
  //         this.itemsAllReadyTaken[i].subTotal = this.menuItemList[i].subTotal;
  //       } else {
  //         this.alertService.showError("Minimum 1 Quantity");
  //         this.menuItemList[i].subTotal = qtyval * this.menuItemList[i].itemAmount;
  //       }
  //       if (this.menuItemList.length == 1) {
  //         this.subTotal = this.menuItemList[i].subTotal;
  //         this.total = this.subTotal;
  //         if (this.taxData.length !== 0) {
  //           let tax = this.taxData;
  //           for (let t = 0; t < tax.length; t++) {
  //             for (let v = 0; v < tax[t].taxPercentage.length; v++) {
  //               if (tax[t].taxPercentage[v].isDefault) {
  //                 tax[t].taxSelectedval = tax[t].taxPercentage[v].taxPercentage;
  //                 tax[t].taxAmount = (tax[t].taxPercentage[v].taxPercentage / 100 * this.subTotal).toFixed(2);
  //               }
  //             }
  //           }
  //         }
  //         this.CalculateTaxFunction();
  //       } else {
  //         this.subTotal = 0;
  //         for (let j = 0; j < this.menuItemList.length; j++) {
  //           this.subTotal = this.subTotal + this.menuItemList[j].subTotal;
  //           this.total = this.subTotal;
  //         }
  //         if (this.taxData.length !== 0) {
  //           let tax = this.taxData;
  //           for (let t = 0; t < tax.length; t++) {
  //             for (let v = 0; v < tax[t].taxPercentage.length; v++) {
  //               if (tax[t].taxPercentage[v].isDefault) {
  //                 tax[t].taxSelectedval = tax[t].taxPercentage[v].taxPercentage;
  //                 tax[t].taxAmount = (tax[t].taxPercentage[v].taxPercentage / 100 * this.subTotal).toFixed(2);
  //               }
  //             }
  //           }
  //         }
  //         this.CalculateTaxFunction();
  //       }
  //     }
  //   } else {
  //     let qtyval = this.menuItemList[i].orderQuantity;
  //     if (qtyval > 1) {
  //       qtyval--;
  //       this.menuItemList[i].orderQuantity = qtyval;
  //       this.menuItemList[i].subTotal = qtyval * this.menuItemList[i].itemAmount;
  //       if (this.modifierData) {
  //         let mod = this.menuItemList[i].modifiers;
  //         let len = this.menuItemList[i].modifiers.length;
  //         for (let j = 0; j < len; j++) {

  //           this.menuItemList[i].subTotal = this.menuItemList[i].subTotal + qtyval * mod[j].price;
  //         }
  //       }
  //       if (this.menuItemList[i].discount.length !== 0) {
  //         let mod = this.menuItemList[i].discount;
  //         let len = this.menuItemList[i].discount.length;
  //         for (let p = 0; p < len; p++) {
  //           if (mod[p].promocode == '') {
  //             let discountVal = mod[p].discountValue;
  //             if (mod[p].discountType == "Percentage") {
  //               mod[p].discountedAmount = (discountVal / 100 * this.menuItemList[i].subTotal).toFixed(2);
  //               this.menuItemList[i].subTotal = this.menuItemList[i].subTotal - mod[p].discountedAmount;
  //             } else {
  //               mod[p].discountedAmount = (qtyval * discountVal).toFixed(2);
  //               this.menuItemList[i].subTotal = this.menuItemList[i].subTotal - mod[p].discountedAmount;
  //             }
  //           } else {
  //             let discountVal = mod[p].promocodeDiscount;
  //             if (mod[p].promocodeDiscountType == "Percentage") {
  //               mod[p].promocodeAmount = (discountVal / 100 * this.menuItemList[i].subTotal).toFixed(2);
  //               this.menuItemList[i].subTotal = this.menuItemList[i].subTotal - mod[p].promocodeAmount;
  //             } else {
  //               mod[p].promocodeAmount = (qtyval * discountVal).toFixed(2);
  //               this.menuItemList[i].subTotal = this.menuItemList[i].subTotal - mod[p].promocodeAmount;
  //             }
  //           }
  //         }
  //       }
  //     } else {
  //       this.alertService.showError("Minimum 1 Quantity");
  //       this.menuItemList[i].subTotal = qtyval * this.menuItemList[i].itemAmount;
  //       if (this.modifierData) {
  //         let mod = this.menuItemList[i].modifiers;
  //         let len = this.menuItemList[i].modifiers.length;
  //         for (let j = 0; j < len; j++) {

  //           this.menuItemList[i].subTotal = this.menuItemList[i].subTotal + qtyval * mod[j].price;
  //         }
  //       }
  //       if (this.menuItemList[i].discount.length !== 0) {
  //         let mod = this.menuItemList[i].discount;
  //         let len = this.menuItemList[i].discount.length;
  //         for (let p = 0; p < len; p++) {
  //           if (mod[p].promocode == '') {
  //             let discountVal = mod[p].discountValue;
  //             if (mod[p].discountType == "Percentage") {
  //               mod[p].discountedAmount = (discountVal / 100 * this.menuItemList[i].subTotal).toFixed(2);
  //               this.menuItemList[i].subTotal = this.menuItemList[i].subTotal - mod[p].discountedAmount;
  //             } else {
  //               mod[p].discountedAmount = (qtyval * discountVal).toFixed(2);
  //               this.menuItemList[i].subTotal = this.menuItemList[i].subTotal - mod[p].discountedAmount;
  //             }
  //           } else {
  //             let discountVal = mod[p].promocodeDiscount;
  //             if (mod[p].promocodeDiscountType == "Percentage") {
  //               mod[p].promocodeAmount = (discountVal / 100 * this.menuItemList[i].subTotal).toFixed(2);
  //               this.menuItemList[i].subTotal = this.menuItemList[i].subTotal - mod[p].promocodeAmount;
  //             } else {
  //               mod[p].promocodeAmount = (qtyval * discountVal).toFixed(2);
  //               this.menuItemList[i].subTotal = this.menuItemList[i].subTotal - mod[p].promocodeAmount;
  //             }
  //           }
  //         }
  //       }
  //     }
  //     if (this.menuItemList.length == 1) {
  //       this.subTotal = this.menuItemList[i].subTotal;
  //       this.total = this.subTotal;
  //       this.itemTax = [];
  //       this.itemTax.push(this.menuItemList[i].itemId);
  //       this.itemTax.push(this.menuItemList[i].orderQuantity);

  //       let stringIds = this.itemTax.join(",");
  //       this.calculateTax(stringIds);

  //     } else {
  //       this.subTotal = 0;
  //       this.itemTax = [];

  //       for (let j = 0; j < this.menuItemList.length; j++) {
  //         this.subTotal = this.subTotal + this.menuItemList[j].subTotal;
  //         this.total = this.subTotal;

  //         this.itemTax.push(this.menuItemList[j].itemId);
  //         this.itemTax.push(this.menuItemList[j].orderQuantity);
  //       }
  //       let stringIds = this.itemTax.join(",");
  //       this.calculateTax(stringIds);
  //     }
  //   }
  // }

  // removeItem(ii, isDirectRemove) {
  //   if (!isDirectRemove && this.Enteredpassword != this.voidPassword) {
  //     this.isCorrectPass = false;
  //     this.alertService.showError("Please enter your correct void password");
  //   } else {
  //     this.closeModal();

  //     let i = 0;
  //     if (!isDirectRemove)
  //       i = this.ItemIndex;
  //     else
  //       i = ii;
  //     if (this.orderId !== null) {
  //       if (this.menuItemList[i].id) {
  //         this.qtyDecrement = true;
  //         let data = {
  //           modifiedItem: this.menuItemList[i].itemName,
  //           modifiedToItem: "",
  //           modifiedBy: "",
  //           reason: "Item Removed"
  //         }
  //         this.modifiedHistory.push(data);
  //         for (let r = 0; r < this.itemsAllReadyTaken.length; r++) {
  //           if (this.menuItemList[i].id == this.itemsAllReadyTaken[r].id) {
  //             this.itemsAllReadyTaken.splice(r, 1);
  //             r = r - 1
  //           }
  //         }
  //         this.menuItemList.splice(i, 1);
  //         this.alertService.showSuccess("Item Removed");
  //         if (this.menuItemList.length == 0) {
  //           this.placeOrderEnable = false;
  //           this.subTotal = 0;
  //           this.total = 0;
  //         } else {
  //           this.placeOrderEnable = true;
  //           this.subTotal = 0;
  //           this.total = 0;
  //           if (this.taxData.length !== 0) {
  //             let tax = this.taxData;
  //             for (let t = 0; t < tax.length; t++) {
  //               for (let v = 0; v < tax[t].taxPercentage.length; v++) {
  //                 if (tax[t].taxPercentage[v].isDefault) {
  //                   tax[t].taxSelectedval = 0;
  //                   tax[t].taxAmount = 0;
  //                 }
  //               }
  //             }
  //           }
  //           for (let j = 0; j < this.menuItemList.length; j++) {
  //             this.subTotal = this.subTotal + this.menuItemList[j].subTotal;
  //             this.total = this.subTotal;
  //           }
  //           if (this.taxData.length !== 0) {
  //             let tax = this.taxData;
  //             for (let t = 0; t < tax.length; t++) {
  //               for (let v = 0; v < tax[t].taxPercentage.length; v++) {
  //                 if (tax[t].taxPercentage[v].isDefault) {
  //                   tax[t].taxSelectedval = tax[t].taxPercentage[v].taxPercentage;
  //                   tax[t].taxAmount = (tax[t].taxPercentage[v].taxPercentage / 100 * this.subTotal).toFixed(2);
  //                 }
  //               }
  //             }
  //           }
  //           this.CalculateTaxFunction();
  //         }
  //       } else {
  //         this.menuItemList.splice(i, 1);
  //         this.alertService.showSuccess("Item Removed");
  //         if (this.menuItemList.length == 0) {
  //           this.placeOrderEnable = false;
  //           this.subTotal = 0;
  //           this.total = 0;
  //           if (this.taxData.length !== 0) {
  //             let tax = this.taxData;
  //             for (let t = 0; t < tax.length; t++) {
  //               for (let v = 0; v < tax[t].taxPercentage.length; v++) {
  //                 if (tax[t].taxPercentage[v].isDefault) {
  //                   tax[t].taxSelectedval = 0;
  //                   tax[t].taxAmount = 0;
  //                 }
  //               }
  //             }
  //           }
  //         } else {
  //           this.placeOrderEnable = true;
  //           this.subTotal = 0;
  //           this.total = 0;

  //           this.itemTax = [];

  //           for (let j = 0; j < this.menuItemList.length; j++) {
  //             this.subTotal = this.subTotal + this.menuItemList[j].subTotal;
  //             this.total = this.subTotal;
  //             this.itemTax.push(this.menuItemList[j].itemId);
  //             this.itemTax.push(this.menuItemList[j].orderQuantity);
  //           }
  //           let stringIds = this.itemTax.join(",");
  //           this.calculateTax(stringIds);
  //         }
  //       }
  //     } else {
  //       this.menuItemList.splice(i, 1);
  //       this.alertService.showSuccess("Item Removed");
  //       if (this.menuItemList.length == 0) {
  //         this.placeOrderEnable = false;
  //         this.subTotal = 0;
  //         this.total = 0;
  //         if (this.taxData.length !== 0) {
  //           let tax = this.taxData;
  //           for (let t = 0; t < tax.length; t++) {
  //             for (let v = 0; v < tax[t].taxPercentage.length; v++) {
  //               if (tax[t].taxPercentage[v].isDefault) {
  //                 tax[t].taxSelectedval = 0;
  //                 tax[t].taxAmount = 0;
  //               }
  //             }
  //           }
  //         }
  //       } else {
  //         this.placeOrderEnable = true;
  //         this.subTotal = 0;
  //         this.total = 0;

  //         this.itemTax = [];

  //         for (let j = 0; j < this.menuItemList.length; j++) {
  //           this.subTotal = this.subTotal + this.menuItemList[j].subTotal;
  //           this.total = this.subTotal;

  //           this.itemTax.push(this.menuItemList[j].itemId);
  //           this.itemTax.push(this.menuItemList[j].orderQuantity);
  //         }

  //         let stringIds = this.itemTax.join(",");
  //         this.calculateTax(stringIds);

  //       }
  //     }
  //   }
  // }

  // colors: Array<any> = ["#ffebee", "#fce4ec", "#f3e5f5", "#f5f5f5", "#cfd8dc", "#e3f2fd", "#e1f5fe", "#80cbc4", "#c8e6c9", "#f4ff81"];

  // getColor(index) {
  //   return this.colors[index.toString().charAt(index.toString().length - 1)];
  // }
  // placeOrder() {

  //   if (!this.placeOrderEnable) {
  //     this.loader.showWarning('Please Add Order First!!');
  //   } else {
  //     this.orderDetails = [
  //       {
  //         orderType: this.orderType,
  //         orderMode: 'Offline',
  //         partnerName: '',
  //         partnerId: '',
  //         deliveryPerson: '',
  //         deliveryPersonPhone: ''
  //       }
  //     ];
  //     let data = {
  //       orderType: this.orderType,
  //       items: this.menuItemList,
  //       orderDetails: this.orderDetails,
  //       subTotal: this.subTotal,
  //       customerId: this.customerDetails != null && this.customerDetails != undefined ? this.customerDetails.customerId : '',
  //       orderStatus: "Running",
  //       outletId: this.outletId,
  //       total: this.total,
  //       numberOfPeople: this.numberofpeople,
  //     }

  //     this.posDataService.postOrderData(data).subscribe(res => {

  //       let status = res['success'];
  //       let msg = res['message'];
  //       if (status) {
  //         this.router.navigate(['/pos-dashboard/dine-in']);
  //         this.alertService.showSuccess('Order Placed Succesfully');
  //       } else {
  //         this.alertService.showError(msg);
  //       }
  //     });
  //   }
  // }

  // updateOrder() {
  //   let itemsUpdatedData = this.itemsAllReadyTaken.concat(this.itemToBeAdded);
  //   if (itemsUpdatedData.length == 0) {
  //     this.alertService.showError("Add Atlest One Item");
  //   } else {
  //     this.orderDetails = [
  //       {
  //         orderType: this.orderDataById.orderType,
  //         orderMode: 'Offline',
  //         partnerName: '',
  //         partnerId: '',
  //         deliveryPerson: '',
  //         deliveryPersonPhone: ''
  //       }
  //     ];
  //     this.orderHistory = [
  //       {
  //         orderStatus: this.orderStatus,
  //         staffName: ""
  //       }
  //     ];
  //     let data = {
  //       orderId: this.orderId,
  //       discount: this.orderDiscAmount,
  //       orderType: this.orderDataById.orderType,
  //       items: this.menuItemList,
  //       orderDetails: this.orderDetails,
  //       orderStatus: this.orderStatus,
  //       subTotal: this.subTotal,
  //       customerId: this.customerDetails != null && this.customerDetails != undefined ? this.customerDetails.customerId : '',
  //       orderNo: this.orderNo,
  //       orderHistory: this.orderHistory,
  //       orderModifiedHistory: this.modifiedHistory,
  //       outletId: this.outletId,
  //       total: this.total,
  //       numberOfPeople: this.numberofpeople
  //     }
  //     // Update Discount in Session
  //     let discData = JSON.parse(sessionStorage.getItem('orderDiscount' + this.orderId));
  //     if (discData != null && discData != undefined && discData[0].discountType == 'Percentage') {
  //       if (this.orderDisData.promocode == "") {
  //         discData[0].discountedAmount = this.orderDiscAmount;
  //         sessionStorage.setItem('orderDiscount' + this.orderId, JSON.stringify(discData));
  //       }
  //     }

  //     this.loader.startLoader('loader-01');
  //     this.posDataService.updateOrderData(data, this.orderId).subscribe((res) => {
  //       this.loader.stopLoader('loader-01');
  //       let status = res['success'];
  //       let msg = res['message'];
  //       if (status) {
  //         this.qtyDecrement = false;
  //         this.alertService.showSuccess('Order Updated Succesfully');
  //         if (this.isCalled) {
  //           this.paySlipData();
  //           this.isCalled = false;
  //         }
  //       } else {
  //         this.alertService.showError(msg);
  //       }
  //     });
  //   }
  // }

  onClickItemPopUp(value, index, content) {
    this.itemIndex = index;
    this.DiscountOrPromo = value;
    this.modalService.open(content, { ariaLabelledBy: 'modal-basic-title', keyboard: false, backdrop: 'static', windowClass: 'main_add_popup add_discount_popup' }).result.then((result) => {
    }, (reason) => {
      console.log(reason);
    });
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
  // completeOrder() {
  //   let id = this.orderDataById.orderId;
  //   let status = 'Completed'
  //   this.loader.startLoader('loader-01');
  //   this.posDataService.changeOrderStatus(id, status).subscribe((res: any) => {
  //     this.loader.stopLoader('loader-01');
  //     let status = res['success'];
  //     let msg = res['message'];
  //     if (status) {
  //       this.alertService.showSuccess('Order Completed');
  //     } else {
  //       this.alertService.showError(msg);
  //     }
  //   });
  // }

  // payNow() {
  //   sessionStorage.removeItem('PayNowFromDineIn');
  //   if (this.itemToBeAdded.length > 0) {
  //     this.isCalled = true;
  //     this.updateOrder();
  //   } else {
  //     if (this.qtyDecrement) {
  //       this.isCalled = true;
  //       this.updateOrder();
  //     } else {
  //       this.paySlipData();
  //     }
  //   }
  // }

  // paySlipData() {
  //   let data;

  //   let itemInclude = false;
  //   let itemWiseTax = [];
  //   if (this.itemsTaxData.length != 0) {
  //     itemInclude = true;
  //     this.itemsTaxData.forEach(itmTax => {
  //       let obj = {
  //         itemName: itmTax.itemName,
  //         taxName: itmTax['taxMaster'].taxName,
  //         taxPercentage: itmTax['taxMaster'].taxPercentage[0].taxPercentage,
  //         taxAmount: itmTax['taxMaster'].taxAmount,
  //       };
  //       itemWiseTax.push(obj);
  //     });
  //   }
  //   this.updateOrder();
  //   if (this.taxCondition !== null && this.taxCondition !== undefined) {
  //     data = {
  //       subTotal: this.subTotal,
  //       total: this.total,
  //       discount: this.orderDiscAmount,
  //       tax: this.taxData,
  //       isItemIncludeTax: itemInclude,
  //       isItemIncludeTaxPercentage: this.taxCondition.percentage,
  //       itemWiseTax: itemWiseTax
  //     }
  //   } else {
  //     data = {
  //       subTotal: this.subTotal,
  //       total: this.total,
  //       discount: this.orderDiscAmount,
  //       tax: this.taxData,
  //       itemWiseTax: itemWiseTax
  //     }
  //   }
  //   this.posDataShareService.setInvoiceData(data);

  //   this.modalService.open(MakePaymentComponent, { backdrop: 'static', size: 'lg', keyboard: true, centered: true }).result.then((result) => {
  //     this.closeResult = `Closed with: ${result}`;
  //     if (result != null && result.length > 0) {
  //       for (let p = 0; p < result.length; p++) {
  //         let indx = this.menuItemList.map(function (x) { return x.id; }).indexOf(result[p]);
  //         this.menuItemList[indx].isPaid = true;
  //       }
  //     }
  //   }, (reason) => {
  //     this.closeResult = `Dismissed ${this.getDismissReason(reason)}`;
  //   });
  // }
  // CreateInvoice() {
  //   let InvData;

  //   let itemInclude = false;
  //   let itemWiseTax = [];
  //   if (this.itemsTaxData.length != 0) {
  //     itemInclude = true;
  //     this.itemsTaxData.forEach(itmTax => {
  //       let obj = {
  //         itemName: itmTax.itemName,
  //         taxName: itmTax['taxMaster'].taxName,
  //         taxPercentage: itmTax['taxMaster'].taxPercentage[0].taxPercentage,
  //         taxAmount: itmTax['taxMaster'].taxAmount,
  //       };
  //       itemWiseTax.push(obj);
  //     });
  //   }
  //   if (this.taxCondition !== null && this.taxCondition !== undefined) {
  //     InvData = {
  //       subTotal: this.subTotal,
  //       total: this.total,
  //       discount: this.orderDiscAmount,
  //       tax: this.taxData,
  //       isItemIncludeTax: itemInclude,
  //       isItemIncludeTaxPercentage: this.taxCondition.percentage,
  //       itemWiseTax: itemWiseTax
  //     }
  //   } else {
  //     InvData = {
  //       subTotal: this.subTotal,
  //       total: this.total,
  //       discount: this.orderDiscAmount,
  //       tax: this.taxData,
  //       itemWiseTax: itemWiseTax
  //     }
  //   }
  //   let TaxOnly = [];
  //   for (let j = 0; j < InvData.tax.length; j++) {
  //     let obj = {
  //       taxName: '',
  //       taxPercentage: 0,
  //       taxAmount: 0
  //     }
  //     if (InvData.length !== 0) {
  //       obj.taxName = InvData.tax[j].taxName;
  //       obj.taxPercentage = InvData.tax[j].taxSelectedval;
  //       obj.taxAmount = InvData.tax[j].taxAmount;
  //     }
  //     TaxOnly.push(obj);
  //   }

  //   let data = {
  //     orderId: this.orderId,
  //     orderType: this.orderDataById.orderType,
  //     orderDateTime: this.orderDataById.orderDateTime,
  //     subTotal: this.subTotal,
  //     promocode: this.orderDisData?.promocodeName,
  //     isPromocodeApplied: this.orderDisData?.isPromocodeApplied,
  //     promocodeDiscountType: this.orderDisData?.promocodeDiscountType,
  //     promocodeDiscount: this.orderDisData?.promocodeDiscount,
  //     promocodeAmount: this.orderDisData?.promocodeAmount,
  //     discountType: this.orderDisData?.discountType,
  //     discountValue: this.orderDisData?.discountValue,
  //     discountedAmount: this.orderDisData?.discountedAmount,
  //     discountNotes: this.orderDisData?.discountNotes,
  //     discountName: this.orderDisData?.discountName,
  //     taxDetails: TaxOnly,
  //     totalPayableAmount: InvData.total.toFixed(2),
  //     paymentMode: "",
  //     isPaid: false,
  //     isItemIncludeTax: InvData.isItemIncludeTax,
  //     outletId: this.outletId,
  //     itemWiseTax: InvData.itemWiseTax
  //   }

  //   this.loader.startLoader('loader-01');
  //   this.posDataService.postInvoiceData(data).subscribe((res: any) => {
  //     this.loader.stopLoader('loader-01');
  //     let showSuccess = res['success'];
  //     let msg = res['message'];
  //     if (showSuccess) {
  //       sessionStorage.setItem("orderId", this.orderId);
  //       this.modalService.open(PrintVeiwComponent, { backdrop: 'static', size: 'md', keyboard: true, centered: true }).result.then((result) => {
  //         this.closeResult = `Closed with: ${result}`;
  //       }, (reason) => {
  //         this.closeResult = `Dismissed ${this.getDismissReason(reason)}`;
  //       });
  //     }
  //     else {
  //       this.alertService.showError(msg);
  //     }
  //   });
  // }

  async backToPage(content) {
    this.modalService.open(content, { ariaLabelledBy: 'modal-basic-title', keyboard: false, centered: true, backdrop: 'static', windowClass: 'main_add_popup' }).result.then((result) => {
    }, (reason) => {
      if (reason) {
        if (this.currentTableDetails?.orderId)
          this.UpdateOrder(true);
        else {
          if (this.PrimaryOrder?.items?.length > 0)
            this.PlaceOrder(true);
        }
      }
      setTimeout(() => {
        this.router.navigateByUrl('/pos-dashboard/dine-in/order');
      }, 50);
    });
  }
  RedirectDine() {
    setTimeout(() => {
      this.router.navigateByUrl('/pos-dashboard/dine-in/order');
    }, 50);
  }
  // End replicate

  RemoveORClearItems(content, isfromitem, i) {
    if (isfromitem) {
      this.isRemoveItem = true;
      this.ItemIndex = i;
    }
    this.modalService.open(content, { ariaLabelledBy: 'modal-basic-title', keyboard: false, centered: true, backdrop: 'static', windowClass: 'main_add_popup' }).result.then((result) => {
    }, (reason) => {
      console.log(reason);
    });
  }
  CloseOrder() {
    if (this.remark == null) {
      this.alertService.showError("Please Enter remarks");
    }
    // if (this.Enteredpassword != this.currentUser.voidPassword) {
    //   this.isCorrectPass = false;
    //   this.alertService.showError("Please enter your correct void password");
    // }
    else {
      this.posDataService.CloseTable(this.currentTableDetails.tableNo, this.currentOutlet.outletId, this.remark, this.userpassword, this.currentUser.userId).subscribe((res: any) => {
        let showSuccess = res['success'];
        let msg = res['message'];
        if (showSuccess) {
          this.closeAction();
          this.alertService.showSuccess('Table Closed Succesfully');
          this.router.navigate(['/pos-dashboard/dine-in']);
        } else {
          this.alertService.showError(msg);
        }
      });
    }
  }
  closeAction() {
    if (this.modalService.hasOpenModals) {
      this.modalService.dismissAll();
    }
  }
  // Password(event) {
  //   if (this.currentUser.voidPassword != null) {
  //     this.Enteredpassword = event.target.value
  //   }
  // }

  Password(event) {
    this.userpassword = (event.target.value);

  }

  remarks(event) {
    this.remark = event.target.value;
  }

  RemoveOrderDiscount() {
    // sessionStorage.removeItem('orderDiscount' + this.orderId);
    // this.DisableAfterDiscount = false;
    // this.orderDiscAmount = 0;
    // this.orderDisData = null;
    // this.itemTax = [];

    // for (let j = 0; j < this.menuItemList.length; j++) {
    //   this.itemTax.push(this.menuItemList[j].itemId);
    //   this.itemTax.push(this.menuItemList[j].orderQuantity);
    // }

    // let stringIds = this.itemTax.join(",");
    // this.calculateTax(stringIds);
  }
  // calcDiscount() {
  //   this.orderId = sessionStorage.getItem('orderId');
  //   let discData = JSON.parse(sessionStorage.getItem('orderDiscount' + this.orderId));
  //   if (discData != null && discData != undefined) {
  //     this.DisableAfterDiscount = true;
  //     this.orderDisData = discData[0];
  //     if (this.orderDisData.promocode == "") {
  //       this.orderDiscAmount = this.orderDisData.discountedAmount;
  //     } else {
  //       this.orderDiscAmount = this.orderDisData.promocodeAmount;
  //     }
  //     this.CheckEmptyCartAndManageCalculation();
  //   }
  // }

  // private CheckEmptyCartAndManageCalculation() {
  //   if (this.menuItemList.length == 0) {
  //     this.placeOrderEnable = false;
  //     this.subTotal = 0;
  //     this.total = 0;
  //     if (this.taxData.length !== 0) {
  //       this.LoopTaxAndCheckDefaultTax();
  //     }
  //   } else {
  //     this.placeOrderEnable = true;
  //     this.SendDataForTaxCalculation();
  //   }
  // }

  // private SendDataForTaxCalculation() {
  //   this.itemTax = [];
  //   for (let j = 0; j < this.menuItemList.length; j++) {
  //     this.itemTax.push(this.menuItemList[j].itemId);
  //     this.itemTax.push(this.menuItemList[j].orderQuantity);
  //   }
  //   let stringIds = this.itemTax.join(",");
  //   this.subTotal = this.subTotal - this.orderDiscAmount;
  //   this.calculateTax(stringIds);
  // }

  // private LoopTaxAndCheckDefaultTax() {
  //   let tax = this.taxData;
  //   for (let t = 0; t < tax.length; t++) {
  //     for (let v = 0; v < tax[t].taxPercentage.length; v++) {
  //       this.CheckDefaultTax(tax, t, v);
  //     }
  //   }
  // }

  // private CheckDefaultTax(tax: any[], t: number, v: number) {
  //   if (tax[t].taxPercentage[v].isDefault) {
  //     tax[t].taxSelectedval = 0;
  //     tax[t].taxAmount = 0;
  //   }
  // }

  // selectTaxPer(e, i) {
  //   let val = e.target.value;
  //   if (this.orderDiscAmount !== 0) {
  //     let sub = this.subTotal - this.orderDiscAmount;
  //     this.taxData[i].taxSelectedval = val;
  //     this.taxData[i].taxAmount = (val / 100 * sub).toFixed(2);
  //     this.CheckTaxConditions();
  //   } else {
  //     this.CheckTaxConditionsWithoutDiscount(i, val);
  //   }
  // }
  // private CheckTaxConditionsWithoutDiscount(i: any, val: any) {
  //   this.taxData[i].taxSelectedval = val;
  //   this.taxData[i].taxAmount = (val / 100 * this.subTotal).toFixed(2);
  //   if (this.taxCondition.isSubtractFromSubTotal) {
  //     this.total = Number(this.subtotalTax + Number(this.taxConditionVal));
  //   } else {
  //     this.total = this.subTotal;
  //   }

  //   for (let f = 0; f < this.taxData.length; f++) {

  //     if (this.taxData.length !== 0) {
  //       this.total = Number((Number(this.total) + Number(this.taxData[f].taxAmount)).toFixed(2));
  //     }
  //   }
  // }

  // private CheckTaxConditions() {
  //   if (this.taxCondition.isSubtractFromSubTotal) {
  //     this.total = Number(this.subtotalTax + Number(this.taxConditionVal) - this.orderDiscAmount);
  //   } else {
  //     this.total = this.subTotal - this.orderDiscAmount;
  //   }
  //   for (let f = 0; f < this.taxData.length; f++) {
  //     if (this.taxData.length !== 0) {
  //       this.total = Number((Number(this.total) + Number(this.taxData[f].taxAmount)).toFixed(2));
  //     }
  //   }
  // }

  // print(id) {
  //   this.updateOrder();
  //   this.CreateInvoice();
  // }
  // CalculateTaxFunction() {
  //   this.fixedTotal = this.subTotal;
  //   this.totalTax = 0;
  //   if (this.taxCondition.length > 0) {
  //     for (let i = 0; i < this.taxCondition.length; i++) {
  //       this.taxConditionVal = (this.taxCondition[i].percentage / 100 * this.fixedTotal).toFixed(2);
  //       this.CheckAllTaxConditionAndAppllyDefaultTax(i);
  //     }
  //   } else {
  //     this.total = this.subTotal;
  //   }
  // }
  // private CheckAllTaxConditionAndAppllyDefaultTax(i: number) {
  //   if (this.taxCondition[i].isItemIncludeTax && this.taxCondition[i].isSubtractFromSubTotal) {
  //     sessionStorage.setItem("isItemIncludeTax" + this.orderId, 'true');
  //     this.isSecondCase = false;
  //     this.totalTax = Number(this.totalTax + Number(this.taxConditionVal));
  //     if (this.orderDiscAmount === null || this.orderDiscAmount === undefined || this.orderDiscAmount == 0)
  //       this.subTotal = this.subTotal - Number(this.taxConditionVal);
  //     this.total = Number(this.subTotal + Number(this.totalTax));
  //     this.taxData[i].isFirstStatus = true;
  //   } else if (this.taxCondition[i].isItemIncludeTax && !this.taxCondition[i].isSubtractFromSubTotal) {
  //     sessionStorage.setItem("isItemIncludeTax" + this.orderId, 'true');
  //     this.taxData[i].isSecondStatus = true;
  //     this.total = this.subTotal;
  //   } else {
  //     this.totalTax = Number(this.totalTax + Number(this.taxConditionVal));
  //     this.total = Number(this.subTotal + Number(this.totalTax));
  //   }
  // }

  // calculateTax(stringIds) {
  //   this.posDataService.getTaxByItems(stringIds).subscribe((res: any) => {
  //     this.itemTax = res['data'];
  //     let taxDataForItems = [];
  //     let taxConditionForItems = [];
  //     let taxItemAmounts = [];
  //     let taxItemQuantity = [];
  //     this.CalculateItemWiseTax(taxDataForItems, taxConditionForItems, taxItemAmounts, taxItemQuantity);
  //     this.itemsTaxData = taxDataForItems;
  //     this.CalculateTaxFunction();
  //     this.LoopTaxAndCheckConditionOfItemwise(taxConditionForItems, taxItemAmounts, taxItemQuantity);
  //     if (this.orderDiscAmount != null && this.orderDiscAmount != undefined)
  //       this.subTotal = this.subTotal + Number(this.orderDiscAmount);
  //   });
  // }
  // private CalculateItemWiseTax(taxDataForItems: any[], taxConditionForItems: any[], taxItemAmounts: any[], taxItemQuantity: any[]) {
  //   for (let n = 0; n < this.itemTax.length; n++) {
  //     taxDataForItems.push(this.itemTax[n]["taxAndItem"]);
  //     taxConditionForItems.push(this.itemTax[n]["taxCondition"]);
  //     taxItemAmounts.push(this.itemTax[n]['itemAmount']);
  //     taxItemQuantity.push(this.itemTax[n]['itemQuantity']);
  //   }
  //   if (this.taxData.length !== 0) {
  //     this.LoopTaxAndCalculateTotal();
  //   }
  //   if (taxDataForItems.length > 0) {
  //     for (let t = 0; t < taxDataForItems.length; t++) {
  //       this.CheckTaxPercentage(taxDataForItems, t, taxItemAmounts, taxItemQuantity);
  //     }
  //   }
  // }

  // private CheckTaxPercentage(taxDataForItems: any[], t: number, taxItemAmounts: any[], taxItemQuantity: any[]) {
  //   for (let v = 0; v < taxDataForItems[t]["taxMaster"].taxPercentage.length; v++) {
  //     taxDataForItems[t]["taxMaster"].taxSelectedval = taxDataForItems[t]["taxMaster"].taxPercentage[v].taxPercentage;
  //     taxDataForItems[t]["taxMaster"].taxAmount = (taxDataForItems[t]["taxMaster"].taxPercentage[v].taxPercentage / 100 * (taxItemAmounts[t] * taxItemQuantity[t])).toFixed(2);
  //   }
  // }

  // private LoopTaxAndCheckConditionOfItemwise(taxConditionForItems: any[], taxItemAmounts: any[], taxItemQuantity: any[]) {
  //   for (let i = 0; i < taxConditionForItems.length; i++) {
  //     let taxConditionForItemsVal = (taxConditionForItems[i].percentage / 100 * (taxItemAmounts[i] * taxItemQuantity[i])).toFixed(2);
  //     this.CheckTaxConditions1(taxConditionForItems, i, taxConditionForItemsVal);
  //   }
  // }

  // private CheckTaxConditions1(taxConditionForItems: any[], i: number, taxConditionForItemsVal: string) {
  //   if (taxConditionForItems[i].isSubtractFromSubTotal) {
  //     this.isSecondCase = false;
  //     if (taxConditionForItems[i].isItemIncludeTax) {
  //       this.totalTax = Number(this.totalTax + Number(taxConditionForItemsVal));
  //       this.subTotal = this.subTotal - Number(taxConditionForItemsVal);
  //       this.total = Number(this.subTotal + Number(this.totalTax));
  //       this.itemsTaxData[i].isSecondStatus = false;
  //     }

  //   } else {

  //     if (!taxConditionForItems[i].isItemIncludeTax) {
  //       this.itemsTaxData[i].isSecondStatus = false;
  //       this.total = this.total + Number(taxConditionForItemsVal);
  //     } else {
  //       this.itemsTaxData[i].isSecondStatus = true;
  //     }
  //   }
  // }

  // private LoopTaxAndCalculateTotal() {
  //   let tax = this.taxData;
  //   for (let t = 0; t < tax.length; t++) {
  //     for (let v = 0; v < tax[t].taxPercentage.length; v++) {

  //       tax[t].taxSelectedval = tax[t].taxPercentage[v].taxPercentage;
  //       tax[t].taxAmount = (tax[t].taxPercentage[v].taxPercentage / 100 * this.subTotal).toFixed(2);
  //     }
  //   }
  // }

  saveLiveNote(event) {
    this.PrimaryOrder.items[this.selectedItemIndex].notes = event.target.value;
  }
  saveLiveOrderNote(event) {
    this.PrimaryOrder.orderNotes = event.target.value;
  }
  
  savenote() {
    this.closeModal(true);
    this.alertService.showSuccess('Your Note is saved Successfully!');
  }

  closeModal(result) {
    this.modalService.dismissAll(result);
  }
  closeModifierModal(result) {
    //Display only item level modifiers check box, or else from master it will get checked if user open another item.
    this.allModifiers.forEach(element => {
      element.isChecked = false;
    });
    this.modalService.dismissAll(result);
  }

  // numofPeople(event) {
  //   this.numberofpeople = event.target.value;
  // }

  // async startPrepare(itemId, index) {
  //   if (!this.runningOrder) {
  //     this.menuItemList[index].itemStatus = "Order";
  //   } else {
  //     let itemIds = [];
  //     itemIds.push(itemId);
  //     let status = "Order";
  //     (await this.posDataService.changeMultipleItemStatus(this.orderId, itemIds, status)).subscribe((res: any) => {
  //       let msg = res['message'];
  //       let showSuccess = res['success'];
  //       if (showSuccess) {

  //         this.alertService.showSuccess(msg);
  //         this.menuItemList[index].itemStatus = status;
  //       } else {
  //         this.alertService.showError(msg);
  //       }
  //     });
  //   }
  // }




  mergeTable() {
    sessionStorage.setItem('TableNum', this.currentTableDetails.tableNo);
    sessionStorage.setItem('tableId', this.currentTableDetails.tableId);
    this.modalService.open( { backdrop: 'static', keyboard: true, centered: true, windowClass: 'main_add_popup' }).result.then((result) => {
      this.alertService.showSuccess("Sucessfully moved");
      this.router.navigate(['/pos-dashboard/dine-in']);
    }, (reason) => {
      this.router.navigate(['/pos-dashboard/dine-in']);
    });
  }

  

  addCustomer() {
    let data = {
      customerId: '',
      customerName: this.customerForm.get('cusName').value,
      address: this.customerForm.get('address').value,
      phoneNumber: this.customerForm.get('phone').value,
      outletId: this.outletId,
      orderType: this.orderType,
      totalPoints: 0,
      convertedAmount: 0,
    }
     sessionStorage.setItem('customerData', null);
     this.customerData = JSON.parse(sessionStorage.getItem('customerData'))
  const cusName = this.customerForm.get('cusName')?.value?.trim();
  const phone = this.customerForm.get('phone')?.value?.trim();

  // If cusName is filled, but phone is empty → block and show toast
  if (cusName && !phone) {
    this.alertService.showWarning("Enter the phone number")
    return;
  }
    function isValid(value) {
      return value !== null && value !== undefined && value !== '';
    }
    if (isValid(data.customerName) && isValid(data.phoneNumber)) {

    if (this.getCustomerDataByEventId != undefined && data.phoneNumber == this.getCustomerDataByEventId.phoneNumber) {
      data.customerId = this.getCustomerDataByEventId.customerId;
      data.totalPoints = this.getCustomerDataByEventId.totalPoints;
      data.convertedAmount = this.getCustomerDataByEventId.convertedAmount;
      this.posDataService.updateCustomerDetails(this.getCustomerDataByEventId.customerId, data).subscribe((res: any) => {
        let msg = res['message'];
        let Data = res['data'];
        let status = res['success'];
        if (status) {
          sessionStorage.setItem('customerData', JSON.stringify(Data));
          sessionStorage.setItem('orderType', 'Dine-in');
          sessionStorage.setItem('tableOrder', 'new');
          // sessionStorage.setItem('page', 'Dine-in');
          if(this.PrimaryOrder.orderId != null)
             this.UpdateOrder(false)
          this.customerForm.reset();
         this.customerData = JSON.parse(sessionStorage.getItem('customerData'))
          
        } else {
          this.alertService.showError(msg);
        }
      });
    } else {

      this.posDataService.postCustomerDetails(data).subscribe((res: any) => {

        let Data = res['data'];
        let msg = res['message'];
        let status = res['success'];
        if (status) {
          //Here we are storing the Add Order Data to the session Storage.
          sessionStorage.setItem('customerData', JSON.stringify(Data));
          this.alertService.showSuccess(msg);
          sessionStorage.setItem('orderType', 'Dine-in');
          sessionStorage.setItem('tableOrder', 'new');
          //sessionStorage.setItem('page', 'Dine-in');
            this.customerData = JSON.parse(sessionStorage.getItem('customerData'));
          this.alertService.showSuccess(msg);
        }
      });
      this.customerForm.reset();
      this.customerData = JSON.parse(sessionStorage.getItem('customerData'));

    }
    } 
    

  }

  getAllCustomers() {
    this.ngxLoader.startLoader('loader-01')
    this.posDataService.getAllCustomers(this.outletId, 'Dine-in').subscribe((response) => {
      this.ngxLoader.stopLoader('loader-01');
      console.log("getAllCustomers", response);
      this.tempcostomerData = response['data'];
      this.costomerData = response['data'];
    })
  }
    patchCustomerData() {
    this.customerForm.patchValue({
      cusName: this.getCustomerDataByEventId.customerName,
      phone: this.getCustomerDataByEventId.phoneNumber,
      address: this.getCustomerDataByEventId.address
    });
  }
 search(): void {

    let input = this.searchInput;
    if (input == '') {
      this.costomerData = this.getAllCustomers;
    } else {
      this.costomerData = this.getAllCustomers
    }
  }
  searchItem(): void {
    let input = this.searchInputItem;

    if (input == '') {
      this.costomerData = this.tempcostomerData;
    } else {

      this.costomerData = this.tempcostomerData?.filter((res: any) => {
        return res.customerName.toLocaleLowerCase().match(input?.toLocaleLowerCase());
      });


    }
  }
   getCustomer(event): void {
    let custId = event.option.value;
    this.getCustomerDataByEventId = this.tempcostomerData.find(x => x.customerId == custId);
    this.patchCustomerData();
  }
  restform(){
    this.customerForm.reset();
  }

}
