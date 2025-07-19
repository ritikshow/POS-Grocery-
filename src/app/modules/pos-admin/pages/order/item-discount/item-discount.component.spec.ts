import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ItemDiscountComponent } from './item-discount.component';

describe('ItemDiscountComponent', () => {
  let component: ItemDiscountComponent;
  let fixture: ComponentFixture<ItemDiscountComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ItemDiscountComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ItemDiscountComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
