import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { VoidedOrderComponent } from './voided-order.component';

describe('VoidedOrderComponent', () => {
  let component: VoidedOrderComponent;
  let fixture: ComponentFixture<VoidedOrderComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ VoidedOrderComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(VoidedOrderComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
