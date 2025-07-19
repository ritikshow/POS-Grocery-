import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { FormGroupEditComponent } from './form-group-edit.component';

describe('FormGroupEditComponent', () => {
  let component: FormGroupEditComponent;
  let fixture: ComponentFixture<FormGroupEditComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ FormGroupEditComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(FormGroupEditComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
