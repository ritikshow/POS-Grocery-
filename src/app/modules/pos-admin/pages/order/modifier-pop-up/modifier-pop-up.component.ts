import { Component, OnInit } from '@angular/core';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';
import { PosSharedService } from '@core/services/common/pos-shared.service';
import { FormArray, FormBuilder, FormControl, FormGroup } from '@angular/forms';
import { AlertService } from '@core/services/common/alert.service';
import { PosDataService } from '@core/services/pos-system/pos-data.service';
import { PosDataShareService } from '@core/services/pos-system/posDataShare.service';
import { NgxUiLoaderService } from 'ngx-ui-loader';

@Component({
  selector: 'app-modifier-pop-up',
  templateUrl: './modifier-pop-up.component.html',
  styleUrls: ['./modifier-pop-up.component.css']
})
export class ModifierPopUpComponent implements OnInit {
  modifierCheckForm: FormGroup;
  itemDetails: any;
  closeResult: string;
  allModifier: any;
  modifierId: any;
  groupName: any;
  modifierById: any;
  itemArray = [];
  modifierGroupName: any;
  outletId: any;

  constructor(
    private ngxLoader: NgxUiLoaderService,
    private activeModal: NgbActiveModal,
    private posSharedService: PosSharedService,
    private alertService: AlertService,
    private posDataService: PosDataService,
    private posDataShareService: PosDataShareService,
    private formBuilder: FormBuilder
  ) { }

  ngOnInit(): void {

    this.outletId = sessionStorage.getItem('activeOutletId');
    this.itemDetails = this.posSharedService.getItemNameFromOrder();
    console.log(this.itemDetails);
    this.getAllModifiersData();
  }

  getAllModifiersData() {
    this.ngxLoader.startLoader('loader-01');
    let data = { outletId: this.outletId, IsAllItem: false }
    this.posDataService.getAllItemsByOutletId(data).subscribe((res: any) => {
      this.ngxLoader.stopLoader('loader-01');
      let modifier = res['data'];
      let success = res['success'];
      let msg = res['message'];
      if (success) {
        let modData;
        let mod;
        if (modifier) {
          modData = modifier.filter((res: any) => {
            return res.id === this.itemDetails.itemId
          });
        }
        mod = modData[0];
        console.log(mod);
        this.allModifier = mod.modifierGroupNameId;
        console.log(this.allModifier);
        this.modifierId = this.allModifier[0].modifierGroupId;
        console.log(this.modifierId);
        if (this.modifierId !== null && this.modifierId !== undefined) {
          this.getModifierByGroup();
        }
      }
      else {
        this.alertService.showError(msg);
      }
    });
  }

  getModifierByGroup() {
    this.ngxLoader.startLoader('loader-01');
    this.posDataService.getmodifierById(this.modifierId).subscribe((res: any) => {
      this.ngxLoader.stopLoader('loader-01');
      let data = res['data'];
      this.modifierById = data.modifierItems;
      this.groupName = data.groupName;
      if (this.itemDetails.modifierPrevious) {
        this.itemArray = this.itemDetails.modifierPrevious;
        if (this.itemArray.length !== 0) {
          setTimeout(() => {
            this.getSelectedData();
          }, 1000);
        }
      }
      console.log(this.modifierById);
    });
    if (this.itemArray.length !== 0) {
      setTimeout(() => {
        this.getSelectedData();
      }, 1000);
    }
  }

  getSelectedData() {
    if (this.itemArray.length !== 0) {
      this.LoopAllModifiersForCheck();
    }
  }

  private LoopAllModifiersForCheck() {
    for (let i = 0; i < this.itemArray.length; i++) {
      for (let j = 0; j < this.modifierById.length; j++) {
        this.CheckModifierNameAndEnable(i, j);
      }
    }
  }

  private CheckModifierNameAndEnable(i: number, j: number) {
    if (this.itemArray[i].modifierItemName == this.modifierById[j].itemName) {
      const ele = document.getElementById(this.modifierById[j].itemId) as HTMLInputElement;
      if (ele !== undefined && ele !== null) {
        ele.checked = true;
      }
    }
  }

  getModifiers(id) {
    this.modifierId = id;
    this.getModifierByGroup();
  }

  closeModal() {
    this.activeModal.close();
  }

  onCheckboxChange(event, price) {
    let obj = {
      modifierGroupId: this.modifierId,
      modifierItemId: event.target.id,
      modifierItemName: event.target.value,
      price: price,
      modifierGroup: this.groupName
    }
    if (event.target.checked) {
      this.itemArray.push(obj);
    } else {
      let i: number = 0;
      this.itemArray.forEach((res: any) => {
        if (res.modifierItemName == event.target.value) {
          this.itemArray.splice(i, 1);
          return;
        }
        i++;
      });
    }
  }

  addModifier() {

    if (this.itemArray.length == 0) {
      this.alertService.showError("Please select modifier");
      return;
    }
    let data = {
      index: this.itemDetails.index,
      modifiers: this.itemArray
    }

    sessionStorage.removeItem('opened');
    this.posDataShareService.onSelectModifier(data);
    this.alertService.showSuccess('Modifier Added');
    this.activeModal.close();
  }
}
