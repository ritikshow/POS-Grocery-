import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { OnlineVoidedOrderComponent } from './online-voided-order.component';

describe('OnlineVoidedOrderComponent', () => {
  let component: OnlineVoidedOrderComponent;
  let fixture: ComponentFixture<OnlineVoidedOrderComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ OnlineVoidedOrderComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(OnlineVoidedOrderComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
