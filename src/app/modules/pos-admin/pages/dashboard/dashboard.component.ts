import { Component, Inject, NgZone, OnInit, PLATFORM_ID } from '@angular/core';
import { AlertService } from '@core/services/common/alert.service';
import { PosDataService } from '@core/services/pos-system/pos-data.service';
import { ModalDismissReasons, NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { NgxUiLoaderService } from 'ngx-ui-loader';
import { OutletSelectionComponent } from '../dines-in/outlet-selection/outlet-selection.component';
import { RestaurantSelectionComponent } from '../dines-in/restaurant-selection/restaurant-selection.component';
import { SalesReceiptComponent } from './sales-receipt/sales-receipt.component';
import * as am5 from '@amcharts/amcharts5';
import * as am5percent from "@amcharts/amcharts5/percent";
import am5themes_Animated from '@amcharts/amcharts5/themes/Animated';
import * as am5xy from '@amcharts/amcharts5/xy';
import { isPlatformBrowser } from '@angular/common';
import { FormArray, FormBuilder, FormGroup, Validators } from '@angular/forms';
import * as Highcharts from 'highcharts';
import { OrderListPreviewComponent } from './order-list-preview/order-list-preview.component';
import { DetailedReportComponent } from './detailed-report/detailed-report.component';
import { CommonService } from '@core/services/common/common.service';
import * as am5radar from "@amcharts/amcharts5/radar";

let Boost = require('highcharts/modules/boost');
let noData = require('highcharts/modules/no-data-to-display');
let More = require('highcharts/highcharts-more');

Boost(Highcharts);
noData(Highcharts);
More(Highcharts);
noData(Highcharts);
require('highcharts/modules/networkgraph')(Highcharts);

@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.css']
})

export class DashboardComponent implements OnInit {
  closeResult: string;
  dashboardForm: FormGroup;
  outletId: any;
  outletName: any;
  restaurantView = false;
  dashBoardData: any;
  userData: any;
  private barChartRoot: am5.Root;
  isListShow: boolean = false;
  TodaySalesList: any = {};
  SelectedTodaySalesList: Array<{ customerName: any, orderType: any, orderNo: any, total: any, orderItemStatus: any }> = [];
  SelectedTodaySalesList1: Array<{ customerName: any, orderType: any, orderNo: any, total: any, cardType: any, orderItemStatus: any }> = [];
  TipListForPrint: Array<{ Date: any, OrderNumber: any, InvoiceNo: any, Total: any, TipAmount: any }> = [];
  takeAwayPieChartRoot: am5.Root;
  onlinePieChartRoot: am5.Root;
  dineInPieChartRoot: am5.Root;
  errorHighlightFrom: string;
  errorHighlightTo: string;
  selectedDate: any;
  filterForm: FormGroup;
  expenceList: any;
  totalCover = 0;
  title = 'HighChartNetworkGraph';
  tokenName: string;
  chart: any;
  getListWithoutFilter: any;
  chartData = [];
  chartData1 = [];
  platforms = [];
  debitAmount: any;
  notes: any;
  dashBoardDataFromPrint: any;
  OverAllBalance = 0;
  detailedReportValue: any;

  showDailySalesReport = true;
  showDetailedSalesReport = true;
  userCredential: any;
  totalCustomersCountByOutlet: any;
  isSalesMonthlyFormatActive = false;
  isSalesDailyFormatActive = false;
  isSalesWeeklyFormatActive = false;

  //Order graph
  isOrderDailyFormatActive = false;
  isOrderMonthlyFormatActive = false;
  isOrderWeeklyFormatActive = false;

  //Payment graph
  isPaymentDailyFormatActive = false;
  isPaymentMonthlyFormatActive = false;
  isPaymentWeeklyFormatActive = false;

  selectedFormat: any;
  selectedSalesFormat: any;
  selectedFormatForPayment: any;

  //New graphs
  am5Root!: am5.Root;
  TodayDineinDataNew = [];

  constructor(
    private posDataService: PosDataService,
    private alertService: AlertService,
    private modalService: NgbModal,
    private ngxLoader: NgxUiLoaderService,
    private formBuilder: FormBuilder,
    private fb: FormBuilder,
    public commonService: CommonService,
    @Inject(PLATFORM_ID) private platformId, private zone: NgZone
  ) { }

  async ngOnInit(): Promise<void> {
    this.userCredential = JSON.parse(sessionStorage.getItem('userCredential'));
    this.dashboardForm = this.formBuilder.group({
      fromDate: [''],
      toDate: [''],
      userName: ['']
    });
    this.userData = JSON.parse(sessionStorage.getItem('userCredential'));
    this.outletName = sessionStorage.getItem('activeOutletname');
    this.outletId = sessionStorage.getItem('activeOutletId');
    if (sessionStorage.getItem('Role') == 'Super Admin') {
      this.restaurantView = true;
    }

    //By default get the today's data.
    await this.getAllOrdersByCount(new Date(), new Date());
    //await this.getAllCustomersCountByOutlet();
    let features = JSON.parse(sessionStorage.getItem('RestaurantFeatures'));
    if (features != null) {
      this.showDailySalesReport = features.find(x => x.key == 'SalesReceiptComponent')?.value;
      this.showDetailedSalesReport = features.find(x => x.key == 'DetailedReportComponent')?.value;
    }
    setTimeout(() => {
      this.getDailyOrderGraph(new Date());
      this.getDailyGraph(new Date());
      this.getPaymentDailyGrapgh(new Date());
      //this.getPaymentMonthlyGraph(new Date());

      //Replacement of old graphs to new graphs, 27-05-2025.
      this.getNewSalesCountGraph();
      this.getOrderByStatusSectionGraph();
      this.getSalesValueSectionGraph();
      this.getTotalSalesCoverGraph();
      this.DineIn_Takeaway_Online_BarCharts();
    }, 1000); // Make delay to render the DOM for graph

  }

  addEvent(content) {
    this.modalService.open(content, { ariaLabelledBy: 'modal-basic-title', keyboard: false, windowClass: 'main_add_popup', backdrop: 'static' }).result.then((result) => {

    }, (reason) => {
      console.log(reason);
    });
  }

  createExpence(): FormGroup {
    return this.fb.group({
      expence: ['', Validators.required]
    });
  }
  removeExpence(i) {
    this.expenceList.removeAt(i);
  }


  Openprintview() {
    if (this.selectedDate == null || this.selectedDate == undefined) {
      this.alertService.showError("Please Select Date");
      return;
    }
    this.closeAction();
    sessionStorage.setItem('PrintDate', this.selectedDate);
    this.modalService.open(SalesReceiptComponent, { backdrop: 'static', windowClass: 'main_add_popup sales_report_print_popup', keyboard: true, centered: true }).result.then((result) => {
      this.closeResult = `Closed with: ${result}`;
    }, (reason) => {
      this.closeResult = `Dismissed ${this.getDismissReason(reason)}`;
    });
  }

  detailedReport() {
    sessionStorage.setItem('DatesForDetailedReport', JSON.stringify(this.detailedReportValue));
    this.modalService.open(DetailedReportComponent, { backdrop: 'static', windowClass: 'main_add_popup detailed_report_popup', keyboard: true, centered: true }).result.then((result) => {
      this.closeResult = `Closed with: ${result}`;
    }, (reason) => {
      this.closeResult = `Dismissed ${this.getDismissReason(reason)}`;
    });
  }

  closeAction() {
    if (this.modalService.hasOpenModals) {
      this.modalService.dismissAll();
    }
  }

  SelectedDatefun(event) {
    this.selectedDate = event.target.value;
  }

  getOutletModalView() {
    sessionStorage.setItem('dash', 'dashboard');
    this.modalService.open(OutletSelectionComponent, { backdrop: 'static', size: 'md', keyboard: true, centered: true }).result.then((result) => {
      this.closeResult = `Closed with: ${result}`;
      if (result) {
        this.outletId = sessionStorage.getItem('activeOutletId');
        this.outletName = sessionStorage.getItem('activeOutletname');
      }
    }, (reason) => {
      this.closeResult = `Dismissed ${this.getDismissReason(reason)}`;
    });
  }

