import { Component, OnInit } from '@angular/core';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';

@Component({
  selector: 'app-no-oulets-by-resturant',
  templateUrl: './no-oulets-by-resturant.component.html',
  styleUrls: ['./no-oulets-by-resturant.component.css']
})
export class NoOuletsByResturantComponent implements OnInit {

  restaurantName: any;

  constructor(
    private activeModal: NgbActiveModal
  ) { }

  ngOnInit(): void {   
  
    this.restaurantName = sessionStorage.getItem('RestaurantWithNoOutlet');
  }

  closeModal() {   
    this.activeModal.close();
  }
  
}