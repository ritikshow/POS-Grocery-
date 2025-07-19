import { Component, OnInit } from '@angular/core';
import { FormArray, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { AlertService } from '@core/services/common/alert.service';
import { PosDataService } from '@core/services/pos-system/pos-data.service';
import { PosEditService } from '@core/services/pos-system/pos-edit.service';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';
import { NgxUiLoaderService } from 'ngx-ui-loader';

@Component({
  selector: 'app-modifier-group-edit',
  templateUrl: './modifier-group-edit.component.html',
  styleUrls: ['./modifier-group-edit.component.css']
})
export class ModifierGroupEditComponent implements OnInit {
  modForm: any = FormGroup;
  modItems: any;
  itemData: any;
  ingredientsData: any;
  ingredientsMas = false;
  itemMaster = false;
  Id: any;
  modifierData: any;
  outletId: any;
  SelectedModifierType:any;

  constructor(
    private ngxLoader: NgxUiLoaderService,
    private activeModal: NgbActiveModal,
    private formBuilder: FormBuilder,
    private alertService: AlertService,
    private posDataService: PosDataService,
    private posEditService: PosEditService
  ) { }

  ngOnInit(): void {
    this.outletId = sessionStorage.getItem('activeOutletId');
    this.Id = this.posEditService.getModifierGroupsEditId();
    if(this.Id !== undefined){
      this.getModifierGroupsDataById();
    }
    //this.getAllIngredients();
    this.getAllItems();
    this.modForm = this.formBuilder.group({
      groupName: ['', Validators.required],
      description: [''],
      modifierName: ['', Validators.required],
      price: [''],
      itemFrom: ['', Validators.required],
      itemName: [''],
      //modifierItems: this.formBuilder.array([ this.createAddress() ])
    });

    this.Id = this.posEditService.getModifierGroupsEditId();
    if(this.Id !== undefined){
      this.getModifierGroupsDataById();
    }
  }

  getModifierGroupsDataById(){
    this.ngxLoader.startLoader('loader-01');
    this.posDataService.getmodifierById(this.Id).subscribe((res: any)=>{
      this.ngxLoader.stopLoader('loader-01');
      this.modifierData = res['data'];
      let success = res['success'];
      let msg = res['message'];
      if (success) {
          this.PatchToForm();
      }
      else {
        this.alertService.showError(msg);
      }
    });
  }


  patchValuesToForm(){
    this.PatchToForm();
    for(let i=0; i<this.modifierData.modifierItems.length; i++){
      if(i == 0){
        (<FormGroup>this.modItemsControls.at(i)).patchValue({
          itemFrom: this.modifierData.modifierItems[i].itemFrom,
          itemId: this.modifierData.modifierItems[i].itemId,
          price: this.modifierData.modifierItems[i].price,
          itemName: this.modifierData.modifierItems[i].itemName
        });
          this.ModifierItemConditions(i);
      } else {
        this.ElsePartOfPatchValues(i);
      }
    }
  }

  private PatchToForm() {
    this.modForm.patchValue({
      groupName: this.modifierData.groupName,
      description: this.modifierData.description,
      modifierName : this.modifierData.modifierName,
      price : this.modifierData.price,
      itemFrom : this.modifierData.modifierType,
      itemName : this.modifierData.itemName
    });
    this.SelectedModifierType = this.modifierData.modifierType
  }

  private ElsePartOfPatchValues(i: number) {
    this.modItems = this.modForm.get('modifierItems') as FormArray;
    this.modItems.push(this.createAddress());
    (<FormGroup>this.modItemsControls.at(i)).patchValue({
      itemFrom: this.modifierData.modifierItems[i].itemFrom,
      itemId: this.modifierData.modifierItems[i].itemId,
      price: this.modifierData.modifierItems[i].price,
      itemName: this.modifierData.modifierItems[i].itemName
    });
    let j = i;
    setTimeout(() => {
      this.TimeOutConditions(j);
    }, 1000);
  }

  private TimeOutConditions(j: number) {
    if (this.modifierData.modifierItems[j].itemFrom == 'ItemMaster') {
      let inp = document.getElementById('itemName' + Number(j));
      let inp1 = document.getElementById('ingredient' + Number(j));
      this.CommonMethod2(inp, inp1);
    } else {
      let inp = document.getElementById('itemName' + Number(j));
      let inp1 = document.getElementById('ingredient' + Number(j));
      this.CommonChangeMethod(inp1, inp);
    }
  }

  private ModifierItemConditions(i: number) {
    if (this.modifierData.modifierItems[i].itemFrom == 'ItemMaster') {
      let inp = document.getElementById('itemName' + Number(i));
      let inp1 = document.getElementById('ingredient' + Number(i));
      this.CommonMethod2(inp, inp1);
    } else {
      let inp = document.getElementById('itemName' + Number(i));
      let inp1 = document.getElementById('ingredient' + Number(i));
      this.CommonChangeMethod(inp1, inp);
    }
  }

  private CommonMethod2(inp: HTMLElement, inp1: HTMLElement) {
    if (inp !== undefined && inp !== null) {
      inp.style.display = 'block';
      inp1.style.display = 'none';
    } else {
      inp.style.display = 'none';
      inp1.style.display = 'block';
    }
  }

  private CommonChangeMethod(inp1: HTMLElement, inp: HTMLElement) {
    if (inp1 !== undefined && inp1 !== null) {
      inp1.style.display = 'block';
      inp.style.display = 'none';
    } else {
      inp1.style.display = 'none';
      inp.style.display = 'block';
    }
  }

  createAddress(): FormGroup {
    return this.formBuilder.group({
      itemFrom: ['', Validators.required],
      itemId: ['', Validators.required],
      price: ['', Validators.required],
      itemName: ['', Validators.required]
    });
  }

  get modItemsControls() {
    return this.modForm.get('modifierItems')['controls'];
  }

  addMod(): void {
    this.modItems = this.modForm.get('modifierItems') as FormArray;
    this.modItems.push(this.createAddress());
  }

  removeMod(i){
    this.modItems.removeAt(i);
  }

  getAllItems(){
    let data = { outletId: this.outletId, IsAllItem: false }
    this.ngxLoader.startLoader('loader-01');
    this.posDataService.getAllItemsByOutletId(data).subscribe((res: any)=>{
      this.ngxLoader.stopLoader('loader-01');
      this.itemData = res['data'];
      let success = res['success'];
      let msg = res['message'];
      if (!success) {
        this.alertService.showError(msg);
      }
    });
  }

  getAllIngredients(){
    this.ngxLoader.startLoader('loader-01');
    this.posDataService.getAllIngredients().subscribe((res: any)=>{
      this.ngxLoader.stopLoader('loader-01');
      this.ingredientsData = res['data'];
      let success = res['success'];
      let msg = res['message'];
      if (!success) {
        this.alertService.showError(msg);
      }
    });
  }

  selectItemFrom(e){
    this.SelectedModifierType = e.target.value;
    // let val = e.target.value;
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

  selectItem(e,i){

    let id = e.currentTarget.options[e.currentTarget.options.selectedIndex].id;
    let item = this.itemData.filter((res: any)=>{
      return res.id == id;
    });
    let price = item[0].itemAmount;
    let val = e.target.value;
    (<FormGroup>this.modItemsControls.at(i)).patchValue({
      itemId: id,
      itemName: val,
      price: price
    });
    console.log(this.modForm.value);
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
      let editData = {
        id: this.Id,
        outletId: this.outletId,
            groupName: this.modForm.get('groupName').value,
            description: this.modForm.get('description')?.value,
            //modifierItems: this.modForm.get('modifierItems').value,
            ItemIds : this.modForm.get('itemName')?.value,
            Price  :this.modForm.get('price')?.value,
            ModifierType : this.modForm.get('itemFrom').value,
            ActiveStatus : true,
            modifierName : this.modForm.get('modifierName').value
      }
     this.ngxLoader.startLoader('loader-01');
      this.posDataService.upDateModifierGroupsData(this.Id, editData).subscribe((res: any)=>{
        this.ngxLoader.stopLoader('loader-01');
        let status = res['success'];
        let msg = res['message'];
        if(status){
          this.alertService.showSuccess(msg);
          this.activeModal.close(status);
        } else {
          this.alertService.showError(msg);
        }
      });
    }
  }
}
