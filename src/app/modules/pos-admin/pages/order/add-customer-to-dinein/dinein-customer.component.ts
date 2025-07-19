import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { AlertService } from '@core/services/common/alert.service';
import { PosDataService } from '@core/services/pos-system/pos-data.service';
import { NgbActiveModal, NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { NgxUiLoaderService } from 'ngx-ui-loader';


@Component({
  selector: 'app-dinein-customer',
  templateUrl: './dinein-customer.component.html',
  styleUrls: ['./dinein-customer.component.css']
})
export class DineInCustomerComponent implements OnInit {
  customerForm: any = FormGroup;
  getCustomerDataByEventId: any;
  outletId: any;
  tempcostomerData: any;
  costomerData: any;
  searchInput: any;
  searchInputItem: any;
  orderNo: any;

  constructor(
    private ngxLoader: NgxUiLoaderService,
    private formBuilder: FormBuilder,
    private alertService: AlertService,
    private posDataService: PosDataService,
    private modalService: NgbModal,
    private activeModal: NgbActiveModal,
  ) { }

  ngOnInit(): void {
    this.outletId = sessionStorage.getItem('activeOutletId');
    this.customerForm = this.formBuilder.group({
      cusName: ['', Validators.required],
      phone: ['', Validators.required],
      address: ['']
    });
    this.getAllCustomers();
    this.orderNo = sessionStorage.getItem('dineInOrderNo');
  }


  addCustomer() {
    if (this.customerForm.invalid) {
      return this.alertService.showError('Field Are Empty');
    } else {
      let data = this.CreateCustomerObject()
      this.checkCustomrIsAvailableOrNot(data);
      if (this.getCustomerDataByEventId != undefined && data.phoneNumber == this.getCustomerDataByEventId.phoneNumber) {
        data.customerId = this.getCustomerDataByEventId.customerId;
        data.totalPoints = this.getCustomerDataByEventId.totalPoints;
        data.convertedAmount = this.getCustomerDataByEventId.convertedAmount;
        this.UpdateCustomerAPICall(data);
      } else {
        this.CreateCustomerApiCall(data);
      }
    }
  }
  private checkCustomrIsAvailableOrNot(data: { customerId: string; customerName: any; address: any; phoneNumber: { number: any; isPrimary: boolean; }[]; outletId: any; orderType: string; totalPoints: number; convertedAmount: number; orderNo: any; }) {
    for (let i = 0; i < this.tempcostomerData.length; i++) {
      //for (let j = 0; j < this.tempcostomerData[i].phoneNumber.length; j++) {
      if(this.tempcostomerData[i].phoneNumber){
        if (this.tempcostomerData[i].phoneNumber == data.phoneNumber) {
          this.getCustomerDataByEventId = this.tempcostomerData[i];
          break;
        }
      }
      //}
    }
  }

  private CreateCustomerObject() {
    return {
      customerId: '',
      customerName: this.customerForm.get('cusName').value,
      address: this.customerForm.get('address').value,
      phoneNumber:this.customerForm.get('phone').value,
      outletId: this.outletId,
      orderType: 'Dine-in',
      totalPoints: 0,
      convertedAmount: 0,
      orderNo: this.orderNo,
    };
  }

  private CreateCustomerApiCall(data: { customerId: string; customerName: any; address: any; phoneNumber: any; outletId: any; orderType: string; totalPoints: number; convertedAmount: number; orderNo: any; }) {
    this.posDataService.postCustomerDetails(data).subscribe((res: any) => {
      let Data = res['data'];
      let msg = res['message'];
      let status = res['success'];
      if (status) {

        sessionStorage.setItem('customerData', JSON.stringify(Data));
        this.alertService.showSuccess("Successfully added Customer");
        this.closeModal(true);
      } else {
        this.alertService.showError(msg);
      }
    });
  }

  private UpdateCustomerAPICall(data: { customerId: string; customerName: any; address: any; phoneNumber: any; outletId: any; orderType: string; totalPoints: number; convertedAmount: number; orderNo: any; }) {
    this.posDataService.updateCustomerDetails(this.getCustomerDataByEventId.customerId, data).subscribe((res: any) => {
      let Data = res['data'];
      let msg = res['message'];
      let status = res['success'];
      if (status) {
        sessionStorage.setItem('customerData', JSON.stringify(Data));
        this.alertService.showSuccess("Successfully added Customer");
        this.closeModal(true);
      } else {
        this.alertService.showError(msg);
      }
    });
  }

  closeModal(value) {
    this.activeModal.close(value);
  }
  patchCustomerData() {
    this.customerForm.patchValue({
      cusName: this.getCustomerDataByEventId.customerName,
      phone: this.getCustomerDataByEventId.phoneNumber,
      address: this.getCustomerDataByEventId.address
    });
  }

  closeAction() {
    if (this.modalService.hasOpenModals) {
      this.modalService.dismissAll();
    }
  }
  getAllCustomers() {
    this.ngxLoader.startLoader('loader-01')
    this.posDataService.getAllCustomers(this.outletId, '').subscribe((response) => {
      this.ngxLoader.stopLoader('loader-01');
      this.tempcostomerData = response['data'];
      this.costomerData = response['data'];
      let success = response['success'];
      let msg = response['message'];
      if (!success) {
        this.alertService.showError(msg);
      }
    })
  }

  search(): void {
    let input = this.searchInput;
    console.log(input)
    if (input == '') {
      this.costomerData = this.getAllCustomers;
    } else {
      this.costomerData = this.getAllCustomers
    }
  }
  searchItem(): void {
    let input = this.searchInputItem;
    if (input == '') {
      this.costomerData = this.tempcostomerData;
    } else {
      this.costomerData = this.tempcostomerData.filter((res: any) => {
        return res.customerName.toLocaleLowerCase().match(input.toLocaleLowerCase());
      });
    }
  }
  getCustomer(event): void {
    let custId = event.option.value;
    this.getCustomerDataByEventId = this.tempcostomerData.find(x => x.customerId == custId);
    this.patchCustomerData();
  }
}

