import { Component, OnInit } from '@angular/core';
import { AlertService } from '@core/services/common/alert.service';
import { PosDataService } from '@core/services/pos-system/pos-data.service';
import { PosDataShareService } from '@core/services/pos-system/posDataShare.service';
import { NgbModal, ModalDismissReasons, NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';
import { PagerService } from '@shared/directives';
import { NgxUiLoaderService } from 'ngx-ui-loader';
import { ViewModComponent } from './view-mod/view-mod.component';

@Component({
  selector: 'app-add-modifier',
  templateUrl: './add-modifier.component.html',
  styleUrls: ['./add-modifier.component.css']
})
export class AddModifierComponent implements OnInit {
  closeResult: string;
  id: any;
  itemData: any;
  modifierData: any;
  mods: any;
  pager: any = {};
  pageNumber = 1;
  pageSize = 10;
  totalRows: number;
  searchInput = '';
  selectedMods = [];
  outletId: any;

  constructor(
    private ngxLoader: NgxUiLoaderService,
    private activeModal: NgbActiveModal,
    private modalService: NgbModal,
    private alertService: AlertService,
    private posDataService: PosDataService,
    private posDataSharedService: PosDataShareService,
    private pagerServcie: PagerService
  ) { }

  ngOnInit(): void {
    sessionStorage.removeItem('modId');
    this.outletId = sessionStorage.getItem('activeOutletId');
    this.id = this.posDataSharedService.getIdForItemModifier();
    this.getAllModWithPagi();
  }

  getAllModWithPagi() {
    this.getAllModifiersData();
    setTimeout(() => {
      this.pagination();
    }, 1000);
  }

  getItemDataById() {
    this.ngxLoader.startLoader('loader-01');
    this.posDataService.getItemById(this.id).subscribe((res: any) => {
      this.ngxLoader.stopLoader('loader-01');
      this.itemData = res['data'];
      let success = res['success'];
      let msg = res['message'];
      if (success) {
        this.selectedMods = this.itemData.modifiers;
        for (let i = 0; i < this.itemData.modifiers.length; i++) {
          const ele = document.getElementById(this.itemData.modifiers[i]) as HTMLInputElement;
          if (ele !== undefined && ele !== null) {
            ele.checked = true;
          }
        }
      }
      else {
        this.alertService.showError(msg);
      }
    });
  }

  getAllModifiersData() {
    this.ngxLoader.startLoader('loader-01');
    let obj = {
      outletId: this.outletId,
      isAllItem: true,
    }
    this.posDataService.getModifiersByOutletId(obj).subscribe(res => {
      this.ngxLoader.stopLoader('loader-01');
      this.modifierData = res['data'];
      let success = res['success'];
      let msg = res['message'];
      if (success) {
        let row = 0;
        if (this.pageNumber == 1) {
          this.mods = this.modifierData.slice(row, this.pageSize);
        }
        if (this.pageNumber > 1) {
          row = (row + this.pageNumber * this.pageSize) - this.pageSize
          this.mods = this.modifierData.slice(row, this.pageSize * this.pageNumber);
        }
        this.getItemDataById();
      }
      else {
        this.alertService.showError(msg);
      }
    });
  }

  pagination() {
    this.totalRows = this.modifierData.length;
    this.pager = this.pagerServcie.getPager(this.totalRows, this.pageNumber);
  }

  setPage(page: any) {

    console.log(page);
    this.pageNumber = page;
    this.getAllModifiersData();
  }

  search(): void {
    let input = this.searchInput;
    if (input == '') {
      let row = 0;
      if (this.pageNumber == 1) {
        this.mods = this.modifierData.slice(row, this.pageSize);
      }
      if (this.pageNumber > 1) {
        row = (row + this.pageNumber * this.pageSize) - this.pageSize
        this.mods = this.modifierData.slice(row, this.pageSize * this.pageNumber);
      }
    } else {
      this.mods = this.modifierData.filter((res: any) => {
        return res.groupName.toLocaleLowerCase().match(input.toLocaleLowerCase());
      });
    }
  }

  closeModal() {
    this.activeModal.close(0);
  }

  view(id) {
    sessionStorage.setItem('modId', id);
    this.modalService.open(ViewModComponent, { backdrop: 'static', size: 'md', keyboard: true, centered: true }).result.then((result) => {
      this.closeResult = `Closed with: ${result}`;

    }, (reason) => {
      this.closeResult = `Dismissed ${this.getDismissReason(reason)}`;
    });
  }

  private getDismissReason(reason: any): string {
    if (reason === ModalDismissReasons.ESC) {
      return 'by pressing ESC';
    } else if (reason === ModalDismissReasons.BACKDROP_CLICK) {
      return 'by clicking on a backdrop';
    } else {
      return `with: ${reason}`;
    }
  }

  select(e) {
    let val = e.target.value;

    if (e.target.checked) {
      this.selectedMods.push(val);
    } else {
      let i: number = 0;
      this.selectedMods.forEach((res: any) => {
        if (res == e.target.value) {
          this.selectedMods.splice(i, 1);
          return;
        }
        i++;
      });
    }
  }

  add() {
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
        modifiers: this.selectedMods,
        discount: this.itemData.discount,
        imageName: this.itemData.imageName,
        imageExtension: this.itemData.imageExtension,
        isActive: this.itemData.isActive,
        preparingTime: this.itemData.preparingTime,
        recipe:this.itemData.recipe,
        taxId:this.itemData.taxId,
        imagePath:this.itemData.imagePath,
        itemTypes: this.itemData.itemTypes,
        isApproved: this.itemData.isApproved,
        
        
        
        

        MultipleImagePath : this.itemData.multipleImagePath
      },
      image: this.itemData.image,
      outlets: ActiveOutlet
    }
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
