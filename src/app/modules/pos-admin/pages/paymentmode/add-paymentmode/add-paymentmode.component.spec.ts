import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { AddPaymentModeComponent } from './add-paymentmode.component';

describe('AddPaymentModeComponent', () => {
  let component: AddPaymentModeComponent;
  let fixture: ComponentFixture<AddPaymentModeComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ AddPaymentModeComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(AddPaymentModeComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
