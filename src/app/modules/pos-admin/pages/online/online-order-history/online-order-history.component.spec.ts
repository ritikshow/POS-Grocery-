import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { OnlineOrderHistoryComponent } from './online-order-history.component';

describe('OnlineCompleteOrderComponent', () => {
  let component: OnlineOrderHistoryComponent;
  let fixture: ComponentFixture<OnlineOrderHistoryComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ OnlineOrderHistoryComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(OnlineOrderHistoryComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
