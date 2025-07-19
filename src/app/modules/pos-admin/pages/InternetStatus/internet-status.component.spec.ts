import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { InternetStatusComponent} from './internet-status.component';

describe('CompleteOrderComponent', () => {
  let component: InternetStatusComponent;
  let fixture: ComponentFixture<InternetStatusComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ InternetStatusComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(InternetStatusComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
