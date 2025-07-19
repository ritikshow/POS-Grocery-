import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { MastersPromoCodeComponent } from './masters-promo-code.component';

describe('MastersPromoCodeComponent', () => {
  let component: MastersPromoCodeComponent;
  let fixture: ComponentFixture<MastersPromoCodeComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ MastersPromoCodeComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(MastersPromoCodeComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
