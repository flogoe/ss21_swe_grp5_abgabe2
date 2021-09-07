/*
 * Copyright (C) 2019 - present Juergen Zimmermann, Hochschule Karlsruhe
 *
 * This program is free software: you can redistribute it and/or modify
 * it under the terms of the GNU General Public License as published by
 * the Free Software Foundation, either version 3 of the License, or
 * (at your option) any later version.
 *
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU General Public License for more details.
 *
 * You should have received a copy of the GNU General Public License
 * along with this program.  If not, see <http://www.gnu.org/licenses/>.
 */

import { CommonModule } from '@angular/common';
import { DetailsArtTypeModule } from './details-artType.module';
import { DetailsErscheinungsdatumModule } from './details-erscheinungsdatum.module';
import { DetailsFamilienstandModule } from './details-familienstand.module';
import { DetailsLieferbarModule } from './details-lieferbar.module';
import { DetailsStammdatenComponent } from './details-stammdaten.component';
import { DetailsTitelModule } from './details-titel.module';
import { DetailsVerlagModule } from './details-verlag.module';
import { NgModule } from '@angular/core';

@NgModule({
    declarations: [DetailsStammdatenComponent],
    exports: [DetailsStammdatenComponent],
    imports: [
        CommonModule,
        DetailsVerlagModule,
        DetailsFamilienstandModule,
        DetailsErscheinungsdatumModule,
        DetailsArtTypeModule,
        DetailsTitelModule,
        DetailsLieferbarModule,
    ],
})
export class DetailsStammdatenModule {}