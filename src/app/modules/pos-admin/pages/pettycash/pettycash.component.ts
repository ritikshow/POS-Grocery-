import { Component, OnInit, ViewChild } from '@angular/core';
import { AlertService } from '@core/services/common/alert.service';
import { PosDataService } from '@core/services/pos-system/pos-data.service';
import { NgbModal, ModalDismissReasons } from '@ng-bootstrap/ng-bootstrap';
import { DataTableDirective } from 'angular-datatables';
import { Subject } from 'rxjs';
import { NgxUiLoaderService } from 'ngx-ui-loader';
import { CommonService } from '@core/services/common/common.service';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';


@Component({
  selector: 'app-pettycash',
  templateUrl: './pettycash.component.html',
  styleUrls: ['./pettycash.component.css']
})
export class PettyCashComponent implements OnInit {
  tableListRecord: any = [];
  isDataLoaded = false;
  today = new Date();


  dtOptions: DataTables.Settings = {
    order: [[1, 'desc']],
    lengthChange: false,
    pageLength: 5,
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

  pettyCashForm: any = FormGroup;
  viewDiv = true;
  outletId: any;
  closeResult: string;
  userData: any;
  isCompanyAdmin: boolean = false;
  searchInputItem: any;
  searchInput: any;
  pettyCashData: any;
  tempPettyCashData: any;

  //New variables for calculations
  openingBalance = 0;
  currentDate = new Date();
  TotalBalance = 0;
  CashOut = 0;
  CashIn = 0;
  openingBalanceAndBalance = 0;
  pettyCashDataToUpdate: any;

  //Filter the records to download report
  filterForm: FormGroup;
  PrintPettyCashData: any;
  outletName: any;
  PettyCashExcelReport: Array<{ SrNo: any, PaidOrRecevieFrom: any, Purpose: any, CashIn: any, CashOut: any, Balance: any }> = [];


  constructor(
    private ngxLoader: NgxUiLoaderService,
    private formBuilder: FormBuilder,
    private alertService: AlertService,
    private posDataService: PosDataService,
    private modalService: NgbModal,
    public commonService: CommonService

  ) { }

  ngOnInit(): void {
     const today = new Date();
    this.dtOptions = {
      order: [[1, 'desc']],
      lengthChange: false,
      pageLength: 4,
      infoCallback: (settings: DataTables.SettingsLegacy, start: number, end: number, mnax: number, total: number, pre: string) => {
        this.tableListRecord.total = total;
      }
    }
    this.outletName = sessionStorage.getItem('activeOutletname');
    this.userData = JSON.parse(sessionStorage.getItem('userCredential'));
    this.isCompanyAdmin = this.userData.roleName == 'Company Admin' ? true : false;
    this.outletId = sessionStorage.getItem('activeOutletId');
    this.pettyCashForm = this.formBuilder.group({
      paidOrReceiveFrom: ['', Validators.required],
      purpose: [''],
      cashOut: [''],
      cashIn: ['']
    });
    this.filterForm = this.formBuilder.group({
      fromDate: [today, Validators.required],
      toDate: [today, Validators.required]
    });
    this.getPettyCashDataByDate();
  }


    OnClickDownload( content) {
    this.modalService.open(content, { ariaLabelledBy: 'modal-basic-title', keyboard: false, backdrop: 'static', windowClass:'main_add_popup',size: 'lg' })
    
  }
  closeModal(result) {
    this.modalService.dismissAll(result);
  }
  addPettyCash(isUpdate) {
    //Validations
    if (this.pettyCashForm.invalid) {
      return this.alertService.showError('Field Are Empty');
    }
    else if (this.pettyCashForm.get('cashOut').value == '' && this.pettyCashForm.get('cashIn').value == '') {
      return this.alertService.showError('Please enter either Cash Out or Cash In to continue');
    }
    else if (this.openingBalance == 0 && this.pettyCashForm.get('cashOut').value != '') {
      return this.alertService.showError("Doesn't have Sufficient Balance");
    }
    else if (this.pettyCashForm.get('cashOut').value > this.openingBalanceAndBalance) {
      return this.alertService.showError('Cash Out amount should be less than Balance');
    }
    else {
      if (!isUpdate) {
        let data = this.CreateObject(false);
        this.CreateNewPettyCashAPICall(data);
      } else {

        if (this.pettyCashForm.get('cashOut').value > this.pettyCashDataToUpdate.balance)
          return this.alertService.showError(`Cash Out amount should be less than the record balance : ${this.pettyCashDataToUpdate.balance} /-`);

        let data = this.CreateObject(true);
        this.UpdatePettyCashAPICall(data);
      }
    }
  }

  private CreateNewPettyCashAPICall(data) {
    this.posDataService.InsertPettyCash(data).subscribe((res: any) => {
      let Data = res['data'];
      let msg = res['message'];
      let status = res['success'];
      if (status) {
        this.pettyCashForm.reset();
        this.alertService.showSuccess(msg);
        this.getPettyCashDataByDate();
      } else {
        this.alertService.showError(msg);
      }
    });
  }
  patchValuesToForm(data) {
    this.pettyCashForm.patchValue({
      paidOrReceiveFrom: data.paidOrReceiveFrom,
      purpose: data.purpose,
      cashOut: data.cashOut,
      cashIn: data.cashIn
    });
  }

  EidtPettyCash(data, content) {
    this.pettyCashDataToUpdate = data;
    this.patchValuesToForm(data);
    this.modalService.open(content, { backdrop: 'static', windowClass: 'main_add_popup', keyboard: true, centered: true }).result.then((result) => {
      this.closeResult = `Closed with: ${result}`;
    }, (reason) => {
      this.closeResult = `Dismissed ${this.getDismissReason(reason)}`;
    });
  }

  private UpdatePettyCashAPICall(data) {
    this.posDataService.UpdatePettyCash(data).subscribe((res: any) => {
      let msg = res['message'];
      let status = res['success'];
      if (status) {
        this.alertService.showSuccess(msg);
      } else {
        this.alertService.showError(msg);
      }
      this.closeAction();
      this.getPettyCashDataByDate();
    });
  }

  private CreateObject(isUpdate) {
    let data: any;

    //For new record
    if (!isUpdate) {
      var calculateBalance = this.openingBalanceAndBalance + (this.pettyCashForm.get('cashIn').value || 0);

      if (this.pettyCashForm.get('cashOut').value != '') {
        calculateBalance = calculateBalance - this.pettyCashForm.get('cashOut').value;
      }
      data = {
        PaidOrReceiveFrom: this.pettyCashForm.get('paidOrReceiveFrom').value,
        Purpose: this.pettyCashForm.get('purpose').value,
        CashOut: (this.pettyCashForm.get('cashOut').value || 0),
        CashIn: (this.pettyCashForm.get('cashIn').value || 0),
        outletId: this.outletId,
        Balance: calculateBalance, //Based on cashout and cashin
        OpeningBalance: this.openingBalance,
        IsDeleted: false,
        CreatedBy: this.userData.userId,
        CreatedByName: this.userData.userName
      };
    }
    //For Update the existing record
    else {
      //For Cash In
      let modifyBalanceInUpdate = this.pettyCashDataToUpdate.balance;
      if (this.pettyCashForm.get('cashIn').value != this.pettyCashDataToUpdate.cashIn) {
        let reduceAmount = modifyBalanceInUpdate - this.pettyCashDataToUpdate.cashIn;
        modifyBalanceInUpdate = reduceAmount + this.pettyCashForm.get('cashIn').value;
      }

      //For cashout
      if (this.pettyCashForm.get('cashOut').value != this.pettyCashDataToUpdate.cashOut) {
        let addAmountAndThenReduce = modifyBalanceInUpdate + this.pettyCashDataToUpdate.cashOut;
        modifyBalanceInUpdate = addAmountAndThenReduce - this.pettyCashForm.get('cashOut').value;
      }

      data = {
        _id: this.pettyCashDataToUpdate._id,
        PaidOrReceiveFrom: this.pettyCashForm.get('paidOrReceiveFrom').value,
        Purpose: this.pettyCashForm.get('purpose').value,
        CashOut: (this.pettyCashForm.get('cashOut').value || 0),
        CashIn: (this.pettyCashForm.get('cashIn').value || 0),
        outletId: this.pettyCashDataToUpdate.outletId,
        OpeningBalance: this.pettyCashDataToUpdate.openingBalance,
        IsDeleted: false,
        Balance: modifyBalanceInUpdate,
        CreatedBy: this.pettyCashDataToUpdate.createdBy,
        CreatedByName: this.pettyCashDataToUpdate.createdByName,
        CreatedOn: this.pettyCashDataToUpdate.createdOn,
        LastModifiedBy: this.userData.userId,
      };

    }

    return data;
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


  onDelete(id) {
    this.ngxLoader.startLoader('loader-01');
    this.posDataService.deletePettyCash(id).subscribe((res) => {
      this.ngxLoader.stopLoader('loader-01');
      console.log(res);
      let success = res['success'];
      let msg = res['message'];
      if (success) {
        this.alertService.showSuccess('Deleted Successfully');
      }
      else {
        this.alertService.showError(msg);
      }
      this.getPettyCashDataByDate();
    });
  }


  closeAction() {
    if (this.modalService.hasOpenModals) {
      this.modalService.dismissAll();
    }
  }


  getPettyCashDataByDate() {
    this.ngxLoader.startLoader('loader-01')

    let date = JSON.stringify(new Date()).split('T')[0];
    this.isDataLoaded = false;
    this.posDataService.GetPettyCash(date.slice(1), this.outletId).subscribe((response: any) => {
      this.ngxLoader.stopLoader('loader-01');
      this.pettyCashData = response['data'];
      let success = response['success'];
      let msg = response['message'];
      this.tableListRecord.total = this.pettyCashData?.length;

      //Sum the categories of Cash Counter
      this.openingBalance = parseInt(msg.split(':')[1]);
      this.CashOut = this.pettyCashData?.reduce((sum, item) => sum + item.cashOut, 0);
      this.CashIn = this.pettyCashData?.reduce((sum, item) => sum + item.cashIn, 0);
      //this.TotalBalance = this.pettyCashData?.reduce((sum, item) => sum + item.balance, 0);
      this.TotalBalance = (this.openingBalance + this.CashIn) - this.CashOut;
      this.openingBalanceAndBalance = this.openingBalance == 0 ? (this.openingBalance + this.TotalBalance) : this.TotalBalance;

      this.isDataLoaded = true;
      if (!success) {
        // this.alertService.showError(msg);
      }
    })
  }

  search(): void {

    let input = this.searchInput;
    console.log(input)
    if (input == '') {
      this.pettyCashData = this.getPettyCashDataByDate;
    } else {
      this.pettyCashData = this.getPettyCashDataByDate
    }
  }
  searchItem(): void {
    let input = this.searchInputItem;

    if (input == '') {
      this.pettyCashData = this.tempPettyCashData;
    } else {

      this.pettyCashData = this.tempPettyCashData?.filter((res: any) => {
        return res.customerName.toLocaleLowerCase().match(input.toLocaleLowerCase());
      });
    }
  }
  // getPettyCashToDownloadReport() {
  //   let toDate = this.filterForm.get('toDate').value ? this.filterForm.get('toDate').value : new Date();
  //   let fromDate = this.filterForm.get('fromDate').value ? this.filterForm.get('fromDate').value : new Date();

  //   let startDate = this.formatDate(new Date(fromDate));
  //   let endDate = this.formatDate(new Date(toDate));

  //   this.posDataService.GetPettyCashReportByDate(startDate, endDate, this.outletId).subscribe((response: any) => {
  //     console.log(response);
  //     this.PrintPettyCashData = response['data'];
  //     this.dtTrigger.next();
  //     this.downloadFile();
  //   });

  // }
  getPettyCashToDownloadReport() {
  const fromDateControl = this.filterForm.get('fromDate');
  const toDateControl = this.filterForm.get('toDate');

  const fromDate = fromDateControl?.value || new Date();
  const toDate = toDateControl?.value || new Date();

  const startDate = this.formatDate(new Date(fromDate));
  const endDate = this.formatDate(new Date(toDate));

  this.posDataService.GetPettyCashReportByDate(startDate, endDate, this.outletId)
    .subscribe({
      next: (response: any) => {
        this.PrintPettyCashData = response['data'];
        this.dtTrigger.next();
        this.downloadFile();
      },
      error: (err) => {
        console.error('Error fetching petty cash report:', err);
        // Optionally show error toast/snackbar here
      }
    });
}


  formatDate(date) {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');

    return `${year}-${month}-${day}`;
  }
  resetPage() {
      const today = new Date();
    this.filterForm.patchValue({
      toDate: today,
      fromDate: today
    })
   
  }

  downloadFile() {
    let i = 1;
    let getOpeningBalance = this.PrintPettyCashData[0]?.openingBalance;
    getOpeningBalance = `Balance ${getOpeningBalance}`;

    this.PettyCashExcelReport.push({
      "SrNo": '',
      "PaidOrRecevieFrom": '',
      "Purpose": '',
      "CashIn": '',
      "CashOut": '',
      "Balance": `Opening Balance : ${getOpeningBalance}`
    });

    const headersSet = new Set<string>();
    this.PrintPettyCashData.forEach(e => {
      this.PettyCashExcelReport.push({
        "SrNo": i,
        "PaidOrRecevieFrom": e.paidOrReceiveFrom ? e.paidOrReceiveFrom : null,
        "Purpose": e.purpose ? e.purpose : null,
        "CashIn": e.cashIn ? e.cashIn : null,
        "CashOut": e.cashOut ? e.cashOut : null,
        "Balance": e.balance ? e.balance : null
      });
      i++;
    });

    const replacer = (key, value) => value === null ? '' : value; // specify how you want to handle null values here
    const header = Object.keys(this.PettyCashExcelReport[0]);
    let csv = this.PettyCashExcelReport.map(row => header.map(fieldName => JSON.stringify(row[fieldName], replacer)).join(','));
    csv.unshift(header.join(','));
    let csvArray = csv.join('\r\n');
    let blob = new Blob([csvArray], { type: 'text/csv' })
    const a = document.createElement('a');
    const url = window.URL.createObjectURL(blob);
    a.href = url;
    a.download = 'Petty_Cash_Report.csv';
    a.click();
    window.URL.revokeObjectURL(url);
    a.remove();
    this.PettyCashExcelReport = [];
  }
}
