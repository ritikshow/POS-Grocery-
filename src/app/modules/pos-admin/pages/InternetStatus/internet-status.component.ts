import { Component,Input } from '@angular/core';

@Component({
  selector: 'app-internet-status',
  templateUrl: './internet-status.component.html',
  styleUrls: ['./internet-status.component.css']
})
export class InternetStatusComponent{

  @Input() onlineStatusMessage: string;
  @Input() onlineStatus: string;

}