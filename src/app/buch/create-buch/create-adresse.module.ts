import { CommonModule } from '@angular/common';
import { CreateAdresseComponent } from './create-adresse.component';
import { MatButtonModule } from '@angular/material/button';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatNativeDateModule } from '@angular/material/core';
import { NgModule } from '@angular/core';
import { ReactiveFormsModule } from '@angular/forms';

@NgModule({
    declarations: [CreateAdresseComponent],
    exports: [CreateAdresseComponent],
    imports: [
        CommonModule,
        MatButtonModule,
        MatDatepickerModule,
        MatFormFieldModule,
        MatInputModule,
        MatNativeDateModule,
        ReactiveFormsModule,
    ],
    providers: [MatDatepickerModule],
})
export class CreateAdresseModule {}
