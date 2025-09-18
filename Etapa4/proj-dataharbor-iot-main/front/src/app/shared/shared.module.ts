import { NgModule } from '@angular/core';

import { MaterialModule } from './material/material.module';
import { ReactiveFormsModule } from '@angular/forms';

@NgModule({
  declarations: [],
  imports: [
    ReactiveFormsModule ,MaterialModule,
  ],
  exports:[ReactiveFormsModule ,MaterialModule]
})
export class SharedModule { }
