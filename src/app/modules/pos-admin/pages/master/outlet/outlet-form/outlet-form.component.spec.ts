import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { OutletFormComponent } from './outlet-form.component';

describe('OutletFormComponent', () => {
  let component: OutletFormComponent;
  let fixture: ComponentFixture<OutletFormComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ OutletFormComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(OutletFormComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
