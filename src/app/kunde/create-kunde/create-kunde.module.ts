/*
 * Copyright (C) 2016 - present Juergen Zimmermann, Hochschule Karlsruhe
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
import { CreateDatumModule } from './create-datum.module';
import { CreateFamilienstandModule } from './create-familienstand.module';
import { CreateGeschlechtTypeModule } from './create-geschlechtType.module';
import { CreateInteressenComponent } from './create-interessen.component';
import { CreateInteressenModule } from './create-interessen.module';
import { CreateKundeComponent } from './create-kunde.component';
import { CreateNachnameModule } from './create-nachname.module';
import { CreateNewsletterModule } from './create-newsletter.module';
import { ErrorMessageModule } from '../../shared/error-message.module';
import { HttpClientModule } from '@angular/common/http';
import { MatButtonModule } from '@angular/material/button';
import { MatToolbarModule } from '@angular/material/toolbar';
import { NgModule } from '@angular/core';
import { ReactiveFormsModule } from '@angular/forms';
import { Title } from '@angular/platform-browser';

// Ein Modul enthaelt logisch zusammengehoerige Funktionalitaet.
// Exportierte Komponenten koennen bei einem importierenden Modul in dessen
// Komponenten innerhalb deren Templates (= HTML-Fragmente) genutzt werden.
// KundeModule ist ein "FeatureModule", das Features fuer Kunden bereitstellt
@NgModule({
    declarations: [CreateKundeComponent],
    exports: [CreateKundeComponent],
    imports: [
        CommonModule,
        CreateFamilienstandModule,
        CreateDatumModule,
        CreateNewsletterModule,
        CreateNachnameModule,
        CreateGeschlechtTypeModule,
        ErrorMessageModule,
        HttpClientModule,
        ReactiveFormsModule,
        CreateGeschlechtTypeModule,
        CreateNachnameModule,
        MatToolbarModule,
        MatButtonModule,
        CreateInteressenModule,
    ],
    providers: [Title],
})
export class CreateKundeModule {}
