/*
 * Copyright (C) 2015 - present Juergen Zimmermann, Hochschule Karlsruhe
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
 * You should have received a copy oSf the GNU General Public License
 * along with this program.  If not, see <http://www.gnu.org/licenses/>.
 */

import type { FamilienstandType } from '../../shared/kunde';
import { Component } from '@angular/core';
import { fadeIn } from '../../../shared';
import log from 'loglevel';

/**
 * Komponente f&uuml;r das Tag <code>hs-suche-familienstand</code>
 */
@Component({
    selector: 'hs-suche-familienstand',
    templateUrl: './suche-familienstand.component.html',
    animations: [fadeIn],
})
export class SucheFamilienstandComponent {
    familienstand: FamilienstandType | '' = '';

    constructor() {
        log.debug('SucheFamilienstandComponent.constructor()');
    }
}
