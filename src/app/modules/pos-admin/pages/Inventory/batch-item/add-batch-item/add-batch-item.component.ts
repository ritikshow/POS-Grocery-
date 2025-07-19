import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { AlertService } from '@core/services/common/alert.service';
import { PosDataService } from '@core/services/pos-system/pos-data.service';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';
import { NgxUiLoaderService } from 'ngx-ui-loader';
import { DomSanitizer } from '@angular/platform-browser';

@Component({
  selector: 'app-add-batch-item',
  templateUrl: './add-batch-item.component.html',
  styleUrls: ['./add-batch-item.component.css']
})
export class AddBatchItemComponent implements OnInit {
  itemForm: any = FormGroup;
  category: any;
  allUser: Object;
  isEdit = false;
  restaurantId: any;
  resData: any;
  PsMasterReceipe: any;
  AllItemsMaster: any;
  outletArray = [];
  id: any;
  itemData: any;
  editMod = false;
  outletId: any;
  taxData = [];
  unitList = ["Kg", "Gram", "Liter"];
  unit: any;
  isNewItem: any;
  SelectedImage: any;
  ItemImage: any;
  BaseUrl: any;
  constructor(
    private ngxLoader: NgxUiLoaderService,
    private activeModal: NgbActiveModal,
    private formBuilder: FormBuilder,
    private alertService: AlertService,
    private posDataService: PosDataService,
    private sanitize: DomSanitizer
  ) { }

  ngOnInit(): void {
    let restData = JSON.parse(sessionStorage.getItem('restaurantData'));
    if (sessionStorage.getItem('activeRestaurantId') !== null && sessionStorage.getItem('activeRestaurantId') !== undefined) {
      this.restaurantId = sessionStorage.getItem('activeRestaurantId');
    } else {
      this.restaurantId = restData.restaurantId;
    }
    this.outletId = sessionStorage.getItem('activeOutletId');
    this.itemForm = this.formBuilder.group({
      category: ['', Validators.required],
      subCat: [''],
      itemName: ['', Validators.required],
      description: [''],
      itemAmount: ['', Validators.required],
      isActive: [true, Validators.required],
      unit: [''],
      quantity: [0],
      isBatchRecipe: ['']
    });
    this.getAllCategory();
    this.getRestaurantDataById();
    this.isNewItem = sessionStorage.getItem('isNewItem');
    this.id = sessionStorage.getItem("itemIdForEditItem");
    if (this.isNewItem == 'false') {
      sessionStorage.removeItem('isNewItem');
      this.editMod = true;
      this.getItemDataById();
    }
  }

  getAllCategory() {

    this.ngxLoader.startLoader('loader-01');
    this.posDataService.getAllCategoryByOutletId(this.outletId, false).subscribe((res: any) => {
      this.ngxLoader.stopLoader('loader-01');
      this.category = res['data'];
      let success = res['success'];
      let msg = res['message'];
      if (!success) {
        this.alertService.showError(msg);
      }
    });
  }

  getRestaurantDataById() {
    this.ngxLoader.startLoader('loader-01');
    this.posDataService.getRestaurantById(this.restaurantId).subscribe((res: any) => {
      this.ngxLoader.stopLoader('loader-01');
      this.resData = res['data'];
      let success = res['success'];
      let msg = res['message'];
      if (!success) {
        this.alertService.showError(msg);
      }
    });
  }

  getItemDataById() {
    this.ngxLoader.startLoader('loader-01');
    this.posDataService.getItemById(this.id).subscribe((res: any) => {
      this.ngxLoader.stopLoader('loader-01');
      console.log(" this.itemData...", this.itemData);
      this.itemData = res['data'];
      let success = res['success'];
      let msg = res['message'];
      if (success) {
        this.patchValuesToForm();
      }
      else {
        this.alertService.showError(msg);
      }
    });

  }

  patchValuesToForm() {

    //this.outletArray = this.itemData.outlets;
    this.outletArray.push(JSON.parse(sessionStorage.getItem('activeOutlet')).outletId);
    this.itemForm.patchValue({
      category: this.itemData.itemCategoryId,
      subCat: this.itemData.itemSubCategoryId,
      itemName: this.itemData.itemName,
      description: this.itemData.description,
      itemAmount: this.itemData.itemAmount,
      isActive: this.itemData.isActive,
      isBatchRecipe: this.itemData.isBatchRecipe,
      unit: this.itemData.unit,
      quantity: this.itemData.quantity
    });
    //console.log("edit active:", this.itemData);
    // for (let i = 0; i < this.outletArray.length; i++) {
    //   const ele = document.getElementById(this.outletArray[i]) as HTMLInputElement;
    //   if (ele !== undefined && ele !== null) {
    //     ele.checked = true;
    //   }
    // }
  }

  closeModal() {
    this.activeModal.close(0);
  }

  onSelectAllboxChange(e) {
    let outlet = this.resData.outlets;
    this.outletArray = [];
    if (e.target.checked) {
      for (let i = 0; i < outlet.length; i++) {
        this.outletArray.push(outlet[i].outletId);
        const ele = document.getElementById(outlet[i].outletId) as HTMLInputElement;
        if (ele !== undefined && ele !== null) {
          ele.checked = true;
        }
      }
    } else {
      for (let i = 0; i < outlet.length; i++) {
        this.outletArray.splice(0, 1);
        const ele = document.getElementById(outlet[i].outletId) as HTMLInputElement;
        if (ele !== undefined && ele !== null) {
          ele.checked = false;
        }
      }
    }
    console.log(this.outletArray);
  }

