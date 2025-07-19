import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { TaxViewSetupEditComponent } from './tax-view-setup-edit.component';

describe('TaxViewSetupEditComponent', () => {
  let component: TaxViewSetupEditComponent;
  let fixture: ComponentFixture<TaxViewSetupEditComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ TaxViewSetupEditComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(TaxViewSetupEditComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
