import { Component, OnInit } from '@angular/core';
import { FormArray, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { AlertService } from '@core/services/common/alert.service';
import { PosDataService } from '@core/services/pos-system/pos-data.service';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';
import { NgxUiLoaderService } from 'ngx-ui-loader';
import { Dropdown } from 'bootstrap';
@Component({
  selector: 'app-modifier-group-form',
  templateUrl: './modifier-group-form.component.html',
  styleUrls: ['./modifier-group-form.component.css']
})
export class ModifierGroupFormComponent implements OnInit {
  modForm: any = FormGroup;
  modItems: any;
  itemData: any;
  ingredientsData: any;
  tempingredientsData: any;
  ingredientsMas = false;
  itemMaster = false;
  Id: any;
  modifierData: any;
  outletId: any;
  ItemsName = [];
  ItemIds = [];
  searchInputItem: any;
  SelectedModifierType:string = "Modifiers";
  selectedItemData : any;
  constructor(
    private ngxLoader: NgxUiLoaderService,
    private activeModal: NgbActiveModal,
    private formBuilder: FormBuilder,
    private alertService: AlertService,
    private posDataService: PosDataService,
  ) { }

  ngOnInit(): void {
    this.outletId = sessionStorage.getItem('activeOutletId');
    //this.getAllIngredients();
    this.getAllItems();
    this.modForm = this.formBuilder.group({
      groupName: ['', Validators.required],
      description: [''],
      modifierName: ['', Validators.required],
      //modifierItems: this.formBuilder.array([ this.createAddress() ]),
      price: [''],
      itemFrom: ['Modifiers', Validators.required],
      itemName: [''],
      //itemId: ['', Validators.required]
    });
   
  }
  ngAfterViewInit() {
    const dropdownElementList = [].slice.call(document.querySelectorAll('.dropdown-toggle'));
    dropdownElementList.map((dropdownToggleEl) => new Dropdown(dropdownToggleEl));
  }
  // createAddress(): FormGroup {
  //   return this.formBuilder.group({
  //     itemFrom: ['', Validators.required],
  //     price: ['', Validators.required],
  //     itemName: ['', Validators.required],
  //     itemId: ['', Validators.required]
  //   });
  // }

  get modItemsControls() {
    return this.modForm.get('modifierItems')['controls'];
  }

  // addMod(): void {
  //   this.modItems = this.modForm.get('modifierItems') as FormArray;
  //   this.modItems.push(this.createAddress());
  // }

  removeMod(i){
    this.modItems.removeAt(i);
  }

  getAllItems(){
    let data = { outletId: this.outletId, IsAllItem: false }
    this.ngxLoader.startLoader('loader-01');
    this.posDataService.getAllItemsByOutletId(data).subscribe((res: any)=>{
      this.ngxLoader.stopLoader('loader-01');
      this.itemData = res['data'];
      this.SelectIdForItem();
    });
  }

  getAllIngredients(){
    this.ngxLoader.startLoader('loader-01');
    this.posDataService.getAllIngredients().subscribe((res: any)=>{
      this.ngxLoader.stopLoader('loader-01');
      this.ingredientsData = res['data'];
      this.tempingredientsData = res['data'];
      let success = res['success'];
      let msg = res['message'];
      if (!success) {
        this.alertService.showError(msg);
      }
    });
  }

  selectItemFrom(e){
    this.SelectedModifierType = e.target.value;
    //let val = e.target.value;
    // if(val == 'ItemMaster'){
    //   let inp = document.getElementById('itemName' + Number(i));
    //   let inp1 = document.getElementById('ingredient' + Number(i));
    //   if(inp !== undefined && inp !== null){
    //     inp.style.display = 'block';
    //     inp1.style.display = 'none';
    //   } else {
    //     inp.style.display = 'none';
    //     inp1.style.display = 'block';
    //   }
    // } else {
    //   let inp = document.getElementById('itemName' + Number(i));
    //   let inp1 = document.getElementById('ingredient' + Number(i));
    //   if(inp1 !== undefined && inp1 !== null){
    //     inp1.style.display = 'block';
    //     inp.style.display = 'none';
    //   } else {
    //     inp1.style.display = 'none';
    //     inp.style.display = 'block';
    //   }
    // }
  }

  selectItem(){
this.selectedItemData =  this.modForm.get('itemName')?.value;;
this.modForm.patchValue({
  price : this.selectedItemData.itemAmount
})
    // let id = e.currentTarget.options[e.currentTarget.options.selectedIndex].id;
    // let item = this.itemData.filter((res: any)=>{
    //   return res.id == id;
    // });
    // let price = item[0].itemAmount;
    // let val = e.target.value;
    // (<FormGroup>this.modItemsControls.at(i)).patchValue({
    //   itemId: id,
    //   itemName: val,
    //   price: price
    // });
    // console.log(this.modForm.value);
  }

  selectIngredient(e,i){
    let id = e.currentTarget.options[e.currentTarget.options.selectedIndex].id;
    let ingredient = this.ingredientsData.filter((rest: any)=>{
      return rest.id == id;
    });
    let price = ingredient[0].price;
    let val = e.target.value;
    (<FormGroup>this.modItemsControls.at(i)).patchValue({
      itemId: id,
      itemName: val,
      price: price
    });
  }

  closeModal(){
    this.activeModal.close();
  }
  addModifier(data:any){
    console.log(data)
    if(this.modForm.invalid){
      this.alertService.showError('Fields are empty');
    } else {
      //let SelectedItemData = this.modForm.get('modifierItems').value;
      let editData = {
            outletId: this.outletId,
            groupName: this.modForm.get('groupName').value,
            description: this.modForm.get('description')?.value,
            //modifierItems: this.modForm.get('modifierItems').value,
            ItemIds : this.ItemIds,//this.modForm.get('itemName')?.value,
            Price  :this.modForm.get('price')?.value == "" ? null : this.modForm.get('price')?.value,
            ModifierType : this.modForm.get('itemFrom').value,
            ActiveStatus : true,
            modifierName : this.modForm.get('modifierName').value
          }
          //console.log("itemdetails",this.modForm.get('modifierItems').value)
      this.ngxLoader.startLoader('loader-01');
      this.posDataService.postModifierData(editData).subscribe((res: any)=>{
        this.ngxLoader.stopLoader('loader-01');
        console.log(res);
        let msg = res['message'];
        if(res.success){
          this.alertService.showSuccess("Modifier added successfully");
          this.activeModal.close(res.success);
        } else {
          this.alertService.showSuccess(msg);
        }
      });
    }
  }
  checkedOrUnCheckedStoreCheckbox(event: any, store: any) {
    store.checked = event.target.checked;
    if (store.checked) {
      this.ItemIds.push(store.id);
      this.ItemsName.push(store.itemName); // Store itemName instead of ID
    } else {
      this.ItemsName = this.ItemsName.filter(item => item !== store.itemName);
      this.ItemIds = this.ItemIds.filter((data)=>data != store.id);
    }
  }
  SelectIdForItem(){
    this.itemData = this.itemData.map(item => ({
      ...item,
      checked: false // Reset checked to false
    }));
  }
}
