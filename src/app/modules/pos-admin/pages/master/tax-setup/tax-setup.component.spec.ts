import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { TaxSetupComponent } from './tax-setup.component';

describe('TaxSetupComponent', () => {
  let component: TaxSetupComponent;
  let fixture: ComponentFixture<TaxSetupComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ TaxSetupComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(TaxSetupComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
