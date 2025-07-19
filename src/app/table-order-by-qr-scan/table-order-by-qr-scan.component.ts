import { Component, ElementRef, OnInit, ViewChild, NgZone, TemplateRef } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';
import { AlertService } from '@core/services/common/alert.service';
import { PosDataService } from '@core/services/pos-system/pos-data.service';
import { ModalDismissReasons, NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { NgxUiLoaderService } from 'ngx-ui-loader';
import { stringify } from 'querystring';
import { interval } from 'rxjs';
import { environment } from 'src/environments/environment';
//import { CarouselModule } from 'ngx-owl-carousel-o';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';

@Component({
  selector: 'table-order-by-qr-scan',
  templateUrl: './table-order-by-qr-scan.component.html',
  styleUrls: ['./table-order-by-qr-scan.component.css']
})

export class TableOrderByQRScanComponent implements OnInit {
  @ViewChild('carouselTrack') carouselTrack!: ElementRef;
  @ViewChild('carouselWrapper') carouselWrapper!: ElementRef;
  currentIndex = 0;
  carouselInterval: any;
  imageWidth = 300;
  ImageDetails = {
    multipleImagePath: [] as string[],
    itemName: '' as string,
    Discription: '' as string
  };
  customOptions = {}
  isDataLoaded: any;
  allCategoryList: any;
  searchText: string = '';
  userForm: FormGroup;
  OutletId: any;
  TableId: any;
  OrderId: any;
  TableDetails: any;
  interval: NodeJS.Timeout;
  allItems: any;
  PrimaryOrder: any;
  BaseUrl: any;
  PageToLoad: number
  closeResult: string;
  Modifiers: any;
  Ingredients: any;
  itemDataToSelectModifier: any;
  SelectedModifiers = [];
  allModifiersByOutlet: any;
  allModifiersTotalAmount = 0;
  itemDiscountList = [];
  outletName: string
  itemTaxList = [];
  allTaxes = [];
  LoginPersonItem: any;
  ItemId: string;
  allDiscounts = [];
  orderHistory: any;
  CustomerLoginData: any;
  GeneralSettingData: any;
  ShowMore: { [key: string]: boolean } = {};
  constructor(private router: Router,
    private modalService: NgbModal,
    private ngxLoader: NgxUiLoaderService,
    private posDataService: PosDataService,
    private route: ActivatedRoute,
    private alertService: AlertService,
    private fb: FormBuilder,
    private zone: NgZone

  ) { }
  ngOnInit(): void {
    this.userForm = this.fb.group({
      name: ['', [Validators.required, Validators.minLength(2)]],
      //email: ['', [Validators.email]],
      mobile: ['', [Validators.required, Validators.pattern('^[0-9]{10}$')]],
    });
    this.OutletId = this.route.snapshot.paramMap.get('outletId') || '';
    sessionStorage.setItem("OutletId", JSON.stringify(this.OutletId));
    this.TableId = this.route.snapshot.paramMap.get('tableId') || '';
    this.outletName = this.route.snapshot.paramMap.get('outletName');
    sessionStorage.setItem("OutLetName", JSON.stringify(this.outletName));
    sessionStorage.setItem("TableId", JSON.stringify(this.TableId));
    this.BaseUrl = environment.apiUrl.replace(/^(.*:\/\/[^\/]+\/).*$/, '$1');
    this.newOrderObjectInitialized();
    if (JSON.parse(sessionStorage.getItem("CustomerLoginData"))) {
      this.PageToLoad = 3;
      this.OrderId = JSON.parse(sessionStorage.getItem("orderHistory"))?.orderId;
      this.orderHistory = JSON.parse(sessionStorage.getItem("orderHistory"))
      this.GetTableDetailsById('notLogin');
    }
    else {
      this.PageToLoad = 1;
      setTimeout(() => {
        this.PageToLoad = 2;
      }, 2000);
    }
    if (sessionStorage.getItem("CartData"))
      this.PrimaryOrder = JSON.parse(sessionStorage.getItem("CartData"));

  }

  toggleIsActive(itemId: string) {
    this.ShowMore[itemId] = !this.ShowMore[itemId];
  }
  isItemActive(itemId: string): boolean {
    return !!this.ShowMore[itemId];
  }
  getShortDescription(description: string): string {
    if (!description) return '';
    if(description?.length > 100)
    return description.split(' ').slice(0, 10).join(' ') + '...';
    else
    return description;
  }
  ngOnDestroy() {
    clearInterval(this.interval);
    //if (this.carouselInterval) {
    clearInterval(this.carouselInterval);
    //}
  }
  ngAfterViewInit() {
    const inputElement: HTMLInputElement | null = document.getElementById("searchInput") as HTMLInputElement;

    if (inputElement) {
      let index: number = 0;

      setInterval(() => {
        inputElement.placeholder = "search for" + " " + this.allItems[index].itemName;
        index = (index + 1) % this.allItems.length;
      }, 2000);
    } else {
      console.error("Input element with id 'searchInput' not found.");
    }
  }
  navigateToCart(PageToload) {
    sessionStorage.setItem('CartData', JSON.stringify(this.PrimaryOrder));
    sessionStorage.setItem('PageToload', JSON.stringify(PageToload));
    this.router.navigate(['/myordercart']);
  }
  GetAllMasters() {
    this.ngxLoader.startLoader('loader-01');
    this.posDataService.GetMasterDataForQr(this.OutletId).subscribe((response: any) => {
      this.ngxLoader.stopLoader('loader-01');
      let MasterData = response['data'];
      this.allCategoryList = MasterData.category;
      this.allItems = MasterData.items;
      this.allItems = this.allItems.filter(x => !x.isBatchRecipe);
      this.allTaxes = MasterData.tax;
      sessionStorage.setItem("GeneralSetting", JSON.stringify(MasterData.generalSetting))
      this.GeneralSettingData = MasterData.generalSetting;
      sessionStorage.setItem("TaxItem", JSON.stringify(this.allTaxes));
      this.allModifiersByOutlet = MasterData.modifiers;
      for (let i = 0; i < this.allItems?.length; i++) {
        this.allItems[i].imagePath = this.allItems[i].imagePath === null || this.allItems[i].imagePath === "null" ? null : this.allItems[i].imagePath?.match(/Uploads.*/)[0];
        this.allItems[i].itemId = this.allItems[i].id;
      }
      this.allCategoryList = this.allCategoryList
        .map(category => {
          category.items = this.allItems?.filter(item => item.categoryId === category.categoryId);
          category.Isopen = true;
          return category;
        })
        .filter(category => category.items && category.items.length > 0);
      let cartData = JSON.parse(sessionStorage.getItem("CartData"));
      console.log("categoryData", this.allCategoryList);
      if (cartData?.items) {
        this.PrimaryOrder = JSON.parse(sessionStorage.getItem("CartData"));
        this.PrimaryOrder.items.forEach((Data) => {
          this.OnClickAdd(Data, true)
        })
      }

      let success = response['success'];
      if (success) {
        this.isDataLoaded = true;
      }
      else {
        this.isDataLoaded = true;
      }

    })
  }
  OnClickAdd(item, isAddMore) {
    this.allCategoryList?.forEach((category) => {
      category.items?.forEach((data) => {
        if (data.id == item.itemId) {
          data.IsAdded = true;
          if (!isAddMore) {
            data.orderQuantity = 1;
            this.AddItemIntoMainObject(item);
            this.CommonCalculation();
          } else {
            data.orderQuantity = item.orderQuantity; // Optional: you can skip this if no change
          }
        }
      });
    });
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
      tableNo: this.TableDetails.tableNo,
      itemWiseTax: item.taxId ? this.AddTaxToItem(item) : [],
      itemStatus: this.GeneralSettingData.directPlaceOrder == true ? "Ordered" : "InCart",
      tableType: this.TableDetails.tableType,
      itemTotal: item.itemAmount,
      modifiers: [],
      discount: [],
      isPrinted: false,
      ModifiersIds: item?.modifiers,
      customerId: JSON.parse(sessionStorage.getItem("CustomerLoginData")).customerId,
      customerName: JSON.parse(sessionStorage.getItem("CustomerLoginData")).customerName
    }
    this.PrimaryOrder.items?.push(newItem);
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

  newOrderObjectInitialized() {
    this.itemTaxList = [];
    this.PrimaryOrder = {
      orderId: null,
      orderType: 'Dine-in',
      items: [],
      customerId: '',
      orderNo: 0,
      orderDetails: [],
      orderNotes: null,
      totalDiscount: 0,
      orderStatus: "Running",
      createdBy: null,
      createdByName: "",
      isDeleted: false,
      isVoidOrder: false,
      isAccepted: true,
      deliverectId: null,
      isMerged: false,
      isPrinted: false,
      mergedWith: null,
      numberOfPeople: null,
      outletId: this.OutletId,
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
      tableId: this.TableId
    };
  }
  QuantityDecreament(CategoryIndex, ItemIndex, item) {
    //let AllowDecreament = true;
    // this.PrimaryOrder?.items?.forEach((order) => {
    //   if (order.itemId == item.id) {
    //     if (this.LoginPersonItem?.length > 0) {
    //       let OrderItem = this.LoginPersonItem?.find((data) => data.itemId == order.itemId)
    //       if (OrderItem?.itemStatus == "Ordered" && OrderItem?.orderQuantity == order?.orderQuantity)
    //         AllowDecreament = false;
    //       else
    //         order.orderQuantity--
    //     }
    //     else
    //       order.orderQuantity--;
    //   }
    // })
    //if (AllowDecreament == true) {
    this.allCategoryList.forEach((category) => {
      category.items.forEach((data) => {
        if (data.id == item.id) {
          data.orderQuantity--;
          if (data.orderQuantity == 0) {
            data.IsAdded = false;
            this.PrimaryOrder.items = this.PrimaryOrder.items.filter((data) => data.itemId != item.id)
          }
        }
      })
    })
    //}
    this.CommonCalculation();
  }
  QuantityIncreament(CategoryIndex, ItemIndex, itemId) {
    this.allCategoryList.forEach((category) => {
      category.items.forEach((data) => {
        if (data.id == itemId)
          data.orderQuantity++;
      })
    })
    this.PrimaryOrder.items?.forEach((data) => {
      if (data.itemId == itemId)
        data.orderQuantity++;
    })
    this.CommonCalculation();
  }
  ManualQuantityChange(quantity, index) {
    if (quantity.length > 4) {
      this.alertService.showError("You can not order this many quantity");
      return;
    }
    this.PrimaryOrder.items[index].orderQuantity = quantity;
    this.CommonCalculation();
  }

  // Calculation Starts.
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
  // Calculation Completed

  closeAction() {
    if (this.modalService.hasOpenModals) {
      this.modalService.dismissAll();
    }
  }


  getAllTaxs() {
    this.posDataService.getTaxByOutletId(this.OutletId, false).subscribe(res => {
      if (res.success) {
        this.allTaxes = res.data;
      } else {
        this.alertService.showError(res.message);
        return null;
      }
    });
  }
  getAllDiscounts() {
    let obj = {
      outletId: this.OutletId,
      isAllItem: false,
    }
    this.posDataService.getAllDiscountByOutletId(obj).subscribe(res => {
      if (res.success) {
        this.allDiscounts = res['data'];
      } else {
        this.alertService.showError(res.message);
        return null;
      }
    });
  }
  OnClickArrow(indx) {
    this.allCategoryList[indx].Isopen = !this.allCategoryList[indx].Isopen
  }
  MenuPage() {
    if (this.userForm.invalid) {
      this.alertService.showWarning('Fields are empty');
      return;
    }
    else
      this.CustomerRegistration();
  }
  async CustomerRegistration() {
    this.ngxLoader.startLoader('loader-01');
    let jsonData: any = {};
    jsonData.CustomerName = this.userForm.controls.name.value,
      jsonData.MobileNumber = this.userForm.controls.mobile.value;
    this.posDataService.CreateCusotmer(jsonData).subscribe(async (response: any) => {
      this.ngxLoader.stopLoader('loader-01');
      this.PageToLoad = 3;
      this.CustomerLoginData = response['data'];
      this.alertService.showSuccess(response.message)
      sessionStorage.setItem('token', this.CustomerLoginData.token);
      sessionStorage.setItem('CustomerLoginData', JSON.stringify(this.CustomerLoginData));
      this.GetTableDetailsById('login');

    });
  }
  async GetOrderByOrderId(value) {
    this.ngxLoader.startLoader('loader-01');
    await this.posDataService.getOrderById(this.OrderId).subscribe(res => {
      if (res.success) {
        this.orderHistory = res.data;
        sessionStorage.setItem("orderHistory", JSON.stringify(this.orderHistory));
        for (let i = 0; i < this.orderHistory.items?.length; i++) {
          this.orderHistory.items[i].imagePath = this.orderHistory.items[i].imagePath === null || this.orderHistory.items[i].imagePath === "null" ? null : this.orderHistory.items[i].imagePath?.match(/Uploads.*/)[0];
        }

        this.LoginPersonItem = this.orderHistory.items.filter((data) => data.customerId == JSON.parse(sessionStorage.getItem("CustomerLoginData")).customerId);

        this.ngxLoader.stopLoader('loader-01');
      } else {
        this.alertService.showError(res.message);
      }
    });
  }
  async GetTableDetailsById(value): Promise<any> {
    //this.ngxLoader.startLoader('loader-01');
    await this.posDataService.getTableMasterById(JSON.parse(sessionStorage.getItem("TableId"))).subscribe(res => {
      if (res.success) {
        this.TableDetails = res.data;
        sessionStorage.setItem("tableNo", JSON.stringify(this.TableDetails?.tableNo));
        this.OrderId = this.TableDetails?.orderId
        this.GetAllMasters();
        setTimeout(() => {
          if (this.TableDetails.tableStatus == "Occupied") {
            this.GetOrderByOrderId(value);
          }
        }, 1000)
      } else {
        this.alertService.showError(res.message);
      }
    });
  }
  openModifier(content, item) {
    this.ItemId = item.id;
    this.Modifiers = [];
    this.Ingredients = [];
    this.SelectedModifiers = [];
    this.itemDataToSelectModifier = item.itemName;
    item?.modifiers?.forEach((itemModifier) => {
      let modifiers = this.allModifiersByOutlet.find((Modifier) => Modifier.id == itemModifier);
      if (modifiers)
        if (modifiers?.modifierType == "Modifiers")
          this.Modifiers.push(modifiers);
        else if (modifiers?.modifierType == "Ingredients")
          this.Ingredients.push(modifiers);
    })
    sessionStorage.setItem('isNewTable', 'true');
    this.OnClickAdd(item, false);
    if (this.Modifiers != null && this.Modifiers?.length > 0 || (this.Ingredients != null && this.Ingredients?.length > 0)) {
      this.modalService.open(content, { backdrop: 'static', windowClass: 'main_add_popup food_customization_popup', keyboard: true, centered: true }).result.then((result) => {
        this.closeResult = `Closed with: ${result}`;
      });
    }
  }
  OnSelectModifier(event, data) {
    let indx = this.PrimaryOrder.items?.findIndex((data) => data.itemId == this.ItemId);
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
  OnAddingModifiers() {
    let indx = this.PrimaryOrder.items.findIndex((data) => data.itemId == this.ItemId)
    this.PrimaryOrder.items[indx].modifiers = this.SelectedModifiers;
    sessionStorage.setItem("CartData", JSON.stringify(this.PrimaryOrder));
    this.CommonCalculation();
    this.closeAction();
  }
  getFilteredCategories(): any[] {
    const text = this.searchText.trim().toLowerCase();

    if (!text) {
      // No filter, return everything
      return this.allCategoryList;
    }

    return this.allCategoryList
      .map(category => {
        const categoryMatch = category.categoryName.toLowerCase().includes(text);
        const filteredItems = (category.items || []).filter((item: any) =>
          item.itemName?.toLowerCase().includes(text)
        );
        if (categoryMatch || filteredItems.length > 0) {
          return {
            ...category,
            items: filteredItems.length > 0 || categoryMatch ? filteredItems : []
          };
        }
        return null;
      })
      .filter(category => category !== null);
  }
  OnClickImage(item: any, content: TemplateRef<any>) {
    //clearInterval(this.carouselInterval);
    this.currentIndex = 0;

    const mainImage = this.BaseUrl + item.imagePath?.match(/Uploads.*/)[0];
    const others = item.multipleImagePath?.map((p: string) => this.BaseUrl + p.match(/Uploads.*/)[0]) || [];
    this.ImageDetails.multipleImagePath = [mainImage, ...others];
    this.ImageDetails.itemName = item.itemName;
    this.ImageDetails.Discription = item.description ?? ''
    this.customOptions = {
      loop: true,
      autoplay: true,
      autoplayTimeout: 3000,
      autoplayHoverPause: true,
      items: 1,
      nav: false,
      dots: true,
      touchDrag: true,
      mouseDrag: true,
      pullDrag: true,
      responsive: {
        0: { items: 1 },
        600: { items: 1 },
        1000: { items: 1 },
        2000: { items: 1 }
      }
    };
    if (this.ImageDetails.multipleImagePath) {
      this.modalService.open(content, {
        backdrop: 'static',
        centered: true,
        windowClass: 'food_customization_popup item_details_popup',
        size: 'lg'
      });
    }
  }


  // startCarousel() {
  //   const track = this.carouselTrack?.nativeElement;
  //   const wrapper = this.carouselWrapper?.nativeElement;

  //   if (!track || !wrapper) return;

  //   const imageCount = this.ImageDetails.multipleImagePath.length;
  //   const wrapperWidth = wrapper.offsetWidth;

  //   // Set total width of carousel track
  //   track.style.width = `${imageCount * wrapperWidth}px`;

  //   // Start interval scroll
  //   this.carouselInterval = setInterval(() => {
  //     this.currentIndex = (this.currentIndex + 1) % imageCount;
  //     track.style.transform = `translateX(-${this.currentIndex * wrapperWidth}px)`;
  //   }, 500);
  // }
}
