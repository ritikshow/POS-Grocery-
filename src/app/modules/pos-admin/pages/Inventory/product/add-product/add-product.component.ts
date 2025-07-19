import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { AlertService } from '@core/services/common/alert.service';
import { PosDataService } from '@core/services/pos-system/pos-data.service';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';
import { NgxUiLoaderService } from 'ngx-ui-loader';

@Component({
  selector: 'app-add-product',
  templateUrl: './add-product.component.html',
  styleUrls: ['./add-product.component.css']
})
export class AddProductComponent implements OnInit {
  productForm: any = FormGroup;
  editMod = false;
  id: any;
  productData: any;
  outletId: any;
  AmountVisible = false;
  WPProductData: any;
  isNew: any;
  keyWord: any;
  page = 1;
  auth: any;
  userData: any;
  OnlyPopUp = false;
  allSupplier: any;
  dataLoaded = false;
  manuallyAddedSupplier: any;
  iswMDataIsNull = true;
  AllProductList: any;

  constructor(
    private ngxLoader: NgxUiLoaderService,
    private activeModal: NgbActiveModal,
    private formBuilder: FormBuilder,
    private alertService: AlertService,
    private posDataService: PosDataService,
  ) { }

  ngOnInit(): void {
    this.AllProductList = JSON.parse(sessionStorage.getItem("ProductList"));
    this.isNew = sessionStorage.getItem('isNewOrder');
    if (this.isNew == 'false') {
      sessionStorage.removeItem('isNewOrder');
      this.id = sessionStorage.getItem('editId');
      this.getProductDataById();
      this.editMod = true;
    }
    this.userData = JSON.parse(sessionStorage.getItem('userCredential'));
    this.auth = btoa(btoa("WatermelonPOSOrder") + btoa(this.userData.emailId));
    let isPopUp = sessionStorage.getItem('onlyPopUp');
    if (isPopUp != null && isPopUp == 'true') {
      this.keyWord = sessionStorage.getItem('keyWord');
      this.OnlyPopUp = true;
      sessionStorage.removeItem('keyWord');
      sessionStorage.removeItem('onlyPopUp');
      this.search();
    }
    this.outletId = sessionStorage.getItem('activeOutletId');
    this.productForm = this.formBuilder.group({
      productName: ['', Validators.required],
      price:['', Validators.required],
      unit: ['', Validators.required],
      supplierId: ['', Validators.required],

    });
    this.GetAllSupplier();
  }
  search() {
    let obj = {
      page: 1,
      keyword: this.keyWord,
    }
    this.ngxLoader.startLoader('loader-01');
    this.posDataService.getWBProductByKeyword(obj, this.auth).subscribe((res: any) => {
      this.ngxLoader.stopLoader('loader-01');
      this.WPProductData = res['data'];
      let success = res['success'];
      let msg = res['message'];
      if (!success) {
        this.alertService.showError(msg);
      } else {
        this.checkProductExistsById();
      }
    });
  }
  Next() {
    this.page++;
    let obj = {
      page: this.page,
      keyword: this.keyWord,
    }
    this.ngxLoader.startLoader('loader-01');
    this.posDataService.getWBProductByKeyword(obj, this.auth).subscribe((res: any) => {
      this.ngxLoader.stopLoader('loader-01');
      this.WPProductData = res['data'];
      let success = res['success'];
      let msg = res['message'];
      if (!success) {
        this.alertService.showError(msg);
      } else {
        this.checkProductExistsById();
      }
    });
  }

  previous() {
    this.page -= 1;
    let obj = {
      page: this.page,
      keyWord: this.keyWord,
    }
    this.ngxLoader.startLoader('loader-01');
    this.posDataService.getWBProductByKeyword(obj, this.auth).subscribe((res: any) => {
      this.ngxLoader.stopLoader('loader-01');
      this.WPProductData = res['data'];
      let success = res['success'];
      let msg = res['message'];
      if (!success) {
        this.alertService.showError(msg);
      }else{
        this.checkProductExistsById();
      }
    });
    this.page++;
  }

  checkProductExistsById(){
    //Check if product is already exists or not to block the ADD button
    for (let i = 0; i < this.WPProductData.length; i++) {

      //unblock Add button by default
      this.WPProductData[i].isBlock = false;
      for (let j = 0; j < this.AllProductList.length; j++) {
        if (this.AllProductList[j].wMData.wmProductId == this.WPProductData[i]._id) {
          this.WPProductData[i].isBlock = true;
        }
      }
    }
  }

