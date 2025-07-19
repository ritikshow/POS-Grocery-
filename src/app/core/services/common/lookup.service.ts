import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from 'src/environments/environment';

@Injectable({
  providedIn: 'root'
})
export class LookupService {

  constructor(private httpClient: HttpClient) { }

  // For List of Reasons
  getAllParameters(data: any): Observable<any> {
    return this.httpClient.post(`${environment.apiUrl}parameters`, data);
  }

}
