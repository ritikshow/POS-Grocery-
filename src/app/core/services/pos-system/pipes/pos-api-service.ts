import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { NgxUiLoaderService } from 'ngx-ui-loader';

@Injectable({
    providedIn: 'root'
})
export class PosApiService {

    constructor(
        private httpClient: HttpClient,
        private ngxLoader: NgxUiLoaderService,
    ) { }

    //Post response  or push data by Post method
    async postAPICallwithToken(APIEndpoint: string, formData: any, token: string): Promise<any>{
        /** spinner starts on init */
        await this.ngxLoader.startLoader('loader-01');
        //Creates a new Promise.
        return new Promise<any>((resolve, reject) => {
            const httpOptions = {
                headers: new HttpHeaders({
                    'authorization': 'Bearer ' + token,
                    'accept': 'application/json',
                    'Content-Type': 'application/json'
                })
            };
            //Constructs a `POST` request that interprets the body as a JSON object
            this.httpClient.post(APIEndpoint, formData, httpOptions).subscribe(res => {
                this.ngxLoader.stopLoader('loader-01');
                resolve(res);
            }, err => {
                console.log("APIEndpoint", APIEndpoint, " formData ", formData, " Error ", err);            
                this.ngxLoader.stopLoader('loader-01');
                reject(err)
            }
            );
        })
    }
}
