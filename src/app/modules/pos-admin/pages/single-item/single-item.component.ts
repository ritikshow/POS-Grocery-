import { Component, OnInit } from '@angular/core';
import { AlertService } from '@core/services/common/alert.service';
import { CommonService } from '@core/services/common/common.service';
import { PosSharedService } from '@core/services/common/pos-shared.service';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';

@Component({
  selector: 'app-single-item',
  templateUrl: './single-item.component.html',
  styleUrls: ['./single-item.component.css']
})
export class SingleItemComponent implements OnInit {
  item: any;
  itemData: any;
  qtyVal = 1;
  subTotal: any;
  total: any;
  addItemObject = {};

  constructor(
    private activeModal: NgbActiveModal,
    private posSharedService: PosSharedService,
    private alertService: AlertService,
    public commonService: CommonService,
  ) { }

  ngOnInit(): void {
    this.getItemData();
  }

  getItemData() {
    this.item = this.posSharedService.getSubCatItem();
    this.itemData = this.item.item;
    this.subTotal = this.qtyVal * this.itemData.itemAmount;
    this.total = this.subTotal;
  }

  closeModal() {
    this.activeModal.close();
  }

  onKey(e) {

    let val = e.target.value;
    console.log(val);
    if (val == '') {
      this.alertService.showError("Minimum 1 Quantity");
      this.subTotal = this.qtyVal * this.itemData.itemAmount;
      this.total = this.subTotal;
    } else if (val == 0) {
      this.alertService.showError("Minimum 1 Quantity");
      this.qtyVal = 1;
      this.subTotal = this.qtyVal * this.itemData.itemAmount;
      this.total = this.subTotal;
    } else {
      this.qtyVal = val;
      this.subTotal = this.qtyVal * this.itemData.itemAmount;
      this.total = this.subTotal;
    }
  }

  quantityIncrement() {
    this.qtyVal++;
    this.subTotal = this.qtyVal * this.itemData.itemAmount;
    this.total = this.subTotal;
  }
  quantityDecrement() {
    if (this.qtyVal > 1) {
      this.qtyVal--;
      this.subTotal = this.qtyVal * this.itemData.itemAmount;
      this.total = this.subTotal;
    } else {
      this.alertService.showError("Minimum 1 Quantity");
      this.subTotal = this.qtyVal * this.itemData.itemAmount;
      this.total = this.subTotal;
    }
  }
  addData() {

    this.addItemObject = {
      itemId: this.itemData.id,
      itemName: this.itemData.itemName,
      orderQuantity: this.qtyVal,
      itemCategory: this.itemData.itemCategoryId,
      itemSubCategory: this.itemData.categoryName,
      itemAmount: this.itemData.itemAmount,
      itemLocation: this.itemData.itemLocation,
      subTotal: this.subTotal,
      isReadyMade: this.itemData.isReadyMade,
      orderTakenBy: this.item.ordertakenBy,
      tableNo: this.item.tableNo,
      tableType: this.item.tableType,
      itemStatus: 'Order',
      modifiers: [],
      discount: []
    }
    this.posSharedService.addItemData(this.addItemObject);
    sessionStorage.setItem('tableOrder', 'open');
    this.posSharedService.onSelectItem(this.addItemObject);
    this.alertService.showSuccess("Item have been Added");
    this.activeModal.close();
  }
}
