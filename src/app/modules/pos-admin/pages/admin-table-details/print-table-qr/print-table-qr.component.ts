import { Component, OnInit, Renderer2 } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { AddItemService } from '@core/services/common/add-item.service';
import { AlertService } from '@core/services/common/alert.service';
import { PosDataService } from '@core/services/pos-system/pos-data.service';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';
import { NgxUiLoaderService } from 'ngx-ui-loader';
import { environment } from 'src/environments/environment';

@Component({
  selector: 'app-print-table-qr',
  templateUrl: './print-table-qr.component.html',
  styleUrls: ['./print-table-qr.component.css']
})
export class PrintTableQrComponent implements OnInit {

  tableTypes: any;
  tableDetailForm: any = FormGroup;
  tableData: any;
  resId: any;
  resData: any;
  isActiveOutlet = false;
  outletId: any;
  isUpdate = false;
  id: any;
   
  tabledesignList = [
    { format: 'Square' },
    { format: 'Triangle' },
    { format: 'Circle' }
  ]
  tableQrCode: any;
  BaseUrl: any;
  RestaurentImage: any;
RestaurentImageBase64 : any;
  constructor(
    private ngxLoader: NgxUiLoaderService,
    private activeModal: NgbActiveModal,
    private formBuilder: FormBuilder,
    private alertService: AlertService,
    private addItems: AddItemService,
    private posDataService: PosDataService,
    private renderer: Renderer2,
  ) { }

  ngOnInit(): void {      
    this.tableQrCode = JSON.parse(sessionStorage.getItem('tableQrCode') || '{}');;
    this.BaseUrl = environment.apiUrl.replace(/^(.*:\/\/[^\/]+\/).*$/, '$1');
    this.RestaurentImage = JSON.parse(sessionStorage.getItem('activeRestaurant')).logoPath?.match(/Uploads.*/)[0];
    this.convertImageToBase64(this.RestaurentImage.split('\\').pop());
    // if(this.RestaurentImage){
    //   const imageUrl = this.BaseUrl + this.RestaurentImage;
    //   console.log("URl",imageUrl);
    //  this.convertImageToBase64(imageUrl)
    //   .then(base64 => this.RestaurentImageBase64 = base64)
    //   .catch(err => console.error('Image load failed:', err));
    // }
   
  }
  

  closeModal() {   
    this.activeModal.close();
  }
  downloadPdf() {
    const element = document.getElementById('qrPage'); // ID of the popup content element
    if (!element) {
      console.error('Popup content not found!');
      return;
    }
  
    import('jspdf').then(jsPDF => {
      import('html2canvas').then(html2canvas => {
        html2canvas.default(element).then((canvas: HTMLCanvasElement) => {
          const imgData = canvas.toDataURL('image/png'); 
          
          const pxWidth = canvas.width;
          const pxHeight = canvas.height;
          const dpi = 96; // Default DPI
          const mmWidth = (pxWidth / dpi) * 25.4;
          const mmHeight = (pxHeight / dpi) * 25.4;
          console.log(mmWidth, mmHeight)
          const pdf = new jsPDF.default({
            orientation: 'p', // Portrait
            unit: 'mm',
            format: [mmWidth, mmHeight], // Custom dimensions
          });
          pdf.addImage(imgData, 'PNG', 0, 0, mmWidth, mmHeight);
          pdf.save('table '+ this.tableQrCode.tableNo.toString() +' QR Code'); // Name of the downloaded PDF
        });
      });
    });
  }
  printPopup() {
    const element = document.getElementById('qrPage'); // ID of the popup content element
    if (!element) {
      console.error('Popup content not found!');
      return;
    }
  
    const popupWindow = window.open('', '_blank', 'width=800,height=600');
    if (popupWindow) {
      popupWindow.document.open();
      popupWindow.document.write(`
        <!DOCTYPE html>
        <html>
          <head>
            <title>Print Popup Content</title>
            <style>
              /* General Styles */
              body {
                font-family: Arial, sans-serif;
              }
              .d-flex {
                display: flex;
              }
              .align-items-center {
                align-items: center;
              }
              .flex-column {
                flex-direction: column;
              }
              .justify-content-center {
                justify-content: center;
              }
              .qr_code_print_content {
                background: #FFFFFF;
                box-shadow: 0px 2px 26px 0px #0000000A;
                border-radius: 4px;
                width: 356px !important;
                max-width: 356px !important;
              }
              .qr_code_content {
                padding: 9px;
                text-align: center;
              }
              img.qr_resto_logo {
                width: 356px;
                height: 110px;
              }
              .font_24 {
                font-size: 24px;
                line-height: 30px;
              }
              .text_uppercase {
                text-transform: uppercase;
              }
              .qr_code_container {
                background: #3598DC;
                box-shadow: 0px 2px 26px 0px #0000000A;
                padding: 14px 20px 23px;
                border-radius: 4px;
              }
              .scan_arrow {
                position: absolute;
                right: -27px;
                top: 3px;
              }
              .qr_img_blk {
                border-radius: 13px;
                background-color: #FFFFFF;
                padding: 3.51px;
              }
              .font_44 {
                font-size: 44px;
                line-height: 53px;
              }
              .table_info_blk {
                background: #132756;
                width: 122px;
                height: 122px;
                padding: 7px 11px;
                border-radius: 50%;
              }
              .mr_16 {
                margin-right: 16px;
              }
              .qr_download_btn {
                background: #3598DC;
                border-radius: 4px;
                border: none;
                padding: 10.51px 29px;
              }
              .qr_download_btn.print_qr_btn {
                padding: 10.51px 44.4px;
              }

              /* Print Styles */
              @media print {
                body {
                  margin: 0;
                  padding: 0;
                }
              }
            </style>
          </head>
          <body onload="window.print(); window.close();">
            ${element.innerHTML}
          </body>
        </html>
      `);
      popupWindow.document.close();
    } else {
      console.error('Unable to open print window!');
    }

  }
    convertImageToBase64(ImageName){
  this.ngxLoader.startLoader('loader-01');
  this.posDataService.getImageInBase64(ImageName).subscribe((res: any) => {
    console.log("Base 64 Data",res);
  this.ngxLoader.stopLoader('loader-01');
  this.RestaurentImageBase64 = 'data:image/jpeg;base64,' + res.data;
});
}
}