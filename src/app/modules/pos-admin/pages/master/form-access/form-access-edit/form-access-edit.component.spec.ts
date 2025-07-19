import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { FormAccessEditComponent } from './form-access-edit.component';

describe('FormAccessEditComponent', () => {
  let component: FormAccessEditComponent;
  let fixture: ComponentFixture<FormAccessEditComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ FormAccessEditComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(FormAccessEditComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
