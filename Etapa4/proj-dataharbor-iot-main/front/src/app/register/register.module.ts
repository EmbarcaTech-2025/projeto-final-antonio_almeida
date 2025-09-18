import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { RegisterRoutingModule } from './register-routing.module';
import { RegisterComponent } from './register.component';
import { SharedModule } from '../shared/shared.module';
import { StoreModule } from '@ngrx/store';
import { registrationFormReducer } from './reducers/registration-form.reducer';
import { EffectsModule } from '@ngrx/effects';
import { UserEffects } from './effects/register.effects';

@NgModule({
  declarations: [
    RegisterComponent
  ],
  imports: [
    CommonModule,
    RegisterRoutingModule,
    SharedModule,
    StoreModule.forFeature('register',registrationFormReducer),
    EffectsModule.forFeature([UserEffects])
  ]
})
export class RegisterModule { }
