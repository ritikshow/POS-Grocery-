import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ModifierGroupFormComponent } from './modifier-group-form.component';

describe('ModifierGroupFormComponent', () => {
  let component: ModifierGroupFormComponent;
  let fixture: ComponentFixture<ModifierGroupFormComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ModifierGroupFormComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ModifierGroupFormComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
