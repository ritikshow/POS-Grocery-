import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { AddMasterPromoCodeComponent } from './add-master-promo-code.component';

describe('AddMasterPromoCodeComponent', () => {
  let component: AddMasterPromoCodeComponent;
  let fixture: ComponentFixture<AddMasterPromoCodeComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ AddMasterPromoCodeComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(AddMasterPromoCodeComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
