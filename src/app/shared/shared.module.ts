import { NgModule } from "@angular/core";
import { CommonModule, CurrencyPipe, DatePipe } from "@angular/common";
import { FormsModule, ReactiveFormsModule } from "@angular/forms";
import { RouterModule } from "@angular/router";
import { NgbModule } from "@ng-bootstrap/ng-bootstrap";
import { NotifierModule } from "angular-notifier";
import { Config } from "src/app/core/configs/config";
import { AlertComponent } from "./directives";
import { AllowAlphaNumericSpaceDirective } from "./directives/allowAlphaNumericSpace/allow-alpha-numeric-space-input.directive";
import { OnlyDecimalNumberDirective } from "./directives/onlyDecimalNumber/only-decimal-number-input.directive";
import { OnlyNumberDirective } from "./directives/onlyNumber/only-number-input.directive";
import { UppercaseInputDirective } from "./directives/uppecase/uppercase-input.directive";
import { AllowAlphaNumericSpacewithSpecialCharacterDirective } from "./directives/allowAlphaNumericSpacewithSpecialCharacter/allow-alpha-numeric-space-specialcharacter-input.directive";
import { NumericwithDecimalDirective } from "./directives/onlyNumberNumericInput/only-number-numeric-input.directive";
import { OnlyNumberPipeDirective } from "./directives/onlyNumberPipe/only-number-pipe.directive";
import { AllowAlphaNumericDashSlashDirective } from "./directives/allowAlphaNumericDashSlash/allow-alpha-numeric-dash-slash-input.directive";
import { NumericwithDecimalDirectiveMinus } from "./directives/onlyNumberNumericInputMinus/only-number-numeric-input-minus.directive";
import {
  AppInnerHeaderComponent,
  AppFooterComponent,
  AppNavComponent,
} from "./components/";
import { AccessControlDirective } from "./directives/accessControl/access-control.directive";
import { ActionControlDirective } from "./directives/accessControl/access-action.directive";
import { AngularSvgIconModule } from "angular-svg-icon";

@NgModule({
  declarations: [
    AppInnerHeaderComponent,
    AppFooterComponent,
    AppNavComponent,
    AlertComponent,
    AllowAlphaNumericSpaceDirective,
    OnlyDecimalNumberDirective,
    OnlyNumberDirective,
    UppercaseInputDirective,
    AllowAlphaNumericSpacewithSpecialCharacterDirective,
    NumericwithDecimalDirective,
    OnlyNumberPipeDirective,
    AllowAlphaNumericDashSlashDirective,
    NumericwithDecimalDirectiveMinus,
    AccessControlDirective,
    ActionControlDirective,
  ],
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    RouterModule,
    NgbModule,
    NotifierModule.withConfig(Config.customNotifierOptions),
    AngularSvgIconModule.forRoot(),
  ],
  exports: [
    AppInnerHeaderComponent,
    AppFooterComponent,
    AppNavComponent,
    AlertComponent,
    NotifierModule,
    AllowAlphaNumericSpaceDirective,
    OnlyDecimalNumberDirective,
    OnlyNumberDirective,
    UppercaseInputDirective,
    AllowAlphaNumericSpacewithSpecialCharacterDirective,
    NumericwithDecimalDirective,
    OnlyNumberPipeDirective,
    AllowAlphaNumericDashSlashDirective,
    NumericwithDecimalDirectiveMinus,
    AccessControlDirective,
    ActionControlDirective,
  ],
  entryComponents: [],
  providers: [DatePipe, CurrencyPipe],
})
export class SharedModule { }
