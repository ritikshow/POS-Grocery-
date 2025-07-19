import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { AlertService } from '@core/services/common/alert.service';
import { PosSharedService } from '@core/services/common/pos-shared.service';
import { PosDataService } from '@core/services/pos-system/pos-data.service';
import { PosDataShareService } from '@core/services/pos-system/posDataShare.service';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';
import { NgxUiLoaderService } from 'ngx-ui-loader';

@Component({
  selector: 'app-item-discount',
  templateUrl: './item-discount.component.html',
  styleUrls: ['./item-discount.component.css']
})
export class ItemDiscountComponent implements OnInit {
  itemDetails: any;
  itemData: any;
  itemDiscountData: any;
  promoDiscountData: any;
  normalDiscountData: any;
  selctedNormalDiscount: any;
  selctedPromoDiscount: any;
  quantity: any;
  showNormalForm = false;
  showPromoForm = false;
  normalDiscount = false;
  promoDiscount = false;
  discountData: any;

  constructor(
    private ngxLoader: NgxUiLoaderService,
    private activeModal: NgbActiveModal,
    private posSharedService: PosSharedService,
    private formBuilder: FormBuilder,
    private alertService: AlertService,
    private posDataService: PosDataService,
    private posDataShareService: PosDataShareService,
  ) { }

  ngOnInit(): void {

    this.itemDetails = this.posSharedService.getItemNameFromOrder();
    this.quantity = this.itemDetails.qty;
    this.getItemData();
  }

  getItemData() {
    let id;
    id = this.itemDetails.itemId;
    this.ngxLoader.startLoader('loader-01');
    this.posDataService.getItemById(id).subscribe((res: any) => {
      this.ngxLoader.stopLoader('loader-01');
      this.itemData = res['data'];
      let success = res['success'];
      let msg = res['message'];
      if (success) {
        this.itemDiscountData = this.itemData.discount;
      }
      else {
        this.alertService.showError(msg);
      }
    });
  }

  closeModal() {
    this.activeModal.close();
  }

  onDiscount() {
    let id = document.getElementById('discBtn');
    id.style.border = '2px solid #2483ad';
    document.getElementById('promoBtn').style.border = '1px solid #ffffff';
    this.normalDiscountData = this.itemDiscountData.filter((res: any) => {
      return res.promocode == "";
    });
    this.normalDiscount = true;
    this.promoDiscount = false;
    console.log('>>> normal discount', this.normalDiscountData);
  }

  onDiscountPromo() {
    let id = document.getElementById('promoBtn');
    id.style.border = '2px solid #2483ad';
    document.getElementById('discBtn').style.border = '1px solid #ffffff';
    this.promoDiscountData = this.itemDiscountData.filter((res: any) => {
      return res.promocode !== "";
    });
    this.normalDiscount = false;
    this.promoDiscount = true;
    console.log('>>> promo discount', this.promoDiscountData);
  }

  normalDisc() {
    console.log('select discount', this.selctedNormalDiscount);
    let discountVal = this.selctedNormalDiscount.discountValue;
    let discountedAmt;
    if (this.selctedNormalDiscount.discountType == 'Percentage') {
      this.selctedNormalDiscount.discountedAmount = (discountVal / 100 * this.itemDetails.subAmount).toFixed(2);
    } else {
      this.selctedNormalDiscount.discountedAmount = discountVal;
    }
    this.showNormalForm = true;
  }

  promoDisc() {
    console.log('select discount', this.selctedPromoDiscount);
    let discountVal = this.selctedPromoDiscount.promocodeDiscount;
    let discountedAmt;
    if (this.selctedPromoDiscount.promocodeDiscountType == 'Percentage') {
      this.selctedPromoDiscount.promocodeAmount = (discountVal / 100 * this.itemDetails.subAmount).toFixed(2);
    } else {
      this.selctedPromoDiscount.promocodeAmount = discountVal;
    }
    this.showPromoForm = true;
  }

  addDiscount() {
    if (this.normalDiscount) {
      this.discountData = [
        {
          promocode: "",
          isPromocodeApplied: this.selctedNormalDiscount.isPromocodeApplied,
          promocodeDiscountType: "",
          promocodeDiscount: 0,
          promocodeAmount: 0,
          discountType: this.selctedNormalDiscount.discountType,
          discountValue: this.selctedNormalDiscount.discountValue,
          discountedAmount: this.selctedNormalDiscount.discountedAmount,
          discountNotes: this.selctedNormalDiscount.discountNotes
        }
      ]
    } else {
      this.discountData = [
        {
          promocode: this.selctedPromoDiscount.promocode,
          isPromocodeApplied: this.selctedPromoDiscount.isPromocodeApplied,
          promocodeDiscountType: this.selctedPromoDiscount.promocodeDiscountType,
          promocodeDiscount: this.selctedPromoDiscount.promocodeDiscount,
          promocodeAmount: this.selctedPromoDiscount.promocodeAmount,
          discountType: "",
          discountValue: 0,
          discountedAmount: 0,
          discountNotes: this.selctedPromoDiscount.discountNotes
        }
      ]
    }
    let data = {
      index: this.itemDetails.index,
      discount: this.discountData
    }
    sessionStorage.removeItem('opened');
    this.posDataShareService.onItemDiscount(data);
    this.alertService.showSuccess('Discount Applied');
    this.activeModal.close();
  }
}
