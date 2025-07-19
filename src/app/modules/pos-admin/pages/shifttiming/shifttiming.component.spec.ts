import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ShiftTimingComponent } from './shifttiming.component';

describe('ShifttimingComponent', () => {
  let component: ShiftTimingComponent;
  let fixture: ComponentFixture<ShiftTimingComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ShiftTimingComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ShiftTimingComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
