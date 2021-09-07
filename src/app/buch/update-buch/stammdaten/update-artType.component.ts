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
 * You should have received a copy of the GNU General Public License
 * along with this program.  If not, see <http://www.gnu.org/licenses/>.
 */

import { Component, Input } from '@angular/core';

import type { ArtType } from '../../shared/buch';
import { FormControl } from '@angular/forms';
import type { FormGroup } from '@angular/forms';
import type { OnInit } from '@angular/core';
import log from 'loglevel';

/**
 * Komponente f&uuml;r das Tag <code>hs-update-artType</code>
 */
@Component({
    // eslint-disable-next-line @angular-eslint/component-selector
    selector: 'hs-update-artType',
    templateUrl: './update-artType.component.html',
    styleUrls: ['./update-artType.component.scss'],
})
export class UpdateArtTypeComponent implements OnInit {
    // <hs-update-artType [form]="form" [currentValue]="...">
    @Input()
    form!: FormGroup;

    @Input()
    currentValue: ArtType | '' | undefined;

    artType!: FormControl;

    ngOnInit() {
        log.debug(
            'UpdateArtTypeComponent.ngOnInit(): currentValue=',
            this.currentValue,
        );
        // siehe formControlName innerhalb @Component({templateUrl: ...})
        this.artType = new FormControl(this.currentValue);
        this.form.addControl('artType', this.artType);
    }
}
