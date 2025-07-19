import { Injectable } from '@angular/core';
import { CanActivate, ActivatedRouteSnapshot, RouterStateSnapshot, Router } from '@angular/router';
import { AuthService } from '@core/services/auth/auth.service';
import { StorageService, StorageKey } from '@core/services/common/storage.service';

@Injectable({ providedIn: 'root' })
export class AuthGuard implements CanActivate {
  menuList: any;

  constructor(
    private router: Router,
    private authService: AuthService,
    private storageService: StorageService
  ) { }

  canActivate(next: ActivatedRouteSnapshot, state: RouterStateSnapshot): boolean {
    let urlfound = false;
    if (this.authService.isLoggedIn()) {

      // Access Control
      let currentUser: any = JSON.parse(this.storageService.getValue(StorageKey.currentUser));
      let code: any = next.data["code"] as Array<string>;

      let abc = [];
      if (code && currentUser['access_control']) {
        abc = currentUser['access_control'].filter(a => a.code === code[0]);

        if (abc.length >= 1) {
          return true;

        } else {

          if (currentUser['user_type'] == 1) {
            this.router.navigate(['/buyer/dashboard']);
            return false;

          } else if (currentUser['user_type'] == 2) {
            this.router.navigate(['/supplier/dashboard']);
            return false;
          }

        }
      }
      return true;
    } else {
      this.router.navigate(['/'], { queryParams: { returnUrl: state.url } });
      return false;
    }
  }

}
