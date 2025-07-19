import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ModifierGroupViewComponent } from './modifier-group-view.component';

describe('ModifierGroupViewComponent', () => {
  let component: ModifierGroupViewComponent;
  let fixture: ComponentFixture<ModifierGroupViewComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ModifierGroupViewComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ModifierGroupViewComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
