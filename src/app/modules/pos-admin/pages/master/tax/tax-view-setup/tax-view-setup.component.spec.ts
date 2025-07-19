import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { TaxViewSetupComponent } from './tax-view-setup.component';

describe('TaxViewSetupComponent', () => {
  let component: TaxViewSetupComponent;
  let fixture: ComponentFixture<TaxViewSetupComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ TaxViewSetupComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(TaxViewSetupComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
