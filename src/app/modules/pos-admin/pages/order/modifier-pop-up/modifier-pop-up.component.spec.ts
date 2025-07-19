import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ModifierPopUpComponent } from './modifier-pop-up.component';

describe('ModifierPopUpComponent', () => {
  let component: ModifierPopUpComponent;
  let fixture: ComponentFixture<ModifierPopUpComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ModifierPopUpComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ModifierPopUpComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
