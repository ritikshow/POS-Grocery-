import { Component, OnInit, ViewChild } from '@angular/core';
import { NgbModal, ModalDismissReasons, NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';
import { AlertService } from '@core/services/common/alert.service';

import { PosDataService } from '@core/services/pos-system/pos-data.service';
import { PosDataShareService } from '@core/services/pos-system/posDataShare.service';

import { NgxUiLoaderService } from 'ngx-ui-loader';
import { DataTableDirective } from 'angular-datatables';
import { FormBuilder, FormGroup } from '@angular/forms';
import { Router } from '@angular/router';
import { ItemViewComponent } from '../../item-master/item-view/item-view.component';
import { AddBatchItemComponent } from './add-batch-item/add-batch-item.component';
import { CommonService } from '@core/services/common/common.service';

@Component({
  selector: 'app-batch-item',
  templateUrl: './batch-item.component.html',
  styleUrls: ['./batch-item.component.css']
})
export class BatchItemComponent implements OnInit {
  tableListRecord: any = {};
  dtOptions: DataTables.Settings = {
    order: [[1, 'desc']],
    lengthChange: false,
    pageLength: 10,
    infoCallback: (settings: DataTables.SettingsLegacy, start: number, end: number, mnax: number, total: number, pre: string) => {
      this.tableListRecord.total = total;
    }
  };
  changedLength(event) {
    this.datatableElement.dtInstance.then((dtInstance: DataTables.Api) => {
      dtInstance.page.len(parseInt(event.target.value)).draw();
    });
  }

  @ViewChild(DataTableDirective, { static: false }) datatableElement: DataTableDirective;


  closeResult: string;
  allItems: any;
  items: any;
  pager: any = {};
  pageNumber = 1;
  pageSize = 10;
  totalRows: number;
  outletId: any;
  outletName: string;
  isDataLoaded: boolean = false;
  categoryList: any;
  filterSearchBox: any;
  categoryForm: any = FormGroup;
  modifierData: any;
  itemsIds = [];
  hideCheckBox = true;
  isAllItem = false;
  SelectedReceipeItem: any;
  PsMasterReceipe: any;
  recipeData = [];
  quantity: any;
  totalCostOfItem = 0;
  itemForRecipe: any;
  grossMargin: any;
  receipeForm: any = FormGroup;
  showSupplier = false;

  constructor(
    private ngxLoader: NgxUiLoaderService,
    private modalService: NgbModal,
    private alertService: AlertService,
    private posDataService: PosDataService,
    private posDataSharedService: PosDataShareService,
    private formBuilder: FormBuilder,
    private router: Router,
    private modal: NgbModal,
    private activeModal: NgbActiveModal,
   public commonService: CommonService,
  ) { }

  async ngOnInit() {
    this.dtOptions = {
      order: [[1, 'desc']],
      lengthChange: false,
      pageLength: 10,
      infoCallback: (settings: DataTables.SettingsLegacy, start: number, end: number, mnax: number, total: number, pre: string) => {
        this.tableListRecord.total = total;
      }
    }
    this.categoryForm = this.formBuilder.group({
      CategoryIdList: ['']
    });
    this.receipeForm = this.formBuilder.group({
      productId: [''],
      supplierId: [''],
      price: [''],
      unit: [''],
      quantity: [''],
      priority: [1],
      itemUnit: [''],
      itemQuantity: ['0'],
    });
    this.outletName = sessionStorage.getItem('activeOutletname');
    sessionStorage.removeItem('addForm');
    this.outletId = sessionStorage.getItem('activeOutletId');

    this.getAllitems();
    this.getAllCategory();
  }
  async getAllitems() {
    this.isDataLoaded = false;
    this.ngxLoader.startLoader('loader-01');
    let data = { outletId: this.outletId, IsAllItem: true }
    this.posDataService.getAllItemsByOutletId(data).subscribe((res: any) => {
      this.ngxLoader.stopLoader('loader-01');
      console.log("res = ", res);
      this.allItems = res['data'];
      let success = res['success'];
      let msg = res['message'];
      if (success) {
        this.allItems = this.allItems.filter(x => x.isBatchRecipe);
        this.tableListRecord.total = this.allItems.length;
        this.isDataLoaded = true;
      }
      else {
        this.isDataLoaded = true;
        this.alertService.showError(msg);
      }
    });
  }

  openForm() {
    sessionStorage.setItem('isNewItem', 'true');
    this.modalService.open(AddBatchItemComponent, { backdrop: 'static', windowClass:'main_add_popup', keyboard: true, centered: true }).result.then((result) => {
      this.closeResult = `Closed with: ${result}`;
      if (result) {
        this.getAllitems();
      }

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

  edit(id) {
    sessionStorage.setItem('isNewItem', 'false');
    sessionStorage.setItem("itemIdForEditItem", id);
    this.modalService.open(AddBatchItemComponent, { backdrop: 'static', windowClass:'main_add_popup', keyboard: true, centered: true }).result.then((result) => {
      this.closeResult = `Closed with: ${result}`;
      if (result) {
        this.getAllitems();
      }

    }, (reason) => {

      this.closeResult = `Dismissed ${this.getDismissReason(reason)}`;
    });
  }

  view(id) {
    this.posDataSharedService.setIdForItemView(id);
    const modalRef = this.modalService.open(ItemViewComponent, { backdrop: 'static', windowClass:'main_add_popup', keyboard: true, centered: true });
    modalRef.componentInstance.name = "Batch";
    modalRef.result.then((result) => {
      this.closeResult = `Closed with: ${result}`;
    }, (reason) => {
      this.closeResult = `Dismissed ${this.getDismissReason(reason)}`;
    });
  }

  onDelete(id) {
    this.ngxLoader.startLoader('loader-01');
    this.posDataService.deleteItemRow(id).subscribe((res) => {
      console.log(res);
      this.ngxLoader.stopLoader('loader-01');
      let success = res['success'];
      let msg = res['message'];
      if (success) {
        this.alertService.showSuccess('Deleted Successfully');
        this.getAllitems();
      }
      else {
        this.alertService.showError(msg);
      }
    });
  }

  filterBySearch(event) {
    this.datatableElement.dtInstance.then((dtInstance: DataTables.Api) => {
      dtInstance.search(this.filterSearchBox).draw();
    });
  }

  async getAllCategory() {
    this.ngxLoader.startLoader('loader-01');
    this.posDataService.getAllCategoryByOutletId(this.outletId,false).subscribe((res: any) => {
      this.ngxLoader.stopLoader('loader-01');
      this.categoryList = res['data'];
      let success = res['success'];
      let msg = res['message'];
      if (!success) {
        this.alertService.showError(msg);
      }
    });
  }

  selectCategory(data) {
    this.filterSearchBox = data.target.value;
    console.log("filterSearchBox = ", this.filterSearchBox)
    this.filterBySearch(data);
  }

  clearCategory() {
    this.categoryForm.controls['CategoryIdList'].setValue("");
    this.filterSearchBox = "";
    this.filterBySearch('');
  }
  reload() {
    this.router.navigate(['/pos-dashboard/walk-in/order']);

  }
  refresh() {
    window.location.replace('/pos-dashboard/item-master');
  }

  selectsAll(event) {
    this.itemsIds = this.allItems.map(x => x.id);
    this.itemsIds = [];
    if (event.target.checked) {
      for (let i = 0; i < this.itemsIds.length; i++) {
        const ele = document.getElementById(this.itemsIds[i]) as HTMLInputElement;
        if (ele !== undefined && ele !== null) {
          ele.checked = true;
          this.isAllItem = true;
        }
      }
    } else {
      for (let i = 0; i < this.itemsIds.length; i++) {
        const ele = document.getElementById(this.itemsIds[i]) as HTMLInputElement;
        if (ele !== undefined && ele !== null) {
          ele.checked = false;
          this.isAllItem = false;
          this.itemsIds = [];
        }
      }
    }
  }

  selectIndividual(event) {
    if (event.target.checked) {
      this.itemsIds.push(event.target.value);
    } else {
      let i: number = 0;
      this.itemsIds.forEach((res: any) => {
        if (res == event.target.value) {
          this.itemsIds.splice(i, 1);
          return;
        }
        i++;
      });
      const ele = document.getElementById('selectAll') as HTMLInputElement;
      if (ele !== undefined && ele !== null) {
        ele.checked = false;
      }
    }
  }

  closeAction() {
    if (this.modalService.hasOpenModals) {
      this.modalService.dismissAll();
    }
  }

  GetVal(event: any) {
    this.quantity = event.target.value;
  }
  closeModal() {
    this.activeModal.close(0);
    this.modal.dismissAll();
  }
}
