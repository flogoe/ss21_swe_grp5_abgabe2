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

import { BuchService, UpdateError } from '../../shared';
import { Component, Input } from '@angular/core';
import { FormControl, FormGroup } from '@angular/forms';
import { HttpErrorResponse, HttpStatusCode } from '@angular/common/http';

import type { Buch } from '../../shared';
import { HOME_PATH } from '../../../shared';
import type { OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { first } from 'rxjs/operators';
import log from 'loglevel';

/**
 * Komponente f&uuml;r das Tag <code>hs-interessen</code>
 */
@Component({
    selector: 'hs-update-interessen',
    templateUrl: './update-interessen.component.html',
})
export class UpdateInteressenComponent implements OnInit {
    // <hs-update-interessen [buch]="...">
    @Input()
    buch!: Buch;

    form!: FormGroup;

    sport!: FormControl;

    lesen!: FormControl;

    reisen!: FormControl;

    errorMsg: string | undefined = undefined;

    constructor(
        private readonly buchService: BuchService,
        private readonly router: Router,
    ) {
        log.debug('UpdateInteressenComponent.constructor()');
    }

    /**
     * Das Formular als Gruppe von Controls initialisieren und mit den
     * Interessenn des zu &auml;ndernden Buchs vorbelegen.
     */
    ngOnInit() {
        log.debug('buch=', this.buch);

        // Definition und Vorbelegung der Eingabedaten (hier: Checkbox)
        const hasSport = this.buch.hasInteresse('S');
        this.sport = new FormControl(hasSport);
        const hasLesen = this.buch.hasInteresse('L');
        this.lesen = new FormControl(hasLesen);
        const hasReisen = this.buch.hasInteresse('R');
        this.reisen = new FormControl(hasReisen);

        this.form = new FormGroup({
            // siehe ngFormControl innerhalb von @Component({template: `...`})
            sport: this.sport,
            lesen: this.lesen,
            reisen: this.reisen,
        });
    }

    /**
     * Die aktuellen Interessen f&uuml;r das angezeigte Buch-Objekt
     * zur&uuml;ckschreiben.
     * @return false, um das durch den Button-Klick ausgel&ouml;ste Ereignis
     *         zu konsumieren.
     */
    onUpdate() {
        if (this.form.pristine) {
            log.debug(
                'UpdateInteressenComponent.onUpdate(): keine Aenderungen',
            );
            return;
        }

        const sport: boolean = this.sport.value; // eslint-disable-line @typescript-eslint/no-unsafe-assignment
        const lesen: boolean = this.lesen.value; // eslint-disable-line @typescript-eslint/no-unsafe-assignment
        const reisen: boolean = this.reisen.value; // eslint-disable-line @typescript-eslint/no-unsafe-assignment

        this.buch.updateInteressen(sport, lesen, reisen);
        log.debug('buch=', this.buch);

        const next = async (result: Buch | UpdateError) => {
            if (result instanceof UpdateError) {
                this.handleError(result);
                return;
            }

            await this.router.navigate([HOME_PATH]);
        };
        this.buchService.update(this.buch).pipe(first()).subscribe({ next });

        // damit das (Submit-) Ereignis konsumiert wird und nicht an
        // uebergeordnete Eltern-Komponenten propagiert wird bis zum
        // Refresh der gesamten Seite
        return false;
    }

    private handleError(err: UpdateError) {
        const { statuscode } = err;
        log.debug(
            `UpdateInteressenComponent.handleError(): statuscode=${statuscode}`,
        );

        switch (statuscode) {
            case HttpStatusCode.BadRequest: {
                const { cause } = err;
                // TODO Aufbereitung der Fehlermeldung: u.a. Anfuehrungszeichen
                // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
                this.errorMsg =
                    cause instanceof HttpErrorResponse
                        ? cause.error
                        : JSON.stringify(cause);
                break;
            }
            case HttpStatusCode.TooManyRequests:
                this.errorMsg =
                    'Zu viele Anfragen. Bitte versuchen Sie es später noch einmal.';
                break;
            case HttpStatusCode.GatewayTimeout:
                this.errorMsg = 'Ein interner Fehler ist aufgetreten.';
                log.error('Laeuft der Appserver? Port-Forwarding?');
                break;
            default:
                this.errorMsg = 'Ein unbekannter Fehler ist aufgetreten.';
                break;
        }

        log.debug(
            `UpdateInteressenComponent.handleError(): errorMsg=${this.errorMsg}`,
        );
    }
}
