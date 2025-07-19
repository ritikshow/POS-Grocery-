import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { SalesByCategoryComponent } from './sales-by-category.component';

describe('SalesByCategoryComponent', () => {
  let component: SalesByCategoryComponent;
  let fixture: ComponentFixture<SalesByCategoryComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ SalesByCategoryComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(SalesByCategoryComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
