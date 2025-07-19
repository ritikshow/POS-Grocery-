import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { OnlineOrderPrintComponent } from './online-order-print.component';

describe('OnlineOrderPrintComponent', () => {
  let component: OnlineOrderPrintComponent;
  let fixture: ComponentFixture<OnlineOrderPrintComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ OnlineOrderPrintComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(OnlineOrderPrintComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
