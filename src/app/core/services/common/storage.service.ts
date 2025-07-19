import { Injectable } from '@angular/core';

@Injectable({ providedIn: 'root' })
export class StorageService {

    getValue(key: string): string {
        return localStorage.getItem(key);
    }

    setValue(key: string, value: string): void {
        localStorage.setItem(key, value);
    }

    removeValue(key: string): void {
        localStorage.removeItem(key);
    }
}

export class StorageKey {
    public static currentUser = 'currentUser';
    public static authToken = 'authToken';
    public static dateformat = 'dateformat';
    public static username = 'username';
    public static password = 'password';
    public static remember = 'remember';
    public static selectedTab = 'selectedTab';
    public static selectedoutletid = 'selectedoutletid';
    public static cartCount = 'cartCount';
    public static criteria = 'criteria';
    public static chartOutletId = 'chartOutletId';
    public static chartOutletIdCat = 'chartOutletIdCat';
}
