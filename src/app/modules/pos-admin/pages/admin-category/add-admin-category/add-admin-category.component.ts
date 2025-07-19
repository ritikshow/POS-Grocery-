import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { AddItemService } from '@core/services/common/add-item.service';
import { AlertService } from '@core/services/common/alert.service';
import { PosDataService } from '@core/services/pos-system/pos-data.service';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';
import { NgxUiLoaderService } from 'ngx-ui-loader';
import { DomSanitizer } from '@angular/platform-browser';
import { environment } from 'src/environments/environment';
@Component({
  selector: 'app-add-admin-category',
  templateUrl: './add-admin-category.component.html',
  styleUrls: ['./add-admin-category.component.css']
})
export class AddAdminCategoryComponent implements OnInit {
  categoryForm: any = FormGroup;
  categoryData: any;
  outletId: any;
  isUpdate = false;
  courseData: any;
  id: any;
  CategoryImage:any;
  SelectedImage:any;
  BaseUrl:any;
  constructor(
    private ngxLoader: NgxUiLoaderService,
    private activeModal: NgbActiveModal,
    private formBuilder: FormBuilder,
    private alertService: AlertService,
    private addItems: AddItemService,
    private posDataService: PosDataService,
    private sanitize : DomSanitizer
  ) { }

  ngOnInit(): void {
    this.categoryForm = this.formBuilder.group({
      categoryName: ['', Validators.required],
      categoryCode: ['', Validators.required],
      location: ['', Validators.required],
      description: [''],
      course: [''],
      file : [''],
      ActiveStatus:['']
    });
    this.BaseUrl = environment.apiUrl.replace(/^(.*:\/\/[^\/]+\/).*$/, '$1');
    this.outletId = sessionStorage.getItem('activeOutletId');
    this.getAllCourse();
    let isNew = sessionStorage.getItem('isNewCategory');
    if (isNew == 'false') {
      this.id = sessionStorage.getItem('editCategory');
      this.isUpdate = true;
      sessionStorage.removeItem('isNewCategory');
      sessionStorage.removeItem('editCategory');
      this.getCategoryDataById(this.id);
    }
    
  }
  closeModal() {
    this.activeModal.close();
  }
  getCategoryDataById(id) {
    this.ngxLoader.startLoader('loader-01');
    this.posDataService.getCategoryById(this.id).subscribe((res: any) => {
      this.ngxLoader.stopLoader('loader-01');
      this.categoryData = res['data'];
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
  getAllCourse() {
    this.ngxLoader.startLoader('loader-01');
    this.posDataService.getAllCourse(this.outletId).subscribe((res: any) => {
      this.ngxLoader.stopLoader('loader-01');
      this.courseData = res['data'];
      let success = res['success'];
      let msg = res['message'];
      if (!success) {
        this.alertService.showError(msg);
      }
    });
  }

  addCategoryFormData() {

    if (this.categoryForm.invalid) {
      this.alertService.showError("Field should not be empty");
    } else {
this.categoryForm.patchValue({
  ActiveStatus : true
})
      let formData = new FormData();
      formData.append('outletId',this.outletId);
      formData.append('categoryName',this.categoryForm.get('categoryName').value ?? '');
      formData.append('categoryCode',this.categoryForm.get('categoryCode').value ?? '');
      formData.append('location',this.categoryForm.get('location').value ?? '');
      formData.append('description',this.categoryForm.get('description').value ?? '');
      formData.append('course',this.categoryForm.get('course').value ?? '');
      formData.append('Image',this.SelectedImage ?? '');
      formData.append('ActiveStatus',this.categoryForm.get('ActiveStatus').value ?? '');
      this.addItems.addAdminCategoryData(formData).subscribe((result) => {     
        if (result.success) {
          this.alertService.showSuccess("Category added successfully");
          this.activeModal.close(true);
        }
      });
    }
  }
  dragNdrop(event) {
    if (event.target.files && event.target.files[0]) {
      const file = event.target.files[0];
      this.SelectedImage = file;
      this.CategoryImage = this.sanitize.bypassSecurityTrustUrl(URL.createObjectURL(file));
    }
  }

  patchValuesToForm() {
    if(this.categoryData?.imagePath != null)
    this.CategoryImage = this.categoryData.imagePath?.match(/Uploads.*/)[0];
    this.categoryForm.patchValue({
      categoryName: this.categoryData.categoryName,
      categoryCode: this.categoryData.categoryCode,
      location: this.categoryData.location,
      description: this.categoryData.description,
      course: this.categoryData.course
      //file:this.categoryData.imagePath
    });

  }
  updateCategoryFormData(data: any) {
    if (this.categoryForm.invalid) {
      this.alertService.showError("Field should not be empty");
    } else if (this.id !== undefined) {
      let formData = new FormData();
      formData.append('categoryId',this.id);
      formData.append('outletId',this.outletId);
      formData.append('categoryName',this.categoryForm.get('categoryName').value ?? '');
      formData.append('categoryCode',this.categoryForm.get('categoryCode').value ?? '');
      formData.append('location',this.categoryForm.get('location').value ?? '');
      formData.append('description',this.categoryForm.get('description').value ?? '');
      formData.append('course',this.categoryForm.get('course').value ?? '');
      formData.append('ActiveStatus',this.categoryData.activeStatus ?? '');
      if(this.SelectedImage){
      formData.append('Image',this.SelectedImage);
      }
      else{
        formData.append('ImagePath',this.categoryData.imagePath ?? '');
      }
      this.ngxLoader.startLoader('loader-01');
      this.posDataService.upDateCategoryData(this.id, formData).subscribe((res: any) => {
        this.ngxLoader.stopLoader('loader-01');
        if (res.success) {
          this.alertService.showSuccess(res.message);
          this.closeModal();
        } else {
          this.alertService.showError(res.message);
        }
      });
    } else {
      this.addItems.addAdminCategoryData(data).subscribe((result) => {
        console.log(result);
        if (result.success) {
          this.alertService.showSuccess("Category added successfully");
          this.closeModal();
        } else {
          this.alertService.showError(result.message);
        }
      });
    }
    this.closeModal();
  }
}
