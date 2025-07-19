import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { OrderListPreviewComponent } from './order-list-preview.component';

describe('OrderListPreviewComponent', () => {
  let component: OrderListPreviewComponent;
  let fixture: ComponentFixture<OrderListPreviewComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ OrderListPreviewComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(OrderListPreviewComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
