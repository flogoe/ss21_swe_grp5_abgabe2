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

import type { Buch, FamilienstandType, GeschlechtType } from '../../shared';
import { BuchService, UpdateError } from '../../shared'; // eslint-disable-line @typescript-eslint/consistent-type-imports
import { Component, Input } from '@angular/core';
import { HttpErrorResponse, HttpStatusCode } from '@angular/common/http';

import { FormGroup } from '@angular/forms';
import { HOME_PATH } from '../../../shared';
import type { OnInit } from '@angular/core';
import { Router } from '@angular/router'; // eslint-disable-line @typescript-eslint/consistent-type-imports
import { first } from 'rxjs/operators';
import log from 'loglevel';

/**
 * Komponente f&uuml;r das Tag <code>hs-update-stammdaten</code>
 */
@Component({
    selector: 'hs-update-stammdaten',
    templateUrl: './update-stammdaten.component.html',
})
export class UpdateStammdatenComponent implements OnInit {
    // <hs-update-stammdaten [buch]="...">
    @Input()
    buch!: Buch;

    readonly form = new FormGroup({});

    errorMsg: string | undefined = undefined;

    constructor(
        private readonly buchService: BuchService,
        private readonly router: Router,
    ) {
        log.debug('UpdateStammdatenComponent.constructor()');
    }

    /**
     * Das Formular als Gruppe von Controls initialisieren und mit den
     * Stammdaten des zu &auml;ndernden Buchs vorbelegen.
     */
    ngOnInit() {
        log.debug('UpdateStammdatenComponent.ngOnInit(): buch=', this.buch);
    }

    /**
     * Die aktuellen Stammdaten f&uuml;r das angezeigte Buch-Objekt
     * zur&uuml;ckschreiben.
     * @return false, um das durch den Button-Klick ausgel&ouml;ste Ereignis
     *         zu konsumieren.
     */
    onUpdate() {
        if (this.form.pristine) {
            log.debug(
                'UpdateStammdatenComponent.onUpdate(): keine Aenderungen',
            );
            return;
        }

        const { nachname }: { nachname: string } = this.form.value; // eslint-disable-line @typescript-eslint/no-unsafe-assignment
        const { familienstand }: { familienstand: FamilienstandType } =
            this.form.value; // eslint-disable-line @typescript-eslint/no-unsafe-assignment
        const {
            geschlechtType,
        }: { geschlechtType: GeschlechtType | '' | undefined } =
            this.form.value; // eslint-disable-line @typescript-eslint/no-unsafe-assignment
        const { rating }: { rating: number } = this.form.value; // eslint-disable-line @typescript-eslint/no-unsafe-assignment
        const { isbn }: { isbn: string } = this.form.value; // eslint-disable-line @typescript-eslint/no-unsafe-assignment
        // datum, preis und rabatt koennen im Formular nicht geaendert werden
        const { datum, preis, rabatt } = this.buch;
        this.buch.updateStammdaten(
            nachname,
            familienstand,
            geschlechtType,
            rating,
            datum,
            preis,
            rabatt,
            isbn,
        );
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
            `UpdateStammdatenComponent.handleError(): statuscode=${statuscode}`,
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
            `UpdateStammdatenComponent.handleError(): errorMsg=${this.errorMsg}`,
        );
    }
}