  getRestaurantModalView() {
    sessionStorage.setItem('dash', 'dashboard');
    this.modalService.open(RestaurantSelectionComponent, { backdrop: 'static', size: 'md', keyboard: true, centered: true }).result.then((result) => {
      this.closeResult = `Closed with: ${result}`;
      if (result) {
        this.getOutletModalView();
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
  async getAllOrdersByCount(fromDate, toDate) {
    let startDate = this.formatDate(new Date(fromDate));
    let endDate = this.formatDate(new Date(toDate));

    let userData = JSON.parse(sessionStorage.getItem("userCredential"));

    this.ngxLoader.startLoader('loader-01');
    let values = { outletId: this.outletId, toDate: endDate, fromDate: startDate, userId: userData['userId'] };
    await this.posDataService.getFilterOrdersByCount(values).subscribe((response: any) => {
      this.ngxLoader.stopLoader('loader-01');
      console.log(response);
      this.dashBoardData = response['data']
      this.detailedReportValue = values;
      sessionStorage.setItem('GetDashboarddata', JSON.stringify(this.dashBoardData));
      this.posDataService.getOrdersCountForPrint(values).subscribe((response: any) => {
        this.dashBoardDataFromPrint = response['data'];
        this.dashBoardDataFromPrint.allOrders = [...this.dashBoardDataFromPrint.dineInOrders, ...this.dashBoardDataFromPrint.onlineOrders, ...this.dashBoardDataFromPrint.takeAwayOrders];
        sessionStorage.setItem('GetPrintByDateData', JSON.stringify(this.dashBoardDataFromPrint));
      });
      this.PrepareObject();
      //this.chart = Highcharts.chart('container', this.options);
      this.getGraphs();
    });
  }
  browserOnly(f: () => void) {
    if (isPlatformBrowser(this.platformId)) {
      this.zone.runOutsideAngular(() => {
        f();
      });
    }
  }
  receiptModalView() {
    this.modalService.open(SalesReceiptComponent, { backdrop: 'static', size: 'md', keyboard: true, centered: true }).result.then((result) => {
      this.closeResult = `Closed with: ${result}`;
    }, (reason) => {
      this.closeResult = `Dismissed ${this.getDismissReason(reason)}`;
    });
  }

  getGraphs() {
    // this.browserOnly(() => {
    //   if (this.barChartRoot != null) {
    //     this.barChartRoot.dispose();
    //   }
    //   this.barChartRoot = am5.Root.new("todaySalesCountDiv");
    //   let barChartRoot = this.barChartRoot;
    //   barChartRoot.setThemes([am5themes_Animated.new(barChartRoot)]);
    //   let barChartGraph = barChartRoot.container.children.push(
    //     am5xy.XYChart.new(barChartRoot, {
    //       panY: false,
    //       layout: barChartRoot.verticalLayout
    //     })
    //   );
    //   this.CreateVariableAndCreateChartData(barChartGraph, barChartRoot);

    //   let legend = barChartGraph.children.push(am5.Legend.new(barChartRoot, {}));
    //   legend.data.setAll(barChartGraph.series.values);

    //   barChartGraph.set("cursor", am5xy.XYCursor.new(barChartRoot, {}));
    //   this.barChartRoot = barChartRoot;
    // });

    // this.TakeAwayDataAndChart();
    // this.OnlineDataAndChart();
    // this.DineInDataAndChart();
    this.TakeAwaySalesListForPieChart();
  }


  private CreateVariableAndCreateChartData(barChartGraph: am5xy.XYChart, barChartRoot: am5.Root) {
    let { TodaySaleCountdata, TodayTotalSaleCountdata, TodayDineInSaleCountdata, TodayTakeAwaySaleCountdata, TodayOnlineSaleCountdata } = this.PrepairingObject();

    let { xAxis, yAxis } = this.SetXAndYInChart(barChartGraph, barChartRoot, TodaySaleCountdata);

    this.SeriesOne(barChartGraph, barChartRoot, xAxis, yAxis, TodayTotalSaleCountdata);

    this.SeriesTwo(barChartGraph, barChartRoot, xAxis, yAxis, TodayDineInSaleCountdata);

    this.SeriesThree(barChartGraph, barChartRoot, xAxis, yAxis, TodayTakeAwaySaleCountdata);

    this.SeriesFour(barChartGraph, barChartRoot, xAxis, yAxis, TodayOnlineSaleCountdata);
  }

  private TakeAwaySalesListForPieChart() {
    let takeAwaySalesList = [{
      key: "Total Sales By Cash",
      value: this.dashBoardData.todaySalesByCash ? this.dashBoardData.todaySalesByCash : 0
    }, {
      key: "Total Sales By Card",
      value: this.dashBoardData.todaySalesByCard ? this.dashBoardData.todaySalesByCard : 0
    }, {
      key: "Total Sales By Online",
      value: this.dashBoardData.todaySalesByOnline ? this.dashBoardData.todaySalesByOnline : 0
    }];
    let takeAwaySalesPieChartRoot = am5.Root.new("takeAwaySalesPieChartDiv");
    let takeAwaySalesPieChartGraph = takeAwaySalesPieChartRoot.container.children.push(
      am5percent.PieChart.new(takeAwaySalesPieChartRoot, {})
    );
    let takeAwaySalesPieSeries = takeAwaySalesPieChartGraph.series.push(
      am5percent.PieSeries.new(takeAwaySalesPieChartRoot, {
        name: "Series3",
        categoryField: "key",
        valueField: "value"
      })
    );
    takeAwaySalesPieSeries.data.setAll(takeAwaySalesList);
  }

  // private DineInDataAndChart() {
  //   let dineInItemList = this.dashBoardData.dineInItemList;
  //   if (this.dineInPieChartRoot != null) {
  //     this.dineInPieChartRoot.dispose();
  //   }
  //   this.dineInPieChartRoot = am5.Root.new("dineInChartDiv");
  //   let dineInPieChartRoot = this.dineInPieChartRoot;
  //   let dineInpieChartGraph = dineInPieChartRoot.container.children.push(
  //     am5percent.PieChart.new(dineInPieChartRoot, {})
  //   );
  //   let dineInPieSeries = dineInpieChartGraph.series.push(
  //     am5percent.PieSeries.new(dineInPieChartRoot, {
  //       name: "Dine In",
  //       categoryField: "key",
  //       valueField: "value"
  //     })
  //   );
  //   dineInPieSeries.data.setAll(dineInItemList);
  // }

  // private OnlineDataAndChart() {
  //   let onlineItemList = this.dashBoardData.onlineItemList;
  //   if (this.onlinePieChartRoot != null) {
  //     this.onlinePieChartRoot.dispose();
  //   }
  //   this.onlinePieChartRoot = am5.Root.new("onlinePieChartDiv");
  //   let onlinePieChartRoot = this.onlinePieChartRoot;
  //   let onlinePieChartGraph = onlinePieChartRoot.container.children.push(
  //     am5percent.PieChart.new(onlinePieChartRoot, {})
  //   );
  //   let onlinePieSeries = onlinePieChartGraph.series.push(
  //     am5percent.PieSeries.new(onlinePieChartRoot, {
  //       name: "Online",
  //       categoryField: "key",
  //       valueField: "value"
  //     })
  //   );
  //   onlinePieSeries.data.setAll(onlineItemList);
  // }

  // private TakeAwayDataAndChart() {
  //   let takeAwayItemList = this.dashBoardData.takeAwayItemList;
  //   if (this.takeAwayPieChartRoot != null) {
  //     this.takeAwayPieChartRoot.dispose();
  //   }
  //   this.takeAwayPieChartRoot = am5.Root.new("takeAwayPieChartDiv");
  //   let takeAwayPieChartRoot = this.takeAwayPieChartRoot;
  //   let takeAwayPieChartGraph = takeAwayPieChartRoot.container.children.push(
  //     am5percent.PieChart.new(takeAwayPieChartRoot, {})
  //   );
  //   let takeAwayPieSeries = takeAwayPieChartGraph.series.push(
  //     am5percent.PieSeries.new(takeAwayPieChartRoot, {
  //       name: "Take away",
  //       categoryField: "key",
  //       valueField: "value"
  //     })
  //   );
  //   takeAwayPieSeries.data.setAll(takeAwayItemList);
  // }

  private SeriesFour(barChartGraph: am5xy.XYChart, barChartRoot: am5.Root, xAxis: am5xy.CategoryAxis<am5xy.AxisRenderer>, yAxis: am5xy.ValueAxis<am5xy.AxisRenderer>, TodayOnlineSaleCountdata: { category: string; value1: any; }[]) {
    let series4 = barChartGraph.series.push(
      am5xy.ColumnSeries.new(barChartRoot, {
        name: "Online",
        xAxis: xAxis,
        yAxis: yAxis,
        valueYField: "value1",
        categoryXField: "category"
      })
    );
    series4.data.setAll(TodayOnlineSaleCountdata);
  }

  private SeriesThree(barChartGraph: am5xy.XYChart, barChartRoot: am5.Root, xAxis: am5xy.CategoryAxis<am5xy.AxisRenderer>, yAxis: am5xy.ValueAxis<am5xy.AxisRenderer>, TodayTakeAwaySaleCountdata: { category: string; value1: any; }[]) {
    let series3 = barChartGraph.series.push(
      am5xy.ColumnSeries.new(barChartRoot, {
        name: "Take Away",
        xAxis: xAxis,
        yAxis: yAxis,
        valueYField: "value1",
        categoryXField: "category"
      })
    );
    series3.data.setAll(TodayTakeAwaySaleCountdata);
  }

  private SeriesTwo(barChartGraph: am5xy.XYChart, barChartRoot: am5.Root, xAxis: am5xy.CategoryAxis<am5xy.AxisRenderer>, yAxis: am5xy.ValueAxis<am5xy.AxisRenderer>, TodayDineInSaleCountdata: { category: string; value1: any; }[]) {
    let series2 = barChartGraph.series.push(
      am5xy.ColumnSeries.new(barChartRoot, {
        name: "Dine In",
        xAxis: xAxis,
        yAxis: yAxis,
        valueYField: "value1",
        categoryXField: "category"
      })
    );
    series2.data.setAll(TodayDineInSaleCountdata);
  }

  private SeriesOne(barChartGraph: am5xy.XYChart, barChartRoot: am5.Root, xAxis: am5xy.CategoryAxis<am5xy.AxisRenderer>, yAxis: am5xy.ValueAxis<am5xy.AxisRenderer>, TodayTotalSaleCountdata: { category: string; value1: any; }[]) {
    let series1 = barChartGraph.series.push(
      am5xy.ColumnSeries.new(barChartRoot, {
        name: "Total Order",
        xAxis: xAxis,
        yAxis: yAxis,
        valueYField: "value1",
        categoryXField: "category"
      })
    );
    series1.data.setAll(TodayTotalSaleCountdata);
  }

  private SetXAndYInChart(barChartGraph: am5xy.XYChart, barChartRoot: am5.Root, TodaySaleCountdata: { category: string; value1: any; }[]) {
    let yAxis = barChartGraph.yAxes.push(
      am5xy.ValueAxis.new(barChartRoot, {
        renderer: am5xy.AxisRendererY.new(barChartRoot, {})
      })
    );
    let xAxis = barChartGraph.xAxes.push(
      am5xy.CategoryAxis.new(barChartRoot, {
        renderer: am5xy.AxisRendererX.new(barChartRoot, {}),
        categoryField: "category"
      })
    );
    xAxis.data.setAll(TodaySaleCountdata);
    return { xAxis, yAxis };
  }

  private PrepairingObject() {
    let TodaySaleCountdata = [
      {
        category: "Total Order",
        value1: this.dashBoardData.totalOrders ? this.dashBoardData.totalOrders : 0
      },
      {
        category: "Dine In",
        value1: this.dashBoardData.dineIn ? this.dashBoardData.dineIn : 0
      },
      {
        category: "Take-Away",
        value1: this.dashBoardData.walkIn ? this.dashBoardData.walkIn : 0
      },
      {
        category: "Online",
        value1: this.dashBoardData.online ? this.dashBoardData.online : 0
      }
    ];

    let TodayTotalSaleCountdata = [
      {
        category: "Total Order",
        value1: this.dashBoardData.totalOrders ? this.dashBoardData.totalOrders : 0
      }
    ];
    let TodayDineInSaleCountdata = [
      {
        category: "Dine In",
        value1: this.dashBoardData.dineIn ? this.dashBoardData.dineIn : 0
      }
    ];
    let TodayTakeAwaySaleCountdata = [
      {
        category: "Take-Away",
        value1: this.dashBoardData.walkIn ? this.dashBoardData.walkIn : 0
      }
    ];
    let TodayOnlineSaleCountdata = [
      {
        category: "Online",
        value1: this.dashBoardData.online ? this.dashBoardData.online : 0
      }
    ];
    return { TodaySaleCountdata, TodayTotalSaleCountdata, TodayDineInSaleCountdata, TodayTakeAwaySaleCountdata, TodayOnlineSaleCountdata };
  }

  getTodayOrderList(OrderType) {
    this.TodaySalesList = {};
    let modalTitle = this.CheckAndGetProperData(OrderType);
    sessionStorage.setItem('dash', 'dashboard');
    sessionStorage.setItem('orderpreviewList', JSON.stringify(this.TodaySalesList));
    sessionStorage.setItem('modalTitle', JSON.stringify(modalTitle));
    this.LoopDataAndOpenModel();
  }
  private CheckAndGetProperData(OrderType: any) {
    let modalTitle = "Total Sales";
    modalTitle = this.FilterDataFromList1(OrderType);
    modalTitle = this.FilterDataFromList2(OrderType);
    this.FilterDataFromList3(OrderType);
    if (OrderType == "TodayDineInOrderByModifier") {
      this.TodaySalesList = this.dashBoardData ? this.dashBoardData.todayDineInOrderByModifierList : null;
    }
    else if (OrderType == "TodayOnlineOrderByModifier") {
      this.TodaySalesList = this.dashBoardData ? this.dashBoardData.todayOnlineOrderByModifierList : null;
    }
    return modalTitle;
  }

  private FilterDataFromList3(OrderType: any) {
    if (OrderType == "TodayDineInOrderByItem") {
      this.TodaySalesList = this.dashBoardData ? this.dashBoardData.todayDineInByItemList : null;
    }
    else if (OrderType == "TodayOnlineOrderByItem") {
      this.TodaySalesList = this.dashBoardData ? this.dashBoardData.todayOnlineByItemList : null;
    }
    else if (OrderType == "TotalOrderByModifier") {
      this.TodaySalesList = this.dashBoardData ? this.dashBoardData.todayTotalOrderByModifierList : null;
    }
    else if (OrderType == "TodayTakeAwayOrderByModifier") {
      this.TodaySalesList = this.dashBoardData ? this.dashBoardData.todayTakeAwayOrderByModifierList : null;
    }
  }

  private FilterDataFromList2(OrderType: any) {
    let modalTitle = "Total Sales";
    if (OrderType == "RunningOrder") {
      modalTitle = "Running Order";
      this.TodaySalesList = this.dashBoardData ? this.dashBoardData.todayRunningOrderList : null;
    }
    else if (OrderType == "VoidOrder") {
      modalTitle = "Void Order";
      this.TodaySalesList = this.dashBoardData ? this.dashBoardData.todayVoidOrderList : null;
    }
    else if (OrderType == "TodayTotalOrderByItem") {
      this.TodaySalesList = this.dashBoardData ? this.dashBoardData.todayTotalOrderByItemList : null;
    }
    else if (OrderType == "TodayTakeAwayByItem") {
      this.TodaySalesList = this.dashBoardData ? this.dashBoardData.todayTakeAwayByItemList : null;
    }
    return modalTitle;
  }

  private FilterDataFromList1(OrderType: any) {
    let modalTitle = "Total Sales";
    if (OrderType == "TodayTotalOrder" || OrderType == "CompletedOrder") {
      this.TodaySalesList = this.dashBoardData.todayCompletedOrderList;
    }
    else if (OrderType == "TodayTakeAwayOrder") {
      modalTitle = "Take Away Sales";
      this.TodaySalesList = this.dashBoardData ? this.dashBoardData.todayTakeAwaySalesList : null;
    }
    else if (OrderType == "TodayDineOrder") {
      modalTitle = "Dine-In Sales";
      this.TodaySalesList = this.dashBoardData ? this.dashBoardData.todayDineInSalesList : null;
    }
    else if (OrderType == "TodayOnlineOrder") {
      modalTitle = "Online Sales";
      this.TodaySalesList = this.dashBoardData ? this.dashBoardData.todayOnlineSalesList : null;
    }
    return modalTitle;
  }

  private LoopDataAndOpenModel() {
    this.SelectedTodaySalesList = [];
    this.TodaySalesList.forEach(e => {
      this.SelectedTodaySalesList.push({
        "customerName": e.customerName ? e.customerName : null,
        "orderType": e.orderType ? e.orderType : null,
        "orderNo": e.orderNo ? e.orderNo : null,
        "total": e.total ? e.total : null,
        "orderItemStatus": e.orderItemsStatus ? e.orderItemsStatus : null
      });
    });
    sessionStorage.setItem('selectedOrderPreviewList', JSON.stringify(this.SelectedTodaySalesList));
    this.modalService.open(OrderListPreviewComponent, { backdrop: 'static', size: 'lg', keyboard: true, centered: true, windowClass: 'main_add_popup' }).result.then((result) => {
      this.closeResult = `Closed with: ${result}`;
    }, (reason) => {
      this.closeResult = `Dismissed ${this.getDismissReason(reason)}`;
    });
  }

  getOrderViewList(OrderType) {
    this.TodaySalesList = [];
    //let modalTitle = this.CheckDataType(OrderType);
    sessionStorage.setItem('dash', 'dashboard');
    //sessionStorage.setItem('modalTitle', JSON.stringify(modalTitle));

    this.SelectedTodaySalesList1 = [];
    this.LoopDataAndCreateObject(OrderType);
    sessionStorage.setItem('orderpreviewList', JSON.stringify(this.TodaySalesList));
    this.OpenModelWithData(OrderType);
  }

  private OpenModelWithData(OrderType: any) {
    if (OrderType == "Tip") {
      let obj = {
        "Date": '',
        "OrderNumber": '',
        "InvoiceNo": '',
        "Total": 'Total Tip :',
        "TipAmount": Number(this.dashBoardDataFromPrint?.totalTip),
      };
      this.TipListForPrint.push(obj);
    }
    this.CheckOrderTypeAndOpenModel(OrderType);
  }

  private CheckOrderTypeAndOpenModel(OrderType: any) {
    if (OrderType != "Tip")
      sessionStorage.setItem('selectedOrderPreviewList', JSON.stringify(this.SelectedTodaySalesList1));
    else
      sessionStorage.setItem('selectedOrderPreviewList', JSON.stringify(this.TipListForPrint));

    this.modalService.open(OrderListPreviewComponent, { backdrop: 'static', size: 'lg', keyboard: true, centered: true, windowClass: 'main_add_popup' }).result.then((result) => {
      this.closeResult = `Closed with: ${result}`;
    }, (reason) => {
      this.closeResult = `Dismissed ${this.getDismissReason(reason)}`;
    });
  }

  private LoopDataAndCreateObject(OrderType: any) {
    //Distinct the payment modes and display the corresponding payment details.
    let array = [];
    for (let i = 0; i < this.dashBoardData.totalSalesList.length; i++) {
      let paymentBrackage = this.dashBoardData.totalSalesList[i].paymentBreakage;
      if (paymentBrackage.length != 0) {
        if (paymentBrackage.some(x => x.paymentMode == OrderType)) {
          let getPaymentModeItem = paymentBrackage?.filter(payment => payment.paymentMode === OrderType);
          let sum = getPaymentModeItem.reduce((sum, item) => sum + item.amount, 0);
          let obj = {
            paymentMode: OrderType,
            totalSum: sum
          }
          array.push(obj);
          this.dashBoardData.totalSalesList[i].dynamicPaymentsList = array;
          this.TodaySalesList.push(this.dashBoardData.totalSalesList[i]);
        }
      }
    }

    this.TodaySalesList.forEach(e => {
      if (OrderType != "Tip") {
        this.PushToObject(e);
      } else {
        this.TipListForPrint.push({
          "Date": e.createdOn ? e.createdOn.split('T')[0] : null,
          "OrderNumber": e.orderNo ? e.orderNo : null,
          "InvoiceNo": e.invoiceNo ? e.invoiceNo : null,
          "Total": e.total ? e.total : 0,
          "TipAmount": e.tipAmount ? e.tipAmount : 0,
        });
      }
    });
    console.log("Total sales list", this.TodaySalesList);
  }

  private PushToObject(e: any) {
    this.SelectedTodaySalesList1.push({
      "customerName": e.customerName ? e.customerName : null,
      "orderType": e.orderType ? e.orderType : null,
      "orderNo": e.orderNo ? e.orderNo : null,
      "total": e.total ? e.total : null,
      "cardType": e.paymentBreakage[0]?.cardType ? e.paymentBreakage[0]?.cardType : e.paymentBreakage[0].paymentMode,
      "orderItemStatus": e.orderItemsStatus ? e.orderItemsStatus : null
    });
    console.log("check", this.SelectedTodaySalesList1)
  }

  private CheckDataType(OrderType: any,) {
    let modalTitle = this.SplitedCondition(OrderType);
    if (OrderType == 'TodayOrderByWallet') {
      modalTitle = "By Wallet";
      this.TodaySalesList = this.dashBoardData ? this.dashBoardDataFromPrint.paiedByWalletOrders : null;
    } else if (OrderType == 'TodayOnlineOrderValue') {
      modalTitle = "Online Sales";
      this.TodaySalesList = this.dashBoardData ? this.dashBoardData.paiedByOnlineOrders : null;
    }
    return modalTitle;
  }

  private SplitedCondition(OrderType: any) {
    let modalTitle = "";
    if (OrderType == "TodayOrderByCard") {
      modalTitle = "By Card";
      this.TodaySalesList = this.dashBoardData ? this.dashBoardData.paiedByCardOrders : null;
    } else if (OrderType == "TodayByCash") {
      modalTitle = "By Cash";
      this.TodaySalesList = this.dashBoardData ? this.dashBoardData.paiedByCashOrders : null;
    } else if (OrderType == "Tip") {
      modalTitle = "Tip";
      this.TodaySalesList = this.dashBoardDataFromPrint.gotTipOrders;
    } else if (OrderType == 'TodayByTapAndGo') {
      modalTitle = "By TapAndGo";
      this.TodaySalesList = this.dashBoardData ? this.dashBoardData.paiedByTapAndGoOrders : null;
    }
    return modalTitle;
  }

  getDashboardData() {
    if (this.dashboardForm.invalid) {
      this.alertService.showError('Fields are empty');
    } else {
      let toDate = this.dashboardForm.get('toDate').value ? this.dashboardForm.get('toDate').value : null;
      let fromDate = this.dashboardForm.get('fromDate').value ? this.dashboardForm.get('fromDate').value : null;
      this.CheckValidation(toDate, fromDate);
      this.getAllOrdersByCount(fromDate, toDate);

      //If filter is applied, then display the data via monthly graph.
      setTimeout(() => {
        this.graphForOrderSummary(new Date(fromDate));
        this.graphForSalesSummary(new Date(fromDate));
        this.getPaymentMonthlyGraph();

        //Replacement of old graphs to new graphs, 27-05-2025.
        this.getNewSalesCountGraph();
        this.getOrderByStatusSectionGraph();
        this.getSalesValueSectionGraph();
        this.getTotalSalesCoverGraph();
        this.DineIn_Takeaway_Online_BarCharts();
      }, 2000); // Make delay to let the DOM render
    }
  }


  private CheckValidation(toDate: any, fromDate: any) {
    if (toDate == null || fromDate == null) {
      if (fromDate == null) {
        this.errorHighlightFrom = "border : 1px solid red";
        this.errorHighlightTo = "";
      }
      else {
        this.errorHighlightTo = "border : 1px solid red";
        this.errorHighlightFrom = "";
      }
      this.alertService.showError('Fields are empty');
    }
    else {
      this.errorHighlightFrom = "";
      this.errorHighlightTo = "";
    }
  }

  PrepareObject() {
    let date = this.dashBoardData.todayDineInSalesList.map(x => x.createdOn.split('T')[0]);
    let uniquedate = [...new Set(date)];

    let TodayDineinData = [];
    uniquedate.forEach(eleDate => {
      let orders = this.dashBoardData.todayDineInSalesList.filter(x => x.createdOn.split('T')[0] == eleDate);

      if (orders != null || orders.length != 0) {
        let sum = 0;
        let persons = 0;
        orders.forEach(odr => {
          sum = sum + odr.total;
          persons = Number(persons) + Number(odr.numberOfPeople) == 0 ? 1 : Number(persons) + Number(odr.numberOfPeople);
        });

        let obj = {
          category: eleDate,
          value1: Number(sum) / Number(persons)
        };
        TodayDineinData.push(obj);
        this.totalCover = this.totalCover + persons;
      }
    });

    this.chartData = [];
    this.options.xAxis.categories = [];
    if (TodayDineinData.length == 1) {
      let object = [TodayDineinData[0].category, Number(TodayDineinData[0].value1.toFixed(2))];
      this.chartData.push(object);
      this.options.xAxis.categories.push(TodayDineinData[0].category);
    } else {
      TodayDineinData.forEach(e => {
        let object = [e.category, Number(e.value1.toFixed(2))];
        this.chartData.push(object);
        this.options.xAxis.categories.push(e.category);
      });
    }
    this.TodayDineinDataNew = TodayDineinData;
    console.log("this.TodayDineinDataNew", this.TodayDineinDataNew)


    let minVal = Math.min(...TodayDineinData.map(x => x.value1));
    this.options.yAxis.min = minVal - minVal * 2 / 100;
    this.options.series[0].data = this.chartData;
  }

  options: any = {
    chart: {
      type: 'line',
    },
    title: {
      text: "Total Revenue Per Cover",
    },
    xAxis: {
      categories: [],
      title: {
        text: null,
      },
    },
    yAxis: {
      min: 0,
      title: {
        text: 'Amount',
        align: 'high',
      },
      labels: {
        overflow: 'justify',
      },
      stackLabels: {
        style: {
          color: '#000000',
          fontWeight: 'bold'
        },
        enabled: true,
        verticalAlign: 'top'
      }
    },
    tooltip: {
      valuePrefix: '',
    },
    plotOptions: {
      bar: {
        dataLabels: {
          enabled: true,
        },
      },
      column: {
        stacking: 'normal',
        dataLabels: {
          enabled: false
        }
      }
    },
    credits: {
      enabled: false,
    },
    series: [
      {
        name: 'Amount',
        data: [],
      },
    ],
  };


  // async getAllCustomersCountByOutlet() {
  //   this.ngxLoader.startLoader('loader-01');
  //   await this.posDataService.getAllCustomersCountByOutlet(this.outletId).subscribe((res: any) => {
  //     this.ngxLoader.stopLoader('loader-01');
  //     let Data = res['data'];
  //     let success = res['success'];
  //     let msg = res['message'];
  //     if (success) {
  //       this.totalCustomersCountByOutlet = Data;
  //     } else {
  //       this.alertService.showError(msg);
  //     }
  //   });
  // }

  selectFormat(type) {
    switch (type) {
      case 1: //If filter date os not selected, then user clicks on monthly. Display based on current month data

        const today = new Date();
        // Start of the current month (set the date to 1)
        const startDate = new Date(today.getFullYear(), 0, 1);
        // End of the current month (set the date to 0 of the next month)
        const endDate = new Date(today.getFullYear(), today.getMonth() + 1, 0);

        this.getAllOrdersByCount(startDate, endDate);
        this.graphForSalesSummary(new Date());
        this.selectedSalesFormat = 1;
        break;
      case 2: //Week
        let todayForWeek = new Date();
        const previous7thDay = new Date(todayForWeek);
        previous7thDay.setDate(todayForWeek.getDate() - 7);

        this.getAllOrdersByCount(previous7thDay, new Date())
        //this.getWeeklySalesGraph(new Date());
        break;
      case 3: //Day
        this.getAllOrdersByCount(new Date(), new Date())
        this.getDailyGraph(new Date());
        this.selectedSalesFormat = 3;
        break;
    }
  }
  selectFormatForOrder(type, category) {
    switch (type) {
      case 1: //If filter date os not selected, then user clicks on monthly. Display based on current month data

        this.selectedFormat = 1;
        const today = new Date();
        // Start of the current month (set the date to 1)
        const startDate = new Date(today.getFullYear(), 0, 1);
        // End of the current month (set the date to 0 of the next month)
        const endDate = new Date(today.getFullYear(), today.getMonth() + 1, 0);
        this.getAllOrdersByCount(startDate, endDate)


        if (category == "payment") {
          this.getPaymentMonthlyGraph();
          this.selectedFormatForPayment = 1;
        } else {
          this.graphForOrderSummary(new Date());
          this.selectedFormat = 1;
        }
        break;

      case 2: //Week
        //this.getWeeklySalesGraph();
        this.selectedFormat = 2;
        break;

      case 3: //Day
        this.getAllOrdersByCount(new Date(), new Date())
        if (category == "payment") {
          this.getPaymentDailyGrapgh(new Date());
          this.selectedFormatForPayment = 3;
        } else {
          this.getDailyOrderGraph(new Date());
          this.selectedFormat = 3;
        }

        break;
    }
  }

  graphForOrderSummary(selectedDateForGraph) {

    this.isOrderDailyFormatActive = false;
    this.isOrderMonthlyFormatActive = true;
    this.isOrderWeeklyFormatActive = false;

    /* Chart code Monthly wise with Manual Data */

    // Dispose existing root if present
    if (am5.registry.rootElements.length) {
      am5.registry.rootElements.forEach(function (root) {
        if (root.dom.id === "chartdiv") {
          root.dispose();
        }
      });
    }

    // Create root element
    let root = am5.Root.new("chartdiv");

    // Set themes
    root.setThemes([am5themes_Animated.new(root)]);

    // Create chart
    let chart = root.container.children.push(am5xy.XYChart.new(root, {
      panX: false,
      panY: false,
      pinchZoomX: false,
      paddingLeft: 0
    }));

    // Add cursor
    let cursor = chart.set("cursor", am5xy.XYCursor.new(root, {
      behavior: "none"
    }));
    cursor.lineY.set("visible", false);

    //Prepare Data object
    let obj = [];
    let monthObj = [{
      monthName: 'Jan',
      monthNum: 1,
      value: 0
    },
    {
      monthName: 'Feb',
      monthNum: 2,
      value: 0
    },
    {
      monthName: 'Mar',
      monthNum: 3,
      value: 0
    },
    {
      monthName: 'Apr',
      monthNum: 4,
      value: 0
    },
    {
      monthName: 'May',
      monthNum: 5,
      value: 0
    },
    {
      monthName: 'June',
      monthNum: 6,
      value: 0
    },
    {
      monthName: 'July',
      monthNum: 7,
      value: 0
    },
    {
      monthName: 'Aug',
      monthNum: 8,
      value: 0
    },
    {
      monthName: 'Sep',
      monthNum: 9,
      value: 0
    },
    {
      monthName: 'Oct',
      monthNum: 10,
      value: 0
    },
    {
      monthName: 'Nov',
      monthNum: 11,
      value: 0
    },
    {
      monthName: 'Dec',
      monthNum: 12,
      value: 0
    }
    ]

    /*Logic to display data-Start */
    let dashBoardData = JSON.parse(sessionStorage.getItem("GetDashboarddata"));
    for (let i = 0; i < dashBoardData.totalSalesList.length; i++) {
      if (dashBoardData.totalSalesList[i].orderStatus == 'Completed') {
        let getOrderDetail = dashBoardData.totalSalesList[i];
        let getOrderDate = new Date(getOrderDetail.createdOn);

        let Indx = monthObj.findIndex(x => x.monthNum == (getOrderDate.getMonth() + 1));
        monthObj[Indx].value += getOrderDetail.total;
      }
    }

    let data = [];
    for (let i = 0; i < monthObj.length; i++) {
      let json = {
        // date: new Date(2025, (monthObj[i].monthNum - 1), 1).getTime(),
        date: new Date(selectedDateForGraph.getFullYear(), (monthObj[i].monthNum - 1), 1).getTime(),
        value: monthObj[i].value
      }
      data.push(json);
    }
    /*Logic to display data-End */

    // Create axes
    let xAxis = chart.xAxes.push(am5xy.DateAxis.new(root, {
      maxDeviation: 0.5,
      baseInterval: {
        timeUnit: "month",
        count: 1
      },
      renderer: am5xy.AxisRendererX.new(root, {
        minGridDistance: 40
      }),
      tooltip: am5.Tooltip.new(root, {})
    }));

    xAxis.get("renderer").labels.template.setAll({
      forceHidden: false,
      rotation: 0
    });

    let yAxis = chart.yAxes.push(am5xy.ValueAxis.new(root, {
      maxDeviation: 1,
      min: 0,
      strictMinMax: true,
      renderer: am5xy.AxisRendererY.new(root, {
        minGridDistance: 50
      })
    }));

    // Add series
    let series = chart.series.push(am5xy.SmoothedXLineSeries.new(root, {
      name: "Sales",
      xAxis: xAxis,
      yAxis: yAxis,
      valueYField: "value",
      valueXField: "date",
      tooltip: am5.Tooltip.new(root, {
        labelText: "{valueY}"
      })
    }));

    series.fills.template.setAll({
      visible: true,
      fillOpacity: 0.3
    });

    series.bullets.push(function () {
      return am5.Bullet.new(root, {
        locationY: 0,
        sprite: am5.Circle.new(root, {
          radius: 4,
          stroke: am5.color(0x0075FF),
          strokeWidth: 2,
          fill: am5.color(0x0075FF)
        })
      });
    });

    // Add scrollbar
    // chart.set("scrollbarX", am5.Scrollbar.new(root, {
    //   orientation: "horizontal"
    // }));

    // Set manual data
    series.data.setAll(data);

    // Animate on load
    series.appear(1000);
    chart.appear(1000, 100);

  }

  getDailyOrderGraph(selectedDate) {
    this.isOrderDailyFormatActive = true;
    this.isOrderMonthlyFormatActive = false;
    this.isOrderWeeklyFormatActive = false;

    // Dispose existing root if present
    if (am5.registry.rootElements.length) {
      am5.registry.rootElements.forEach(function (root) {
        if (root.dom.id === "chartdivOrderDaily") {
          root.dispose();
        }
      });
    }

    /* Chart code for Current Day with Manual Data */

    // Create root element
    let root = am5.Root.new("chartdivOrderDaily");

    // Set themes
    root.setThemes([am5themes_Animated.new(root)]);

    // Create chart
    let chart = root.container.children.push(am5xy.XYChart.new(root, {
      panX: false,
      panY: false,
      pinchZoomX: false,
      paddingLeft: 0
    }));

    // Add cursor
    let cursor = chart.set("cursor", am5xy.XYCursor.new(root, {
      behavior: "none"
    }));
    cursor.lineY.set("visible", false);

    // Manual data for current day
    let data = [{ date: selectedDate.getTime(), value: this.dashBoardData.totalOrderValue }];

    // Create axes
    let xAxis = chart.xAxes.push(am5xy.DateAxis.new(root, {
      maxDeviation: 0.5,
      baseInterval: {
        timeUnit: "day",
        count: 1
      },
      renderer: am5xy.AxisRendererX.new(root, {
        minGridDistance: 40
      }),
      tooltip: am5.Tooltip.new(root, {})
    }));

    xAxis.get("renderer").labels.template.setAll({
      forceHidden: false,
      rotation: 0
    });

    let yAxis = chart.yAxes.push(am5xy.ValueAxis.new(root, {
      maxDeviation: 1,
      min: 0,
      strictMinMax: true,
      renderer: am5xy.AxisRendererY.new(root, {
        minGridDistance: 50
      })
    }));

    // Add series
    let series = chart.series.push(am5xy.SmoothedXLineSeries.new(root, {
      name: "Sales",
      xAxis: xAxis,
      yAxis: yAxis,
      valueYField: "value",
      valueXField: "date",
      tooltip: am5.Tooltip.new(root, {
        labelText: "{valueY}"
      })
    }));

    series.fills.template.setAll({
      visible: true,
      fillOpacity: 0.3
    });

    series.bullets.push(function () {
      return am5.Bullet.new(root, {
        locationY: 0,
        sprite: am5.Circle.new(root, {
          radius: 4,
          stroke: root.interfaceColors.get("background"),
          strokeWidth: 2,
          fill: series.get("fill")
        })
      });
    });

    // Add scrollbar
    // chart.set("scrollbarX", am5.Scrollbar.new(root, {
    //   orientation: "horizontal"
    // }));

    // Set manual data
    series.data.setAll(data);

    // Animate on load
    series.appear(1000);
    chart.appear(1000, 100);

  }

  /*Sales Summary graph */
  graphForSalesSummary(selectedDateForGraph) {
    this.isSalesDailyFormatActive = false;
    this.isSalesMonthlyFormatActive = true;
    this.isSalesWeeklyFormatActive = false;
    /* Chart code Monthly wise with Manual Data */

    // Dispose existing root if present
    if (am5.registry.rootElements.length) {
      am5.registry.rootElements.forEach(function (root) {
        if (root.dom.id === "chartdivsales") {
          root.dispose();
        }
      });
    }

    // Create root element
    let root = am5.Root.new("chartdivsales");

    // Set themes
    root.setThemes([am5themes_Animated.new(root)]);

    // Create chart
    let chart = root.container.children.push(am5xy.XYChart.new(root, {
      panX: false,
      panY: false,
      paddingLeft: 0
    }));

    root._logo?.dispose();


    // Add cursor
    let cursor = chart.set("cursor", am5xy.XYCursor.new(root, {
      behavior: "none"
    }));
    cursor.lineY.set("visible", false);

    //Prepare Data object
    let obj = [];
    let monthObj = [{
      monthName: 'Jan',
      monthNum: 1,
      value: 0
    },
    {
      monthName: 'Feb',
      monthNum: 2,
      value: 0
    },
    {
      monthName: 'Mar',
      monthNum: 3,
      value: 0
    },
    {
      monthName: 'Apr',
      monthNum: 4,
      value: 0
    },
    {
      monthName: 'May',
      monthNum: 5,
      value: 0
    },
    {
      monthName: 'June',
      monthNum: 6,
      value: 0
    },
    {
      monthName: 'July',
      monthNum: 7,
      value: 0
    },
    {
      monthName: 'Aug',
      monthNum: 8,
      value: 0
    },
    {
      monthName: 'Sep',
      monthNum: 9,
      value: 0
    },
    {
      monthName: 'Oct',
      monthNum: 10,
      value: 0
    },
    {
      monthName: 'Nov',
      monthNum: 11,
      value: 0
    },
    {
      monthName: 'Dec',
      monthNum: 12,
      value: 0
    }
    ]

    /*Logic to display data-Start */
    let dashBoardData = JSON.parse(sessionStorage.getItem("GetDashboarddata"));
    for (let i = 0; i < dashBoardData.totalSalesList.length; i++) {
      if (dashBoardData.totalSalesList[i].orderStatus == 'Completed') {
        let getOrderDetail = dashBoardData.totalSalesList[i];
        let getOrderDate = new Date(getOrderDetail.createdOn);

        let Indx = monthObj.findIndex(x => x.monthNum == (getOrderDate.getMonth() + 1));
        //monthObj[Indx].value = dashBoardData.totalOrders;
        monthObj[Indx].value += 1;
      }
    }

    let data = [];
    for (let i = 0; i < monthObj.length; i++) {
      let json = {
        date: new Date(selectedDateForGraph.getFullYear(), (monthObj[i].monthNum - 1), 1).getTime(),
        value: monthObj[i].value
      }
      data.push(json);
    }
    /*Logic to display data-End */

    // Create axes
    let xAxis = chart.xAxes.push(am5xy.DateAxis.new(root, {
      maxDeviation: 1,
      baseInterval: {
        timeUnit: "month",
        count: 1
      },
      renderer: am5xy.AxisRendererX.new(root, {
        minGridDistance: 40
      }),
      tooltip: am5.Tooltip.new(root, {})
    }));

    xAxis.get("renderer").labels.template.setAll({
      forceHidden: false,
      rotation: 0
    });

    let yAxis = chart.yAxes.push(am5xy.ValueAxis.new(root, {
      maxDeviation: 1,
      min: 0,
      strictMinMax: true,
      renderer: am5xy.AxisRendererY.new(root, {
        minGridDistance: 20
      })
    }));

    // Add series
    let series = chart.series.push(am5xy.SmoothedXLineSeries.new(root, {
      name: "Sales",
      xAxis: xAxis,
      yAxis: yAxis,
      valueYField: "value",
      valueXField: "date",
      tooltip: am5.Tooltip.new(root, {
        labelText: "{valueY}"
      })
    }));


    // Change Fill (Graph Area) Color
    series.fills.template.setAll({
      visible: true,
      fill: am5.color(0xff5733), // Light Red-Orange
      fillOpacity: 0.2 // Adjust transparency
    });

    // Change Plot Container Background
    chart.plotContainer.set("background", am5.Rectangle.new(root, {
      fill: am5.color(0xffffff), // White background
      fillOpacity: 1
    }));

    // Remove Any Default Chart Background
    chart.set("background", am5.Rectangle.new(root, {
      fill: am5.color(0xffffff), // White or Transparent
      fillOpacity: 0
    }));


    series.fills.template.setAll({
      visible: true,
      stroke: am5.color(0x0075FF),
      strokeWidth: 1,
      fillOpacity: 0.3
    });

    series.bullets.push(function () {
      return am5.Bullet.new(root, {
        locationY: 0,
        sprite: am5.Circle.new(root, {
          radius: 4,
          stroke: am5.color(0x0075FF),
          strokeWidth: 2,
          fill: am5.color(0x0075FF)
        })
      });
    });

    // Add scrollbar
    // chart.set("scrollbarX", am5.Scrollbar.new(root, {
    //   orientation: "horizontal"
    // }));

    // Set manual data
    series.data.setAll(data);

    // Animate on load
    series.appear(1000);
    chart.appear(1000, 100);

  }
  getDailyGraph(selectedDate) {
    this.isSalesDailyFormatActive = true;
    this.isSalesMonthlyFormatActive = false;
    this.isSalesWeeklyFormatActive = false;

    /* Chart code for Current Day with Manual Data */

    // Dispose existing root if present
    if (am5.registry.rootElements.length) {
      am5.registry.rootElements.forEach(function (root) {
        if (root.dom.id === "chartdivsalesDaily") {
          root.dispose();
        }
      });
    }

    // Create root element
    let root = am5.Root.new("chartdivsalesDaily");

    // Set themes
    root.setThemes([am5themes_Animated.new(root)]);

    // Create chart
    let chart = root.container.children.push(am5xy.XYChart.new(root, {
      panX: false,
      panY: false,
      pinchZoomX: false,
      paddingLeft: 0
    }));
    root._logo?.dispose();

    // Add cursor
    let cursor = chart.set("cursor", am5xy.XYCursor.new(root, {
      behavior: "none"
    }));
    cursor.lineY.set("visible", false);

    // Manual data for current day
    let currentDate = new Date();
    //let data = [{ date: currentDate.getTime(), value: Math.floor(Math.random() * 200) + 100 }];
    let data = [{ date: selectedDate.getTime(), value: this.dashBoardDataFromPrint.totalCompletedOrders }];

    // Create axes
    let xAxis = chart.xAxes.push(am5xy.DateAxis.new(root, {
      maxDeviation: 0.5,
      baseInterval: {
        timeUnit: "day",
        count: 1
      },
      renderer: am5xy.AxisRendererX.new(root, {
        minGridDistance: 40
      }),
      tooltip: am5.Tooltip.new(root, {})
    }));

    xAxis.get("renderer").labels.template.setAll({
      forceHidden: false,
      rotation: 0
    });

    let yAxis = chart.yAxes.push(am5xy.ValueAxis.new(root, {
      maxDeviation: 1,
      min: 0,
      strictMinMax: true,
      renderer: am5xy.AxisRendererY.new(root, {
        minGridDistance: 50
      })
    }));

    // Add series
    let series = chart.series.push(am5xy.SmoothedXLineSeries.new(root, {
      name: "Sales",
      xAxis: xAxis,
      yAxis: yAxis,
      valueYField: "value",
      valueXField: "date",
      tooltip: am5.Tooltip.new(root, {
        labelText: "{valueY}"
      })
    }));

    series.fills.template.setAll({
      visible: true,
      fillOpacity: 0.3
    });

    series.bullets.push(function () {
      return am5.Bullet.new(root, {
        locationY: 0,
        sprite: am5.Circle.new(root, {
          radius: 4,
          stroke: root.interfaceColors.get("background"),
          strokeWidth: 2,
          fill: series.get("fill")
        })
      });
    });

    // Add scrollbar
    // chart.set("scrollbarX", am5.Scrollbar.new(root, {
    //   orientation: "horizontal"
    // }));

    // Set manual data
    series.data.setAll(data);

    // Animate on load
    series.appear(1000);
    chart.appear(1000, 100);

  }

  // getWeeklySalesGraph(selectedDate) {
  //   this.isSalesDailyFormatActive = false;
  //   this.isSalesMonthlyFormatActive = false;
  //   this.isSalesWeeklyFormatActive = true;
  //   /* Chart code for Current Week with Manual Data */

  //   // Dispose existing root if present
  //   if (am5.registry.rootElements.length) {
  //     am5.registry.rootElements.forEach(function (root) {
  //       if (root.dom.id === "chartdivWeeklySales") {
  //         root.dispose();
  //       }
  //     });
  //   }

  //   // Create root element
  //   let root = am5.Root.new("chartdivWeeklySales");

  //   // Set themes
  //   root.setThemes([am5themes_Animated.new(root)]);

  //   // Create chart
  //   let chart = root.container.children.push(am5xy.XYChart.new(root, {
  //     panX: true,
  //     panY: true,
  //     wheelX: "panX",
  //     wheelY: "zoomX",
  //     pinchZoomX: true,
  //     paddingLeft: 0
  //   }));

  //   // Add cursor
  //   let cursor = chart.set("cursor", am5xy.XYCursor.new(root, {
  //     behavior: "none"
  //   }));
  //   cursor.lineY.set("visible", false);

  //   // Manual data for current week with weekdays
  //   let weekDays = [
  //     {
  //       week: 0,//"Sunday",
  //       salesValue: 0,
  //       createdDate: "",
  //     },
  //     {
  //       week: 1,//"Monday",
  //       salesValue: 0,
  //       createdDate: "",
  //     },
  //     {
  //       week: 2, //"Tuesday",
  //       salesValue: 0,
  //       createdDate: "",
  //     },
  //     {
  //       week: 3, //"Wed",
  //       salesValue: 0,
  //       createdDate: "",
  //     },
  //     {
  //       week: 4, //"Thursday",
  //       salesValue: 0,
  //       createdDate: "",
  //     },
  //     {
  //       week: 5, //"Fri",
  //       salesValue: 0,
  //       createdDate: "",
  //     },
  //     {
  //       week: 6, //"Sat",
  //       salesValue: 0,
  //       createdDate: "",
  //     }
  //   ]
  //   /*Logic to display data-Start */
  //   let dashBoardData = JSON.parse(sessionStorage.getItem("GetDashboarddata"));
  //   for (let i = 0; i < dashBoardData.totalSalesList.length; i++) {
  //     if (dashBoardData.totalSalesList[i].orderStatus == 'Completed') {
  //       let getOrderDetail = dashBoardData.totalSalesList[i];
  //       let getOrderDate = new Date(getOrderDetail.createdOn);
  //       let Indx = weekDays.findIndex(x => x.week == (getOrderDate.getDay()));
  //       weekDays[Indx].salesValue += 1;
  //       weekDays[Indx].createdDate = getOrderDetail.createdOn;
  //     }
  //   }
  //   console.log("week", weekDays);
  //   let abhi = [
  //     {
  //       "week": 0,
  //       "salesValue": 0,
  //       "createdDate": ""
  //     },
  //     {
  //       "week": 1,
  //       "salesValue": 1,
  //       "createdDate": "2025-03-03"
  //     },
  //     {
  //       "week": 2,
  //       "salesValue": 1,
  //       "createdDate": "2025-02-25"
  //     },
  //     {
  //       "week": 3,
  //       "salesValue": 0,
  //       "createdDate": "2025-03-03"
  //     },
  //     {
  //       "week": 4,
  //       "salesValue": 0,
  //       "createdDate": ""
  //     },
  //     {
  //       "week": 5,
  //       "salesValue": 2,
  //       "createdDate": "2025-02-28"
  //     },
  //     {
  //       "week": 6,
  //       "salesValue": 0,
  //       "createdDate": ""
  //     }
  //   ]

  //   let data = [];
  //   let temp = []
  //   for (let k = 0; k < 7; k++) {
  //     let currentdate = new Date();
  //     currentdate.setDate(selectedDate.getDate() - k);
  //     let js = {
  //       date: this.formatDate(currentdate),
  //       salesValue: 0
  //     }
  //     temp.push(js);
  //   }
  //   console.log("temp ", temp);


  //   for (let i = 0; i < abhi.length; i++) {
  //     let date = new Date();

  //     //new logic
  //     if (abhi[i].createdDate != "") {
  //       let convertDate = this.formatDate(new Date(abhi[i].createdDate));
  //       let index = temp.findIndex(x => x.date == convertDate);
  //       temp[index].salesValue += abhi[i].salesValue

  //     }
  //     //new logic

  //   }

  //   for (let i = 0; i < temp.length; i++) {
  //     let date = new Date();
  //     date.setDate(selectedDate.getDate() - i);
  //     data.push({ date: new Date(temp[i].date).getTime(), value: temp[i].salesValue });
  //   }


  //   data.reverse();

  //   // Create axes
  //   let xAxis = chart.xAxes.push(am5xy.DateAxis.new(root, {
  //     maxDeviation: 0.5,
  //     baseInterval: {
  //       timeUnit: "day",
  //       count: 1
  //     },
  //     renderer: am5xy.AxisRendererX.new(root, {
  //       minGridDistance: 40
  //     }),
  //     tooltip: am5.Tooltip.new(root, {})
  //   }));

  //   xAxis.get("renderer").labels.template.setAll({
  //     forceHidden: false,
  //     rotation: 0
  //   });

  //   let yAxis = chart.yAxes.push(am5xy.ValueAxis.new(root, {
  //     maxDeviation: 1,
  //     min: 0,
  //     strictMinMax: true,
  //     renderer: am5xy.AxisRendererY.new(root, {
  //       minGridDistance: 50
  //     })
  //   }));

  //   // Add series
  //   let series = chart.series.push(am5xy.SmoothedXLineSeries.new(root, {
  //     name: "Sales",
  //     xAxis: xAxis,
  //     yAxis: yAxis,
  //     valueYField: "value",
  //     valueXField: "date",
  //     tooltip: am5.Tooltip.new(root, {
  //       labelText: "{valueY}"
  //     })
  //   }));

  //   series.fills.template.setAll({
  //     visible: true,
  //     fillOpacity: 0.3
  //   });

  //   series.bullets.push(function () {
  //     return am5.Bullet.new(root, {
  //       locationY: 0,
  //       sprite: am5.Circle.new(root, {
  //         radius: 4,
  //         stroke: root.interfaceColors.get("background"),
  //         strokeWidth: 2,
  //         fill: series.get("fill")
  //       })
  //     });
  //   });

  //   // Add scrollbar
  //   chart.set("scrollbarX", am5.Scrollbar.new(root, {
  //     orientation: "horizontal"
  //   }));

  //   // Set manual data
  //   series.data.setAll(data);

  //   // Animate on load
  //   series.appear(1000);
  //   chart.appear(1000, 100);

  // }

  formatDate(date) {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');

    return `${year}-${month}-${day}`;
  }

  getPaymentDailyGrapgh(selectedDate) {
    this.isPaymentDailyFormatActive = true;
    this.isPaymentMonthlyFormatActive = false;
    this.isPaymentWeeklyFormatActive = false;

    /* Chart code */
    // Dispose existing root if present
    if (am5.registry.rootElements.length) {
      am5.registry.rootElements.forEach(function (root) {
        if (root.dom.id === "chartdivDailyPayments") {
          root.dispose();
        }
      });
    }

    // Create root element
    let root = am5.Root.new("chartdivDailyPayments");
    root._logo.dispose();

    // Set themes
    root.setThemes([
      am5themes_Animated.new(root)
    ]);

    // Create chart
    let chart = root.container.children.push(am5xy.XYChart.new(root, {
      panX: false,
      panY: false,
      paddingLeft: 0,
      layout: root.verticalLayout
    }));
    root._logo?.dispose();

    // Add scrollbar
    // chart.set("scrollbarX", am5.Scrollbar.new(root, {
    //   orientation: "horizontal"
    // }));

    // Data for only the current day
    let data = [{
      "day": selectedDate,
      "cash": this.dashBoardDataFromPrint.byCashValue,
      "card": this.dashBoardDataFromPrint.byCardValue,
      "tapango": this.dashBoardDataFromPrint.byTapAndGoValue,
    }];

    // Create axes
    let xRenderer = am5xy.AxisRendererX.new(root, {
      minorGridEnabled: true,
      minGridDistance: 10, // Adjust distance between grid lines
      cellStartLocation: 0.2, // Reduce spacing
      cellEndLocation: 0.8  // Reduce spacing
    });
    let xAxis = chart.xAxes.push(am5xy.CategoryAxis.new(root, {
      categoryField: "day",
      renderer: xRenderer,
      tooltip: am5.Tooltip.new(root, {})
    }));

    xRenderer.grid.template.setAll({
      location: 1
    });

    xAxis.data.setAll(data);

    let yAxis = chart.yAxes.push(am5xy.ValueAxis.new(root, {
      min: 0,
      renderer: am5xy.AxisRendererY.new(root, {
        strokeOpacity: 0.1
      })
    }));

    // Add legend
    let legend = chart.children.push(am5.Legend.new(root, {
      centerX: am5.p50,
      x: am5.p50
    }));

    // Add series
    function makeSeries(name, fieldName, color) {
      let series = chart.series.push(am5xy.ColumnSeries.new(root, {
        name: name,
        stacked: true,
        xAxis: xAxis,
        yAxis: yAxis,
        valueYField: fieldName,
        categoryXField: "day"
      }));

      series.columns.template.setAll({
        tooltipText: "{name}, {categoryX}: {valueY}",
        tooltipY: am5.percent(10),
        fill: am5.color(color),
        stroke: am5.color(color),
        width: 7,  // Set exact width to 15px
        maxWidth: 7, // Ensure it doesn't expand beyond 15px
        cornerRadiusTL: 10,
        cornerRadiusTR: 10,
        cornerRadiusBL: 10,
        cornerRadiusBR: 10
      });
      series.data.setAll(data);

      // Make stuff animate on load
      series.appear();

      series.bullets.push(function () {
        return am5.Bullet.new(root, {
          sprite: am5.Label.new(root, {
            text: "{valueY}",
            fill: root.interfaceColors.get("alternativeText"),
            centerY: am5.p50,
            centerX: am5.p50,
            populateText: true
          })
        });
      });

      legend.data.push(series);
    }

    // Creating series for each payment method
    makeSeries("Cash", "cash", 0xF23223);
    makeSeries("Card", "card", 0x3598DC);
    makeSeries("Tapandgo", "tapandgo", 0xA1F17D);

    // Animate chart appearance
    chart.appear(1000, 100);
  }

  getPaymentMonthlyGraph() {
    this.isPaymentDailyFormatActive = false;
    this.isPaymentMonthlyFormatActive = true;
    this.isPaymentWeeklyFormatActive = false;

    // Dispose existing root if present
    if (am5.registry.rootElements.length) {
      am5.registry.rootElements.forEach(function (root) {
        if (root.dom.id === "chartdivMonthlyPayments") {
          root.dispose();
        }
      });
    }

    // Create root element
    let root = am5.Root.new("chartdivMonthlyPayments");

    // Set themes
    root.setThemes([
      am5themes_Animated.new(root)
    ]);

    // Create chart
    let chart = root.container.children.push(am5xy.XYChart.new(root, {
      panX: false,
      panY: false,
      paddingLeft: 0,
      layout: root.verticalLayout
    }));

    // Add scrollbar
    // chart.set("scrollbarX", am5.Scrollbar.new(root, {
    //   orientation: "horizontal"
    // }));

    let monthObj = [{
      monthName: 'Jan',
      monthNum: 1,
      value: 0,
      "cash": 0,
      "card": 0,
      "tapandgo": 0
    },
    {
      monthName: 'Feb',
      monthNum: 2,
      value: 0,
      "cash": 0,
      "card": 0,
      "tapandgo": 0
    },
    {
      monthName: 'Mar',
      monthNum: 3,
      value: 0,
      "cash": 0,
      "card": 0,
      "tapandgo": 0
    },
    {
      monthName: 'Apr',
      monthNum: 4,
      value: 0,
      "cash": 0,
      "card": 0,
      "tapandgo": 0
    },
    {
      monthName: 'May',
      monthNum: 5,
      value: 0,
      "cash": 0,
      "card": 0,
      "tapandgo": 0
    },
    {
      monthName: 'June',
      monthNum: 6,
      value: 0,
      "cash": 0,
      "card": 0,
      "tapandgo": 0
    },
    {
      monthName: 'July',
      monthNum: 7,
      value: 0,
      "cash": 0,
      "card": 0,
      "tapandgo": 0
    },
    {
      monthName: 'Aug',
      monthNum: 8,
      value: 0,
      "cash": 0,
      "card": 0,
      "tapandgo": 0
    },
    {
      monthName: 'Sep',
      monthNum: 9,
      value: 0,
      "cash": 0,
      "card": 0,
      "tapandgo": 0
    },
    {
      monthName: 'Oct',
      monthNum: 10,
      value: 0,
      "cash": 0,
      "card": 0,
      "tapandgo": 0
    },
    {
      monthName: 'Nov',
      monthNum: 11,
      value: 0,
      "cash": 0,
      "card": 0,
      "tapandgo": 0
    },
    {
      monthName: 'Dec',
      monthNum: 12,
      value: 0,
      "cash": 0,
      "card": 0,
      "tapandgo": 0
    }
    ]

    /*Logic to display data-Start */
    let dashBoardData = JSON.parse(sessionStorage.getItem("GetDashboarddata"));
    for (let i = 0; i < dashBoardData.totalSalesList.length; i++) {
      if (dashBoardData.totalSalesList[i].orderStatus == 'Completed') {
        let getOrderDetail = dashBoardData.totalSalesList[i];
        let getOrderDate = new Date(getOrderDetail.createdOn);

        let Indx = monthObj.findIndex(x => x.monthNum == (getOrderDate.getMonth() + 1));

        //Payment brakage-start
        for (let j = 0; j < dashBoardData.totalSalesList[i].paymentBreakage.length; j++) {
          if (dashBoardData.totalSalesList[i].paymentBreakage[j].paymentMode == 'Cash') {
            monthObj[Indx].cash += dashBoardData.totalSalesList[i].paymentBreakage[j].cashRecived;
          } else if (dashBoardData.totalSalesList[i].paymentBreakage[j].paymentMode == 'Card') {
            monthObj[Indx].card += dashBoardData.totalSalesList[i].paymentBreakage[j].cashRecived;
          } else if (dashBoardData.totalSalesList[i].paymentBreakage[j].paymentMode == 'tapandgo') {
            monthObj[Indx].tapandgo += dashBoardData.totalSalesList[i].paymentBreakage[j].cashRecived;
          }
        }
        //End
      }
    }

    let finalData = monthObj;

    // Create axes
    let xRenderer = am5xy.AxisRendererX.new(root, {
      minorGridEnabled: true,
      minGridDistance: 10,
      cellStartLocation: 0.2,
      cellEndLocation: 0.8
    });

    let xAxis = chart.xAxes.push(am5xy.CategoryAxis.new(root, {
      categoryField: "monthName",
      renderer: xRenderer,
      tooltip: am5.Tooltip.new(root, {})
    }));

    xRenderer.grid.template.setAll({
      location: 1 // Moves labels to the middle of the bars
    });

    // Set all months as categories in the X-axis
    xAxis.data.setAll(finalData);

    let yAxis = chart.yAxes.push(am5xy.ValueAxis.new(root, {
      min: 0,
      renderer: am5xy.AxisRendererY.new(root, {
        strokeOpacity: 0.1
      })
    }));

    // Add legend
    let legend = chart.children.push(am5.Legend.new(root, {
      centerX: am5.p50,
      x: am5.p50
    }));

    // Add series
    function makeSeries(name, fieldName, color) {
      let series = chart.series.push(am5xy.ColumnSeries.new(root, {
        name: name,
        stacked: true,
        xAxis: xAxis,
        yAxis: yAxis,
        valueYField: fieldName,
        categoryXField: "monthName"
      }));

      series.columns.template.setAll({
        tooltipText: "{name}, {categoryX}: {valueY}",
        tooltipY: am5.percent(10),
        fill: am5.color(color),
        stroke: am5.color(color),
        width: 7,  // Set exact width to 15px
        maxWidth: 7, // Ensure it doesn't expand beyond 15px
        cornerRadiusTL: 10,
        cornerRadiusTR: 10,
        centerX: am5.percent(50),
        cornerRadiusBL: 10,
        cornerRadiusBR: 10
      });
      series.data.setAll(finalData);

      // Make stuff animate on load
      series.appear();

      series.bullets.push(function () {
        return am5.Bullet.new(root, {
          sprite: am5.Label.new(root, {
            // text: "{valueY}",
            fill: root.interfaceColors.get("alternativeText"),
            centerY: am5.p50,
            centerX: am5.p50,
            populateText: true
          })
        });
      });

      legend.data.push(series);
    }

    // Creating series for each payment method
    makeSeries("Cash", "cash", 0xF23223);
    makeSeries("Card", "card", 0x3598DC);
    makeSeries("Tapandgo", "tapandgo", 0xA1F17D);

    // Animate chart appearance
    chart.appear(1000, 100);

  }

  getNewSalesCountGraph() {
    if (am5.registry.rootElements.length) {
      am5.registry.rootElements.forEach(function (root) {
        if (root.dom.id === "chartdivForSalesCount") {
          root.dispose();
        }
      });
    }

    let root = am5.Root.new("chartdivForSalesCount");

    root.setThemes([am5themes_Animated.new(root)]);

    let chart = root.container.children.push(
      am5percent.PieChart.new(root, {
        endAngle: 270,
        layout: root.verticalLayout,
        innerRadius: am5.percent(60)
      })
    );

    let series = chart.series.push(
      am5percent.PieSeries.new(root, {
        valueField: "value",
        categoryField: "category",
        endAngle: 270
      })
    );

    series.labels.template.setAll({
      text: "{category}: {value}",
      radius: 10,
      inside: false,
      oversizedBehavior: "wrap",
      textAlign: "center"
    });

    series.ticks.template.setAll({
      visible: true,
      strokeOpacity: 0.4,
      strokeDasharray: [2, 2]
    });

    series.slices.template.set("tooltipText", "{category}: {value}");

    series.set("colors", am5.ColorSet.new(root, {
      colors: [
        am5.color(0x73556E),
        am5.color(0x9FA1A6),
        am5.color(0xF2AA6B),
        am5.color(0xF28F6B),
        am5.color(0xA95A52),
        am5.color(0xE35B5D),
        am5.color(0xFFA446)
      ]
    }));

    let gradient = am5.RadialGradient.new(root, {
      stops: [
        { color: am5.color(0x000000) },
        { color: am5.color(0x000000) },
        {}
      ]
    });

    series.slices.template.setAll({
      fillGradient: gradient,
      strokeWidth: 2,
      stroke: am5.color(0xffffff),
      cornerRadius: 10,
      shadowOpacity: 0.1,
      shadowOffsetX: 2,
      shadowOffsetY: 2,
      shadowColor: am5.color(0x000000),
      fillPattern: am5.GrainPattern.new(root, {
        maxOpacity: 0.2,
        density: 0.5,
        colors: [am5.color(0x000000)]
      }),
      interactive: true,
      cursorOverStyle: "pointer"
    });

    series.slices.template.states.create("hover", {
      shadowOpacity: 1,
      shadowBlur: 10
    });

    series.ticks.template.setAll({
      strokeOpacity: 0.4,
      strokeDasharray: [2, 2]
    });

    series.states.create("hidden", {
      endAngle: -90
    });

    // Set data
    series.data.setAll([{
      category: "Total Sales",
      value: this.dashBoardData?.totalOrders
    }, {
      category: "Take Away Sales",
      value: this.dashBoardData?.walkIn
    }, {
      category: "Dine-In Sales",
      value: this.dashBoardData?.dineIn
    }, {
      category: "Online Sales",
      value: this.dashBoardData?.online
    }]);


    // This is the correct click event listener
    series.slices.template.events.on("click", (ev: am5.ISpritePointerEvent) => {
      const dataContext = ev.target.dataItem?.dataContext as { category: string, value: number };
      if (dataContext) {
        alert(`You clicked on ${dataContext.category}: ${dataContext.value}`);
      }
    });

    series.appear(1000, 100);
  }

  getOrderByStatusSectionGraph() {

    if (am5.registry.rootElements.length) {
      am5.registry.rootElements.forEach(function (root) {
        if (root.dom.id === "chartdivForOrderStatusSection") {
          root.dispose();
        }
      });
    }

    let root = am5.Root.new("chartdivForOrderStatusSection");

    // Set themes
    root.setThemes([
      am5themes_Animated.new(root)
    ]);

    // Create chart
    let chart = root.container.children.push(am5radar.RadarChart.new(root, {
      panX: false,
      panY: false,
      wheelX: "panX",
      wheelY: "zoomX",
      innerRadius: am5.percent(20),
      startAngle: -90,
      endAngle: 180
    }));

    // Replace percentages with actual values and total counts
    let sumAllOrderStatus = Number(this.dashBoardData?.voidOrder + this.dashBoardData?.completedOrders + this.dashBoardData?.runningOrders);
    let data = [{
      category: "Voided Order",
      value: this.dashBoardData?.voidOrder,   // actual value (e.g. 35% of 200)
      full: sumAllOrderStatus,   // total count for scale
      columnSettings: {
        fill: chart.get("colors").getIndex(1)
      }
    }, {
      category: "Completed Order",
      value: this.dashBoardData?.completedOrders,  // actual value (e.g. 92% of 300)
      full: sumAllOrderStatus,
      columnSettings: {
        fill: chart.get("colors").getIndex(2)
      }
    }, {
      category: "Running Order",
      value: this.dashBoardData?.runningOrders,  // actual value (e.g. 68% of 150)
      full: sumAllOrderStatus,
      columnSettings: {
        fill: chart.get("colors").getIndex(3)
      }
    }];

    // Calculate max for xAxis scale
    let maxValue = Math.max(...data.map(d => d.full));

    // Add cursor
    let cursor = chart.set("cursor", am5radar.RadarCursor.new(root, {
      behavior: "zoomX"
    }));

    cursor.lineY.set("visible", false);

    // Create axes and renderers
    let xRenderer = am5radar.AxisRendererCircular.new(root, {});
    xRenderer.labels.template.setAll({
      radius: 10
    });
    xRenderer.grid.template.setAll({
      forceHidden: true
    });

    let xAxis = chart.xAxes.push(am5xy.ValueAxis.new(root, {
      renderer: xRenderer,
      min: 0,
      max: maxValue,
      strictMinMax: true,
      numberFormat: "#,###",  // normal numbers, no %
      tooltip: am5.Tooltip.new(root, {})
    }));

    let yRenderer = am5radar.AxisRendererRadial.new(root, {
      minGridDistance: 20
    });
    yRenderer.labels.template.setAll({
      centerX: am5.p100,
      fontWeight: "500",
      fontSize: 18,
      templateField: "columnSettings"
    });
    yRenderer.grid.template.setAll({
      forceHidden: true
    });

    let yAxis = chart.yAxes.push(am5xy.CategoryAxis.new(root, {
      categoryField: "category",
      renderer: yRenderer
    }));

    yAxis.data.setAll(data);

    // Create full background series
    let series1 = chart.series.push(am5radar.RadarColumnSeries.new(root, {
      xAxis: xAxis,
      yAxis: yAxis,
      clustered: false,
      valueXField: "full",
      categoryYField: "category",
      fill: root.interfaceColors.get("alternativeBackground")
    }));

    series1.columns.template.setAll({
      width: am5.p100,
      fillOpacity: 0.08,
      strokeOpacity: 0,
      cornerRadius: 20
    });

    series1.data.setAll(data);

    // Create actual value series
    let series2 = chart.series.push(am5radar.RadarColumnSeries.new(root, {
      xAxis: xAxis,
      yAxis: yAxis,
      clustered: false,
      valueXField: "value",
      categoryYField: "category"
    }));

    series2.columns.template.setAll({
      width: am5.p100,
      strokeOpacity: 0,
      tooltipText: "{category}: {valueX}",  // show actual value
      cornerRadius: 20,
      templateField: "columnSettings"
    });

    series2.data.setAll(data);

    // Animate chart and series in
    series1.appear(1000);
    series2.appear(1000);
    chart.appear(1000, 100);
  }

  getSalesValueSectionGraph() {

    if (am5.registry.rootElements.length) {
      am5.registry.rootElements.forEach(function (root) {
        if (root.dom.id === "chartdivForSalesValueSection") {
          root.dispose();
        }
      });
    }

    let root = am5.Root.new("chartdivForSalesValueSection");

    root.setThemes([
      am5themes_Animated.new(root)
    ]);

    // Create chart
    let chart = root.container.children.push(am5percent.PieChart.new(root, {
      radius: am5.percent(90),
      innerRadius: am5.percent(50),
      layout: root.horizontalLayout
    }));

    // Create series
    let series = chart.series.push(am5percent.PieSeries.new(root, {
      name: "Series",
      valueField: "amount",
      categoryField: "paymentMode"
    }));

    // Set data
    let array = [];
    this.dashBoardDataFromPrint?.distinctPaymentsTotal.forEach(element => {
      let obj = {
        paymentMode: element.paymentMode,
        amount: element.totalAmount
      }
      array.push(obj);
    });


    series.data.setAll(array);

    // Disabling labels and ticks
    series.labels.template.set("visible", false);
    series.ticks.template.set("visible", false);

    // Adding gradients
    series.slices.template.set("strokeOpacity", 0);
    series.slices.template.set("fillGradient", am5.RadialGradient.new(root, {
      stops: [{
        brighten: -0.8
      }, {
        brighten: -0.8
      }, {
        brighten: -0.5
      }, {
        brighten: 0
      }, {
        brighten: -0.5
      }]
    }));

    // Create legend
    let legend = chart.children.push(am5.Legend.new(root, {
      centerY: am5.percent(50),
      y: am5.percent(50),
      layout: root.verticalLayout
    }));
    // set value labels align to right
    legend.valueLabels.template.setAll({ textAlign: "right" })
    // set width and max width of labels
    legend.labels.template.setAll({
      maxWidth: 140,
      width: 140,
      oversizedBehavior: "wrap"
    });

    legend.data.setAll(series.dataItems);

    chart.setAll({
      layout: root.horizontalLayout,
      marginRight: 0  // Add this line
    });

    legend.setAll({
      centerY: am5.percent(50),
      y: am5.percent(50),
      layout: root.verticalLayout,
      marginLeft: -200 // Try reducing this value as needed
    });

    series.appear(1000, 100);
  }

  getTotalSalesCoverGraph() {
    if (am5.registry.rootElements.length) {
      am5.registry.rootElements.forEach(function (root) {
        if (root.dom.id === "chartdivForSalesCoverLineGraph") {
          root.dispose();
        }
      });
    }

    let root = am5.Root.new("chartdivForSalesCoverLineGraph");
    root.setThemes([
      am5themes_Animated.new(root)
    ]);

    // Create chart
    let chart = root.container.children.push(
      am5xy.XYChart.new(root, {
        panX: true,
        panY: true,
        wheelX: "panX",
        wheelY: "zoomX",
        layout: root.verticalLayout,
        pinchZoomX: true,
        paddingLeft: 0
      })
    );

    // Add cursor
    let cursor = chart.set(
      "cursor",
      am5xy.XYCursor.new(root, {
        behavior: "none"
      })
    );
    cursor.lineY.set("visible", false);

    let colorSet = am5.ColorSet.new(root, {});

    // The data   
    let data = this.TodayDineinDataNew;

    // Create axes
    let xRenderer = am5xy.AxisRendererX.new(root, {
      minorGridEnabled: true,
      minGridDistance: 70
    });
    xRenderer.grid.template.set("location", 0.5);
    xRenderer.labels.template.setAll({
      location: 0.5,
      multiLocation: 0.5
    });

    let xAxis = chart.xAxes.push(
      am5xy.DateAxis.new(root, {
        baseInterval: { timeUnit: "day", count: 1 },
        renderer: xRenderer,
        tooltip: am5.Tooltip.new(root, {})
      })
    );

    let yRenderer = am5xy.AxisRendererY.new(root, {});
    yRenderer.grid.template.set("forceHidden", true);
    yRenderer.labels.template.set("minPosition", 0.05);

    let yAxis = chart.yAxes.push(
      am5xy.ValueAxis.new(root, {
        maxPrecision: 0,
        extraMin: 0.1,
        renderer: yRenderer
      })
    );

    let series = chart.series.push(
      am5xy.LineSeries.new(root, {
        xAxis: xAxis,
        yAxis: yAxis,
        valueYField: "value1",
        valueXField: "category",
        maskBullets: false,
        tooltip: am5.Tooltip.new(root, {
          pointerOrientation: "vertical",
          dy: -20,
          labelText: "{valueY}"
        })
      })
    );

    series.data.processor = am5.DataProcessor.new(root, {
      dateFormat: "yyyy-MM-dd",
      dateFields: ["category"]
    });

    series.strokes.template.setAll({ strokeDasharray: [3, 3], strokeWidth: 2 });

    let i = -1;
    series.bullets.push(function () {
      i++;

      if (i > 7) {
        i = 0;
      }

      let container = am5.Container.new(root, {
        centerX: am5.p50,
        centerY: am5.p50
      });

      container.children.push(
        am5.Circle.new(root, { radius: 20, fill: series.get("fill") })
      );

      container.children.push(
        am5.Picture.new(root, {
          centerX: am5.p50,
          centerY: am5.p50,
          width: 23,
          height: 23,
          src: "https://amcharts.com/wp-content/uploads/assets/timeline/timeline" + i + ".svg"
        })
      );

      return am5.Bullet.new(root, {
        sprite: container
      });
    });

    series.data.setAll(data);
    series.appear(1000);

    chart.appear(1000, 100);
  }

  DineIn_Takeaway_Online_BarCharts() {
    if (am5.registry.rootElements.length) {
      am5.registry.rootElements.forEach(function (root) {
        if (root.dom.id === "AllTypesOrderPieChart") {
          root.dispose();
        }
      });
    }

    let root = am5.Root.new("AllTypesOrderPieChart");

    root.setThemes([
      am5themes_Animated.new(root)
    ]);

    let chart = root.container.children.push(am5xy.XYChart.new(root, {
      panX: false,
      panY: false,
      wheelX: "panX",
      wheelY: "zoomX",
      paddingLeft: 0,
      layout: root.verticalLayout
    }));

    chart.set("scrollbarX", am5.Scrollbar.new(root, {
      orientation: "horizontal"
    }));

    // Data with totals
    // const rawData = {
    //   TakeawayItems: [
    //     { key: "White Wine", value: "1" },
    //     { key: "Rasmalai Cake", value: "1" },
    //     { key: "Margarita", value: "1" },
    //     { Total: 50 }
    //   ],
    //   OnlineItems: [
    //     { key: "Sugar Free Chocolate Ice Cream", value: "1" },
    //     { key: "Roomali Roti", value: "1" },
    //     { key: "Kashmiri Pulao", value: "1" },
    //     { Total: 70 }
    //   ],
    //   DineInItems: [
    //     { key: "Shahi Paneer", value: "1" },
    //     { key: "Panchmel Dal", value: "1" },
    //     { key: "Belgian Chocolate Mousse Cake", value: "1" },
    //     { Total: 40 }
    //   ]
    // };
    let takeAwaySum = {
      Total : this.dashBoardData?.takeAwayItemList.reduce((sum, item) => sum + Number(item.value), 0)
    }
    let onlineSum = {
      Total : this.dashBoardData?.onlineItemList.reduce((sum, item) => sum + Number(item.value), 0)
    }
    let dineInSum = {
      Total : this.dashBoardData?.dineInItemList.reduce((sum, item) => sum + Number(item.value), 0)
    }
    
    this.dashBoardData?.takeAwayItemList.push(takeAwaySum);
    this.dashBoardData?.onlineItemList.push(onlineSum);
    this.dashBoardData?.dineInItemList.push(dineInSum);
    const rawData = {
      TakeawayItems: this.dashBoardData?.takeAwayItemList,
      OnlineItems: this.dashBoardData?.onlineItemList,
      DineInItems: this.dashBoardData?.dineInItemList
    }


    // Prepare data and extract totals
    let allKeys = new Set();
    let data = ["Dine In", "Takeaway", "Online"].map((type) => {
      let key = type.replace(" ", "") + "Items";
      let obj: { type: string;[key: string]: number | string } = { type, Total: 0 };

      rawData[key].forEach((item) => {
        if (item.key) {
          obj[item.key.trim()] = +item.value;
          allKeys.add(item.key.trim());
        }
        if (item.Total) {
          obj.Total = item.Total;  // Add total to object
        }
      });

      return obj;
    });

    // Create axes
    let xRenderer = am5xy.AxisRendererX.new(root, {
      minorGridEnabled: true
    });

    let xAxis = chart.xAxes.push(am5xy.CategoryAxis.new(root, {
      categoryField: "type",
      renderer: xRenderer,
      tooltip: am5.Tooltip.new(root, {})
    }));

    xRenderer.grid.template.setAll({ location: 1 });
    xAxis.data.setAll(data);

    let yAxis = chart.yAxes.push(am5xy.ValueAxis.new(root, {
      min: 0,
      strictMinMax: false,
      renderer: am5xy.AxisRendererY.new(root, {
        strokeOpacity: 0.1
      })
    }));

    // Yellow-green color palette
    const limeGreenShades = [
      am5.color(0xd4e157),
      am5.color(0xd4e157),
      am5.color(0xd4e157),
      am5.color(0xd4e157),
      am5.color(0xd4e157),
      am5.color(0xd4e157)
    ];

    // Add series for each item key (stacked bars)
    let colorIndex = 0;
    allKeys.forEach((itemKey: string) => {
      const color = limeGreenShades[colorIndex % limeGreenShades.length];

      let series = chart.series.push(am5xy.ColumnSeries.new(root, {
        name: itemKey,
        stacked: true,
        xAxis: xAxis,
        yAxis: yAxis,
        valueYField: itemKey,
        categoryXField: "type"
      }));

      series.columns.template.setAll({
        tooltipText: "{name}, {categoryX}: {valueY}",
        tooltipY: am5.percent(10),
        fill: color,
        stroke: color,
        cornerRadiusTL: 10,
        cornerRadiusTR: 10
      });

      series.data.setAll(data);
      series.appear();

      // **Remove bullets for individual segments to avoid clutter**
      // series.bullets.push(function () {
      //   return am5.Bullet.new(root, {
      //     sprite: am5.Label.new(root, {
      //       text: "{valueY}",
      //       fill: root.interfaceColors.get("alternativeText"),
      //       centerY: am5.p50,
      //       centerX: am5.p50,
      //       populateText: true
      //     })
      //   });
      // });

      colorIndex++;
    });

    // Add total labels on top of each stacked bar
    // Use a separate series with bullets positioned above the bar

    let totalSeries = chart.series.push(am5xy.ColumnSeries.new(root, {
      xAxis: xAxis,
      yAxis: yAxis,
      valueYField: "Total",
      categoryXField: "type",
      clustered: false
    }));

    totalSeries.columns.template.set("visible", false);


    totalSeries.data.setAll(data);

    totalSeries.bullets.push(function () {
      return am5.Bullet.new(root, {
        locationY: 0,
        sprite: am5.Label.new(root, {
          text: "Over All Items Sold : {valueY}",
          fill: am5.color(0x000000),
          centerX: am5.p50,
          centerY: am5.p100,
          populateText: true,
          //fontWeight: "bold",
          dy: -10 // Adjust label above the bar
        })
      });
    });

    chart.appear(1000, 100);
  }
OnClickReset(){
   this.getAllOrdersByCount(new Date(), new Date());
   
   setTimeout(() => {
      this.getDailyOrderGraph(new Date());
      this.getDailyGraph(new Date());
      this.getPaymentDailyGrapgh(new Date());
      //this.getPaymentMonthlyGraph(new Date());

      //Replacement of old graphs to new graphs, 27-05-2025.
      this.getNewSalesCountGraph();
      this.getOrderByStatusSectionGraph();
      this.getSalesValueSectionGraph();
      this.getTotalSalesCoverGraph();
      this.DineIn_Takeaway_Online_BarCharts();
    }, 1000);
    this.dashboardForm.setValue({
    toDate : "",
    fromDate : "",
    userName : ""
   })
}






}
