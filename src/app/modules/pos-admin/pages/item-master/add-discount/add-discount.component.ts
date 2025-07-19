import { Component, OnInit } from '@angular/core';
import { AlertService } from '@core/services/common/alert.service';
import { PosDataService } from '@core/services/pos-system/pos-data.service';
import { PosDataShareService } from '@core/services/pos-system/posDataShare.service';
import { NgbActiveModal, NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { NgxUiLoaderService } from 'ngx-ui-loader';
import { filter } from 'rxjs/operators';

@Component({
  selector: 'app-add-discount',
  templateUrl: './add-discount.component.html',
  styleUrls: ['./add-discount.component.css']
})
export class AddDiscountComponent implements OnInit {
  closeResult: string;
  id: any;
  itemData: any;
  promocode: any;
  discount = [];
  normalDiscount = false;
  promoDiscount = false;
  showNormalForm = false;
  showPromoForm = false;
  selctedNormalDiscount = [];
  selctedPromoDiscount = [];
  discountData = [];
  orderLevel = false;
  amount = 0;
  outletId: any;
  orderId: any;
  orderData: any;

  constructor(
    private ngxLoader: NgxUiLoaderService,
    private activeModal: NgbActiveModal,
    private alertService: AlertService,
    private posDataService: PosDataService,
    private posDataSharedService: PosDataShareService
  ) { }

  ngOnInit(): void {
    this.orderId = sessionStorage.getItem('orderId');
    this.outletId = sessionStorage.getItem('activeOutletId');
    this.id = this.posDataSharedService.getIdForItemDiscount();
    this.checkDiscount();
    this.getDiscount();
    this.getPromoCode();
  }

  checkDiscount() {
    if (sessionStorage.getItem('orderLevelDisc') == 'true') {
      setTimeout(() => {
        this.getOrderByIdData();
      }, 1000);
    } else {
      this.getItemDataById();
    }
  }

  getOrderByIdData() {
    this.ngxLoader.startLoader('loader-01');
    this.posDataService.getOrderById(this.id).subscribe((res: any) => {
      this.ngxLoader.stopLoader('loader-01');
      this.orderData = res['data'];
      let success = res['success'];
      let msg = res['message'];
      if (success) {
        this.itemData = this.orderData;
        for (let k = 0; k < this.orderData.items.length; k++) {
          this.amount = this.orderData.subTotal;
        }
        this.orderLevel = true;
      }
      else {
        this.alertService.showError(msg);
      }
    });
  }

  getItemDataById() {
    this.ngxLoader.startLoader('loader-01');
    this.posDataService.getItemById(this.id).subscribe((res: any) => {
      this.ngxLoader.stopLoader('loader-01');
      let data = res['data'];
      let success = res['success'];
      let msg = res['message'];
      if (success) {
        this.itemData = data;
        this.onDiscountPromo();
        this.amount = this.itemData.itemAmount;
      }
      else {
        this.alertService.showError(msg);
      }
    });
  }

  getPromoCode() {
    let jsonData : any={};
    jsonData.outletId = sessionStorage.getItem('activeOutletId');
    jsonData.isAllItem = true;
    this.ngxLoader.startLoader('loader-01');
    this.posDataService.getPromocodeByOutletId(jsonData).subscribe((res: any) => {
      this.ngxLoader.stopLoader('loader-01');
      this.promocode = res['data'];
      let success = res['success'];
      let msg = res['message'];
      this.promoDiscount = true;
      if (!success) {
        this.alertService.showError(msg);
      }
    });
  }

  getDiscount() {
    let DisountIn = sessionStorage.getItem('DiscountIn');
    sessionStorage.removeItem('DiscountIn');
    this.ngxLoader.startLoader('loader-01');
    let obj = {
      outletId: this.outletId,
      isAllItem: true,
    }
    this.posDataService.getAllDiscountByOutletId(obj).subscribe((res: any) => {
      this.ngxLoader.stopLoader('loader-01');
      let discount = res['data'];
      let success = res['success'];
      let msg = res['message'];
      if (success) {
        if (DisountIn == 'DineIn')
          this.discount = discount.filter(x => x.activeStatus && x.discountDineIn);
        else if (DisountIn == 'Online')
          this.discount = discount.filter(x => x.activeStatus && x.discountEOrder);
        else if (DisountIn == 'Take')
          this.discount = discount.filter(x => x.activeStatus && x.discountTakeAway);
        else
          this.discount = discount.filter(x => x.activeStatus);
      }
      else {
        this.alertService.showError(msg);
      }
    });
  }

  closeModal() {
    this.activeModal.close(0);
  }

  onDiscount() {
    let id = document.getElementById('discBtn');
    id.style.border = '2px solid #2483ad';
    document.getElementById('promoBtn').style.border = '1px solid #ffffff';
    this.normalDiscount = true;
    this.promoDiscount = false;
    this.selctedNormalDiscount = [];
    this.selctedPromoDiscount = [];
    this.discountData = this.itemData?.discount?.map((d) => d) ?? [];
    this.discount?.forEach((data) => {
      data.checked = this.itemData?.discount?.some((ItemDiscount) => ItemDiscount == data.discountId)
      if (data.checked) {
        this.selctedNormalDiscount.push(data);
        //this.discountData.push(data.discountId);
        this.showNormalForm = true;
      }
    })

  }

  onDiscountPromo() {
    let id = document.getElementById('promoBtn');
    id.style.border = '2px solid #2483ad';
    document.getElementById('discBtn').style.border = '1px solid #ffffff';
    this.normalDiscount = false;
    this.promoDiscount = true;
    this.selctedNormalDiscount = [];
    this.selctedPromoDiscount = [];
    this.discountData = this.itemData?.discount?.map((d) => d) ?? [];
    this.promocode?.forEach((data) => {
      data.checked = this.itemData?.discount?.some((ItemDiscount) => ItemDiscount == data.promocodeId);
      if (data.checked) {
        this.selctedPromoDiscount.push(data);
        this.showPromoForm = true;
        //this.discountData.push(data.promocodeId);
      }
    })
  }

  normalDisc(event, data) {
    if (event.target.checked) {
      let selctedNormalDiscountData = {
        discountType: data.discountType,
        discountValue: data.discountValue,
        discountedAmount: 0,
        discountNotes: data.discountName,
        discountName: data.discountName,
        discountId: data.discountId
      }
      let discountVal = selctedNormalDiscountData.discountValue;
      if (selctedNormalDiscountData.discountType == 'Percentage') {
        selctedNormalDiscountData.discountedAmount = parseInt((discountVal / 100 * this.amount).toFixed(2));
      } else {
        selctedNormalDiscountData.discountedAmount = discountVal;
      }
      this.showNormalForm = true;
      this.selctedNormalDiscount.push(selctedNormalDiscountData);
      this.discountData.push(data.discountId);
    } else {
      this.selctedNormalDiscount = this.selctedNormalDiscount?.filter((d) => d.discountId != data.discountId);
      this.discountData = this.discountData?.filter((d) => d != data.discountId);
    }
    // this.discountData = [
    //   {
    //     promocode: "",
    //     isPromocodeApplied: false,
    //     promocodeDiscountType: "",
    //     promocodeDiscount: 0,
    //     promocodeAmount: 0,
    //     discountType: this.selctedNormalDiscount.discountType,
    //     discountValue: this.selctedNormalDiscount.discountValue,
    //     discountedAmount: this.selctedNormalDiscount.discountedAmount,
    //     discountNotes: this.selctedNormalDiscount.discountName,
    //     discountName: this.selctedNormalDiscount.discountName
    //   }
    // ]

  }

  promoDisc(event, data) {
    if (event.target.checked) {
      let selctedPromoDiscountData = {
        promocodeType: data.promocodeType,
        promocodeValue: data.promocodeValue,
        discountedAmount: 0,
        promocodeDiscountType: data.discountType,
        discountNotes: data.promocodeName,
        discountName: data.promocodeName,
        promocodeId: data.promocodeId
      }
      let discountVal = selctedPromoDiscountData.promocodeValue;

      if (selctedPromoDiscountData.promocodeType == 'Percentage') {
        selctedPromoDiscountData.discountedAmount = parseInt((discountVal / 100 * this.amount).toFixed(2));
      } else {
        selctedPromoDiscountData.discountedAmount = discountVal;
      }
      this.showPromoForm = true;
      this.selctedPromoDiscount.push(selctedPromoDiscountData);
      this.discountData.push(data.promocodeId);
    } else {
      this.selctedPromoDiscount = this.selctedPromoDiscount?.filter((d) => d.promocodeId != data.promocodeId);
      this.discountData = this.discountData?.filter((d) => d != data.promocodeId);
    }
    // this.discountData = [
    //   {
    //     promocode: this.selctedPromoDiscount.promocode,
    //     isPromocodeApplied: true,
    //     promocodeDiscountType: this.selctedPromoDiscount.promocodeType,
    //     promocodeDiscount: this.selctedPromoDiscount.promocodeValue,
    //     promocodeAmount: this.selctedPromoDiscount.discountedAmount,
    //     discountType: "",
    //     discountValue: 0,
    //     discountedAmount: 0,
    //     discountNotes: this.selctedPromoDiscount.discountName,
    //     discountName: this.selctedPromoDiscount.discountName,
    //   }
    // ]

  }


  addDiscount() {
    let ActiveOutlet = [];
    ActiveOutlet.push(JSON.parse(sessionStorage.getItem('activeOutlet')).outletId);
    let data = {
      item: {
        id: this.itemData.id,
        itemName: this.itemData.itemName,
        description: this.itemData.description,
        itemCategoryId: this.itemData.itemCategoryId,
        CategoryId: this.itemData.itemCategoryId,
        itemSubCategoryId: this.itemData.itemSubCategoryId,
        itemAmount: this.itemData.itemAmount,
        bomDetails: this.itemData.bomDetails,
        isReadyMade: this.itemData.isReadyMade,
        modifiers: this.itemData.modifiers,
        discount: this.discountData,
        imageName: this.itemData.imageName,
        imageExtension: this.itemData.imageExtension,
        recipe: this.itemData.recipe,
        isActive: this.itemData.isActive,
        preparingTime: this.itemData.preparingTime,
        taxId:this.itemData.taxId,
        imagePath:this.itemData.imagePath,
        itemTypes: this.itemData.itemTypes,
        isApproved: this.itemData.isApproved,

        MultipleImagePath : this.itemData.multipleImagePath
      },
      image: this.itemData.image,
      outlets: ActiveOutlet
    }
    if (this.discountData.length == 0) {
      this.alertService.showError('Please Select Modifier Group');
    } else {
      this.ngxLoader.startLoader('loader-01');
      this.posDataService.updateItemData(data, this.id).subscribe((res: any) => {
        this.ngxLoader.stopLoader('loader-01');
        let status = res['success'];
        let msg = res['message'];
        if (status) {
          this.activeModal.close(status);
          this.alertService.showSuccess(msg);
        } else {
          this.alertService.showError(msg);
        }
      });
    }
  }

  addOrderDiscount() {
    if (this.discountData.length == 0) {
      this.alertService.showError('Please Select Modifier Group');
    } else {
      sessionStorage.setItem('orderDiscount' + this.orderId, JSON.stringify(this.discountData));
      sessionStorage.setItem('orderDiscountId', this.itemData.orderId);
      this.alertService.showSuccess('Discount Added Successfully');
      sessionStorage.removeItem('orderLevelDisc');
      this.activeModal.close(true);
    }
  }
}
