import { NgModule } from '@angular/core';
import { CustomGenericFilterComponent } from './custom-generic-filter.component';
import { CommonModule } from '@angular/common';  
import { NgxMaterialTimepickerModule } from 'ngx-material-timepicker';
import { FormsModule } from '@angular/forms';



@NgModule({
  declarations: [
    CustomGenericFilterComponent
  ],
  imports: [
    CommonModule,
    NgxMaterialTimepickerModule,
    FormsModule
  ],
  exports: [
    CustomGenericFilterComponent
  ]
})
export class CustomGenericFilterModule { }
