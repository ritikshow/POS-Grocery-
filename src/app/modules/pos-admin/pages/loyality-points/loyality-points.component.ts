import { Component, OnInit, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup, Validators, FormArray } from '@angular/forms';
import { AlertService } from '@core/services/common/alert.service';
import { CommonService } from '@core/services/common/common.service';
import { PosDataService } from '@core/services/pos-system/pos-data.service';
import { NgbActiveModal, NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { DataTableDirective } from 'angular-datatables';
import { NgxUiLoaderService } from 'ngx-ui-loader';
import { Subject } from 'rxjs';

@Component({
  selector: 'app-loyality-points',
  templateUrl: './loyality-points.component.html',
  styleUrls: ['./loyality-points.component.css']
})

export class LoyalityPointsComponent implements OnInit {
  loyaltyForm: any = FormGroup;
  tableListRecord: any = [];
  isDataLoaded = false;
  addLoyaltyPts: any;

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
  dtElement: DataTableDirective;
  dtTrigger: Subject<any> = new Subject();

  closeResult: string;
  users: any;
  allItems: any;
  outletId: any;
  outletName: string;
  viewData: any;
  customerData: any;
  outletData: any;
  loyaltyData: any;
  isDataAvailable = false;
  editLevelOne = false;
  editLevelTwo = false;
  editLevelThree = false;
  editLevelFour = false;
  editLevelFive = false;
  array = [];

  constructor(
    private ngxLoader: NgxUiLoaderService,
    private modalService: NgbModal,
    private posDataService: PosDataService,
    private alertService: AlertService,
    private activeModal: NgbActiveModal,
    private formBuilder: FormBuilder,
    public commonService: CommonService,
  ) { }

  ngOnInit(): void {
    this.dtOptions = {
      order: [[1, 'desc']],
      lengthChange: false,
      pageLength: 10,
      infoCallback: (settings: DataTables.SettingsLegacy, start: number, end: number, mnax: number, total: number, pre: string) => {
        this.tableListRecord.total = total;
      }
    }
    this.loyaltyForm = this.formBuilder.group({
      minimumAmount: [0, Validators.required],
      defaultAmount: [0, Validators.required],
      defaultPoint: [0, Validators.required],
      consumptionPoint: [0, Validators.required],
      consumptionAmount: [0, Validators.required],

      fromAmountOne: [0],
      fromAmountTwo: [0],
      fromAmountThree: [0],
      fromAmountFour: [0],
      fromAmountFive: [0],

      toAmountOne: [0],
      toAmountTwo: [0],
      toAmountThree: [0],
      toAmountFour: [0],
      toAmountFive: [0],

      amountOne: [0],
      amountTwo: [0],
      amountThree: [0],
      amountFour: [0],
      amountFive: [0],

      pointOne: [0],
      pointTwo: [0],
      pointThree: [0],
      pointFour: [0],
      pointFive: [0],


      isActive: [true, Validators.required]
    });
    this.outletName = sessionStorage.getItem('activeOutletname');
    this.outletId = sessionStorage.getItem('activeOutletId');
    this.getAllCustomers();
    this.getLoyaltySettingById();

  }

  removeLoyalty(i) {
    this.addLoyaltyPts.removeAt(i);
  }

  editLevels(level) {
    if (level == 1) {
      this.editLevelOne = true;
    }
    if (level == 2) {
      this.editLevelTwo = true;
    }
    if (level == 3) {
      this.editLevelThree = true;
    }
    if (level == 4) {
      this.editLevelFour = true;
    }
    if (level == 5) {
      this.editLevelFive = true;
    }
  }

  save(level) {
    let data;
    if (level == 1) {
      data = {
        minimumAmount: this.loyaltyData?.minimumAmount,
        defaultAmount: this.loyaltyData?.defaultAmount,
        defaultPoint: this.loyaltyData.defaultPoint,
        consumptionPoint: this.loyaltyData?.consumptionPoint,
        consumptionAmount: this.loyaltyData?.consumptionAmount,

        levels: [
          {
            level: 1,
            fromAmount: this.loyaltyForm.get('fromAmountOne').value,
            toAmount: this.loyaltyForm.get('toAmountOne').value,
            point: this.loyaltyForm.get('pointOne').value,
            amount: this.loyaltyForm.get('amountOne').value,
          },
          {
            level: this.loyaltyData?.levels[1].level,
            fromAmount: this.loyaltyData?.levels[1].fromAmount,
            toAmount: this.loyaltyData?.levels[1].toAmount,
            point: this.loyaltyData?.levels[1].point,
            amount: this.loyaltyData?.levels[1].amount,
          },
          {
            level: this.loyaltyData?.levels[2].level,
            fromAmount: this.loyaltyData?.levels[2].fromAmount,
            toAmount: this.loyaltyData?.levels[2].toAmount,
            point: this.loyaltyData?.levels[2].point,
            amount: this.loyaltyData?.levels[2].amount,
          },
          {
            level: this.loyaltyData?.levels[3].level,
            fromAmount: this.loyaltyData?.levels[3].fromAmount,
            toAmount: this.loyaltyData?.levels[3].toAmount,
            point: this.loyaltyData?.levels[3].point,
            amount: this.loyaltyData?.levels[3].amount,
          },
          {
            level: this.loyaltyData?.levels[4].level,
            fromAmount: this.loyaltyData?.levels[4].fromAmount,
            toAmount: this.loyaltyData?.levels[4].toAmount,
            point: this.loyaltyData?.levels[4].point,
            amount: this.loyaltyData?.levels[4].amount,
          },


        ],
        outletId: this.loyaltyData.outletId,
        isActive: this.loyaltyData?.isActive,
      }
    } else if (level == 2) {

      data = {
        minimumAmount: this.loyaltyData?.minimumAmount,
        defaultAmount: this.loyaltyData?.defaultAmount,
        defaultPoint: this.loyaltyData.defaultPoint,
        consumptionPoint: this.loyaltyData?.consumptionPoint,
        consumptionAmount: this.loyaltyData?.consumptionAmount,

        levels: [
          {
            level: this.loyaltyData?.levels[0].level,
            fromAmount: this.loyaltyData?.levels[0].fromAmount,
            toAmount: this.loyaltyData?.levels[0].toAmount,
            point: this.loyaltyData?.levels[0].point,
            amount: this.loyaltyData?.levels[0].amount,
          },
          {
            level: 2,
            fromAmount: this.loyaltyForm.get('fromAmountTwo').value,
            toAmount: this.loyaltyForm.get('toAmountTwo').value,
            point: this.loyaltyForm.get('pointTwo').value,
            amount: this.loyaltyForm.get('amountTwo').value,
          },
          {
            level: this.loyaltyData?.levels[2].level,
            fromAmount: this.loyaltyData?.levels[2].fromAmount,
            toAmount: this.loyaltyData?.levels[2].toAmount,
            point: this.loyaltyData?.levels[2].point,
            amount: this.loyaltyData?.levels[2].amount,
          },
          {
            level: this.loyaltyData?.levels[3].level,
            fromAmount: this.loyaltyData?.levels[3].fromAmount,
            toAmount: this.loyaltyData?.levels[3].toAmount,
            point: this.loyaltyData?.levels[3].point,
            amount: this.loyaltyData?.levels[3].amount,
          },
          {
            level: this.loyaltyData?.levels[4].level,
            fromAmount: this.loyaltyData?.levels[4].fromAmount,
            toAmount: this.loyaltyData?.levels[4].toAmount,
            point: this.loyaltyData?.levels[4].point,
            amount: this.loyaltyData?.levels[4].amount,
          },


        ],
        outletId: this.loyaltyData.outletId,
        isActive: this.loyaltyData?.isActive,
      }
    } else if (level == 3) {

      data = {
        minimumAmount: this.loyaltyData?.minimumAmount,
        defaultAmount: this.loyaltyData?.defaultAmount,
        defaultPoint: this.loyaltyData.defaultPoint,
        consumptionPoint: this.loyaltyData?.consumptionPoint,
        consumptionAmount: this.loyaltyData?.consumptionAmount,

        levels: [
          {
            level: this.loyaltyData?.levels[0].level,
            fromAmount: this.loyaltyData?.levels[0].fromAmount,
            toAmount: this.loyaltyData?.levels[0].toAmount,
            point: this.loyaltyData?.levels[0].point,
            amount: this.loyaltyData?.levels[0].amount,
          },
          {
            level: this.loyaltyData?.levels[1].level,
            fromAmount: this.loyaltyData?.levels[1].fromAmount,
            toAmount: this.loyaltyData?.levels[1].toAmount,
            point: this.loyaltyData?.levels[1].point,
            amount: this.loyaltyData?.levels[1].amount,
          },
          {
            level: 3,
            fromAmount: this.loyaltyForm.get('fromAmountThree').value,
            toAmount: this.loyaltyForm.get('toAmountThree').value,
            point: this.loyaltyForm.get('pointThree').value,
            amount: this.loyaltyForm.get('amountThree').value,
          },
          {
            level: this.loyaltyData?.levels[3].level,
            fromAmount: this.loyaltyData?.levels[3].fromAmount,
            toAmount: this.loyaltyData?.levels[3].toAmount,
            point: this.loyaltyData?.levels[3].point,
            amount: this.loyaltyData?.levels[3].amount,
          },
          {
            level: this.loyaltyData?.levels[4].level,
            fromAmount: this.loyaltyData?.levels[4].fromAmount,
            toAmount: this.loyaltyData?.levels[4].toAmount,
            point: this.loyaltyData?.levels[4].point,
            amount: this.loyaltyData?.levels[4].amount,
          },


        ],
        outletId: this.loyaltyData.outletId,
        isActive: this.loyaltyData?.isActive,
      }
    } else if (level == 4) {

      data = {
        minimumAmount: this.loyaltyData?.minimumAmount,
        defaultAmount: this.loyaltyData?.defaultAmount,
        defaultPoint: this.loyaltyData.defaultPoint,
        consumptionPoint: this.loyaltyData?.consumptionPoint,
        consumptionAmount: this.loyaltyData?.consumptionAmount,

        levels: [
          {
            level: this.loyaltyData?.levels[0].level,
            fromAmount: this.loyaltyData?.levels[0].fromAmount,
            toAmount: this.loyaltyData?.levels[0].toAmount,
            point: this.loyaltyData?.levels[0].point,
            amount: this.loyaltyData?.levels[0].amount,
          },
          {
            level: this.loyaltyData?.levels[1].level,
            fromAmount: this.loyaltyData?.levels[1].fromAmount,
            toAmount: this.loyaltyData?.levels[1].toAmount,
            point: this.loyaltyData?.levels[1].point,
            amount: this.loyaltyData?.levels[1].amount,
          },
          {
            level: this.loyaltyData?.levels[2].level,
            fromAmount: this.loyaltyData?.levels[2].fromAmount,
            toAmount: this.loyaltyData?.levels[2].toAmount,
            point: this.loyaltyData?.levels[2].point,
            amount: this.loyaltyData?.levels[2].amount,
          },
          {
            level: 4,
            fromAmount: this.loyaltyForm.get('fromAmountFour').value,
            toAmount: this.loyaltyForm.get('toAmountFour').value,
            point: this.loyaltyForm.get('pointFour').value,
            amount: this.loyaltyForm.get('amountFour').value,
          },
          {
            level: this.loyaltyData?.levels[4].level,
            fromAmount: this.loyaltyData?.levels[4].fromAmount,
            toAmount: this.loyaltyData?.levels[4].toAmount,
            point: this.loyaltyData?.levels[4].point,
            amount: this.loyaltyData?.levels[4].amount,
          },


        ],
        outletId: this.loyaltyData.outletId,
        isActive: this.loyaltyData?.isActive,
      }
    } else if (level == 5) {

      data = {
        minimumAmount: this.loyaltyData?.minimumAmount,
        defaultAmount: this.loyaltyData?.defaultAmount,
        defaultPoint: this.loyaltyData.defaultPoint,
        consumptionPoint: this.loyaltyData?.consumptionPoint,
        consumptionAmount: this.loyaltyData?.consumptionAmount,

        levels: [
          {
            level: this.loyaltyData?.levels[0].level,
            fromAmount: this.loyaltyData?.levels[0].fromAmount,
            toAmount: this.loyaltyData?.levels[0].toAmount,
            point: this.loyaltyData?.levels[0].point,
            amount: this.loyaltyData?.levels[0].amount,
          },
          {
            level: this.loyaltyData?.levels[1].level,
            fromAmount: this.loyaltyData?.levels[1].fromAmount,
            toAmount: this.loyaltyData?.levels[1].toAmount,
            point: this.loyaltyData?.levels[1].point,
            amount: this.loyaltyData?.levels[1].amount,
          },
          {
            level: this.loyaltyData?.levels[2].level,
            fromAmount: this.loyaltyData?.levels[2].fromAmount,
            toAmount: this.loyaltyData?.levels[2].toAmount,
            point: this.loyaltyData?.levels[2].point,
            amount: this.loyaltyData?.levels[2].amount,
          },
          {
            level: this.loyaltyData?.levels[3].level,
            fromAmount: this.loyaltyData?.levels[3].fromAmount,
            toAmount: this.loyaltyData?.levels[3].toAmount,
            point: this.loyaltyData?.levels[3].point,
            amount: this.loyaltyData?.levels[3].amount,
          },
          {
            level: 5,
            fromAmount: this.loyaltyForm.get('fromAmountFive').value,
            toAmount: this.loyaltyForm.get('toAmountFive').value,
            point: this.loyaltyForm.get('pointFive').value,
            amount: this.loyaltyForm.get('amountFive').value,
          },


        ],
        outletId: this.loyaltyData.outletId,
        isActive: this.loyaltyData?.isActive,
      }
    }

    this.posDataService.addLoyaltyPoints(data).subscribe((response) => {
      let success = response['success'];
      let msg = response['message'];
      if (success) {
        this.closeAction(true);
        this.alertService.showSuccess(msg);
        this.getLoyaltySettingById();
      } else {
        this.alertService.showError(msg);
      }
    });
  }


  getAllCustomers() {

    this.isDataLoaded = false;
    this.posDataService.getAllCustomers(this.outletId, '').subscribe((response) => {
      this.customerData = response['data'];
      let success = response['success'];
      let msg = response['message'];
      if (success) {
        this.isDataLoaded = true;
        this.dtTrigger.next();
        this.tableListRecord.total = this.customerData.length;
      }
      else {
        this.isDataLoaded = true;
        this.alertService.showError(msg);
      }
    });
  }
  closeAction(reason) {
    if (this.modalService.hasOpenModals()) {
      this.modalService.dismissAll(reason);
    }
  }
  getLoyaltySettingById() {
    this.isDataAvailable = false;
    this.ngxLoader.startLoader('loader-01');
    this.posDataService.getLoyaltySettingById(this.outletId).subscribe((res: any) => {
      this.ngxLoader.stopLoader('loader-01');
      this.loyaltyData = res['data'];
      let success = res['success'];
      let msg = res['message'];
      if (success) {
        this.patchValuesToForm();
        this.isDataAvailable = true;
      }
      else {
        this.alertService.showError(msg);
      }
    });
  }

  patchValuesToForm() {
    this.loyaltyForm.patchValue({
      minimumAmount: this.loyaltyData?.minimumAmount,
      defaultAmount: this.loyaltyData?.defaultAmount,
      defaultPoint: this.loyaltyData?.defaultPoint,
      consumptionPoint: this.loyaltyData?.consumptionPoint,
      consumptionAmount: this.loyaltyData?.consumptionAmount,
      isActive: this.loyaltyData?.isActive,
      fromAmountOne: this.loyaltyData?.levels[0].fromAmount,
      toAmountOne: this.loyaltyData?.levels[0].toAmount,
      amountOne: this.loyaltyData?.levels[0].amount,
      pointOne: this.loyaltyData?.levels[0].point,

      fromAmountTwo: this.loyaltyData?.levels[1].fromAmount,
      toAmountTwo: this.loyaltyData?.levels[1].toAmount,
      amountTwo: this.loyaltyData?.levels[1].amount,
      pointTwo: this.loyaltyData?.levels[1].point,

      fromAmountThree: this.loyaltyData?.levels[2].fromAmount,
      toAmountThree: this.loyaltyData?.levels[2].toAmount,
      amountThree: this.loyaltyData?.levels[2].amount,
      pointThree: this.loyaltyData?.levels[2].point,

      fromAmountFour: this.loyaltyData?.levels[3].fromAmount,
      toAmountFour: this.loyaltyData?.levels[3].toAmount,
      amountFour: this.loyaltyData?.levels[3].amount,
      pointFour: this.loyaltyData?.levels[3].point,

      fromAmountFive: this.loyaltyData?.levels[4].fromAmount,
      toAmountFive: this.loyaltyData?.levels[4].toAmount,
      amountFive: this.loyaltyData?.levels[4].amount,
      pointFive: this.loyaltyData?.levels[4].point,


    });
  }

  LiveMinimumAmount(event) {
    this.loyaltyForm.patchValue({
      fromAmountOne: event.target.value
    });
  }

  openPointSettingPopUp(content) {
    this.outletData = JSON.parse(sessionStorage.getItem('activeOutlet'));
    this.getLoyaltySettingById();
    this.modalService.open(content, { backdrop: 'static', size: 'lg', keyboard: true, centered: true, windowClass: 'loyality_popup' }).result.then((result) => {
    }, (reason) => {
      console.log(reason);
    });
  }
  SavePointSetting() {
    if (this.loyaltyForm.invalid) {
      this.alertService.showWarning("Fields are empty");
    } else {

      let data = {
        minimumAmount: this.loyaltyForm.get('minimumAmount').value,
        defaultAmount: this.loyaltyForm.get('defaultAmount').value,
        defaultPoint: this.loyaltyForm.get('defaultPoint').value,
        consumptionPoint: this.loyaltyForm.get('consumptionPoint').value,
        consumptionAmount: this.loyaltyForm.get('consumptionAmount').value,
        levels: [
          {
            level: 1,
            fromAmount: this.loyaltyForm.get('fromAmountOne').value,
            toAmount: this.loyaltyForm.get('toAmountOne').value,
            point: this.loyaltyForm.get('pointOne').value,
            amount: this.loyaltyForm.get('amountOne').value,
          },
          {
            level: 2,
            fromAmount: this.loyaltyForm.get('fromAmountTwo').value,
            toAmount: this.loyaltyForm.get('toAmountTwo').value,
            point: this.loyaltyForm.get('pointTwo').value,
            amount: this.loyaltyForm.get('amountTwo').value,
          },
          {
            level: 3,
            fromAmount: this.loyaltyForm.get('fromAmountThree').value,
            toAmount: this.loyaltyForm.get('toAmountThree').value,
            point: this.loyaltyForm.get('pointThree').value,
            amount: this.loyaltyForm.get('amountThree').value,
          },
          {
            level: 4,
            fromAmount: this.loyaltyForm.get('fromAmountFour').value,
            toAmount: this.loyaltyForm.get('toAmountFour').value,
            point: this.loyaltyForm.get('pointFour').value,
            amount: this.loyaltyForm.get('amountFour').value,
          },
          {
            level: 5,
            fromAmount: this.loyaltyForm.get('fromAmountFive').value,
            toAmount: this.loyaltyForm.get('toAmountFive').value,
            point: this.loyaltyForm.get('pointFive').value,
            amount: this.loyaltyForm.get('amountFive').value,
          }
        ],
        outletId: this.outletId,
        isActive: this.loyaltyForm.get('isActive').value,
      }


      this.posDataService.addLoyaltyPoints(data).subscribe((response) => {
        let success = response['success'];
        let msg = response['message'];
        if (success) {
          this.closeAction(true);
          this.alertService.showSuccess(msg);
          this.getLoyaltySettingById();
        } else {
          this.alertService.showError(msg);
        }
      });
    }
  }
  redeemButton(cusData, id, index) {
    this.outletData = JSON.parse(sessionStorage.getItem('activeOutlet'));
    //logic to convert points to converted Currency
    //take total points from cusData and ConsumptionAmount from loyaltyData
    let pointsToCurrency = this.loyaltyData.consumptionAmount;
    let convPoints = cusData.totalPoints * pointsToCurrency;
    cusData.convertedAmount = cusData.convertedAmount + convPoints;

    let data = {
      customerId: id,
      customerName: cusData.customerName,
      address: cusData.address,
      phoneNumber: [
        {
          number: cusData.phoneNumber[0].number,
          isPrimary: true
        }
      ],
      outletId: this.outletId,
      orderType: cusData.orderType,
      totalPoints: 0,
      convertedAmount: cusData.convertedAmount,
      customerTotalAmount: cusData.customerTotalAmount,
    }
    this.ngxLoader.startLoader('loader-01');
    this.posDataService.updateCustomerDetails(data.customerId, data).subscribe((res: any) => {
      this.ngxLoader.stopLoader('loader-01');
      let msg = res['message'];
      let status = res['success'];
      if (status) {
        this.alertService.showSuccess(msg);
        this.activeModal.close(true);
        this.customerData[index] = data;
      } else {
        this.alertService.showError(msg);
      }
    });
  }
}
