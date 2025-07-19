import { Component, OnInit } from '@angular/core';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';

@Component({
  selector: 'app-order-list-preview',
  templateUrl: './order-list-preview.component.html',
})
export class OrderListPreviewComponent implements OnInit {
  closeView: boolean = false;
  TodaySalesList: any = {};
  isExportEnable: boolean = false;
  modalTitle : string = '';
  voidOrder : boolean = false;
  CardType : boolean = false;
  Tip: boolean = false;
  loginUserData : any;

  //To hide and display payment brakages
  openPaymentBlock = false;

  constructor(
    private activeModal: NgbActiveModal
  ) {

    this.TodaySalesList = JSON.parse(sessionStorage.getItem("orderpreviewList")) ? JSON.parse(sessionStorage.getItem("orderpreviewList")) : null;
    this.modalTitle = JSON.parse(sessionStorage.getItem("modalTitle")) ? JSON.parse(sessionStorage.getItem("modalTitle")) : null;
    if(this.modalTitle == "Void Order"){
      this.voidOrder = true;
    }
    if(this.modalTitle == "By Card")
    {
      this.CardType = true;
    }
    if(this.modalTitle == "Tip")
    {
      this.Tip = true;
    }
    this.isExportEnable = true;

  }

  ngOnInit(): void {
    if (sessionStorage.getItem('dash') == 'dashboard') {
      this.closeView = true;
    }
    this.loginUserData = JSON.parse(sessionStorage.getItem("userCredential"));
  }

  closeModal() {
    this.activeModal.close();
  }

  downloadFile() {
    let data = JSON.parse(sessionStorage.getItem("selectedOrderPreviewList"));
    const replacer = (key, value) => value === null ? '' : value; // specify how you want to handle null values here
    const header = Object.keys(data[0]);
    let csv = data.map(row => header.map(fieldName => JSON.stringify(row[fieldName], replacer)).join(','));
    csv.unshift(header.join(','));
    let csvArray = csv.join('\r\n');
    let blob = new Blob([csvArray], { type: 'text/csv' })
    const a = document.createElement('a');
    const url = window.URL.createObjectURL(blob);
    a.href = url;
    a.download = 'order_report.csv';
    a.click();
    window.URL.revokeObjectURL(url);
    a.remove();
  }
  viewPaymentBrakage() {
    if (!this.openPaymentBlock){
      this.openPaymentBlock = true;
    }else{
      this.openPaymentBlock = false;
    }
  }

}