  onCheckboxChange(event) {

    let id = event.target.value;

    if (event.target.checked) {
      this.outletArray.push(id);
    } else {
      let i: number = 0;
      this.outletArray.forEach((res: any) => {
        if (res == event.target.value) {
          this.outletArray.splice(i, 1);
          return;
        }
        i++;
      });
      const ele = document.getElementById('selectAll') as HTMLInputElement;
      if (ele !== undefined && ele !== null) {
        ele.checked = false;
      }
    }
    console.log(this.outletArray);
  }

  addItem() {
    this.itemForm.patchValue({
      isBatchRecipe: true
    })
    if (this.itemForm.invalid) {
      this.alertService.showWarning("Fields are empty");
    } else if (this.outletArray.length == 0) {
      this.alertService.showWarning("Plese Select Atleast One Outlet");
    } else if (this.isNewItem != 'true') {
      const formData = new FormData();
      formData.append('id', this.itemData.id);
      formData.append('ItemName', this.itemForm.get('itemName').value);
      formData.append('Description', this.itemForm.get('description').value ?? '');
      formData.append('ItemCategoryId', this.itemForm.get('category').value);
      formData.append('ItemSubCategoryId', '');
      formData.append('ImageName', this.itemForm.get('imageName')?.value);
      formData.append('itemAmount', this.itemForm.get('itemAmount').value);
      formData.append('isActive', this.itemForm.get('isActive').value);
      formData.append('CategoryId', this.itemData.itemCategoryId);
      formData.append('taxId', this.itemForm.get('taxId')?.value);
      formData.append('isBatchRecipe', this.itemForm.get('isBatchRecipe').value);
      formData.append('unit', this.itemForm.get('unit').value);
      formData.append('quantity', this.itemForm.get('quantity').value);
      formData.append('bomDetails', this.itemData?.bomDetails);
      formData.append('recipe', this.itemData?.recipe);
      formData.append('modifiers', this.itemData?.modifiers);
      formData.append('discount', this.itemData?.discount);
      formData.append('isApproved', this.itemData.isApproved);
      this.outletArray.forEach((data: string, index: number) => {
        formData.append(`outlets[${index}]`, data);
      });

      // this.outletArray.forEach((data: string, index: number) => {
      //   formData.append(`bomDetails[${index}]`, data);
      // });
      // this.outletArray.forEach((data: string, index: number) => {
      //   formData.append(`discount[${index}]`, data);
      // });
      // this.outletArray.forEach((data: string, index: number) => {
      //   formData.append(`recipe[${index}]`, data);
      // });
      // this.outletArray.forEach((data: string, index: number) => {
      //   formData.append(`modifiers[${index}]`, data);
      // });

      if (this.SelectedImage) {
        formData.append('Image', this.SelectedImage);
      } else {
        formData.append('ImageName', this.itemData?.imageName);
        formData.append('ImagePath', this.itemData?.imagePath ?? '')
      }
      this.ngxLoader.startLoader('loader-01');
      this.posDataService.updateItem(formData, this.itemData.id).subscribe((res: any) => {
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
    } else {

      const formData = new FormData();
      // this.itemForm.patchValue({
      //   isActive : true
      // })
      formData.append('ItemName', this.itemForm.get('itemName').value);
      formData.append('Description', this.itemForm.get('description').value ?? '');
      formData.append('ItemCategoryId', this.itemForm.get('category').value);
      formData.append('ItemSubCategoryId', '');
      formData.append('itemAmount', this.itemForm.get('itemAmount').value);
      formData.append('isActive', this.itemForm.get('isActive').value);
      formData.append('recipe', JSON.stringify(this.itemData?.recipe || []));
      formData.append('BomDetails', JSON.stringify([]));
      formData.append('Modifiers', JSON.stringify(this.itemData?.modifiers || []));
      formData.append('MultipleImagePath', JSON.stringify(this.itemData?.multipleImagePath || []));
      formData.append('Discount', JSON.stringify(this.itemData?.discount || []));
      formData.append('ImageName', this.itemForm.get('imageName')?.value ?? '');
      formData.append('ImageExtension', '');
      formData.append('TaxId', this.itemForm.get('taxId')?.value ?? '');
      formData.append('unit', this.itemForm.get('unit').value ?? '');
      formData.append('quantity', this.itemForm.get('quantity').value ?? '');
      this.outletArray.forEach((data: string, index: number) => {
        formData.append(`outlets[${index}]`, data);
      });
      formData.append('Image', this.SelectedImage);
      formData.append('IsBatchRecipe', this.itemForm.get('isBatchRecipe').value);
      this.ngxLoader.startLoader('loader-01');
      this.posDataService.postItemData(formData).subscribe((res: any) => {
        this.ngxLoader.stopLoader('loader-01');
        let status = res['success'];
        let msg = res['message'];
        if (status) {
          sessionStorage.removeItem('addForm');
          this.activeModal.close(status);
          this.alertService.showSuccess('Item Added Succesfully');
        } else {
          this.alertService.showError(msg);
        }
      });
    }
  }
  dragNdrop(event) {
    if (event.target.files && event.target.files[0]) {
      const file = event.target.files[0];
      this.SelectedImage = file;
      this.ItemImage = this.sanitize.bypassSecurityTrustUrl(URL.createObjectURL(file));
      this.itemForm.patchValue({
        imageName: file.name,
      });
    }
  }
}
