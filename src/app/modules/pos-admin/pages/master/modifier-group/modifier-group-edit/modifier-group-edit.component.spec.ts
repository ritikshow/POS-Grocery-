import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ModifierGroupEditComponent } from './modifier-group-edit.component';

describe('ModifierGroupEditComponent', () => {
  let component: ModifierGroupEditComponent;
  let fixture: ComponentFixture<ModifierGroupEditComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ModifierGroupEditComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ModifierGroupEditComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
