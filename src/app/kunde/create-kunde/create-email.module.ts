import { CommonModule } from '@angular/common';
import { CreateEmailComponent } from './create-email.component';
import { MatButtonModule } from '@angular/material/button';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatNativeDateModule } from '@angular/material/core';
import { NgModule } from '@angular/core';
import { ReactiveFormsModule } from '@angular/forms';

@NgModule({
    declarations: [CreateEmailComponent],
    exports: [CreateEmailComponent],
    imports: [
        ReactiveFormsModule,
        MatFormFieldModule,
        MatDatepickerModule,
        MatNativeDateModule,
        MatInputModule,
        MatButtonModule,
        CommonModule,
    ],
    providers: [MatDatepickerModule],
})
export class CreateEmailModule {}
