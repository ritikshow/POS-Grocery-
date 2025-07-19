import { Component, Input, OnInit } from '@angular/core';
import { AlertService } from '@core/services/common/alert.service';
import { PosDataService } from '@core/services/pos-system/pos-data.service';
import { PosDataShareService } from '@core/services/pos-system/posDataShare.service';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';
import { NgxUiLoaderService } from 'ngx-ui-loader';

@Component({
  selector: 'app-item-view',
  templateUrl: './item-view.component.html',
  styleUrls: ['./item-view.component.css']
})
export class ItemViewComponent implements OnInit {
  @Input() name: any;
  id: any;
  itemData: any;
  restaurantId: any;
  allOutlets: any;
  outlets = [];
  taxData: any;
  IsAccepted: boolean = true;
  ClickedOnApproveReject :boolean = false;
  DiscountData = [];
  RecipeData = [];
  ModifierData = [];
  PromocodeData = [];

  constructor(
    private ngxLoader: NgxUiLoaderService,
    private activeModal: NgbActiveModal,
    private alertService: AlertService,
    private posDataService: PosDataService,
    private posDataSharedService: PosDataShareService,
  ) { }

  ngOnInit(): void {
    this.restaurantId = JSON.parse(sessionStorage.getItem('activeRestaurant')).restaurantId;
    this.id = this.posDataSharedService.getIdForItemView();
    this.getItemDataById();
    if (this.name == "Menu") {
      this.getRestaurantDataById();
    }
  }

  getItemDataById() {
    this.ngxLoader.startLoader('loader-01');
    this.posDataService.getItemById(this.id).subscribe((res: any) => {
      this.ngxLoader.stopLoader('loader-01');
      this.itemData = res['data'];
        this.IsAccepted = this.itemData.isApproved
      for (let i = 0; i < this.itemData?.recipe?.length; i++) {
        this.RecipeData.push(this.itemData.recipe[i]);

      }
      let success = res['success'];
      let msg = res['message'];
      if (success) {
        if (this.name == "Menu") {
          this.ShowDiscount();
          this.ShowPromocode();
          this.ShowModifier();
          if (this.itemData.taxId != null) {
            this.getTaxDataById();
          }
        }
      }
      else {
        this.alertService.showError(msg);
      }
    });
  }

  getRestaurantDataById() {

    this.ngxLoader.startLoader('loader-01');
    this.posDataService.getRestaurantById(this.restaurantId).subscribe((res: any) => {
      this.ngxLoader.stopLoader('loader-01');
      let data = res['data'];
      let success = res['success'];
      let msg = res['message'];
      if (success) {
        this.allOutlets = data.outlets;
        setTimeout(() => {
          this.getOutlet();
        }, 1000);
      }
      else {
        this.alertService.showError(msg);
      }
    });
  }
  getOutlet() {
    for (let i = 0; i < this.allOutlets.length; i++) {
      let obj = {
        outletName: ''
      }
      for (let j = 0; j < this.itemData.outlets?.length; j++) {
        if (this.allOutlets[i].outletId == this.itemData.outlets[j]) {
          obj = {
            outletName: this.allOutlets[i].outletName
          }
        }
      }
      this.outlets.push(obj);
    }
  }

  closeModal() {
    this.activeModal.close();
  }
  getTaxDataById() {
   
    this.ngxLoader.startLoader('loader-01');
    this.posDataService.getTaxById(this.itemData.taxId).subscribe((tax: any) => {
      this.ngxLoader.startLoader('loader-01');
      this.taxData = tax['data'];
      let success = tax['success'];
      let msg = tax['message'];
      if (!success) {
        this.alertService.showError(msg);
      }
    });
  }
  ShowDiscount() {
    this.ngxLoader.startLoader('loader-01');
    let obj = {
      outletId: sessionStorage.getItem('activeOutletId'),
      isAllItem: false,
    }
    this.posDataService.getAllDiscountByOutletId(obj).subscribe((res: any) => {
      this.ngxLoader.stopLoader('loader-01');
      let Data = res['data'];
      if (res['success']) {
        for (let i = 0; i < this.itemData?.discount?.length; i++) {
          let matchedDiscount = Data?.find((item: any) => item.discountId == this.itemData.discount[i]);
          if (matchedDiscount != undefined) {
            this.DiscountData.push(matchedDiscount);
          }
        }
      } else {
        this.alertService.showError(res['message']);
      }
    });
  }

  ShowPromocode() {
    this.ngxLoader.startLoader('loader-01');
    let jsonData: any = {};
    jsonData.outletId = sessionStorage.getItem('activeOutletId');
    jsonData.isAllItem = false;
    this.posDataService.getAllPromocodeByOutletId(jsonData).subscribe((res: any) => {
      this.ngxLoader.stopLoader('loader-01');
      let Data = res['data'];
      if (res['success']) {
        for (let i = 0; i < this.itemData?.discount?.length; i++) {
          let matchedDiscount = Data?.find((item: any) => item.promocodeId == this.itemData.discount[i]);
          if (matchedDiscount != undefined) {
            this.PromocodeData.push(matchedDiscount);
          }
        }
      } else {
        this.alertService.showError(res['message']);
      }
    });
  }


  ShowModifier() {
    this.ngxLoader.startLoader('loader-01');
    let obj = {
      outletId: sessionStorage.getItem('activeOutletId'),
      isAllItem: false,
    }
    this.posDataService.getModifiersByOutletId(obj).subscribe(res => {
      this.ngxLoader.stopLoader('loader-01');
      let Data = res['data'];
      if (res['success']) {
        for (let i = 0; i < this.itemData?.modifiers?.length; i++) {
          let matchedmodifier = Data?.find((item: any) => item.id == this.itemData.modifiers[i]);
          if (matchedmodifier != null && matchedmodifier != undefined)
            this.ModifierData.push(matchedmodifier);
        }
      } else {
        this.alertService.showError(res['message']);
      }
    });
  }
  OnClickApproveOrReject(isApproved) {
    this.posDataService.ApproveItem(this.itemData.id,isApproved).subscribe((res: any) => {
      this.IsAccepted = isApproved;
      this.ClickedOnApproveReject = true;
      this.ngxLoader.stopLoader('loader-01');
      let status = res['success'];
      let msg = res['message'];
      if (status) {
        this.alertService.showSuccess(msg);
      } else {
        this.alertService.showError(msg);
      }
    });
  }
}


