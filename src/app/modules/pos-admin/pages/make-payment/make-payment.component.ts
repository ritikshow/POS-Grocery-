import { Component, OnInit } from '@angular/core';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { AlertService } from '@core/services/common/alert.service';
import { PosDataService } from '@core/services/pos-system/pos-data.service';
import { NgbModal, ModalDismissReasons, NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';
import { NgxUiLoaderService } from 'ngx-ui-loader';

@Component({
  selector: 'app-make-payment',
  templateUrl: './make-payment.component.html',
  styleUrls: ['./make-payment.component.css']
})
export class MakePaymentComponent implements OnInit {
  // Variables which is coming from Parent component
  PrimaryOrder: any;
  itemTaxList = [];
  itemDiscountList = [];
  customerData: any;

  form: any = FormGroup;
  breakageData = [];
  cardDetails = false;
  cashDetails = false;
  totalReceived = 0;
  TotalPaybleAmount: any;
  balAmount: any;
  amount: any;
  calPercentage: any;
  outletId: any;
  module: any;
  tip = 0;
  isOther: any;
  ShowPrintMessage = false;
  paidItemList = [];
  SelectedItemTotal = 0;
  remainingAmount = 0;
  isPointApplied = false;
  outletData: any;
  BalanceAmount: number = 0;
  GetLoyaltyData: any;
  AmountFromWallete: any;
  currentUser = JSON.parse(sessionStorage.getItem('userCredential'));

  //To hide item level payments for Walkin and Online
  hideItemLevelPayment = false;

  //Payment mode from API
  allPaymentModes: any;
  //Display sub payment modes in UI
  selectedPaymentModeData: any;

  closeResult: string;
  constructor(
    private ngxLoader: NgxUiLoaderService,
    private activeModal: NgbActiveModal,
    private modalService: NgbModal,
    private alertService: AlertService,
    private formBuilder: FormBuilder,
    private posDataService: PosDataService,
    private router: Router,
  ) { }

  ngOnInit(): void {
    this.outletId = sessionStorage.getItem('activeOutletId');
    this.module = sessionStorage.getItem('module');
    this.outletData = JSON.parse(sessionStorage.getItem('activeOutlet'));

    //Hide Item level payments for Walk-in and Online
    let page = sessionStorage.getItem('page');
    if (page == 'Walk-in' || page == 'Online')
      this.hideItemLevelPayment = true;

    this.form = this.formBuilder.group({
      paymentMode: ['', Validators.required],
      amount: ['', Validators.required],
      cashRecived: [''],
      balanceReturned: [''],
      cardType: [''],
      cardName: [''],
      tip: [''],
      points: [0],
    });
    this.breakageData = this.PrimaryOrder.paymentBreakage;
    // this.vatPercentage();
    // this.CalculateTaxForSpacificItem();
    this.CalculateRemainingAmountFromAllItemAndExistingRecord();
    this.form.patchValue({
      // amount: this.PrimaryOrder?.items?.reduce((acc,num)=>{
      //   return Number(acc.isPaid ? acc : acc + num.itemTotal)
      // },0)
      amount: (this.PrimaryOrder.total - (this.breakageData?.reduce((acc, num) => acc + num.amount, 0) || 0)).toFixed(2)

    });
    this.getPaymentModes();
   
  }

  get loginForm() { return this.form.controls; }

  getPaymentModes() {
    this.ngxLoader.startLoader('loader-01');
    this.posDataService.GetPaymentModesByOutlet(this.outletId, false).subscribe((res: any) => {
      this.ngxLoader.stopLoader('loader-01');
      this.allPaymentModes = res['data']
      this.GetLoyaltySetting();
    });
  }

  private CalculateTaxForSpacificItem() {
    for (let j = 0; j < this.PrimaryOrder.tax.length; j++) {
      let obj = {
        taxName: '',
        taxPercent: 0,
        taxAmount: 0
      };
      if (this.PrimaryOrder.length !== 0) {
        obj.taxName = this.PrimaryOrder.tax[j].taxName;
        obj.taxPercent = this.PrimaryOrder.tax[j].taxSelectedval;
        obj.taxAmount = this.PrimaryOrder.tax[j].taxAmount;
      }
      this.itemTaxList.push(obj);
    }
  }

  private CalculateRemainingAmountFromAllItemAndExistingRecord() {
    let list = [];
    list = this.PrimaryOrder.items;
    this.remainingAmount = this.PrimaryOrder.total - (this.PrimaryOrder.paymentBreakage?.reduce((acc, num) => acc + num.amount, 0)) || 0;
    let newOrderTotal = this.PrimaryOrder.total;
    newOrderTotal = this.LoopAllItemAndCalculateTotalForPerticularItem(newOrderTotal);
    // for (let r = 0; r < this.PrimaryOrder.items.length; r++) {
    //   if (this.PrimaryOrder.items[r].isPaid)
    //     this.remainingAmount = this.remainingAmount - this.PrimaryOrder.items[r].newTotal;
    // }
    if (list.length !== 0) {
      this.LoopItemAndCalculateTotal(list);
    }
  }

  private LoopAllItemAndCalculateTotalForPerticularItem(newOrderTotal: any) {
    for (let p = 0; p < this.PrimaryOrder.items.length; p++) {
      this.PrimaryOrder.items[p].newTotal = 0;
      if (this.PrimaryOrder.itemWiseTax != null && this.PrimaryOrder.itemWiseTax.length > 0) {
        if (this.PrimaryOrder.itemWiseTax.map(x => x.itemName).includes(this.PrimaryOrder.items[p].itemName)) {
          let itemTax = this.PrimaryOrder.itemWiseTax.find(x => x.itemName = this.PrimaryOrder.items[p].itemName);
          this.PrimaryOrder.items[p].newTotal = Number(this.PrimaryOrder.items[p].newTotal) + Number(itemTax.taxAmount);
          newOrderTotal = newOrderTotal - Number(itemTax.taxAmount);
        }
      }
      let itemPercentage = Number(this.PrimaryOrder.items[p].subTotal) / Number(this.PrimaryOrder.subTotal) * 100;
      let itemAmount = Number(this.remainingAmount) * Number(itemPercentage) / 100;
      this.PrimaryOrder.items[p].newTotal = this.PrimaryOrder.items[p].newTotal + itemAmount;
    }
    return newOrderTotal;
  }

  private LoopItemAndCalculateTotal(list: any[]) {
    for (let m = 0; m < list.length; m++) {
      for (let n = 0; n < list.length; n++) {
        n = this.CalculateTotalAndSubTotalFromItems(m, n, list);
      }
    }
    //this.menuItemList = list;
  }

  private CalculateTotalAndSubTotalFromItems(m: number, n: number, list: any[]) {
    //Added hideItemLevelPayment (To find whether order type is Dine or Walkin/Online).
    //In Items list - id will not be there in case of walkin and online order. Becuase id is a GUID which will be added on the time of createOrder API call.
    //Due to this, we are skipping this block for walkin and online
    if (m !== n && !this.hideItemLevelPayment) {
      if (list[m].id == list[n].id) {
        list[m].orderQuantity = list[m].orderQuantity + list[n].orderQuantity;
        list[m].subTotal = list[m].subTotal + list[n].subTotal;
        list.splice(n, 1);
        n = n - 1;
      }
    }
    return n;
  }

  ApplyPoints() {
    this.isPointApplied = true;
    let points = Number(this.form.get('points').value);
    points = this.CheckWalletAmountAndPatchToForm(points);
    let walletObj = this.CreatePaymentBrackage(points)
    this.breakageData.push(walletObj);
    this.remainingAmount = Number(this.remainingAmount) - Number(points);
    this.totalReceived = Number(this.totalReceived) + Number(points);
    this.form.patchValue({
      amount: this.remainingAmount.toFixed(2)
    });
  }
  private CreatePaymentBrackage(points: number) {
    return {
      paymentMode: "Wallet",
      amount: points,
      cashRecived: 0,
      balanceReturned: 0,
      cardType: '',
      tip: 0,
      pointAmount: 0,
    };
  }

  private CheckWalletAmountAndPatchToForm(points: number) {
    if (points > this.PrimaryOrder.total) {
      this.customerData.convertedAmount = Number(this.customerData.convertedAmount) - this.PrimaryOrder.total;
    } else {
      this.customerData.convertedAmount = Number(this.customerData.convertedAmount) - Number(points);
    }
    if (Number(points) > Number(this.remainingAmount)) {
      points = this.remainingAmount;
      this.form.patchValue({
        points: this.remainingAmount.toFixed(2)
      });
    }
    return points;
  }

  RemovePoints() {
    let getWalletData = this.breakageData.find(x => x.paymentMode == 'Wallet');
    let indx = this.breakageData.map(function (x) { return x; }).indexOf(getWalletData);
    this.Remove(getWalletData.amount, indx);
  }
  //End code Abhijith 23-02-23
  GetCustomerById(id) {
    this.posDataService.getCustomerById(id).subscribe((res: any) => {
      this.customerData = res['data'];
      let success = res['success'];
      let msg = res['message'];
      if (success) {
        // this.form.patchValue({
        //   points: this.customerData.convertedAmount
        // });
      } else {
        this.alertService.showError(msg);
      }
    });
  }
  // GetInvoiceByOrderId() {
  //   this.posDataService.getPrimaryOrderByOrderId(this.orderId).subscribe((res: any) => {
  //     let existingInvoice = res['data'];
  //     let success = res['success'];
  //     if (success && existingInvoice != null && existingInvoice.paymentBreakage != null && existingInvoice.paymentBreakage.length > 0) {
  //       this.totalReceived = existingInvoice.paymentBreakage.reduce((sum, current) => sum + current.amount, 0);
  //       let pointData = existingInvoice.paymentBreakage.find(x => x.paymentMode == 'Wallet');
  //       if (pointData != undefined && pointData != null && pointData.amount != 0) {
  //         this.form.patchValue({
  //           points: pointData.amount.toFixed(2)
  //         });
  //         this.isPointApplied = true;
  //       }
  //       this.remainingAmount = existingInvoice.totalPayableAmount - this.totalReceived;
  //       this.breakageData = existingInvoice.paymentBreakage;
  //       this.form.patchValue({
  //         amount: Number(this.remainingAmount.toFixed(2))
  //       });
  //     }
  //   });
  // }

  //This method is using to close the payment popup after doing payment
  closeModal() {
    let paidItems = this.PrimaryOrder.items.filter(x => x.isPaid);
    let paidItemIDs = paidItems.map(x => x.id);
    let page = sessionStorage.getItem('page');
    if (page == 'dine') {
      this.activeModal.close(null);
      this.router.navigate(['/pos-dashboard/dine-in']);
    } else if (page == 'Walk-in') {
      this.router.navigate(['/pos-dashboard/walk-in']);
    } else if (page == 'Online') {
      this.router.navigate(['/pos-dashboard/online']);
    } else {
      this.router.navigate(['/pos-dashboard/dine-in/running-order']);
    }
    this.activeModal.close(paidItemIDs);
  }

  //This method is using to close a payment popup without payment
  cancelPaymentPopUp() {
    this.activeModal.close(null);
  }

  selectPaymentType() {

    // if (this.form.get('paymentMode').value == 'Card' || this.form.get('paymentMode').value == 'Online') {
    //   this.cardDetails = true;
    //   this.cashDetails = false;
    //   this.form.get('cashRecived').clearValidators();
    //   this.form.get('cashRecived').updateValueAndValidity();
    //   this.form.get('balanceReturned').clearValidators();
    //   this.form.get('balanceReturned').updateValueAndValidity();
    // } else if (this.form.get('paymentMode').value == 'tapandgo') {
    //   this.cashDetails = false;
    //   this.cardDetails = false;
    //   this.form.get('balanceReturned').clearValidators();
    //   this.form.get('cashRecived').clearValidators();
    //   this.form.get('cardType').clearValidators();
    //   this.form.get('cardName').clearValidators();
    //   this.form.get('cardType').updateValueAndValidity();
    // } else {
    //   this.cashDetails = true;
    //   this.cardDetails = false;
    //   this.form.get('cashRecived').setValidators(Validators.required);
    //   this.form.get('balanceReturned').setValidators(Validators.required);
    //   this.form.get('cardType').clearValidators();
    //   this.form.get('cardName').clearValidators();
    //   this.form.get('cardType').updateValueAndValidity();
    // }

    let getSelectedPaymentModeFromForm = this.form.get('paymentMode').value;
    this.selectedPaymentModeData = this.allPaymentModes.find(x => x.paymentModeName == getSelectedPaymentModeFromForm);
    this.selectedPaymentModeData.subPaymentModes = this.selectedPaymentModeData?.subPaymentModes.filter(d=>d != '');
    if (this.selectedPaymentModeData?.subPaymentModes?.length != 0) {
      
      this.cardDetails = true;
    }
  }
  displayCardName() {
    // if (this.form.get('cardType').value == 'Others') {
    //   this.form.get('cardName').setValidators(Validators.required);
    //   this.form.get('cardName').updateValueAndValidity();
    //   this.isOther = true;
    // } else {
    //   this.isOther = false;
    //   this.form.get('cardName').clearValidators();
    //   this.form.get('cardName').updateValueAndValidity();
    // }
    this.form.get('cardType').value
  }
  TipAmount(event) {
    this.tip = event.target.value;
  }


  addItem() {
    let SelectedWalltAmount = this.breakageData?.reduce((sum, data) => data.paymentMode == "Wallet" ? data.amount + sum : sum, 0);
    SelectedWalltAmount = this.form.get('paymentMode').value == "Wallet" ? SelectedWalltAmount + Number(this.form.get('amount').value) : SelectedWalltAmount;
    if (SelectedWalltAmount > this.AmountFromWallete) {
      this.alertService.showWarning('Selected Amount Exceeds the wallet Amount');
      return;
    }
    let obj: any = {};
    if (this.selectedPaymentModeData?.subPaymentModes?.length > 0 && (this.form.get('cardType').value == "")) {
      this.alertService.showWarning('Please Select Card Type');
    } else {
      if (this.form.invalid || this.form.get('amount').value == 0) {
        this.alertService.showWarning('Please Select Payment type and Enter Amount');
      } else {
        this.MaintainPaymentTypeAndCalculateRemainingAmount(obj);
      }
    }
    this.form.get('cardType').value == ""
  }

  private MaintainPaymentTypeAndCalculateRemainingAmount(obj: any) {
    if (this.selectedPaymentModeData?.subPaymentModes?.length != 0) {
      this.CheckPaymentModeAddPaymentBrackage(obj);
    } else {
      this.CalculateAndCreateObjectPushToBrackage(obj);
    }
  }

  private CheckPaymentModeAddPaymentBrackage(obj: any) {
    this.totalReceived = 0;
    this.totalReceived = this.totalReceived + Number(this.form.get('amount').value);
    //If total cash recevied is greater than remaining amount, make remaining amount as 0
    if (this.totalReceived > this.remainingAmount)
      this.remainingAmount = 0;
    else {
      //Less the amount based on remaining amount if it is available
      if (this.remainingAmount != 0 || this.remainingAmount != null) {
        this.remainingAmount = this.remainingAmount - this.totalReceived;
      } else {
        this.remainingAmount = this.PrimaryOrder.total - this.totalReceived;
      }
    }
    //this.remainingAmount = this.PrimaryOrder.total - this.totalReceived;
    let cashRecive = Number(this.form.get('amount').value);

    this.CreateObjectAndPushToMainBrackage(obj, cashRecive);
    if (Number(cashRecive.toFixed(2)) >= Number(this.PrimaryOrder.total.toFixed(2))) {
      this.form.reset();
      this.CheckAndManageIfPointsAppliedToPayment();
    } else {
      this.ResetFormAndCalculateRemainingAmount();
    }
    this.cashDetails = false;
  }

  private CalculateAndCreateObjectPushToBrackage(obj: any) {
    this.totalReceived = 0;
    this.totalReceived = this.totalReceived + Number(this.form.get('cashRecived').value) - Number(this.form.get('balanceReturned').value);

    //Less the amount based on remaining amount if it is available
    if (this.remainingAmount != 0 || this.remainingAmount != null) {
      this.remainingAmount = this.remainingAmount - this.totalReceived;
    } else {
      this.remainingAmount = this.PrimaryOrder.total - this.totalReceived;
    }
    //this.remainingAmount = this.PrimaryOrder.total - this.totalReceived;
    obj.paymentMode = this.form.get('paymentMode').value;
    obj.amount = Number(this.form.get('cashRecived').value) - Number(this.form.get('balanceReturned').value);
    obj.cashRecived = Number(this.form.get('cashRecived').value);
    obj.balanceReturned = Number(this.form.get('balanceReturned').value);
    obj.cardType = obj.cardType = this.form.get('cardType')?.value || null;

    obj.tip = Number(this.tip);
    this.CheckPointsAppliedAndCalculation3(obj);
    this.cashDetails = false;
  }

  private CreateObjectAndPushToMainBrackage(obj: any, cashRecive: number) {
    obj.paymentMode = this.form.get('paymentMode').value;
    obj.amount = Number(this.form.get('amount').value);
    obj.cashRecived = Number(cashRecive);
    obj.balanceReturned = Number(this.form.get('balanceReturned').value);
    obj.cardType = obj.cardType = this.form.get('cardType')?.value || null;;
    obj.tip = Number(this.tip);
    if (this.isPointApplied)
      obj.pointAmount = Number(this.form.get('points').value);

    else
      obj.pointAmount = 0;

    this.breakageData.push(obj);
  }

  private CheckPointsAppliedAndCalculation3(obj: any) {
    if (this.isPointApplied)
      obj.pointAmount = Number(this.form.get('points').value);
    else
      obj.pointAmount = 0;
    this.breakageData.push(obj);
    if (Number(this.totalReceived.toFixed(2)) >= Number(this.PrimaryOrder.total.toFixed(2))) {
      this.CheckPointsAppliedAndCalculation();
    } else {
      let amtR = this.form.get('amount').value;
      if (this.PrimaryOrder.total <= parseFloat(amtR)) {
        this.CheckPointsAppliedAndCalculation1();
      } else {
        this.CheckPointsAppliedAndCalculation2();
      }
    }
  }

  private CheckPointsAppliedAndCalculation2() {
    this.form.reset();
    if (this.isPointApplied) {
      let getWalletData = this.breakageData.find(x => x.paymentMode == 'Wallet');
      this.form.patchValue({
        points: getWalletData.amount.toFixed(2)
      });
    } else {
      this.CheckAppliedPointAndMaintainBalance();
    }
    this.form.patchValue({
      amount: (this.remainingAmount).toFixed(2)
    });
  }

  private CheckAppliedPointAndMaintainBalance() {
    if (this.customerData != null && this.customerData != undefined) {
      if (this.customerData.convertedAmount > this.PrimaryOrder.total) {
        this.form.patchValue({
          points: this.remainingAmount.toFixed(2)
        });
      } else {
        this.form.patchValue({
          points: this.customerData.convertedAmount
        });
      }
    } else {
      this.form.patchValue({
        points: 0
      });
    }
  }

  private CheckPointsAppliedAndCalculation1() {
    this.form.reset();
    if (this.isPointApplied) {
      let getWalletData = this.breakageData.find(x => x.paymentMode == 'Wallet');
      this.form.patchValue({
        points: getWalletData.amount.toFixed(2)
      });
    } else {
      this.form.patchValue({
        points: this.remainingAmount.toFixed(2)
      });
    }
    this.form.patchValue({
      amount: 0,
    });
  }

  private CheckPointsAppliedAndCalculation() {
    this.form.reset();
    if (this.isPointApplied) {
      let getWalletData = this.breakageData.find(x => x.paymentMode == 'Wallet');
      this.form.patchValue({
        points: getWalletData.amount.toFixed(2)
      });
    } else {
      this.form.patchValue({
        points: this.remainingAmount.toFixed(2)
      });
    }
  }

  private ResetFormAndCalculateRemainingAmount() {
    this.form.reset();
    if (this.isPointApplied) {
      let getWalletData = this.breakageData.find(x => x.paymentMode == 'Wallet');
      this.form.patchValue({
        points: getWalletData.amount.toFixed(2)
      });
    } else {
      this.CalculatePointsAppliedAndWalletBalance();
    }
    this.form.patchValue({
      amount: (this.remainingAmount).toFixed(2)
    });
  }

  private CalculatePointsAppliedAndWalletBalance() {
    if (this.customerData != null && this.customerData != undefined) {
      if (this.customerData.convertedAmount > this.PrimaryOrder.total) {
        this.form.patchValue({
          points: this.remainingAmount.toFixed(2)
        });
      } else {
        this.form.patchValue({
          points: this.customerData.convertedAmount
        });
      }
    } else {
      this.form.patchValue({
        points: 0
      });
    }
  }

  private CheckAndManageIfPointsAppliedToPayment() {
    if (this.isPointApplied) {
      let getWalletData = this.breakageData.find(x => x.paymentMode == 'Wallet');
      this.form.patchValue({
        points: getWalletData.amount.toFixed(2)
      });
    } else {
      this.form.patchValue({
        points: this.remainingAmount.toFixed(2)
      });
    }
    this.form.patchValue({
      amount: (this.remainingAmount).toFixed(2)
    });
  }

  vatPercentage() {

    this.calPercentage = (Number(this.PrimaryOrder.isItemIncludeTaxPercentage) / 100 * Number(this.PrimaryOrder?.subTotal)).toFixed(2);
  }
  PayForPerticularItem(event, Id, total) {
    if (event.target.checked) {
      this.SelectedItemTotal = this.SelectedItemTotal + total;
      this.paidItemList.push(Id);
      this.form.patchValue({
        amount: Number(this.SelectedItemTotal.toFixed(2)),//Number(this.PrimaryOrder?.total) - (this.breakageData.reduce((acc,num)=>{acc + num.amount},0) || 0),
        cashRecived: this.SelectedItemTotal,
        balanceReturned: 0
      })

    } else {
      this.SelectedItemTotal = this.SelectedItemTotal - total;
      this.paidItemList.splice(this.paidItemList.indexOf(Id), 1);
      this.form.patchValue({
        amount: Number(this.SelectedItemTotal.toFixed(2)),//Number(this.PrimaryOrder?.total) - (this.breakageData.reduce((acc,num)=>acc + num.amount,0) || 0),
        cashRecived: this.SelectedItemTotal,
        balanceReturned: 0
      })
      if (!this.paidItemList || this.paidItemList?.length == 0) {
        this.form.patchValue({
          // amount :  this.PrimaryOrder?.items?.reduce((acc,num)=>{
          //   return Number(num.isPaid ? acc : acc + num.itemAmount)
          // },0)
          amount: this.PrimaryOrder.total - (this.breakageData.reduce((acc, num) => acc + num.amount, 0) || 0),
          cashRecived: this.SelectedItemTotal,
          balanceReturned: 0
        })
      }
    }
  }

  async onBill() {
    /*This block is for Walk-in and Online order types.
    Order will be placed / updated only after successsful payment*/
    if (this.hideItemLevelPayment) {

      //If amount is still remaining, then don't update or place the order
      if (this.remainingAmount != 0)
        return this.alertService.showError("Please pay the remaining amount");

      let isPaid = false;
      let paymentMode = this.form.get('paymentMode').value;
      if (paymentMode == '' || this.breakageData.length == 0) {
        return this.alertService.showError('Please add payment details');
      } else {
        let totalPointAmount = Number(this.breakageData.reduce((sum, current) => sum + current.amount, 0)) //+ Number(this.PrimaryOrder.paymentBreakage.reduce((acc,num) => acc+num.amount,0) || 0);

        if (Number(totalPointAmount.toFixed(2)) >= Number(this.PrimaryOrder.total.toFixed(2))) {
          isPaid = true;
          this.PrimaryOrder.OrderStatus = "Running"; //After payment the status of order will be Running.
          this.PrimaryOrder.isPaid = true;
          this.PrimaryOrder.items?.map((data) => data.isPaid = true);
        }
      }
      sessionStorage.setItem("PaymentSuccessForWalkinOrOnline", "Paid");
      this.modalService.dismissAll();

    } else {
      /*This block is only for Dine-in order type.*/

      console.log("Breakage Data", this.breakageData);
      let isPaid = false;
      if (this.breakageData == null || this.breakageData == undefined || this.breakageData.length == 0) {
        this.alertService.showError('Please add payment details');
      } else {
        let totalPointAmount = Number(this.breakageData.reduce((sum, current) => sum + current.amount, 0)) //+ Number(this.PrimaryOrder.paymentBreakage.reduce((acc,num) => acc+num.amount,0) || 0);

        if (Number(totalPointAmount.toFixed(2)) >= Number(this.PrimaryOrder.total.toFixed(2))) {
          isPaid = true;
          this.PrimaryOrder.OrderStatus = "Completed"; //After payment the status of order will be Completed.
          this.PrimaryOrder.items?.map((data) => data.isPaid = true);
        }
        await this.MarkItemAsIsPaid(this.paidItemList);
        await this.UpdateOrder(isPaid);
        this.modalService.dismissAll(); //To close payment popup

        //Print preview only for Dine in, For online and takeaway -> Print preview is in thier respective components.
        let page = sessionStorage.getItem('page');
        if (Number(this.totalReceived.toFixed(2)) <= Number(this.PrimaryOrder.total.toFixed(2))) {//Add based on remaining amount also only for dinein
          // this.openPrintView();
        }
        else if (page == 'dine') { //Is user pays half amount.
          this.router.navigate(['/pos-dashboard/dine-in']);
        } else if (page == 'running-order') {
          this.router.navigate(['/pos-dashboard/dine-in/running-order']);
        }
        else {
          this.alertService.showError('Added Amount is Not Equal to Total Amount');
        }

      }
    }

  }

  UpdateOrder(isPaid) {
    this.PrimaryOrder.isPaid = isPaid;
    this.PrimaryOrder.lastModifiedBy = this.currentUser.userId;
    this.PrimaryOrder.lastModifiedByName = this.currentUser.userName;
    this.PrimaryOrder.paymentBreakage = [...this.breakageData];
    this.PrimaryOrder.totalPerson = this.PrimaryOrder.numberOfPeople;
    this.posDataService.updateOrderData(this.PrimaryOrder, this.PrimaryOrder.orderId).subscribe(res => {
      this.PrimaryOrder.paymentBreakage = [];
      if (res.success) {
        this.SelectedItemTotal = 0;
        this.paidItemList = [];
        this.alertService.showSuccess("Order Updated Successfully");
      } else {
        this.alertService.showError(res.message);
      }
    });

  }
  // private CheckDiscountAndCreateObjectForInvoice(isPaid: boolean) {
  //   let data;
  //   if (this.itemDiscountList !== undefined) {
  //     data = this.CreateObjectForCreateInvoiceWithoutDiscount(isPaid);
  //   } else {
  //     //data = this.CreateObjectForCreateInvoiceWithDiscount(isPaid);
  //   }
  //   return data;
  // }

  // private CreateInvoiceAPICall(data: any) {
  //   if (Number(this.totalReceived.toFixed(2)) <= Number(this.PrimaryOrder.total.toFixed(2))) {
  //     this.openPrintView();
  //   } else {
  //     this.alertService.showError('Added Amount is Not Equal to Total Amount');
  //   }
  // }

  // private CreateInvoiceForOnlineOrders(data: any) {
  //   this.posDataService.postOnlinePrimaryOrder(data).subscribe((res: any) => {
  //     let status = res['success'];
  //     let msg = res['message'];
  //     if (status) {
  //       this.alertService.showSuccess('Payment Done');
  //       if (this.paidItemList != null && this.paidItemList.length > 0)
  //         this.MarkItemAsIsPaid(this.paidItemList);
  //       this.openPrintView();
  //     } else {
  //       this.alertService.showWarning(msg);
  //     }
  //   });
  // }

  // private CreateInvoiceForWalkInOrders(data: any) {
  //   this.ngxLoader.startLoader('loader-01');
  //   this.posDataService.postWalkinPrimaryOrder(data).subscribe((res: any) => {
  //     this.ngxLoader.stopLoader('loader-01');
  //     let status = res['success'];
  //     let msg = res['message'];
  //     if (status) {
  //       this.alertService.showSuccess('Payment Done');
  //       if (this.paidItemList != null && this.paidItemList.length > 0)
  //         this.MarkItemAsIsPaid(this.paidItemList);
  //       this.openPrintView();
  //     } else {
  //       this.alertService.showWarning(msg);
  //     }
  //   });
  // }

  // private CreateInvoiceForDineInOrders(data: any) {
  //   this.ngxLoader.startLoader('loader-01');
  //   this.posDataService.postPrimaryOrder(data).subscribe((res: any) => {
  //     this.ngxLoader.stopLoader('loader-01');
  //     let status = res['success'];
  //     let msg = res['message'];
  //     if (status) {
  //       this.alertService.showSuccess('Payment Done');
  //       if (this.paidItemList != null && this.paidItemList.length > 0)
  //         this.MarkItemAsIsPaid(this.paidItemList);
  //       this.openPrintView();
  //     } else {
  //       this.alertService.showWarning(msg);
  //     }
  //   });
  // }

  // private CreateObjectForCreateInvoiceWithDiscount(isPaid: boolean) {
  //   let data = {
  //     orderId: this.PrimaryOrder.orderId,
  //     orderType: this.PrimaryOrder.orderType,
  //     orderDateTime: this.PrimaryOrder.orderDateTime,
  //     customerId: this.PrimaryOrder.customerId,
  //     subTotal: this.PrimaryOrder.subTotal,
  //     promocode: "",
  //     isPromocodeApplied: false,
  //     promocodeDiscountType: "",
  //     promocodeDiscount: 0,
  //     promocodeAmount: 0,
  //     discountType: "",
  //     discountValue: 0,
  //     discountedAmount: 0,
  //     discountNotes: "",
  //     taxDetails: this.itemTaxList,
  //     totalPayableAmount: this.PrimaryOrder.total.toFixed(2),
  //     tipAmount: this.tip,
  //     ReceivedAmount: this.breakageData.reduce((sum, current) => sum + current.cashRecived, 0),
  //     paymentMode: "",
  //     isPaid: isPaid,
  //     paymentBreakage: this.breakageData,
  //     isItemIncludeTax: this.PrimaryOrder.isItemIncludeTax,
  //     isItemIncludeTaxPercentage: String(this.PrimaryOrder.isItemIncludeTaxPercentage),
  //     outletId: this.outletId,
  //     itemWiseTax: this.PrimaryOrder.itemWiseTax
  //   };
  //   return data;
  // }

  // private CreateObjectForCreateInvoiceWithoutDiscount(isPaid: boolean) {
  //   let data = {
  //     orderId: this.PrimaryOrder.orderId,
  //     orderType: this.PrimaryOrder.orderType,
  //     orderDateTime: this.PrimaryOrder.orderDateTime,
  //     customerId: this.PrimaryOrder.customerId,
  //     subTotal: this.PrimaryOrder.subTotal,
  //     promocode: this.itemDiscountList.promocode,
  //     isPromocodeApplied: this.itemDiscountList.isPromocodeApplied,
  //     promocodeDiscountType: this.itemDiscountList.promocodeDiscountType,
  //     promocodeDiscount: this.itemDiscountList.promocodeDiscount,
  //     promocodeAmount: this.itemDiscountList.promocodeAmount,
  //     discountType: this.itemDiscountList.discountType,
  //     discountValue: this.itemDiscountList.discountValue,
  //     discountedAmount: this.itemDiscountList.discountedAmount,
  //     discountNotes: this.itemDiscountList.discountNotes,
  //     discountName: this.itemDiscountList.discountName,
  //     taxDetails: this.itemTaxList,
  //     totalPayableAmount: this.PrimaryOrder.total.toFixed(2),
  //     tipAmount: this.tip,
  //     ReceivedAmount: this.breakageData.reduce((sum, current) => sum + current.cashRecived, 0),
  //     paymentMode: "",
  //     isPaid: isPaid,
  //     paymentBreakage: this.breakageData,
  //     isItemIncludeTax: this.PrimaryOrder.isItemIncludeTax,
  //     isItemIncludeTaxPercentage: String(this.PrimaryOrder.isItemIncludeTaxPercentage),
  //     outletId: this.outletId,
  //     itemWiseTax: this.PrimaryOrder.itemWiseTax
  //   };
  //   return data;
  // }

  async MarkItemAsIsPaid(ids) {
    for (let p = 0; p < ids.length; p++) {
      let indx = this.PrimaryOrder.items.map(function (x) { return x.id; }).indexOf(ids[p]);
      this.PrimaryOrder.items[indx].isPaid = true;
    }
  }
  Remove(amount, i) {
    this.totalReceived = this.totalReceived - amount;
    this.remainingAmount = this.remainingAmount + amount;
    if (this.breakageData[i].paymentMode === 'Wallet') {
      this.customerData.convertedAmount = Number(this.customerData?.convertedAmount) + Number(amount);
      this.isPointApplied = false;
    }
    this.breakageData.splice(i, 1);
    this.form.patchValue({
      amount: parseFloat(this.remainingAmount.toFixed(2))
    });
  }
  // openPrintView() {
  //   let totalPointAmount = this.breakageData.reduce((sum, current) => sum + current.pointAmount, 0);

  //   if (Number(this.totalReceived.toFixed(2)) <= Number(this.PrimaryOrder.total.toFixed(2))) {
  //     this.OpenPrintViewAndCheckConditions(totalPointAmount);
  //   } else {
  //     this.ShowPrintMessage = true;
  //     this.alertService.showError('Added Amount is Not Equal to Total Amount');
  //   }
  // }

  // private OpenPrintViewAndCheckConditions(totalPointAmount: any) {
  //   if (this.isPointApplied)
  //     this.PrimaryOrder.total = this.PrimaryOrder.total + totalPointAmount;
  //   sessionStorage.removeItem('orderDiscount' + this.PrimaryOrder.orderId);
  //   //this.activeModal.close();
  //   this.ShowPrintMessage = false;
  //   this.modalService.open(PrintVeiwComponent, { backdrop: 'static', size: 'md', keyboard: true, centered: true }).result.then((result) => {
  //     this.CheckResultAndRedirectToPage(result);
  //   }, (reason) => {
  //     this.closeResult = `Dismissed ${this.getDismissReason(reason)}`;
  //   });
  // }
  private getDismissReason(reason: any): string {
    if (reason === ModalDismissReasons.ESC) {
      return 'by pressing ESC';
    } else if (reason === ModalDismissReasons.BACKDROP_CLICK) {
      return 'by clicking on a backdrop';
    } else {
      return `with: ${reason}`;
    }
  }

  private CheckResultAndRedirectToPage(result: any) {
    if (result) {
      let page = sessionStorage.getItem('page');
      if (page == 'dine') {
        this.router.navigate(['/pos-dashboard/dine-in']);
      } else if (page == 'Walk-in') {
        this.router.navigate(['/pos-dashboard/walk-in']);
      } else if (page == 'Online') {
        this.router.navigate(['/pos-dashboard/online']);
      } else {
        this.router.navigate(['/pos-dashboard/dine-in/running-order']);
      }
    }
  }

  onKey(event) {

    if (this.form.get('amount').value > this.remainingAmount) {
      let val = (Number(event.target.value)).toFixed(2);
      let totalAmt = this.form.get('amount').value;
      this.TotalPaybleAmount = totalAmt;
      let balanceReturnedAmt = Number(Number(this.form.get('amount').value) - this.remainingAmount);
      if (parseFloat(val) > parseFloat(this.remainingAmount.toString())) {
        this.form.patchValue({
          balanceReturned: balanceReturnedAmt.toFixed(2)
        });
      } else {
        this.form.patchValue({
          balanceReturned: 0,
        })
      }
      this.form.patchValue({
        cashRecived: this.form.get('amount').value
      })
    }
  }
  async GetLoyaltySetting() {
    const Outletid = sessionStorage.getItem('activeOutletId');
    if ((sessionStorage.getItem("page") == "dine" || sessionStorage.getItem("page") == "Running" || sessionStorage.getItem("page") == "running") && this.PrimaryOrder?.customerId != null) {
      await this.GetCustomerById(this.PrimaryOrder.customerId);
    }
    else {
      this.customerData = JSON.parse(sessionStorage.getItem('customerData'));
    }
    setTimeout(() => {
      this.posDataService.GetLoyaltyByOutlet(Outletid).subscribe((res: any) => {
        const status = res['success'];
        const msg = res['message'];
        if (status && res.data) {
          this.GetLoyaltyData = res.data;

          this.AmountFromWallete = this.customerData?.totalPoints * this.GetLoyaltyData.amountPerPoint;
          if (this.AmountFromWallete > 0 && this.PrimaryOrder?.total >= this.GetLoyaltyData?.minAmountToUseWallet)
            this.allPaymentModes.push({ paymentModeName: "Wallet" });
        } else {
          this.alertService.showError(msg || 'Failed to load loyalty settings');
        }
      });
    }, 200)
  }
}
