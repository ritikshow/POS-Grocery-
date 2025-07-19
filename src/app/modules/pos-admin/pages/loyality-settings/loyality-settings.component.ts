import { Component, OnInit } from '@angular/core';
import { FormArray, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { AlertService } from '@core/services/common/alert.service';
import { CommonService } from '@core/services/common/common.service';
import { PosDataService } from '@core/services/pos-system/pos-data.service';
import { NgbActiveModal, NgbModal } from '@ng-bootstrap/ng-bootstrap';

@Component({
  selector: 'app-loyality-settings',
  templateUrl: './loyality-settings.component.html',
  styleUrls: ['./loyality-settings.component.css']
})
export class LoyalitySettingsComponent implements OnInit {
  LoyalitySetting: FormGroup;
  edit: boolean = false;
  GetLoyaltyData: any;


  constructor(
    private fb: FormBuilder,
    private posDataService: PosDataService,
    private activeModal: NgbActiveModal,
    private modalService: NgbModal,
    private alertService: AlertService,
    public commonService: CommonService
  ) {}

  ngOnInit(): void {
    this.LoyalitySetting = this.fb.group({
      minimuAmount: ['', Validators.required],
      Point: ['', Validators.required],
      Updatetier:[''],
      allowPoints:[],
      minAmountToEarnPoints:[],
      tiers: this.fb.array([this.createTierGroup()])
    });
    this.GetLoyaltySetting();
  }

  // Get the tiers FormArray
  get tiers(): FormArray {
    return this.LoyalitySetting.get('tiers') as FormArray;
  }

  // Create a new tier FormGroup
  createTierGroup(): FormGroup {
    return this.fb.group({
      tiername: ['', Validators.required],
      amountAndCoin: ['', Validators.required],
      coinamount: ['', Validators.required]
    });
  }

  // Add new tier to FormArray
  addTier(): void {
     const tier = this.createTierGroup();
     this.tiers.push(tier);

     if (!this.edit) {
      tier.disable();
     }
   }

  // Remove tier by index
  removeTier(index: number): void {
    this.tiers.removeAt(index);
  }
  onSave(){
       if(this.LoyalitySetting.valid){
        const formValue = this.LoyalitySetting.value;
         if(this.GetLoyaltyData.id==null && this.GetLoyaltyData.outletId==null){
             const obj = {
        OutletId: sessionStorage.getItem('activeOutletId'),
        MinAmountToUseWallet: parseFloat(formValue.minimuAmount),
        AmountPerPoint: parseFloat(formValue.Point),
        UpdateTierBy: formValue.Updatetier,
        AllowPointEarnWhenWalletUsed: formValue.allowPoints,
        MinAmountToEarnPoints:formValue.minAmountToEarnPoints,
        TierList: formValue.tiers.map((tier: any) => ({
        TierName: tier.tiername,
        RequiredAmountOrPoints: parseFloat(tier.amountAndCoin),
        PointsPerAmount: parseFloat(tier.coinamount)
      }))
      }
     this.posDataService.CreateLoyalty(obj).subscribe((res: any) => {
        const status = res['success'];
        const msg = res['message'];
        this.GetLoyaltySetting();
        if (status) {
          this.activeModal.close(status);
          this.alertService.showSuccess(msg);
        } else {
          this.alertService.showError(msg);
        }
      });

         }
         else{
            const obj = {
        OutletId:this.GetLoyaltyData.outletId,
        Id:this.GetLoyaltyData.id,
        MinAmountToUseWallet: parseFloat(formValue.minimuAmount),
        AmountPerPoint: parseFloat(formValue.Point),
        UpdateTierBy: formValue.Updatetier,
        AllowPointEarnWhenWalletUsed: formValue.allowPoints,
        MinAmountToEarnPoints:formValue.minAmountToEarnPoints,
        TierList: formValue.tiers.map((tier: any) => ({
        TierName: tier.tiername,
        RequiredAmountOrPoints: parseFloat(tier.amountAndCoin),
        PointsPerAmount: parseFloat(tier.coinamount)
      }))
    }
     this.posDataService.UpdateLoylaty ( obj).subscribe((res: any) => {
        const status = res['success'];
        const msg = res['message'];
        if (status) {
          this.activeModal.close(status);
          this.alertService.showSuccess(msg);
        } else {
          this.alertService.showError(msg);
        }
      });
         }
          
       }
  }

 
  GetLoyaltySetting(): void {
    const Outletid = sessionStorage.getItem('activeOutletId');
    this.posDataService.GetLoyaltyByOutlet(Outletid).subscribe((res: any) => {
      const status = res['success'];
      const msg = res['message'];
      if (status && res.data) {
        this.GetLoyaltyData = res.data;
        this.patchLoyaltyForm(res.data);

        // Disable form if not in edit mode
        if (!this.edit) {
           this.disableAllControls();
        }
      } else {
        this.alertService.showError(msg || 'Failed to load loyalty settings');
      }
    });
  }

  patchLoyaltyForm(data: any): void {
      this.LoyalitySetting.patchValue({
      minimuAmount: data.minAmountToUseWallet,
      Point: data.amountPerPoint,
      allowPoints: data.allowPointEarnWhenWalletUsed,
      Updatetier: data.updateTierBy,
      minAmountToEarnPoints :data.minAmountToEarnPoints
    });

    this.tiers.clear();
    if (data.tierList && Array.isArray(data.tierList)) {
      data.tierList.forEach((tier: any) => {
        const tierGroup = this.fb.group({
          tiername: [tier.tierName],
          amountAndCoin: [tier.requiredAmountOrPoints],
          coinamount: [tier.pointsPerAmount]
        });

        if (!this.edit) {
          tierGroup.disable();
        }

        this.tiers.push(tierGroup);
      });
    }
  }

  onClickEdit(): void {
    this.edit = !this.edit;

    if (this.edit) {
      this.enableAllControls();
    } else {
     this.disableAllControls();
    }
  }

  saveLoyaltySettings(): void {
    this.onSave();
    this.edit = false;
    this.disableAllControls();
  }

  disableAllControls(): void {
    Object.keys(this.LoyalitySetting.controls).forEach(key => {
      const control = this.LoyalitySetting.get(key);
      control?.disable();

      if (control instanceof FormArray) {
        control.controls.forEach(child => child.disable());
      }
    });
  }

  enableAllControls(): void {
    Object.keys(this.LoyalitySetting.controls).forEach(key => {
      const control = this.LoyalitySetting.get(key);
      control?.enable();

      if (control instanceof FormArray) {
        control.controls.forEach(child => child.enable());
      }
    });
  }
}