  Add(data, i) {
    let PRid = document.getElementsByName("SelectPricing")[i]["selectedIndex"];
    let PriceRange = data.pricing_range[PRid];
    let obj = {
      "pricingRange": PriceRange,
      "wMData":
      {
        "WMProductId": data._id,
        "WMSupplierId": data.user_type_id,
        "supplierProductCode": data.supplier_product_code,
        "productCode": data.product_code,
        "categoryName": data.category_name,
        "categoryId": data.category_id,
        "subCategoryName": data.subcategory_name,
        "subCategoryId": data.subcategory_id
      },
      "productName": data.subcategory_name,
      "unit": data.base_uom,
      "OutletId": this.outletId
    }
    if (!obj.pricingRange)
      obj.pricingRange = {};

    this.ngxLoader.startLoader('loader-01');
    this.posDataService.InsertProduct(obj).subscribe((res: any) => {
      this.ngxLoader.stopLoader('loader-01');
      let status = res['success'];
      let msg = res['message'];
      if (status) {
         //Make Add button block, once user adds any product.
         this.WPProductData[i].isBlock = true;
        this.alertService.showSuccess('Product added succesfully');
      } else {
        this.alertService.showError(msg);
      }
    });
  }
  getProductDataById() {
    this.ngxLoader.startLoader('loader-01');
    this.posDataService.GetProductById(this.id).subscribe((res: any) => {
      this.ngxLoader.stopLoader('loader-01');
      this.productData = res['data'];
      let success = res['success'];
      let msg = res['message'];
      if (success) {
        console.log(res);
        this.patchValuesToForm();
        this.AmountVisible = true;
        if (this.productData.wMData == null || this.productData.wMData.wMSupplierName == null) {
          this.iswMDataIsNull = true;
        } else {
          this.iswMDataIsNull = false;
        }
      }
      else {
        this.alertService.showError(msg);
      }
    });
  }
  GetVal(event: any) {
    this.keyWord = event.target.value;
  }
  patchValuesToForm() {

    this.productForm.patchValue({
      productName: this.productData.productName,
      price: this.productData.pricingRange?.list_price,
      unit: this.productData.unit,
      supplierId: this.productData?.supplierId,
      supplierName: this.productData.supplierName
    });
  }

  closeModal() {
    this.activeModal.close(0);
  }

  addProductOrder() {
    let obj;
    if (this.productForm.invalid) {
      this.alertService.showWarning("Fields are empty");
    } else if (sessionStorage.getItem('isNewOrder') !== 'true') {
      let supId = this.productForm.get('supplierId').value;
      obj = {
        productName: this.productForm.get('productName').value,
        unit: this.productForm.get('unit').value,
        pricingRange:{
          list_price:this.productForm.get('price').value,
        },
        OutletId: this.outletId,
        supplierName: this.manuallyAddedSupplier.find(x => x.supplierId == supId)?.supplierName,
        supplierId: supId
      }
      this.ngxLoader.startLoader('loader-01');
      this.posDataService.UpdateProduct(this.id, obj).subscribe((res: any) => {
        this.ngxLoader.stopLoader('loader-01');
        let status = res['success'];
        let msg = res['message'];
        if (status) {
          sessionStorage.removeItem('editId');
          this.activeModal.close(status);
          this.alertService.showSuccess(msg);
        } else {
          this.alertService.showError(msg);
        }
      });
    } else {
      let supId = this.productForm.get('supplierId').value

      obj = {
        productName: this.productForm.get('productName').value,
        unit: this.productForm.get('unit').value,
        pricingRange:{
          list_price:this.productForm.get('price').value,
        },
        OutletId: this.outletId,
        supplierName: this.manuallyAddedSupplier.find(x => x.supplierId == supId).supplierName,
        supplierId: supId
      }
      if (!obj.pricingRange)
        obj.pricingRange = {};
      if (!obj.wMData)
        obj.wMData = {};
      this.ngxLoader.startLoader('loader-01');
      this.posDataService.InsertProduct(obj).subscribe((res: any) => {
        this.ngxLoader.stopLoader('loader-01');
        let status = res['success'];
        let msg = res['message'];
        if (status) {
          sessionStorage.removeItem('isNewOrder');
          this.activeModal.close(status);
          this.alertService.showSuccess('Product Added Succesfully');
        } else {
          this.alertService.showError(msg);
        }
      });
    }
  }
  GetAllSupplier() {
    this.dataLoaded = false;
    this.posDataService.GetAllSupplier(this.outletId).subscribe((res: any) => {
      this.allSupplier = res['data'];
      let success = res['success'];
      let msg = res['message'];
      if (success) {
        this.manuallyAddedSupplier = this.allSupplier.filter(x => !x.isInWatermelon);
        this.dataLoaded = true;
      }
      else {
        this.dataLoaded = true;
        this.alertService.showError(msg);
      }
    });
  }
}
