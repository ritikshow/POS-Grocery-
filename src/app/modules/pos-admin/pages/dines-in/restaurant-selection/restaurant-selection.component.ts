import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { PosSharedService } from '@core/services/common/pos-shared.service';
import { PosDataService } from '@core/services/pos-system/pos-data.service';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';
import { NgxUiLoaderService } from 'ngx-ui-loader';
import { AlertService } from '@core/services/common/alert.service';

@Component({
  selector: 'app-restaurant-selection',
  templateUrl: './restaurant-selection.component.html',
  styleUrls: ['./restaurant-selection.component.css']
})
export class RestaurantSelectionComponent implements OnInit {
  restaurantForm: any = FormGroup;
  closeResult: string;
  resData = [];
  closeView = false;
  MultiRestaurant: any;

  constructor(
    private ngxLoader: NgxUiLoaderService,
    private posDataService: PosDataService,
    private formBuilder: FormBuilder,
    private activeModal: NgbActiveModal,
    private posSharedService: PosSharedService,
    private alertService: AlertService,
  ) { }

  ngOnInit(): void {
    if (sessionStorage.getItem('dash') == 'dashboard') {
      this.closeView = true;
    }
    this.restaurantForm = this.formBuilder.group({
      restaurantId: ['', Validators.required],
    });
    this.getAllRestaurantData();
  }

  getAllRestaurantData() {
    this.ngxLoader.startLoader('loader-01');
    this.posDataService.getAllRestaurants(false).subscribe((res: any) => {
      this.ngxLoader.stopLoader('loader-01');
      let data = res['data'];
      let success = res['success'];
      let msg = res['message'];
      if (success) {
        if (sessionStorage.getItem('Role') != 'Super Admin') {
          this.MultiRestaurant = JSON.parse(sessionStorage.getItem('restaurantData'));
          this.MultiRestaurant.forEach(element => {
            let resD = data.find(x => x.restaurantId == element.restaurantId);
            if (resD != null && resD != undefined)
              this.resData.push(resD);
          });
        }
        else {
          this.resData = data;
        }
      } else {
        this.alertService.showError(msg);
      }
    });
  }

  selectRestaurant() {

    if (this.restaurantForm.invalid) {
      return;
    } else {
      let restaurantId = this.restaurantForm.get('restaurantId').value;
      sessionStorage.setItem('activeRestaurantId', restaurantId);
      this.posSharedService.callToggle.next(true);
      this.activeModal.close(true);
    }
  }

  closeModal() {
    this.activeModal.close();
  }
}
