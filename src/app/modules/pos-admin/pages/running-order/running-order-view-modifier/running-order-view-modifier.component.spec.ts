import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { RunningOrderViewModifierComponent } from './running-order-view-modifier.component';

describe('RunningOrderViewModifierComponent', () => {
  let component: RunningOrderViewModifierComponent;
  let fixture: ComponentFixture<RunningOrderViewModifierComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ RunningOrderViewModifierComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(RunningOrderViewModifierComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
