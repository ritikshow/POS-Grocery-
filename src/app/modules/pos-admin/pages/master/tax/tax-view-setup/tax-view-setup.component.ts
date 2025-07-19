import { TaxViewSetupEditComponent } from './tax-view-setup-edit/tax-view-setup-edit.component';
import { TaxViewSetupViewComponent } from './tax-view-setup-view/tax-view-setup-view.component';
import { Component, OnInit } from '@angular/core';
import { AlertService } from '@core/services/common/alert.service';
import { PosDataService } from '@core/services/pos-system/pos-data.service';
import { PosEditService } from '@core/services/pos-system/pos-edit.service';
import { PosViewService } from '@core/services/pos-system/pos-view.service';
import { NgbActiveModal, NgbModal, ModalDismissReasons } from '@ng-bootstrap/ng-bootstrap';
import { NgxUiLoaderService } from 'ngx-ui-loader';

@Component({
  selector: 'app-tax-view-setup',
  templateUrl: './tax-view-setup.component.html',
  styleUrls: ['./tax-view-setup.component.css']
})
export class TaxViewSetupComponent implements OnInit {
  taxData: any;
  outletId: any;
  closeResult: string;

  constructor(
    private activeModal: NgbActiveModal,
    private ngxLoader: NgxUiLoaderService,
    private modalService: NgbModal,
    private alertService: AlertService,
    private posDataService: PosDataService,
    private posViewService: PosViewService,
    private posEditService: PosEditService
  ) { }

  ngOnInit(): void {
    this.outletId = sessionStorage.getItem('activeOutletId');
   
  }
  closeModal() {
    this.activeModal.close();
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
  edit(id) {
    this.posEditService.setTaxSetupEditId(id);
    this.modalService.open(TaxViewSetupEditComponent, { backdrop: 'static', size: 'md', keyboard: true, centered: true }).result.then((result) => {
      this.closeResult = `Closed with: ${result}`;
      if (result) {
      
      }
    }, (reason) => {

      this.closeResult = `Dismissed ${this.getDismissReason(reason)}`;
    });
  }
  view(id) {
    this.posViewService.setTaxSetupViewId(id);
    this.modalService.open(TaxViewSetupViewComponent, { backdrop: 'static', size: 'md', keyboard: true, centered: true }).result.then((result) => {
      this.closeResult = `Closed with: ${result}`;
    }, (reason) => {
      this.closeResult = `Dismissed ${this.getDismissReason(reason)}`;
    });
  }
  onDelete(id) {
    this.ngxLoader.startLoader('loader-01');
    this.posDataService.deleteTaxSetupRow(id).subscribe((res) => {
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
    });
  }
}
