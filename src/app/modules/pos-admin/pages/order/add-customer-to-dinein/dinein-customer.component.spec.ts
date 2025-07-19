import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { DineInCustomerComponent } from './dinein-customer.component';

describe('DineInCustomerComponent', () => {
  let component: DineInCustomerComponent;
  let fixture: ComponentFixture<DineInCustomerComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [DineInCustomerComponent]
    })
      .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(DineInCustomerComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
