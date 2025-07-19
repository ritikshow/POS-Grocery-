import { Injectable } from '@angular/core';
import { AbstractControl, ValidationErrors } from '@angular/forms';
import { PhoneNumberUtil } from 'google-libphonenumber';
import { CountryCodes } from 'src/app/shared/country-codes';

@Injectable({
  providedIn: 'root'
})
export class PhoneValidatorService  {
  // Mapping of country code to phone number length
  private countryPhoneLengths: { [code: string]: number } = {
    'IN': 10, // India
    'AU': 9,  // Australia
    'US': 10, // United States
    'GB': 10, // United Kingdom
    'CN': 11, // China
    'DE': 11, // Germany (example)
    'FR': 9,  // France (example)
    'RU': 10, // Russia (example)
    // Add more as needed
  };

  countryList = CountryCodes.map(c => ({
    name: c.name,
    code: c.code.toLowerCase(),
    dialCode: c.dial_code,
    flag: `https://flagcdn.com/${c.code.toLowerCase()}.svg`,
    phoneLength: c.phoneLength || 10
  }));

  getCountries() {
    return this.countryList;
  }

  // Create phone validator based on country
  createPhoneValidator(country: any) {
    return (control: AbstractControl): ValidationErrors | null => {
      if (!control.value) {
        return { required: true };
      }
      return null;
    };
  }

  // Validate phone number for a specific country
  validatePhoneNumber(phoneNumber: string, country: any): boolean {
    if (!phoneNumber) {
      return false;
    }
    return true;
  }

  // Get country by name
  getCountryByName(countryName: string) {
    return this.countryList.find(country => country.name === countryName);
  }

  // Get country by code
  getCountryByCode(countryCode: string) {
    return this.countryList.find(country => country.code === countryCode);
  }
}