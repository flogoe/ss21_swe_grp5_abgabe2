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

/* eslint-disable max-classes-per-file */

import { AuthService, ROLLE_ADMIN } from '../../../auth/auth.service'; // eslint-disable-line @typescript-eslint/consistent-type-imports
import { BuchService, RemoveError } from '../../shared'; // eslint-disable-line @typescript-eslint/consistent-type-imports
import { Component, Input } from '@angular/core';
import { easeIn, easeOut } from '../../../shared';
import { first, tap } from 'rxjs/operators';
import type { Buch } from '../../shared';
import { NgLocalization } from '@angular/common';
import type { OnInit } from '@angular/core';
import { Router } from '@angular/router'; // eslint-disable-line @typescript-eslint/consistent-type-imports
import { Subject } from 'rxjs';
import log from 'loglevel';

/**
 * Komponente f&uuml;r das Tag <code>hs-gefundene-buecher</code>, um zun&auml;chst
 * das Warten und danach das Ergebnis der Suche anzuzeigen, d.h. die gefundenen
 * B&uuml;cher oder eine Fehlermeldung.
 */
@Component({
    selector: 'hs-gefundene-buecher',
    templateUrl: './gefundene-buecher.component.html',
    animations: [easeIn, easeOut],
})
export class GefundeneBuecherComponent implements OnInit {
    // Im ganzen Beispiel: lokale Speicherung des Zustands und nicht durch z.B.
    // eine Flux-Bibliothek wie beispielsweise Redux http://redux.js.org

    // Property Binding: <hs-gefundene-buecher [buecher]="...">
    // Decorator fuer ein Attribut. Siehe InputMetadata
    @Input()
    buecher: Buch[] = [];

    isAdmin!: boolean;

    // nachtraegliches Einloggen mit der Rolle "admin" beobachten
    isAdmin$ = new Subject<boolean>();

    // Empfehlung: Konstruktor nur fuer DI
    constructor(
        private readonly buchService: BuchService,
        private readonly router: Router,
        private readonly authService: AuthService,
    ) {
        log.debug('GefundeneBuecherComponent.constructor()');
    }

    // Attribute mit @Input() sind undefined im Konstruktor.
    // Methode zum "LifeCycle Hook" OnInit: wird direkt nach dem Konstruktor
    // aufgerufen.
    // Weitere Methoden zum Lifecycle: ngAfterViewInit(), ngAfterContentInit()
    // https://angular.io/docs/ts/latest/guide/cheatsheet.html
    // Die Ableitung vom Interface OnInit ist nicht notwendig, aber erleichtert
    // IntelliSense bei der Verwendung von TypeScript.
    ngOnInit() {
        log.debug('GefundeneBuecherComponent.ngOnInit()');
        this.isAdmin = this.authService.isAdmin;

        this.authService.rollen$
            .pipe(
                tap((rollen: string[]) =>
                    // ein neues Observable vom Typ boolean
                    this.isAdmin$.next(rollen.includes(ROLLE_ADMIN)),
                ),
            )
            // das Subject von AuthService abonnieren bzw. beobachten
            .subscribe();
    }

    /**
     * Das ausgew&auml;hlte bzw. angeklickte Buch in der Detailsseite anzeigen.
     * @param buch Das ausgew&auml;hlte Buch
     */
    onClick(buch: Buch) {
        log.debug('GefundeneBuecherComponent.onClick(): buch=', buch);

        // Puffern im Singleton: eigentlich unnoetig
        this.buchService.buch = buch;

        // URL mit der Buch-ID, um ein Bookmark zu ermoeglichen
        // Gefundenes Buch als NavigationExtras im Router puffern
        return this.router.navigate([buch._id], { state: { buch } });
    }

    /**
     * Das ausgew&auml;hlte bzw. angeklickte Buch l&ouml;schen.
     * @param buch Das ausgew&auml;hlte Buch
     */
    onRemove(buch: Buch) {
        log.debug('GefundeneBuecherComponent.onRemove(): buch=', buch);

        return this.buchService
            .remove(buch)
            .pipe(
                tap(result => {
                    if (result instanceof RemoveError) {
                        log.debug(
                            `GefundeneBuecherComponent.onRemove(): statuscode=${result.statuscode}`,
                        );
                        return;
                    }

                    this.buecher = this.buecher.filter(b => b._id !== buch._id);
                }),
                first(),
            )
            .subscribe();
    }
}

export class AnzahlLocalization extends NgLocalization {
    getPluralCategory(count: number) {
        return count === 1 ? 'single' : 'multi';
    }
}

/* eslint-enable max-classes-per-file */
