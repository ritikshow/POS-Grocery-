import { Injectable } from '@angular/core';
import { ActivatedRouteSnapshot, CanActivate, RouterStateSnapshot } from '@angular/router';

@Injectable({ providedIn: 'root' })
export class POSAuthGuard implements CanActivate {
  menuList: any;
  AllPermission: any;
  canActivate(functinalityName: ActivatedRouteSnapshot, state: RouterStateSnapshot): boolean {
    this.AllPermission = JSON.parse(sessionStorage.getItem('RestaurantFeatures'));
    if (this.AllPermission == null || this.AllPermission == undefined || this.AllPermission.length == 0)
      return true;
    if (this.AllPermission.map(x => x.key).includes(functinalityName.component['name'])) {
      let permission = this.AllPermission.find(x => x.key == functinalityName.component['name']);
      if (permission.value)
        return true;
      else
        return false;
    }
    else {
      return true;
    }
  }
}
