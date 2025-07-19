import { Component, OnInit } from '@angular/core';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { AlertService } from '@core/services/common/alert.service';
import { PosDataService } from '@core/services/pos-system/pos-data.service';
import { AngularEditorConfig } from '@kolkov/angular-editor';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';
import { NgxUiLoaderService } from 'ngx-ui-loader';

@Component({
  selector: 'app-print-design-veiw',
  templateUrl: './print-design-veiw.component.html',
  styleUrls: ['./print-design-veiw.component.css']
})
export class PrintDesignVeiwComponent implements OnInit {
  generalForm: any = FormGroup;
  panelOpenState = false;
  previewData: any;
  outletId: any;
  isradio: any;
  default: any;
  selectedSectionFormat: any;

  constructor(
    private ngxLoader: NgxUiLoaderService,
    private activeModal: NgbActiveModal,
    private formBuilder: FormBuilder,
    private alertService: AlertService,
    private posDataService: PosDataService
  ) { }

  ngOnInit(): void {
    this.outletId = sessionStorage.getItem('activeOutletId');
    this.generalForm = this.formBuilder.group({
      invoiceTitle: ['', Validators.required],
      orderNo: ['', Validators.required],
      customer: ['', Validators.required],
      servedBy: ['', Validators.required],
      item: ['', Validators.required],
      quantity: ['', Validators.required],
      discount: [''],
      amount: ['', Validators.required],
      showHeader: [true, Validators.required],
      headerContent: ['', Validators.required],
      showFooter: [true, Validators.required],
      footerContent: ['', Validators.required],
      showLogo: [false],
      showOrderNotes: [false],
      showLoyalty: [false],
      showDeliveryAddress: [false],
      showModifiersAndNotes: [false],      
    });
    this.checkHeaderCheckBox();
    this.checkFooterCheckBox();

    //By default keep first section active
    this.selectedSectionFormat = 1;
  }

  checkHeaderCheckBox() {
    const ele = document.getElementById('headerCheck') as HTMLInputElement;
    if (ele !== undefined && ele !== null) {
      ele.checked = true;
    }
  }

  checkFooterCheckBox() {
    const ele = document.getElementById('footerCheck') as HTMLInputElement;
    if (ele !== undefined && ele !== null) {
      ele.checked = true;
    }
  }

  editorConfig: AngularEditorConfig = {
    editable: true,
    spellcheck: true,
    height: 'auto',
    minHeight: '0',
    maxHeight: 'auto',
    width: 'auto',
    minWidth: '0',
    translate: 'yes',
    enableToolbar: true,
    showToolbar: true,
    placeholder: 'Enter text here...',
    defaultParagraphSeparator: '',
    defaultFontName: '',
    defaultFontSize: '',
    fonts: [
      { class: 'arial', name: 'Arial' },
      { class: 'times-new-roman', name: 'Times New Roman' },
      { class: 'calibri', name: 'Calibri' },
      { class: 'comic-sans-ms', name: 'Comic Sans MS' }
    ],
    customClasses: [
      {
        name: 'quote',
        class: 'quote',
      },
      {
        name: 'redText',
        class: 'redText'
      },
      {
        name: 'titleText',
        class: 'titleText',
        tag: 'h1',
      },
    ],
    uploadWithCredentials: false,
    sanitize: false,
    toolbarPosition: 'top',
    toolbarHiddenButtons: [
      ['insertUnorderedList', 'insertOrderedList', 'toggleEditorMode'],
      ['insertImage', 'insertVideo', 'unlink', 'link']
    ]
  };
  changedesignStatus(e) {
    this.isradio = this.generalForm.get('isActive').value; this.default = "";
    this.posDataService.validActivedesignStatus(this.default, this.isradio).subscribe((res: any) => {

      let msg = res['message'];
      let success = res['success'];
      if (success) {
        this.alertService.showSuccess(msg);
        this.generalForm.patchValue({ isActive: true });
      } else {
        this.alertService.showError(msg);
        this.generalForm.patchValue({ isActive: false });
      }
    });
  }
  onCheckboxChange(event) {
    if (event.target.checked) {
      this.generalForm.patchValue({
        showHeader: true
      });
    } else {
      this.generalForm.patchValue({
        showHeader: false
      });
    }
  }

  closeModal() {
    this.activeModal.close();
  }
  generalSubmit() {
    if (this.generalForm.invalid) {
      this.alertService.showError('Fields Are Empty');
    } else {
      let data = {
        printItemHeaderSettings: {
          Item: this.generalForm.get('item').value,
          Discount: this.generalForm.get('discount').value,
          Quantity: this.generalForm.get('quantity').value,
          Amount: this.generalForm.get('amount').value,
          ShowModifiersAndNotes: this.generalForm.get('showModifiersAndNotes').value,
        },
        printGenerealSettings: {
          InvoiceTitle: this.generalForm.get('invoiceTitle').value,
          OrderNo: this.generalForm.get('orderNo').value,
          Customer: this.generalForm.get('customer').value,
          ServedBy: this.generalForm.get('servedBy').value,
          ShowOrderNotes: this.generalForm.get('showOrderNotes').value,
          ShowLoyalty: this.generalForm.get('showLoyalty').value
        },
        printHeaderSettings: {
          ShowHeader: this.generalForm.get('showHeader').value,
          ShowLogo: this.generalForm.get('showLogo').value,
          HeaderDetails: this.generalForm.get('headerContent').value
        },
        printFooterSettings: {
          ShowFooter: this.generalForm.get('showFooter').value,
          FooterDetails: this.generalForm.get('footerContent').value,
          ShowDeliveryAddress: this.generalForm.get('showDeliveryAddress').value
        },
        outletId: this.outletId,
        ActiveStatus : true
      }
      console.log(data);
      this.ngxLoader.startLoader('loader-01');
      this.posDataService.postPrintDesignData(data).subscribe((res: any) => {
        this.ngxLoader.stopLoader('loader-01');
        this.previewData = res['data'];
        let msg = res['message'];
        let status = res['success'];
        console.log(this.previewData);
        if (status) {
          this.alertService.showSuccess(msg);
        }
        this.activeModal.close();
      });
    }
  }
  selectSection(type) {
    switch (type) {
      case 1:
        this.selectedSectionFormat = 1;
        break;
      case 2:
        this.selectedSectionFormat = 2;
        break;
      case 3:
        this.selectedSectionFormat = 3;
        break;
      case 4:
        this.selectedSectionFormat = 4;
        break;
      case 5:
        this.selectedSectionFormat = 5;
        break;
    }
  }

  onNewCheckboxChange(event, type) {
    if (event.target.checked) {
      switch (type) {
        case 1:
          this.generalForm.patchValue({
            showLogo: true
          });
          break;
        case 2:
          this.generalForm.patchValue({
            showOrderNotes: true
          });
          break;
        case 3:
          this.generalForm.patchValue({
            showLoyalty: true
          });
          break;
        case 4:
          this.generalForm.patchValue({
            showDeliveryAddress: true
          });
          break;
        case 5:
          this.generalForm.patchValue({
            showModifiersAndNotes: true
          });
          break;
      }
    }
  }
}
