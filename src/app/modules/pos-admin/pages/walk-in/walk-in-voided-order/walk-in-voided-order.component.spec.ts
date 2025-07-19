import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { WalkInVoidedOrderComponent } from './walk-in-voided-order.component';

describe('WalkInVoidedOrderComponent', () => {
  let component: WalkInVoidedOrderComponent;
  let fixture: ComponentFixture<WalkInVoidedOrderComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ WalkInVoidedOrderComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(WalkInVoidedOrderComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
