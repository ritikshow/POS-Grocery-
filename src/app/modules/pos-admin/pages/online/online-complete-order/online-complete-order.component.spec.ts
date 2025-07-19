import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { OnlineCompleteOrderComponent } from './online-complete-order.component';

describe('OnlineCompleteOrderComponent', () => {
  let component: OnlineCompleteOrderComponent;
  let fixture: ComponentFixture<OnlineCompleteOrderComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ OnlineCompleteOrderComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(OnlineCompleteOrderComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
