import { ComponentFixture, TestBed } from '@angular/core/testing';

import { LoyalitySettingsComponent } from './loyality-settings.component';

describe('LoyalitySettingsComponent', () => {
  let component: LoyalitySettingsComponent;
  let fixture: ComponentFixture<LoyalitySettingsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ LoyalitySettingsComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(LoyalitySettingsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
