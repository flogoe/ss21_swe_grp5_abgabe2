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

import type { Buch, Suchkriterien } from '../shared';
import { BuchService, FindError } from '../shared';
import { first, tap } from 'rxjs/operators';

import { Component } from '@angular/core';
import { HttpStatusCode } from '@angular/common/http';
import type { OnInit } from '@angular/core';
import { Title } from '@angular/platform-browser';
import log from 'loglevel';

@Component({
    selector: 'hs-suche-buch',
    templateUrl: './suche-buecher.component.html',
})
export class SucheBuecherComponent implements OnInit {
    suchkriterien!: Suchkriterien;

    waiting = false;

    buecher: Buch[] = [];

    errorMsg: string | undefined;

    // Wird von der JS-Engine aufgerufen
    constructor(
        private readonly buchService: BuchService,
        private readonly titleService: Title,
    ) {
        log.debug('SucheBuecherComponent.constructor()');
    }

    // Wird von Angular aufgerufen, wenn der DOM-Baum fertig ist,
    // d.h. nach dem "Rendering".
    // Wird immer generiert, wenn Angular-CLI genutzt wird.
    ngOnInit() {
        this.titleService.setTitle('Suche');
    }

    /**
     * Das Attribut <code>suchkriterien</code> wird auf den Wert des Ereignisses
     * <code>$suchkriterien</code> vom Typ Suchkriterien gesetzt. Diese Methode
     * wird aufgerufen, wenn in der Kindkomponente f&uuml;r
     * <code>hs-suchformular</code> das Ereignis ausgel&ouml;st wird.
     *
     * @param suchkriterien f&uuml;r die Suche.
     */
    suchen(suchkriterien: Suchkriterien) {
        log.debug(
            'SucheBuecherComponent.suchen(): suchkriterien=',
            suchkriterien,
        );
        this.suchkriterien = suchkriterien;

        this.buecher = [];
        this.errorMsg = undefined;

        this.waiting = true;

        // Observable: mehrere Werte werden "lazy" bereitgestellt, statt in einem JSON-Array
        // pipe ist eine "pure" Funktion, die ein Observable in ein NEUES Observable transformiert
        this.buchService
            .find(this.suchkriterien) // eslint-disable-line unicorn/no-array-callback-reference
            .pipe(
                tap(result => this.setProps(result)),
                first(),
            )
            .subscribe();
    }

    private setProps(result: FindError | Buch[]) {
        this.waiting = false;

        if (result instanceof FindError) {
            this.handleError(result);
            return;
        }

        this.buecher = result;
        log.debug('SucheBuecherComponent.setProps(): buecher=', this.buecher);
        this.errorMsg = undefined;
    }

    private handleError(err: FindError) {
        this.suchkriterien = {
            titel: '',
            artType: '',
            rating: 0,
            schlagwoerter: { javascript: false, typescript: false },
        };
        this.buecher = [];

        const { statuscode } = err;
        log.debug(
            `SucheBuecherComponent.handleError(): statuscode=${statuscode}`,
        );
        this.setErrorMsg(statuscode);
    }

    private setErrorMsg(statuscode: number) {
        switch (statuscode) {
            case HttpStatusCode.NotFound:
                this.errorMsg = 'Keine Bücher gefunden.';
                break;
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
            `SucheBuecherComponent.setErrorMsg(): errorMsg=${this.errorMsg}`,
        );
    }
}
