import { Component } from '@angular/core';
import { FormBuilder } from '@angular/forms';
@Component({
  selector: 'app-app-inner-header',
  templateUrl: './app-inner-header.component.html',
  styleUrls: ['./app-inner-header.component.css']
})

export class AppInnerHeaderComponent {

  constructor(
    private formBuilder: FormBuilder
  ) { }
}
