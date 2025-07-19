import { Component, OnInit } from '@angular/core';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { AlertService } from '@core/services/common/alert.service';
import { PosDataService } from '@core/services/pos-system/pos-data.service';
import { PosEditService } from '@core/services/pos-system/pos-edit.service';
import { AngularEditorConfig } from '@kolkov/angular-editor';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';
import { NgxUiLoaderService } from 'ngx-ui-loader';
@Component({
  selector: 'app-print-design-veiw-edit',
  templateUrl: './print-design-veiw-edit.component.html',
  styleUrls: ['./print-design-veiw-edit.component.css']
})
export class PrintDesignVeiwEditComponent implements OnInit {
  generalForm: any = FormGroup;
  panelOpenState = false;
  previewData: any;
  outletId: any;
  id: any;
  editData: any;
  isradio: any;
  selectedSectionFormat: any;
  constructor(
    private ngxLoader: NgxUiLoaderService,
    private posEditService: PosEditService,
    private activeModal: NgbActiveModal,
    private formBuilder: FormBuilder,
    private alertService: AlertService,
    private posDataService: PosDataService
  ) { }

  ngOnInit(): void {

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

    this.id = this.posEditService.getPrintDesignViewEditId();
    this.outletId = sessionStorage.getItem('activeOutletId');
    if (this.id !== undefined) {
      this.editPrintDataById();
    }
    //By default keep first section active
    this.selectedSectionFormat = 1;
  }
  changedesignStatus(e) {
    this.isradio = this.generalForm.get('isActive').value;
    this.posDataService.validActivedesignStatus(this.id, this.isradio).subscribe((res: any) => {
      let msg = res['message'];
      let success = res['success'];
      if (success) {
        this.alertService.showSuccess(msg);
      } else {
        this.alertService.showError(msg);
        this.generalForm.patchValue({ isActive: false });
      }
    });
  }

  editPrintDataById() {
    this.ngxLoader.startLoader('loader-01');
    this.posDataService.getAllPrintDesignById(this.id).subscribe((res: any) => {
      this.ngxLoader.stopLoader('loader-01');
      this.editData = res['data'];
      let success = res['success'];
      let msg = res['message'];
      if (success) {
        this.previewData = this.editData;
        console.log(this.editData);
        this.patchValuesToForm();
      }
      else {
        this.alertService.showError(msg);
      }
    });
  }
  patchValuesToForm() {
    this.generalForm.patchValue({
      invoiceTitle: this.editData.printGenerealSettings.invoiceTitle,
      orderNo: this.editData.printGenerealSettings.orderNo,
      customer: this.editData.printGenerealSettings.customer,
      servedBy: this.editData.printGenerealSettings.servedBy,
      item: this.editData.printItemHeaderSettings.item,
      quantity: this.editData.printItemHeaderSettings.quantity,
      discount: this.editData.printItemHeaderSettings.discount,
      amount: this.editData.printItemHeaderSettings.amount,
      showHeader: this.editData.printHeaderSettings.showHeader,
      headerContent: this.editData.printHeaderSettings.headerDetails,
      showFooter: this.editData.printFooterSettings.showFooter,
      footerContent: this.editData.printFooterSettings.footerDetails,

      //New properties
      showLogo: this.editData.printGenerealSettings.showLogo,
      showDeliveryAddress: this.editData.printGenerealSettings.showDeliveryAddress,      
      showModifiersAndNotes: this.editData.printGenerealSettings.showModifiersAndNotes,      
      showOrderNotes: this.editData.printGenerealSettings.showOrderNotes,      
      showLoyalty: this.editData.printGenerealSettings.showLoyalty,      
    });
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

  onCheckboxChange1(event) {
    if (event.target.checked) {
      this.generalForm.patchValue({
        showFooter: true
      });
    } else {
      this.generalForm.patchValue({
        showFooter: false
      });
    }
  }
  closeModal() {
    this.activeModal.close();
    this.generalForm.reset();
  }
  editGeneralSubmit(data: any) {

    console.log(data);
    if (this.generalForm.invalid) {
      this.alertService.showError('Fields Are Empty');
    } else {
      let printEditData = {
        id: this.id,
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
        activeStatus: this.editData.activeStatus
      }
      console.log(printEditData);
      this.ngxLoader.startLoader('loader-01');
      this.posDataService.updatePrintDesignData(this.id, printEditData).subscribe((res: any) => {
        this.ngxLoader.stopLoader('loader-01');
        let status = res['success'];
        let msg = res['message'];
        this.previewData = res['data'];
        if (status) {
          this.alertService.showSuccess(msg);
          this.activeModal.close(status);
        } else {
          this.alertService.showError(msg);
        }
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
