import { TestBed } from '@angular/core/testing';

import { PhoneValidatorService } from './phone-validator.service';

describe('PhoneValidatorService', () => {
  let service: PhoneValidatorService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(PhoneValidatorService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
