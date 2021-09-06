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

import { BuchService, FindError } from '../shared';
import { first, tap } from 'rxjs/operators';

import { ActivatedRoute } from '@angular/router';
import type { Buch } from '../shared';
import { Component } from '@angular/core';
import { HttpStatusCode } from '@angular/common/http';
import type { OnInit } from '@angular/core';
import { Title } from '@angular/platform-browser';
import log from 'loglevel';

/**
 * Komponente f&uuml;r das Tag <code>hs-update-buch</code> mit Kindkomponenten
 * f&uuml;r die folgenden Tags:
 * <ul>
 *  <li> <code>hs-stammdaten</code>
 *  <li> <code>hs-interessen</code>
 * </ul>
 */
@Component({
    selector: 'hs-update-buch',
    templateUrl: './update-buecher.component.html',
    styleUrls: ['./update-buecher.component.scss'],
})
export class UpdateBuchComponent implements OnInit {
    buch: Buch | undefined;

    errorMsg: string | undefined;

    constructor(
        private readonly buchService: BuchService,
        private readonly titleService: Title,
        private readonly route: ActivatedRoute,
    ) {
        log.debug('UpdateBuchComponent.constructor()');
    }

    ngOnInit() {
        // Pfad-Parameter aus /buecher/:id/update
        const id = this.route.snapshot.paramMap.get('id') ?? undefined;

        this.buchService
            .findById(id)
            .pipe(
                tap(result => this.setProps(result)),
                first(),
            )
            .subscribe();
    }

    private setProps(result: FindError | Buch) {
        if (result instanceof FindError) {
            this.handleError(result);
            return;
        }

        this.buch = result;
        this.errorMsg = undefined;

        const nachname = `Aktualisieren ${this.buch._id}`;
        this.titleService.setTitle(nachname);
    }

    private handleError(err: FindError) {
        const { statuscode } = err;
        log.debug(
            `UpdateBuchComponent.handleError(): statuscode=${statuscode}`,
        );

        this.buch = undefined;

        switch (statuscode) {
            case HttpStatusCode.NotFound:
                this.errorMsg = 'Kein Buch gefunden.';
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
    }
}
