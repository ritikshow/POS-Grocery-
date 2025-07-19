import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from 'src/environments/environment';
import { StorageService, StorageKey } from '../common/storage.service';

@Injectable({
  providedIn: 'root'
})
export class AuthService {

  constructor(
    private httpClient: HttpClient,
    private storageService: StorageService
  ) { }

  CheckUserCreditial(data: any): Observable<any> {
    return this.httpClient.post(`${environment.apiUrl}login`, data);
  }

  isLoggedIn(): boolean {
    let token = this.storageService.getValue(StorageKey.authToken);
    let currentUser = this.storageService.getValue(StorageKey.currentUser);

    if (token && currentUser)
      return true;
    else
      return false;
  }

  getAccessToken(): any {
    let token = sessionStorage.getItem('token');
    return token ? token : null;
  }

  logout() {   
   
    sessionStorage.clear();
  }

  getUserId(): any {
    let id = JSON.parse(this.storageService.getValue(StorageKey.currentUser)).id;
    return id ? id : null;
  }

  getUserName(): any {
    let name = JSON.parse(this.storageService.getValue(StorageKey.currentUser)).fullname;
    return name ? name : null;
  }

  getDateFormat(): any {
    let dateformat = this.storageService.getValue(StorageKey.dateformat) ? this.storageService.getValue(StorageKey.dateformat) : "dd/MM/yyyy";
    return dateformat;
  }

  forgotPassword(data: any): Observable<any> {
    return this.httpClient.post(`${environment.apiUrl}forgotpassword`, data);
  }

  getUserRoleId(): any {
    let role_id = JSON.parse(this.storageService.getValue(StorageKey.currentUser)).role_id;
    return role_id ? role_id : null;
  }

  getUserRoleCode(): any {
    let code = JSON.parse(this.storageService.getValue(StorageKey.currentUser)).role_code;
    return code ? code : null;
  }

  getAccessControls() {
    let currentUser: any = JSON.parse(this.storageService.getValue(StorageKey.currentUser));
    return currentUser['access_control'];
  }
  checkVoidOrder(id: any, data: any): Observable<any> {
    return this.httpClient.put(`${environment.apiUrl}/UserRegistration/CheckVoidOrder/${id}`, data);
  }
}