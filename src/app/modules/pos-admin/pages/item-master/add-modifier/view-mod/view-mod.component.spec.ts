import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ViewModComponent } from './view-mod.component';

describe('ViewModComponent', () => {
  let component: ViewModComponent;
  let fixture: ComponentFixture<ViewModComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ViewModComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ViewModComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
