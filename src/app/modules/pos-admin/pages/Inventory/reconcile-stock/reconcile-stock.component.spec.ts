import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ReconcileStockComponent } from './reconcile-stock.component';

describe('CompleteOrderComponent', () => {
  let component: ReconcileStockComponent;
  let fixture: ComponentFixture<ReconcileStockComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ReconcileStockComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ReconcileStockComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
