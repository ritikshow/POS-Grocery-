import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { NoOuletsByResturantComponent } from './no-oulets-by-resturant.component';

describe('NoOuletsByResturantComponent', () => {
  let component: NoOuletsByResturantComponent;
  let fixture: ComponentFixture<NoOuletsByResturantComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ NoOuletsByResturantComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(NoOuletsByResturantComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
