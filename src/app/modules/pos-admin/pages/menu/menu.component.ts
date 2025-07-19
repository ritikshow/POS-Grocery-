import { Component, OnInit, ViewChild } from '@angular/core';
import { NgbModal, ModalDismissReasons, NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';
import { AlertService } from '@core/services/common/alert.service';
import { CategoryComponent } from '../category/category.component';
import { PosDataService } from '@core/services/pos-system/pos-data.service';
import { AddModifierComponent } from '../item-master/add-modifier/add-modifier.component';
import { AddDiscountComponent } from '../item-master/add-discount/add-discount.component';
import { PosDataShareService } from '@core/services/pos-system/posDataShare.service';
import { ItemViewComponent } from '../item-master/item-view/item-view.component';
import { NgxUiLoaderService } from 'ngx-ui-loader';
import { DataTableDirective } from 'angular-datatables';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { AddAdminCategoryComponent } from '../admin-category/add-admin-category/add-admin-category.component';
import { ModifierGroupFormComponent } from '../master/modifier-group/modifier-group-form/modifier-group-form.component';
import { Router } from '@angular/router';
import { CommonService } from '@core/services/common/common.service';

@Component({
  selector: 'app-menu',
  templateUrl: './menu.component.html',
  styleUrls: ['./menu.component.css']
})
export class MenuComponent implements OnInit {
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
  showButton = true;
  SelectedReceipeItem: any;
  PsMasterReceipe: any;
  recipeData = [];
  quantity: any;
  totalCostOfItem = 0;
  itemForRecipe: any;
  grossMargin: any;
  receipeForm: any = FormGroup;
  showSupplier = false;
  allBatchItems: any;
  showReceipe = false;
  Role: any;
  SelectedFilter: any;
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
    public commonService: CommonService
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
      quantity: ['', Validators.required],
      priority: [1],
      itemUnit: [''],
      itemQuantity: ['0', Validators.required],
    });

    this.outletName = sessionStorage.getItem('activeOutletname');
    sessionStorage.removeItem('addForm');
    this.outletId = sessionStorage.getItem('activeOutletId');
    this.getAllitems();
    this.getAllCategory();
    this.GetAllReceipe();
    this.Role = JSON.parse(sessionStorage.getItem('userCredential')).roleName;
   
  }

  openFormCat() {
    this.modalService.open(AddAdminCategoryComponent, { backdrop: 'static', windowClass: 'main_add_popup', keyboard: true, centered: true }).result.then((result) => {
      this.closeResult = `Closed with: ${result}`;
      if (result) {
        this.getAllCategory();
      }
    }, (reason) => {
      this.closeResult = `Dismissed ${this.getDismissReason(reason)}`;
    });
  }
  getAllModifierGroupData() {
    this.ngxLoader.startLoader('loader-01');
    let obj = {
      outletId: sessionStorage.getItem('activeOutletId'),
      isAllItem: false,
    }
    this.posDataService.getModifiersByOutletId(obj).subscribe(res => {
      this.ngxLoader.stopLoader('loader-01');
      this.modifierData = res['data'];
      let success = res['success'];
      let msg = res['message'];
      if (!success) {
        this.alertService.showError(msg);
      }
    });
  }

  openModifierForm() {
    this.modalService.open(ModifierGroupFormComponent, { backdrop: 'static', windowClass: 'main_add_popup', keyboard: true, centered: true }).result.then((result) => {
      this.closeResult = `Closed with: ${result}`;
      if (result) {
        this.getAllModifierGroupData();
      }
    }, (reason) => {

      this.closeResult = `Dismissed ${this.getDismissReason(reason)}`;
    });
  }
  async getAllitems() {
    this.isDataLoaded = false;
    this.ngxLoader.startLoader('loader-01');
    let data = { outletId: this.outletId, IsAllItem: true }
    this.posDataService.getAllItemsByOutletId(data).subscribe((res: any) => {
      this.ngxLoader.stopLoader('loader-01');

      this.allItems = res['data'];
      if (this.filterSearchBox) {
        this.allItems = this.allItems.filter(item => item.categoryName === this.filterSearchBox);
      }

      let success = res['success'];
      let msg = res['message'];
      if (success) {
        this.allBatchItems = this.allItems.filter(x => x.isBatchRecipe);
        this.allItems = this.allItems.filter(x => !x.isBatchRecipe);
        this.tableListRecord.total = this.allItems.length;
        this.isDataLoaded = true;
        let features = JSON.parse(sessionStorage.getItem('RestaurantFeatures'));
        if (features != null) {
          this.showReceipe = features.find(x => x.key == 'recipe')?.value;
        }
      }
      else {
        this.alertService.showError(msg);
      }
    });
  }

  openForm() {
    sessionStorage.setItem('addForm', 'new');
    this.modalService.open(CategoryComponent, { backdrop: 'static', windowClass: 'main_add_popup', keyboard: true, centered: true }).result.then((result) => {
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
    sessionStorage.setItem('addForm', 'old');
    this.posDataSharedService.setIdForItemModifier(id);
    this.modalService.open(CategoryComponent, { backdrop: 'static', windowClass: 'main_add_popup', keyboard: true, centered: true }).result.then((result) => {
      this.closeResult = `Closed with: ${result}`;
      if (result) {
        this.getAllitems();
      }

    }, (reason) => {

      this.closeResult = `Dismissed ${this.getDismissReason(reason)}`;
    });
  }

  addModify(id) {
    this.posDataSharedService.setIdForItemModifier(id);
    this.modalService.open(AddModifierComponent, { backdrop: 'static', windowClass: 'main_add_popup', keyboard: true, centered: true }).result.then((result) => {
      this.closeResult = `Closed with: ${result}`;
      if (result) {
        this.getAllitems();
      }
    }, (reason) => {
      this.closeResult = `Dismissed ${this.getDismissReason(reason)}`;
    });
  }

  addDiscount(id) {
    sessionStorage.setItem('orderLevelDisc', 'false');
    this.posDataSharedService.setIdForItemDiscount(id);
    this.modalService.open(AddDiscountComponent, { backdrop: 'static', windowClass: 'main_add_popup', keyboard: true, centered: true }).result.then((result) => {
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
    const modalRef = this.modalService.open(ItemViewComponent, { backdrop: 'static', windowClass: 'main_add_popup', keyboard: true, centered: true });
    modalRef.componentInstance.name = "Menu";
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
    this.posDataService.getAllCategoryByOutletId(this.outletId, false).subscribe((res: any) => {
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
    (document.getElementsByName("filterSearchBox")[0] as HTMLInputElement).value = "";
    this.filterBySearch("");
    this.getAllitems();
  }
  reload() {
    this.router.navigate(['/pos-dashboard/walk-in/order']);

  }
  refresh() {
    window.location.replace('/pos-dashboard/item-master');
  }

  uploadFile(files) {
    if (files.length === 0) {
      return;
    }
    let fileToUpload = <File>files[0];
    const formData = new FormData();
    formData.append('file', fileToUpload, fileToUpload.name);

    let outletId = this.outletId;
    this.ngxLoader.startLoader('loader-01');
    this.posDataService.postItemMasterFile(formData, outletId).subscribe((res: any) => {
      this.ngxLoader.stopLoader('loader-01');
      console.log(res);
      let msg = res['message'];
      if (res.success) {
        this.alertService.showSuccess("congratulationsss");
      } else {
        this.alertService.showError(msg);
      }
    });
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

  // Add recipe
  closeAction() {
    if (this.modalService.hasOpenModals) {
      this.modalService.dismissAll();
    }
  }
  openRecipePopUp(content, item) {
    this.recipeData = [];
    this.itemForRecipe = item;
    // this.itemForRecipe.CategoryId = item?.ItemCategoryId;
    this.showSupplier = false;
    this.SelectedReceipeItem = undefined;
    this.totalCostOfItem = 0;
    if (this.itemForRecipe.recipe != null) {
      for (let i = 0; i < this.itemForRecipe.recipe.length; i++) {
        this.CalculateTotalCostOfItem(this.itemForRecipe.recipe[i]);
      }
      this.recipeData = this.itemForRecipe.recipe;
    }
    this.modalService.open(content, { backdrop: 'static', windowClass: 'main_add_popup', keyboard: true, centered: true }).result.then((result) => {
    }, (reason) => {
      console.log(reason);
    });
  }
  GetAllReceipe() {

    this.ngxLoader.startLoader('loader-01');
    this.posDataService.GetAllReceipe(this.outletId).subscribe((res: any) => {
      this.ngxLoader.stopLoader('loader-01');
      this.PsMasterReceipe = res['data'];
      let success = res['success'];
      let msg = res['message'];
      if (!success) {
        this.alertService.showError(msg);
      }
    });
  }

  removeMod(i) {
    const index: number = this.recipeData.indexOf(i);
    if (index !== -1) {
      this.recipeData.splice(index, 1);
      if (i.unit.toLowerCase() == 'kg') {
        let countableAmount = Number(i.quantity) * 1000;
        let totalA = Number(i.price) / 1000 * Number(countableAmount);
        this.totalCostOfItem = Number(this.totalCostOfItem) - Number(totalA);
        this.grossMargin = this.itemForRecipe.itemAmount - this.totalCostOfItem;
      } else if (i.unit.toLowerCase() == 'g') {
        let inkillo = Number(i.price) * 1;
        let countableAmount = Number(i.quantity) * 1000;
        let totalA = Number(inkillo) / 1000 * Number(countableAmount);
        this.totalCostOfItem = Number(this.totalCostOfItem) - Number(totalA);
        this.grossMargin = this.itemForRecipe.itemAmount - this.totalCostOfItem;
      } else {
        this.totalCostOfItem = Number(this.totalCostOfItem) - i.price * i.quantity;
        this.grossMargin = this.itemForRecipe.itemAmount - this.totalCostOfItem;
      }
    }
  }

  selectReceipeItem() {

    let productId = (<HTMLInputElement>document.getElementById("prodId")).value;
    this.SelectedReceipeItem = this.PsMasterReceipe.find(x => x.productID == productId);
    this.showSupplier = true;
    this.receipeForm.patchValue({
      unit: this.SelectedReceipeItem?.unit,
      price: this.SelectedReceipeItem.price,
      supplierId: this.SelectedReceipeItem.supplierName
    });
  }

  selectBatchItem(event) {

    this.SelectedReceipeItem = this.allBatchItems.find(x => x.id == event.target.value);
    this.showSupplier = true;
    this.receipeForm.patchValue({
      itemUnit: this.SelectedReceipeItem.unit,
    });
  }

  addNewRecipe(isBatchItem) {
    if (this.receipeForm.invalid) {
      this.alertService.showError("Field should not be empty");
      return;
    }

    let obj: any = {};
    if (!isBatchItem) {
      obj.productID = this.SelectedReceipeItem?.productID;
      obj.productName = this.SelectedReceipeItem.productName;
      obj.supplierID = this.SelectedReceipeItem.supplierID;
      obj.supplierName = this.SelectedReceipeItem.supplierName;
      obj.price = this.SelectedReceipeItem.price;
      obj.priority = Number(this.receipeForm.get('priority').value);
      obj.quantity = this.quantity;
    }
    else {
      obj.productID = this.SelectedReceipeItem.id;
      obj.productName = this.SelectedReceipeItem.itemName;
      obj.quantity = Number(this.receipeForm.get('itemQuantity').value);
      obj.priority = 0;
      obj.price = this.SelectedReceipeItem.itemAmount;
    }
    obj.unit = this.SelectedReceipeItem.unit;
    obj.isBatchRecipe = isBatchItem;

    this.CalculateTotalCostOfItem(obj);
    this.recipeData.push(obj);
  }

  private CalculateTotalCostOfItem(obj: { productID: string; productName: any; supplierID: string; supplierName: any; unit: any; price: any; quantity: any; }) {
    if (obj.unit.toLowerCase() == 'kg') {
      let countableAmount = Number(obj.quantity) * 1000;
      let totalA = Number(obj.price) / 1000 * Number(countableAmount);
      this.totalCostOfItem = Number(this.totalCostOfItem) + Number(totalA);
      this.grossMargin = this.itemForRecipe.itemAmount - this.totalCostOfItem;
    } else if (obj.unit.toLowerCase() == 'g') {
      let inkillo = Number(obj.price) * 1;
      let countableAmount = Number(obj.quantity) * 1000;
      let totalA = Number(inkillo) / 1000 * Number(countableAmount);
      this.totalCostOfItem = Number(this.totalCostOfItem) + Number(totalA);
      this.grossMargin = this.itemForRecipe.itemAmount - this.totalCostOfItem;
    } else {
      this.totalCostOfItem = Number(this.totalCostOfItem) + obj.price * obj.quantity;
      this.grossMargin = this.itemForRecipe.itemAmount - this.totalCostOfItem;
    }
  }

  GetVal(event: any) {
    this.quantity = event.target.value;
  }
  closeModal() {
    this.activeModal.close(0);
    this.allIndiaForm.reset();
    this.modal.dismissAll();
  }
  addRecipes() {
    if (this.receipeForm.invalid) {
      this.alertService.showError("Field should not be empty");
      return;
    }
    let ActiveOutlet = [];
    ActiveOutlet.push(JSON.parse(sessionStorage.getItem('activeOutlet')).outletId);
    this.itemForRecipe.recipe = this.recipeData;
    let data = {
      item: this.itemForRecipe,
      image: '',
      outlets: ActiveOutlet
    }
    this.ngxLoader.startLoader('loader-01');
    this.posDataService.updateItemData(data, this.itemForRecipe.id).subscribe((res: any) => {
      this.ngxLoader.stopLoader('loader-01');
      let status = res['success'];
      let msg = res['message'];
      if (status) {
        this.activeModal.close(status);
        this.alertService.showSuccess(msg);
        this.closeModal();
      } else {
        this.alertService.showError(msg);
      }
    });
  }

  // addRecipes() {
  //   debugger;
  //   if (this.receipeForm.invalid) {
  //     this.receipeForm.markAllAsTouched(); // Show validation errors
  //     return; // Stop if the form is invalid
  //   }

  //   let ActiveOutlet = [];
  //   ActiveOutlet.push(JSON.parse(sessionStorage.getItem('activeOutlet')).outletId);
  //   this.itemForRecipe.recipe = this.recipeData;

  //   let data = {
  //     item: this.itemForRecipe,
  //     image: '',
  //     outlets: ActiveOutlet
  //   };

  //   this.ngxLoader.startLoader('loader-01');
  //   this.posDataService.updateItemData(data, this.itemForRecipe.id).subscribe((res: any) => {
  //     this.ngxLoader.stopLoader('loader-01');
  //     let status = res['success'];
  //     let msg = res['message'];
  //     if (status) {
  //       this.activeModal.close(status);
  //       this.alertService.showSuccess(msg);
  //       this.closeModal();
  //     } else {
  //       this.alertService.showError(msg);
  //     }
  //   });
  // }
  changeItemStatus(id, status) {
    let jsonData: any = {};
    jsonData.Id = id;
    jsonData.IsActive = !status

    this.posDataService.changeItemsStatus(id, !status).subscribe((res: any) => {
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

  OpenCloneForm(content) {
    this.modalService.open(content, { backdrop: 'static', windowClass: 'main_add_popup', keyboard: true, centered: true }).result.then((result) => {
      this.closeResult = `Closed with: ${result}`;
    }, (reason) => {
      this.closeResult = `Dismissed ${this.getDismissReason(reason)}`;
    });
  }




  get isAnyTypeSelected(): boolean {
    const { veg, nonVeg, eggetarian, harddrinks, softdrinks } = this.allIndiaForm.value;
    return !!(veg || nonVeg || eggetarian || harddrinks || softdrinks);
  }
  allIndiaForm = this.formBuilder.group({
    veg: [''],
    nonVeg: [''],
    eggetarian: [''],
    harddrinks: [''],
    softdrinks: [''],
  });


  nextAllIndia() {
    const formValue = this.allIndiaForm.value;
    const itemTypes: string[] = [];
    if (formValue.veg) itemTypes.push('Veg');
    if (formValue.nonVeg) itemTypes.push('NonVeg');
    if (formValue.eggetarian) itemTypes.push('Eggetarian');
    if (formValue.harddrinks) itemTypes.push('Harddrinks');
    if (formValue.softdrinks) itemTypes.push('Softdrinks');

    const params = {
      OutletId: this.outletId,
      restaurantName: this.outletName,
      itemTypes: itemTypes // <-- property name matches .NET List<string>
    };

    // Send params to your API or next logic
    this.posDataService.CloneItem(params).subscribe(res => {
      this.ngxLoader.stopLoader('loader-01')
      this.alertService.showSuccess(res.message || "Items and categories cloned successfully."  );
      this.allIndiaForm.reset();
      this.modalService.dismissAll();
      this.getAllitems();

    });
  }
  OnSelectFilter() {
    debugger;
    if (this.SelectedFilter = "Pending items"){
      this.allItems = this.allItems?.filter(data => data.isApproved == false)
      
    }
  }
}
