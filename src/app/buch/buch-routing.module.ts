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

import { AdminGuard } from '../auth/admin.guard';
import { CreateBuchComponent } from './create-buch/create-buch.component';
import { CreateBuchGuard } from './create-buch/create-buch.guard';
import { DetailsBuchComponent } from './details-buch/details-buch.component';
import { NgModule } from '@angular/core';
import { RouterModule } from '@angular/router';
import type { Routes } from '@angular/router';
import { SucheBuecherComponent } from './suche-buch/suche-buecher.component';
import { UpdateBuchComponent } from './update-buch/update-buecher.component';

// Route-Definitionen fuer das Feature-Modul "buch":
// Zuordnung von Pfaden und Komponenten mit HTML-Templates
const routes: Routes = [
    {
        path: 'suche',
        component: SucheBuecherComponent,
    },
    {
        path: 'create',
        component: CreateBuchComponent,
        canActivate: [AdminGuard],
        canDeactivate: [CreateBuchGuard],
    },
    // id als Pfad-Parameter
    {
        path: ':id',
        component: DetailsBuchComponent,
    },
    {
        path: 'details',
        component: DetailsBuchComponent,
    },
    {
        path: ':id/update',
        component: UpdateBuchComponent,
        canActivate: [AdminGuard],
    },
];

@NgModule({
    exports: [RouterModule],
    imports: [RouterModule.forChild(routes)],
})
export class BuchRoutingModule {}
