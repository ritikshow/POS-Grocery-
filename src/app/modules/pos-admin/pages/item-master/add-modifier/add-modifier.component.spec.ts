import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { AddModifierComponent } from './add-modifier.component';

describe('AddModifierComponent', () => {
  let component: AddModifierComponent;
  let fixture: ComponentFixture<AddModifierComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ AddModifierComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(AddModifierComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
