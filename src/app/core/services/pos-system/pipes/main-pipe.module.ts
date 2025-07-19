import { NgModule } from '@angular/core';
import {CommonModule} from "@angular/common";
import { NoSanitizePipe } from './sanitization-pipes';


@NgModule({
  declarations:[NoSanitizePipe],
  imports:[CommonModule],
  exports:[NoSanitizePipe]
})

export class MainPipe{}