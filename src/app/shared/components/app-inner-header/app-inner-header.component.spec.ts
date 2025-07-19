import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { AppInnerHeaderComponent } from './app-inner-header.component';

describe('AppInnerHeaderComponent', () => {
  let component: AppInnerHeaderComponent;
  let fixture: ComponentFixture<AppInnerHeaderComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ AppInnerHeaderComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(AppInnerHeaderComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
