import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { AlertService } from '@core/services/common/alert.service';
import { PosDataService } from '@core/services/pos-system/pos-data.service';
import { PosDataShareService } from '@core/services/pos-system/posDataShare.service';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';
import { NgxUiLoaderService } from 'ngx-ui-loader';
import { DomSanitizer } from '@angular/platform-browser';
import { environment } from 'src/environments/environment';
interface ImagePreview {
  isNew: boolean;
  file?: File;            // for newly added files
  serverPath?: string;    // for already uploaded files
  previewUrl: string;
}
@Component({
  selector: 'app-category',
  templateUrl: './category.component.html',
  styleUrls: ['./category.component.css']
})
export class CategoryComponent implements OnInit {
  itemForm: any = FormGroup;
  category: any;
  allUser: Object;
  isEdit = false;
  restaurantId: any;
  ItemImage: any;
  MultipleImages: any;
  imagesToDelete = [];
  selectedIds: any;
  resData: any;
  PsMasterReceipe: any;
  AllItemsMaster: any;
  outletArray = [];
  id: any;
  itemData: any;
  editMod: any;
  outletId: any;
  taxData = [];
  SelectedImage: any;
  BaseUrl: string;
  selectedFiles: File[] = [];
  imagePreviews: ImagePreview[] = [];
  SelectedImageForMultiple: any;
  constructor(
    private ngxLoader: NgxUiLoaderService,
    private activeModal: NgbActiveModal,
    private formBuilder: FormBuilder,
    private alertService: AlertService,
    private posDataService: PosDataService,
    private posDataSharedService: PosDataShareService,
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
      taxId: [''],
      isBatchRecipe: [''],
      file: [''],
      imageName: [''],
      PreparingTime: ['', Validators.required],
      itemTypes: ['', Validators.required],


    });
    this.BaseUrl = environment.apiUrl.replace(/^(.*:\/\/[^\/]+\/).*$/, '$1');
    this.getAllTaxesData();
    this.getAllCategory();
    this.getRestaurantDataById();
    this.id = this.posDataSharedService.getIdForItemModifier();
    if (sessionStorage.getItem('addForm') == 'old') {
      this.getItemDataById();
      this.editMod = true;
    }
    if (sessionStorage.getItem('addForm') == 'new') {
      this.editMod = false;
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
      this.itemData = res['data'];
      if (this.itemData.multipleImagePath) {
        this.imagePreviews = this.itemData.multipleImagePath.map(path => ({
          isNew: false,
          serverPath: path,
          previewUrl: this.BaseUrl + path?.match(/Uploads.*/)[0]
        }));
      }
      this.selectedIds = this.itemData.outlets;
      console.log("selected addons", this.selectedIds);
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
  selectOnlyOne(type: string) {
    this.itemForm.get('itemTypes').setValue(type);
  }



  patchValuesToForm() {
    if (this.itemData?.imagePath != null && this.itemData?.imagePath != 'null')
      this.ItemImage = this.itemData?.imagePath?.match(/Uploads.*/)[0];
    this.outletArray.push(JSON.parse(sessionStorage.getItem('activeOutlet')).outletId);
    console.log("single image", this.ItemImage);
    this.itemForm.patchValue({
      category: this.itemData.itemCategoryId,
      taxId: this.itemData.taxId,
      subCat: this.itemData.itemSubCategoryId,
      itemName: this.itemData.itemName,
      description: this.itemData.description,
      itemAmount: this.itemData.itemAmount,
      isActive: this.itemData.isActive,
      PreparingTime: this.itemData.preparingTime,
      itemTypes: this.itemData.itemTypes

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
  }

  addItem() {
    this.itemForm.patchValue({
      isBatchRecipe: false
    })
    if (this.itemForm.invalid) {
      this.alertService.showWarning("Fields are empty");
      // } else if (this.outletArray.length == 0) {
      //   this.alertService.showWarning("Plese Select Atleast One Outlet");
    } else if (sessionStorage.getItem('addForm') !== 'new') {
      const formData = new FormData();
      formData.append('id', this.itemData.id);
      formData.append('ItemTypes', this.itemForm.get('itemTypes').value);
      formData.append('ItemName', this.itemForm.get('itemName').value ?? '');
      formData.append('Description', this.itemForm.get('description').value ?? '');
      formData.append('ItemCategoryId', this.itemForm.get('category').value ?? '');
      formData.append('ItemSubCategoryId', '');
      formData.append('CategoryId', this.itemData.categoryId ?? '');
      formData.append('ImageName', this.itemForm.get('imageName').value ?? '');
      formData.append('itemAmount', this.itemForm.get('itemAmount').value ?? '');
      formData.append('isActive', this.itemForm.get('isActive').value);
      formData.append('taxId', this.itemForm.get('taxId').value ?? '');
      formData.append('isBatchRecipe', this.itemForm.get('isBatchRecipe').value);
      formData.append('PreparingTime', this.itemForm.get('PreparingTime').value ?? '');
      formData.append('bomDetails', this.itemData?.bomDetails);
      formData.append('recipe', JSON.stringify(this.itemData?.recipe ?? ''));
      formData.append('isApproved', this.itemData.isApproved);
      //this.itemData.modifiers?.forEach(m => { formData.append('modifiers', m); });

      // formData.append('discount',this.itemData?.discount);
      // this.itemData.discount?.forEach(d => { formData.append('discount', d);});
      // ...existing code...

      // ...existing code...

      if (Array.isArray(this.itemData.modifiers) && this.itemData.modifiers.length > 0) {
        this.itemData.modifiers.forEach(m => { formData.append('modifiers', m); });
      } else {
        formData.append('modifiers', '');
      }

      if (Array.isArray(this.itemData.discount) && this.itemData.discount.length > 0) {
        this.itemData.discount.forEach(d => { formData.append('discount', d); });
      } else {
        formData.append('discount', '');
      }
      this.outletArray.forEach((data: string, index: number) => {
        formData.append('Outlets', data);
      });
      this.imagePreviews.filter(img => img.isNew && img.file)
        .forEach(img => {
          formData.append('MultipleImage', img.file!);
        });
      const existingPaths = this.imagePreviews
        .filter(img => !img.isNew && img.serverPath)
        .map(img => img.serverPath);

      // For existing uploaded image paths
      existingPaths?.forEach((path, index) => {
        formData.append(`MultipleImagePath[${index}]`, path);
      });

      // For deleted images
      this.imagesToDelete?.forEach((path, index) => {
        formData.append(`DeletedImagePath[${index}]`, path);
      });
      if (this.SelectedImage) {
        formData.append('Image', this.SelectedImage);
      } else {
        formData.append('ImageName', this.itemData.imageName);
        formData.append('ImagePath', this.itemData.imagePath ?? '')
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
      formData.append('ItemTypes', this.itemForm.get('itemTypes').value);
      formData.append('ItemName', this.itemForm.get('itemName').value);
      formData.append('Description', this.itemForm.get('description').value ?? '');
      formData.append('ItemCategoryId', this.itemForm.get('category').value ?? '');
      formData.append('ItemSubCategoryId', '');
      formData.append('itemAmount', this.itemForm.get('itemAmount').value ?? '');
      formData.append('isActive', this.itemForm.get('isActive').value);
      formData.append('recipe', JSON.stringify(this.itemData?.recipe || []));
      formData.append('BomDetails', JSON.stringify([]));
      formData.append('Modifiers', JSON.stringify([]));
      formData.append('Discount', JSON.stringify([]));
      formData.append('ImageName', this.itemForm.get('imageName').value ?? '');
      formData.append('ImageExtension', '');
      formData.append('TaxId', this.itemForm.get('taxId').value ?? '');
      formData.append('PreparingTime', this.itemForm.get('PreparingTime').value ?? '');
      //formData.append('outlets', JSON.stringify(this.outletArray));
      if (!this.outletArray || this.outletArray.length === 0) {
        this.alertService.showWarning('Please select at least one outlet');
        return;
      }

      this.outletArray.forEach((data: string, index: number) => {
        formData.append(`outlets[${index}]`, data);
      });
      formData.append('Image', this.SelectedImage);
      formData.append('IsBatchRecipe', this.itemForm.get('isBatchRecipe').value);
      formData.append('ItemTypes', this.itemForm.get('itemTypes').value);
      formData.append('ItemName', this.itemForm.get('itemName').value);
      formData.append('Description', this.itemForm.get('description').value ?? '');
      formData.append('ItemCategoryId', this.itemForm.get('category').value ?? '');
      formData.append('ItemSubCategoryId', '');
      formData.append('itemAmount', this.itemForm.get('itemAmount').value ?? '');
      formData.append('isActive', this.itemForm.get('isActive').value);
      formData.append('recipe', JSON.stringify(this.itemData?.recipe || []));
      formData.append('BomDetails', JSON.stringify([]));
      formData.append('Modifiers', JSON.stringify([]));
      formData.append('Discount', JSON.stringify([]));
      formData.append('ImageName', this.itemForm.get('imageName').value ?? '');
      formData.append('ImageExtension', '');
      formData.append('TaxId', this.itemForm.get('taxId').value ?? '');
      formData.append('PreparingTime', this.itemForm.get('PreparingTime').value ?? '');
      formData.append('MultipleImagePath', JSON.stringify([]));
      //formData.append('outlets', JSON.stringify(this.outletArray));
      this.outletArray.forEach((data: string, index: number) => {
        formData.append('Outlets', data);
      });
      formData.append('Image', this.SelectedImage);
      this.imagePreviews.filter(img => img.isNew && img.file)
        .forEach(img => {
          formData.append('MultipleImage', img.file!);
        });
      console.log("iamges data", this.selectedFiles);
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


  getAllTaxesData() {

    this.ngxLoader.startLoader('loader-01');
    this.posDataService.getTaxByOutletId(this.outletId, false).subscribe((res: any) => {
      this.ngxLoader.stopLoader('loader-01');
      let data = res['data'];
      for (let i = 0; i < data.length; i++) {
        let taxObj = {
          taxId: "",
          taxName: "",
          taxPercent: [],
          taxAmount: 0,
          taxSelectedval: 0
        };
        if (data.length !== 0) {
          taxObj.taxId = data[i].taxId;
          taxObj.taxName = data[i].taxName;
          taxObj.taxAmount = 0;
          taxObj.taxSelectedval = 0;
          let perData = data[i].taxPercent;
          for (let j = 0; j < perData?.length; j++) {
            let perObj = {
              taxPercent: 0,
              isDefault: false,
              taxAmount: 0
            };
            if (perData.length !== 0) {
              perObj.taxPercent = perData[j].taxPercent;
              perObj.isDefault = perData[j].isDefault;
              perObj.taxAmount = 0;
              taxObj.taxPercent.push(perObj);
            }
          }
        }
        this.taxData.push(taxObj);
      }
    });
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
  // dragNdropFOrMultipleImage(event) {
  //   if (event.target.files && event.target.files[0]) {
  //     const file = event.target.files[0];
  //     this.SelectedImageForMultiple = file;
  //     this.ItemImage = this.sanitize.bypassSecurityTrustUrl(URL.createObjectURL(file));
  //     this.itemForm.patchValue({
  //       imageName: file.name,
  //     });
  //   }
  // }
  onImageSelected(event: any): void {
    const files = event.target.files;

    for (let file of files) {
      const reader = new FileReader();
      reader.onload = (e: any) => {
        this.imagePreviews.push({
          isNew: true,
          file: file,
          previewUrl: e.target.result
        });
      };
      reader.readAsDataURL(file);
    }
  }
  removeImage(index: number): void {
    const removed = this.imagePreviews[index];

    // Optional: track serverPath for deletion
    if (!removed.isNew && removed.serverPath) {
      this.imagesToDelete.push(removed.serverPath);
    }

    this.imagePreviews.splice(index, 1);
  }

}
