import { Component, OnInit } from '@angular/core';
import { AlertService } from '@core/services/common/alert.service';
import { PosDataService } from '@core/services/pos-system/pos-data.service';
import { PosEditService } from '@core/services/pos-system/pos-edit.service';
import { PosViewService } from '@core/services/pos-system/pos-view.service';
import { NgbModal, ModalDismissReasons } from '@ng-bootstrap/ng-bootstrap';
import { NgxUiLoaderService } from 'ngx-ui-loader';
import { OutletEditComponent } from './outlet-edit/outlet-edit.component';
import { OutletFormComponent } from './outlet-form/outlet-form.component';
import { OutletViewComponent } from './outlet-view/outlet-view.component';

@Component({
  selector: 'app-outlet',
  templateUrl: './outlet.component.html',
  styleUrls: ['./outlet.component.css']
})
export class OutletComponent implements OnInit {
  closeResult: string;
  outletData: any;

  constructor(
    private ngxLoader: NgxUiLoaderService,
    private modalService: NgbModal,
    private alertService: AlertService,
    private posDataService: PosDataService,
    private posViewService: PosViewService,
    private posEditService: PosEditService
    ) { }

  ngOnInit(): void {
    this.getAllOutletData();
  }

  getAllOutletData(){
    this.ngxLoader.startLoader('loader-01');
    // this.posDataService.getAllOutlet().subscribe((res: any)=>{
    //   this.ngxLoader.stopLoader('loader-01');
    //   this.outletData = res['data'];
    //   let success = res['success'];
    //   let msg = res['message'];
    //   if (!success) {
    //     this.alertService.showError(msg);
    //   }
    // });
  }

  openForm(){
    this.modalService.open(OutletFormComponent, { backdrop: 'static', size: 'md', keyboard: true, centered: true }).result.then((result) => {
      this.closeResult = `Closed with: ${result}`;
      if(result){
        this.getAllOutletData();
      }

    }, (reason) => {
      this.closeResult = `Dismissed ${this.getDismissReason(reason)}`;
    });
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

  view(id){
    this.posViewService.setOutletViewId(id);
    this.modalService.open(OutletViewComponent, { backdrop: 'static', size: 'md', keyboard: true, centered: true }).result.then((result) => {
      this.closeResult = `Closed with: ${result}`;
    }, (reason) => {
      this.closeResult = `Dismissed ${this.getDismissReason(reason)}`;
    });
  }


  edit(id){
    this.posEditService.setOutletEditId(id);
    this.modalService.open(OutletEditComponent, { backdrop: 'static', size: 'md', keyboard: true, centered: true }).result.then((result) => {
      this.closeResult = `Closed with: ${result}`;
      if(result){
        this.getAllOutletData();
      }
    }, (reason) => {

      this.closeResult = `Dismissed ${this.getDismissReason(reason)}`;
    });
  }
  onDelete(id) {
    this.ngxLoader.startLoader('loader-01');
   this.posDataService.deleteOutletRow(id).subscribe((res)=>{
    this.ngxLoader.stopLoader('loader-01');
     console.log(res);
     let success = res['success'];
     let msg = res['message'];
     if(success){
      this.getAllOutletData();
       this.alertService.showSuccess('Deleted Successfully');
     }
     else {
       this.alertService.showError(msg);
     }
   });
}
}
