import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { LoyalityPointsComponent } from './loyality-points.component';

describe('LoyalityPointsComponent', () => {
  let component: LoyalityPointsComponent;
  let fixture: ComponentFixture<LoyalityPointsComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ LoyalityPointsComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(LoyalityPointsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
