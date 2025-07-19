import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { AddSupplierOrderComponent } from './add-supplier-order.component';

describe('CategoryComponent', () => {
  let component: AddSupplierOrderComponent;
  let fixture: ComponentFixture<AddSupplierOrderComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ AddSupplierOrderComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(AddSupplierOrderComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
