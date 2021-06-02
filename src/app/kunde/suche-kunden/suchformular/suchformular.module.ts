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

import { FormsModule } from '@angular/forms';
import { HttpClientModule } from '@angular/common/http';
import { NgModule } from '@angular/core';
import { SucheFamilienstandModule } from './suche-familienstand.module';
import { SucheGeschlechtTypeModule } from './suche-geschlechtType.module';
import { SucheNachnameModule } from './suche-nachname.module';
import { SucheSchlagwoerterModule } from './suche-schlagwoerter.module';
import { SuchformularComponent } from './suchformular.component';

// Ein Modul enthaelt logisch zusammengehoerige Funktionalitaet.
// Exportierte Komponenten koennen bei einem importierenden Modul in dessen
// Komponenten innerhalb deren Templates (= HTML-Fragmente) genutzt werden.
// SucheKundenModule ist ein "FeatureModule", das Features fuer Kunden bereitstellt
@NgModule({
    declarations: [SuchformularComponent],
    exports: [SuchformularComponent],
    imports: [
        FormsModule,
        HttpClientModule,
        SucheFamilienstandModule,
        SucheSchlagwoerterModule,
        SucheNachnameModule,
        SucheGeschlechtTypeModule,
    ],
})
export class SuchformularModule {}
