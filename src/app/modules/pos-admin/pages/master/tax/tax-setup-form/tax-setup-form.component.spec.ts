import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { TaxSetupFormComponent } from './tax-setup-form.component';

describe('TaxSetupFormComponent', () => {
  let component: TaxSetupFormComponent;
  let fixture: ComponentFixture<TaxSetupFormComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ TaxSetupFormComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(TaxSetupFormComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
