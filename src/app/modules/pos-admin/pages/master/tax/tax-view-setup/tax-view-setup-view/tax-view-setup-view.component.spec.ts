import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { TaxViewSetupViewComponent } from './tax-view-setup-view.component';

describe('TaxViewSetupViewComponent', () => {
  let component: TaxViewSetupViewComponent;
  let fixture: ComponentFixture<TaxViewSetupViewComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ TaxViewSetupViewComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(TaxViewSetupViewComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
