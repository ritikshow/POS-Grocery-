import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ViewMastersPromoCodeComponent } from './view-masters-promo-code.component';

describe('ViewMastersPromoCodeComponent', () => {
  let component: ViewMastersPromoCodeComponent;
  let fixture: ComponentFixture<ViewMastersPromoCodeComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ViewMastersPromoCodeComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ViewMastersPromoCodeComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
