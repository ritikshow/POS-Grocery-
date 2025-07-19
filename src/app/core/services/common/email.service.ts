import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from 'src/environments/environment';
import { HttpClient } from '@angular/common/http';

@Injectable({ providedIn: "root" })
export class EmailService {
	constructor(private httpClient: HttpClient) {}
  	
	sendEmail(sendTo,sendFrom,emailSubject,emailBody): Observable<any>{
		let data = {
			"send_to":sendTo,
			"send_from":sendFrom,
			"email_subject":emailSubject,
			"email_body":emailBody
		  }
		  console.log(`${environment.apiUrl}emaillogs/sendemail`);
		return this.httpClient.post(`${environment.apiUrl}emaillogs/sendemail`, data);
	}
	saveEmailLog(data:any): Observable<any>{
		return this.httpClient.post(`${environment.apiUrl}emaillogs`, data);
	}
}
