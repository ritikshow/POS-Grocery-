import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from 'src/environments/environment';

@Injectable({
  providedIn: 'root'
})

export class PosAuthService {

  constructor(
    private httpClient: HttpClient,
  ) { }

  userCredential(data: any): Observable<any> {
    return this.httpClient.post(`${environment.apiUrl}/UserRegistration/Authentication/authentication`, data, {
    });
  }
  forgotPassword(data: any): Observable<any> {
    return this.httpClient.get(`${environment.apiUrl}/UserRegistration/ForgetPassword/${data}`, {
    });
  }
  resetPassword(data: any): Observable<any> {
    return this.httpClient.post(`${environment.apiUrl}/UserRegistration/ResetPassword`, data);
  }
  userResDataByUserId(id: any): Observable<any> {
    return this.httpClient.get(`${environment.apiUrl}/UserRestaurantLink/GetRestaurantByUserId/${id}`);
  }
}
