import { BrowserModule } from "@angular/platform-browser";
import { FormsModule, ReactiveFormsModule } from "@angular/forms";
import { NgModule } from "@angular/core";
import { AppRoutingModule } from "./app-routing.module";
import { AppComponent } from "./app.component";
import { AuthLayoutComponent } from "./layouts/auth-layout/auth-layout.component";
import { SharedModule } from "./shared/shared.module";
import { NgSelectModule } from "@ng-select/ng-select";
import { CoreModule } from "./core/core.module";
import { HttpClientModule } from "@angular/common/http";
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { HighchartsChartModule } from 'highcharts-angular';
import { CommonModule } from '@angular/common';
import { CarouselModule } from 'ngx-owl-carousel-o';
import {
  NgxUiLoaderModule,
  NgxUiLoaderHttpModule,
} from "ngx-ui-loader";
import {
  NgbActiveModal,
  NgbDateParserFormatter,
  NgbModule,
} from "@ng-bootstrap/ng-bootstrap";
import { NgbDateCustomParserFormatter } from "././ngb-date-parser-formatter";
import { SharedService } from "@core/services/common/shared.service";
import { environment } from "src/environments/environment";
import { SlickCarouselModule } from "ngx-slick-carousel";
import { PosComponent } from './layouts/pos/pos.component';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { MainPipe } from "@core/services/pos-system/pipes/main-pipe.module";
import { DataTablesModule } from "angular-datatables";
import { InternetStatusComponent } from "@module/pos-admin/pages/InternetStatus/internet-status.component";
//import { TableOrderByQRScanComponent } from "./table-order-by-qr-scan/table-order-by-qr-scan.component";
//import { TableOrderCartComponent } from "./table-order-cart/table-order-cart.component";
import { NotifierModule } from 'angular-notifier';

@NgModule({
  declarations: [
    AppComponent,
    AuthLayoutComponent,
    PosComponent,
    InternetStatusComponent,
   // TableOrderByQRScanComponent,
    //TableOrderCartComponent
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    CarouselModule,
    SharedModule,
    ReactiveFormsModule,
    FormsModule,
    FormsModule,
    NgSelectModule,
    ReactiveFormsModule,
    CoreModule,
    NgxUiLoaderModule,
    NgbModule,
    DataTablesModule,
    NgxUiLoaderHttpModule.forRoot({
      showForeground: true,
      exclude: [environment.apiUrl + "/Notification/GetNotificationsByUserId"],
    }),
    HttpClientModule,
    SlickCarouselModule,
    BrowserAnimationsModule,
    MainPipe,
    MatSlideToggleModule,
    HighchartsChartModule,
    CommonModule,
    NotifierModule.withConfig({
      position: {
        horizontal: { position: 'right' },
        vertical: { position: 'top' }
      },
      theme: 'material',
      behaviour: {
        autoHide: 3000,
        onClick: false,
        onMouseover: 'pauseAutoHide',
        showDismissButton: true,
        stacking: 4
      }
    }),
  ],
  providers: [
    SharedService,
    NgbActiveModal,
    { provide: NgbDateParserFormatter, useClass: NgbDateCustomParserFormatter },
  ],
  bootstrap: [AppComponent],
  exports: [
    MatSlideToggleModule
  ]
})
export class AppModule { }
