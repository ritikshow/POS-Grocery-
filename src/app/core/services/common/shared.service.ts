import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Observable } from 'rxjs';
import { environment } from 'src/environments/environment';

@Injectable()
export class SharedService {

    private countSource = new BehaviorSubject(0);
    currentCount = this.countSource.asObservable();

    constructor(
        private httpClient: HttpClient
    ) { }

    changeCount(count: any) {
        this.countSource.next(count)
    }

    cartListData(data: any): Observable<any> {
        return this.httpClient.get(`${environment.apiUrl}carts`, data);
    }

    notificationCount(data: any): Observable<any> {
        return this.httpClient.get(`${environment.apiUrl}notifications/count`, data);
    }

    createReferral(data: any): Observable<any> {
        return this.httpClient.post(`${environment.apiUrl}referrals/create`, data);
    }
}
