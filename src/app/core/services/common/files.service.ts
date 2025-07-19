import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from 'src/environments/environment';

@Injectable({
  providedIn: 'root'
})
export class FilesService {

  constructor(private httpClient: HttpClient) { }
  download(fileId):Observable<any>{
    return this.httpClient.get(`${environment.apiUrl}file_references/download?id=${fileId}`);
  }
  downloadSample(name):Observable<any>{
    return this.httpClient.get(`${environment.apiUrl}file_references/downloadSample?name=${name}`);
  }
}
