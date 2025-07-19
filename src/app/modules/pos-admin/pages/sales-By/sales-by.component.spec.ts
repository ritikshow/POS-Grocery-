import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { SalesByComponent } from './sales-by.component';


describe('SalesByComponent', () => {
  let component: SalesByComponent;
  let fixture: ComponentFixture<SalesByComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ SalesByComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(SalesByComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
