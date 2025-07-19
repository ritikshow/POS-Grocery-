import { HttpInterceptor, HttpRequest, HttpHandler, HttpEvent, HttpHeaders } from "@angular/common/http";
import { Injectable } from "@angular/core";
import { Observable } from "rxjs";
import { tap } from "rxjs/operators";
import { Router } from "@angular/router";
import { AuthService } from '@core/services/auth/auth.service';
import { StorageService } from '@core/services/common/storage.service';


@Injectable()
export class AuthInterceptor implements HttpInterceptor {

  constructor(private router: Router, private authService: AuthService, private storageService: StorageService) { }

  intercept(req: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
    let authToken = this.authService.getAccessToken();
    if (authToken) {
      const clonedReq = req.clone({
        headers: new HttpHeaders({
          'Authorization': 'Bearer '+authToken,
        })
      });
      return next.handle(clonedReq).pipe(
        tap(
          succ => { },
          err => {
            if (err.status == 401) {
              this.backToLogin();
            }
          }
        ))
    }
    else {
      return next.handle(req.clone()).pipe(
        tap(
          succ => { },
          err => {
            if (err.status == 401) {
              this.backToLogin();
            }
          }
        ))
    }
  }

  private backToLogin() {
   this.authService.logout();
    this.router.navigate(['/home']);
  }
}



