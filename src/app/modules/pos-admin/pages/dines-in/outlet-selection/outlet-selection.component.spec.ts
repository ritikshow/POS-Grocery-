import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { OutletSelectionComponent } from './outlet-selection.component';

describe('OutletSelectionComponent', () => {
  let component: OutletSelectionComponent;
  let fixture: ComponentFixture<OutletSelectionComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ OutletSelectionComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(OutletSelectionComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
