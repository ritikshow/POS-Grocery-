import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { SalesByItemComponent } from './sales-by-item.component';

describe('SalesByitemComponent', () => {
  let component: SalesByItemComponent;
  let fixture: ComponentFixture<SalesByItemComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ SalesByItemComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(SalesByItemComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
